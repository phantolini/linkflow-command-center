
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  writeBatch,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

interface CachedData<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface QueueItem {
  operation: 'create' | 'update' | 'delete';
  collection: string;
  id: string;
  data?: any;
  retries: number;
  timestamp: number;
}

export class FirebaseDataManager {
  private cache = new Map<string, CachedData<any>>();
  private subscribers = new Map<string, Set<(data: any) => void>>();
  private syncQueue: QueueItem[] = [];
  private isOnline = navigator.onLine;
  private syncInterval?: NodeJS.Timeout;

  constructor() {
    this.init();
  }

  private init() {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processSyncQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Start periodic sync
    this.syncInterval = setInterval(() => {
      if (this.isOnline) {
        this.processSyncQueue();
      }
    }, 30000); // Sync every 30 seconds

    // Load cached data from localStorage
    this.loadFromStorage();

    // Save to localStorage before page unload
    window.addEventListener('beforeunload', () => {
      this.saveToStorage();
    });
  }

  // Get document by ID
  async get<T>(collectionName: string, id: string, useCache = true): Promise<T | null> {
    const cacheKey = `${collectionName}:${id}`;

    // Check cache first if enabled
    if (useCache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      if (this.isCacheValid(cached)) {
        return cached.data as T;
      }
    }

    try {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() } as T;
        this.setCache(cacheKey, data);
        return data;
      }
    } catch (error) {
      console.error('Error getting document:', error);
      // Return cached data if available
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey)!.data as T;
      }
    }

    return null;
  }

  // Get multiple documents with query
  async getMany<T>(
    collectionName: string, 
    conditions?: { field: string; operator: any; value: any }[],
    orderField?: string,
    useCache = true
  ): Promise<T[]> {
    const cacheKey = `${collectionName}:query:${JSON.stringify(conditions)}:${orderField}`;

    // Check cache first
    if (useCache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      if (this.isCacheValid(cached)) {
        return cached.data as T[];
      }
    }

    try {
      let q = collection(db, collectionName);
      let queryRef: any = q;

      // Apply conditions
      if (conditions) {
        conditions.forEach(condition => {
          queryRef = query(queryRef, where(condition.field, condition.operator, condition.value));
        });
      }

      // Apply ordering
      if (orderField) {
        queryRef = query(queryRef, orderBy(orderField));
      }

      const querySnapshot = await getDocs(queryRef);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[];

      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error getting documents:', error);
      // Return cached data if available
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey)!.data as T[];
      }
      return [];
    }
  }

  // Create document
  async create<T extends Record<string, any>>(collectionName: string, id: string, data: Omit<T, 'id'>): Promise<T> {
    const docData = {
      ...data as Record<string, any>,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    };

    // Add to sync queue for offline support
    this.addToSyncQueue('create', collectionName, id, docData);

    try {
      if (this.isOnline) {
        await setDoc(doc(db, collectionName, id), docData);
      }
      
      const result = { id, ...docData } as unknown as T;
      this.setCache(`${collectionName}:${id}`, result);
      this.invalidateQueryCaches(collectionName);
      this.notifySubscribers(`${collectionName}:${id}`, result);
      
      return result;
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  }

  // Update document
  async update<T extends Record<string, any>>(collectionName: string, id: string, updates: Partial<T>): Promise<T> {
    const updateData = {
      ...(updates as Record<string, any>),
      updated_at: serverTimestamp()
    };

    // Add to sync queue
    this.addToSyncQueue('update', collectionName, id, updateData);

    try {
      if (this.isOnline) {
        await updateDoc(doc(db, collectionName, id), updateData);
      }

      // Update cache
      const cacheKey = `${collectionName}:${id}`;
      const existing = this.cache.get(cacheKey);
      if (existing) {
        const updated = { ...existing.data, ...updateData } as T;
        this.setCache(cacheKey, updated);
        this.notifySubscribers(cacheKey, updated);
        return updated;
      }

      // If not in cache, fetch the updated document
      return await this.get<T>(collectionName, id, false) as T;
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  }

  // Delete document
  async delete(collectionName: string, id: string): Promise<void> {
    // Add to sync queue
    this.addToSyncQueue('delete', collectionName, id);

    try {
      if (this.isOnline) {
        await deleteDoc(doc(db, collectionName, id));
      }

      // Remove from cache
      const cacheKey = `${collectionName}:${id}`;
      this.cache.delete(cacheKey);
      this.invalidateQueryCaches(collectionName);
      this.notifySubscribers(cacheKey, null);
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  // Batch operations
  async batch(operations: Array<{
    operation: 'create' | 'update' | 'delete';
    collection: string;
    id: string;
    data?: any;
  }>): Promise<void> {
    try {
      if (this.isOnline) {
        const batch = writeBatch(db);
        
        operations.forEach(op => {
          const docRef = doc(db, op.collection, op.id);
          
          switch (op.operation) {
            case 'create':
              batch.set(docRef, { 
                ...op.data, 
                created_at: serverTimestamp(),
                updated_at: serverTimestamp()
              });
              break;
            case 'update':
              batch.update(docRef, { 
                ...op.data, 
                updated_at: serverTimestamp()
              });
              break;
            case 'delete':
              batch.delete(docRef);
              break;
          }
        });
        
        await batch.commit();
      }

      // Update caches and queues
      operations.forEach(op => {
        this.addToSyncQueue(op.operation, op.collection, op.id, op.data);
        
        if (op.operation === 'delete') {
          this.cache.delete(`${op.collection}:${op.id}`);
        } else if (op.data) {
          this.setCache(`${op.collection}:${op.id}`, { id: op.id, ...op.data });
        }
        
        this.invalidateQueryCaches(op.collection);
      });
    } catch (error) {
      console.error('Error in batch operation:', error);
      throw error;
    }
  }

  // Real-time subscription
  subscribe<T>(
    collectionName: string, 
    id: string, 
    callback: (data: T | null) => void
  ): () => void {
    const cacheKey = `${collectionName}:${id}`;
    
    // Add to subscribers
    if (!this.subscribers.has(cacheKey)) {
      this.subscribers.set(cacheKey, new Set());
    }
    this.subscribers.get(cacheKey)!.add(callback);

    // Set up Firestore listener if online
    let unsubscribe: (() => void) | null = null;
    
    if (this.isOnline) {
      const docRef = doc(db, collectionName, id);
      unsubscribe = onSnapshot(docRef, (doc) => {
        if (doc.exists()) {
          const data = { id: doc.id, ...doc.data() } as T;
          this.setCache(cacheKey, data);
          callback(data);
        } else {
          this.cache.delete(cacheKey);
          callback(null);
        }
      }, (error) => {
        console.error('Firestore listener error:', error);
      });
    }

    // Return unsubscribe function
    return () => {
      const subs = this.subscribers.get(cacheKey);
      if (subs) {
        subs.delete(callback);
        if (subs.size === 0) {
          this.subscribers.delete(cacheKey);
        }
      }
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }

  // Analytics tracking
  async trackEvent(event: string, properties: Record<string, any> = {}): Promise<void> {
    const analyticsData = {
      event,
      properties,
      timestamp: serverTimestamp(),
      session_id: this.getSessionId()
    };

    try {
      if (this.isOnline) {
        const docRef = doc(collection(db, 'analytics'));
        await setDoc(docRef, analyticsData);
      } else {
        // Store in queue for later sync
        this.addToSyncQueue('create', 'analytics', Date.now().toString(), analyticsData);
      }
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }

  // Private methods
  private setCache<T>(key: string, data: T, ttl = 60 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  private isCacheValid(cached: CachedData<any>): boolean {
    return (Date.now() - cached.timestamp) < cached.ttl;
  }

  private invalidateQueryCaches(collectionName: string): void {
    const keysToDelete: string[] = [];
    for (const [key] of this.cache) {
      if (key.startsWith(`${collectionName}:query:`)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  private addToSyncQueue(
    operation: 'create' | 'update' | 'delete',
    collection: string,
    id: string,
    data?: any
  ): void {
    this.syncQueue.push({
      operation,
      collection,
      id,
      data,
      retries: 0,
      timestamp: Date.now()
    });
  }

  private async processSyncQueue(): Promise<void> {
    if (!this.isOnline || this.syncQueue.length === 0) return;

    const itemsToProcess = [...this.syncQueue];
    this.syncQueue = [];

    for (const item of itemsToProcess) {
      try {
        const docRef = doc(db, item.collection, item.id);
        
        switch (item.operation) {
          case 'create':
            await setDoc(docRef, item.data);
            break;
          case 'update':
            await updateDoc(docRef, item.data);
            break;
          case 'delete':
            await deleteDoc(docRef);
            break;
        }
      } catch (error) {
        console.error('Sync error:', error);
        
        // Retry up to 3 times
        if (item.retries < 3) {
          item.retries++;
          this.syncQueue.push(item);
        }
      }
    }
  }

  private notifySubscribers(key: string, data: any): void {
    const subscribers = this.subscribers.get(key);
    if (subscribers) {
      subscribers.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Subscriber error:', error);
        }
      });
    }
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(2);
      sessionStorage.setItem('session_id', sessionId);
    }
    return sessionId;
  }

  private saveToStorage(): void {
    try {
      const cacheData: Record<string, any> = {};
      for (const [key, value] of this.cache) {
        if (this.isCacheValid(value)) {
          cacheData[key] = value;
        }
      }
      
      localStorage.setItem('firebase_cache', JSON.stringify(cacheData));
      localStorage.setItem('firebase_sync_queue', JSON.stringify(this.syncQueue));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const cacheData = localStorage.getItem('firebase_cache');
      const queueData = localStorage.getItem('firebase_sync_queue');
      
      if (cacheData) {
        const parsed = JSON.parse(cacheData);
        for (const [key, value] of Object.entries(parsed)) {
          if (this.isCacheValid(value as CachedData<any>)) {
            this.cache.set(key, value as CachedData<any>);
          }
        }
      }
      
      if (queueData) {
        this.syncQueue = JSON.parse(queueData);
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  }

  // Cleanup method
  destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    this.cache.clear();
    this.subscribers.clear();
    this.syncQueue = [];
  }
}

// Export singleton instance
export const firebaseDataManager = new FirebaseDataManager();
