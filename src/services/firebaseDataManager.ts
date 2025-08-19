
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  getDocs,
  onSnapshot,
  increment,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';

interface CachedItem {
  data: any;
  timestamp: number;
  ttl: number;
}

interface SyncOptions {
  appContext?: string | null;
  syncImmediately?: boolean;
  conflictResolution?: string;
}

class FirebaseDataManager {
  private localCache: Map<string, CachedItem>;
  private subscribers: Map<string, Set<(event: any) => void>>;
  private unsubscribeFunctions: Map<string, () => void>;

  constructor() {
    this.localCache = new Map();
    this.subscribers = new Map();
    this.unsubscribeFunctions = new Map();
    this.init();
  }

  private init() {
    this.loadFromLocalStorage();
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Save to localStorage before page unload
    window.addEventListener('beforeunload', () => {
      this.saveToLocalStorage();
    });
  }

  // ===============================================
  // Data Management
  // ===============================================

  async get(key: string, options: {
    forceRefresh?: boolean;
    fallbackToCache?: boolean;
    appContext?: string | null;
  } = {}): Promise<any> {
    const {
      forceRefresh = false,
      fallbackToCache = true,
      appContext = null
    } = options;

    const cacheKey = this.getCacheKey(key, appContext);
    
    // Return cached data if available and not forcing refresh
    if (!forceRefresh && this.localCache.has(cacheKey)) {
      const cachedData = this.localCache.get(cacheKey)!;
      if (this.isCacheValid(cachedData)) {
        return cachedData.data;
      }
    }

    // Try to fetch from Firestore
    try {
      const docRef = doc(db, this.getCollectionPath(appContext), key);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        this.setCache(cacheKey, data);
        return data;
      }
    } catch (error) {
      console.error('Failed to fetch data from Firestore:', error);
    }

    // Fallback to cache if available
    if (fallbackToCache && this.localCache.has(cacheKey)) {
      return this.localCache.get(cacheKey)!.data;
    }

    return null;
  }

  async set(key: string, data: any, options: SyncOptions = {}): Promise<boolean> {
    const {
      appContext = null,
      syncImmediately = true
    } = options;

    const cacheKey = this.getCacheKey(key, appContext);
    
    // Update local cache
    this.setCache(cacheKey, data);
    this.notifySubscribers(key, data, appContext);

    // Sync to Firestore immediately
    if (syncImmediately) {
      try {
        const docRef = doc(db, this.getCollectionPath(appContext), key);
        await setDoc(docRef, {
          ...data,
          updatedAt: serverTimestamp(),
          appContext: appContext || 'linkbuilder'
        }, { merge: true });
        return true;
      } catch (error) {
        console.error('Failed to sync data to Firestore:', error);
        return false;
      }
    }

    return true;
  }

  async update(key: string, updates: any, options: SyncOptions = {}): Promise<boolean> {
    const { appContext = null } = options;
    
    try {
      const docRef = doc(db, this.getCollectionPath(appContext), key);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      
      // Update cache
      const cacheKey = this.getCacheKey(key, appContext);
      if (this.localCache.has(cacheKey)) {
        const cached = this.localCache.get(cacheKey)!;
        const updatedData = { ...cached.data, ...updates };
        this.setCache(cacheKey, updatedData);
        this.notifySubscribers(key, updatedData, appContext);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to update data in Firestore:', error);
      return false;
    }
  }

  async delete(key: string, options: { appContext?: string | null } = {}): Promise<boolean> {
    const { appContext = null } = options;
    const cacheKey = this.getCacheKey(key, appContext);
    
    try {
      // Remove from Firestore
      const docRef = doc(db, this.getCollectionPath(appContext), key);
      await deleteDoc(docRef);
      
      // Remove from cache
      this.localCache.delete(cacheKey);
      this.notifySubscribers(key, null, appContext);
      
      return true;
    } catch (error) {
      console.error('Failed to delete data from Firestore:', error);
      return false;
    }
  }

  // ===============================================
  // Query Methods
  // ===============================================

  async query(collectionName: string, conditions: any[] = [], options: {
    orderByField?: string;
    orderDirection?: 'asc' | 'desc';
    appContext?: string | null;
  } = {}): Promise<any[]> {
    try {
      const { orderByField, orderDirection = 'asc', appContext = null } = options;
      
      let q = collection(db, this.getCollectionPath(appContext, collectionName));
      
      // Add where conditions
      conditions.forEach(([field, operator, value]) => {
        q = query(q, where(field, operator, value)) as any;
      });
      
      // Add ordering
      if (orderByField) {
        q = query(q, orderBy(orderByField, orderDirection)) as any;
      }
      
      const querySnapshot = await getDocs(q as any);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Failed to query Firestore:', error);
      return [];
    }
  }

  // ===============================================
  // Real-time Subscriptions
  // ===============================================

  subscribe(key: string, callback: (event: any) => void, appContext: string | null = null): () => void {
    const subscriptionKey = this.getCacheKey(key, appContext);
    
    if (!this.subscribers.has(subscriptionKey)) {
      this.subscribers.set(subscriptionKey, new Set());
    }
    
    this.subscribers.get(subscriptionKey)!.add(callback);
    
    // Set up Firestore real-time listener if not already exists
    if (!this.unsubscribeFunctions.has(subscriptionKey)) {
      const docRef = doc(db, this.getCollectionPath(appContext), key);
      const unsubscribe = onSnapshot(docRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          this.setCache(subscriptionKey, data);
          this.notifySubscribers(key, data, appContext);
        }
      });
      
      this.unsubscribeFunctions.set(subscriptionKey, unsubscribe);
    }
    
    // Return unsubscribe function
    return () => {
      const subs = this.subscribers.get(subscriptionKey);
      if (subs) {
        subs.delete(callback);
        if (subs.size === 0) {
          this.subscribers.delete(subscriptionKey);
          // Clean up Firestore listener
          const unsubscribe = this.unsubscribeFunctions.get(subscriptionKey);
          if (unsubscribe) {
            unsubscribe();
            this.unsubscribeFunctions.delete(subscriptionKey);
          }
        }
      }
    };
  }

  // ===============================================
  // Analytics
  // ===============================================

  async incrementAnalytics(key: string, field: string, amount: number = 1, appContext: string | null = null): Promise<void> {
    try {
      const docRef = doc(db, this.getCollectionPath(appContext, 'analytics'), key);
      await updateDoc(docRef, {
        [field]: increment(amount),
        lastUpdated: serverTimestamp()
      });
    } catch (error) {
      // If document doesn't exist, create it
      const docRef = doc(db, this.getCollectionPath(appContext, 'analytics'), key);
      await setDoc(docRef, {
        [field]: amount,
        lastUpdated: serverTimestamp()
      }, { merge: true });
    }
  }

  // ===============================================
  // Batch Operations
  // ===============================================

  async batchWrite(operations: Array<{
    type: 'set' | 'update' | 'delete';
    key: string;
    data?: any;
    appContext?: string | null;
  }>): Promise<boolean> {
    try {
      const batch = writeBatch(db);
      
      operations.forEach(({ type, key, data, appContext = null }) => {
        const docRef = doc(db, this.getCollectionPath(appContext), key);
        
        switch (type) {
          case 'set':
            batch.set(docRef, { ...data, updatedAt: serverTimestamp() });
            break;
          case 'update':
            batch.update(docRef, { ...data, updatedAt: serverTimestamp() });
            break;
          case 'delete':
            batch.delete(docRef);
            break;
        }
      });
      
      await batch.commit();
      return true;
    } catch (error) {
      console.error('Batch write failed:', error);
      return false;
    }
  }

  // ===============================================
  // Helper Methods
  // ===============================================

  private getCollectionPath(appContext: string | null = null, collection: string = 'data'): string {
    const context = appContext || 'linkbuilder';
    return `apps/${context}/${collection}`;
  }

  private getCacheKey(key: string, appContext: string | null): string {
    return appContext ? `${appContext}:${key}` : key;
  }

  private setCache(key: string, data: any) {
    this.localCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: 60 * 60 * 1000 // 1 hour default TTL
    });
  }

  private isCacheValid(cachedItem: CachedItem): boolean {
    return (Date.now() - cachedItem.timestamp) < cachedItem.ttl;
  }

  private notifySubscribers(key: string, data: any, appContext: string | null = null) {
    const subscriptionKey = this.getCacheKey(key, appContext);
    const subscribers = this.subscribers.get(subscriptionKey);
    
    if (subscribers) {
      subscribers.forEach(callback => {
        try {
          callback({ key, data, appContext });
        } catch (error) {
          console.error('Subscriber callback error:', error);
        }
      });
    }
  }

  // ===============================================
  // Local Storage Persistence
  // ===============================================

  private saveToLocalStorage() {
    try {
      const cacheData: Record<string, CachedItem> = {};

      // Save cache (excluding TTL expired items)
      for (const [key, value] of this.localCache) {
        if (this.isCacheValid(value)) {
          cacheData[key] = value;
        }
      }

      localStorage.setItem('firebase_data_cache', JSON.stringify(cacheData));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }

  private loadFromLocalStorage() {
    try {
      const cacheData = localStorage.getItem('firebase_data_cache');

      if (cacheData) {
        const parsed = JSON.parse(cacheData);
        Object.entries(parsed).forEach(([key, value]) => {
          if (this.isCacheValid(value as CachedItem)) {
            this.localCache.set(key, value as CachedItem);
          }
        });
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
    }
  }

  // ===============================================
  // Utility Methods
  // ===============================================

  clearCache(pattern: string | null = null) {
    if (pattern) {
      // Clear cache entries matching pattern
      for (const [key] of this.localCache) {
        if (key.includes(pattern)) {
          this.localCache.delete(key);
        }
      }
    } else {
      this.localCache.clear();
    }
  }

  getStats() {
    return {
      cacheSize: this.localCache.size,
      isOnline: navigator.onLine,
      subscriberCount: Array.from(this.subscribers.values())
        .reduce((total, subs) => total + subs.size, 0)
    };
  }
}

// Create and export global instance
export const firebaseDataManager = new FirebaseDataManager();

// Make it globally available
declare global {
  interface Window {
    firebaseDataManager: FirebaseDataManager;
  }
}

if (typeof window !== 'undefined') {
  window.firebaseDataManager = firebaseDataManager;
}
