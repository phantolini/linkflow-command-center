
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
  limit, 
  onSnapshot,
  serverTimestamp,
  FieldValue,
  QueryConstraint,
  WhereFilterOp
} from 'firebase/firestore';
import { db } from './firebase';

// Cache interface
interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
}

// Query constraint interface
export interface QueryFilter {
  field: string;
  operator: WhereFilterOp;
  value: any;
}

// Subscription callback type
type SubscriptionCallback<T = any> = (data: T) => void;

class FirebaseDataManager {
  private cache = new Map<string, CacheEntry>();
  private subscriptions = new Map<string, SubscriptionCallback[]>();
  private unsubscribeFunctions = new Map<string, () => void>();
  
  // Cache configuration
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_CACHE_SIZE = 1000;

  // Clear expired cache entries
  private clearExpiredCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Set cache with size limit
  private setCache<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    // Clear expired entries first
    this.clearExpiredCache();
    
    // If cache is full, remove oldest entries
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      const toRemove = entries.slice(0, Math.floor(this.MAX_CACHE_SIZE * 0.2));
      toRemove.forEach(([key]) => this.cache.delete(key));
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  // Get from cache
  private getCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }

  // Invalidate cache for queries
  private invalidateQueryCaches(collectionName: string): void {
    const keysToDelete: string[] = [];
    for (const key of this.cache.keys()) {
      if (key.startsWith(`${collectionName}:query:`)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  // Subscription management
  private notifySubscribers<T>(key: string, data: T): void {
    const callbacks = this.subscriptions.get(key) || [];
    callbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in subscription callback:', error);
      }
    });
  }

  // Subscribe to real-time updates
  subscribe<T>(collectionName: string, id: string, callback: SubscriptionCallback<T>): () => void {
    const key = `${collectionName}:${id}`;
    
    if (!this.subscriptions.has(key)) {
      this.subscriptions.set(key, []);
    }
    
    this.subscriptions.get(key)!.push(callback);
    
    // Set up Firestore listener if not already exists
    if (!this.unsubscribeFunctions.has(key)) {
      const docRef = doc(db, collectionName, id);
      const unsubscribe = onSnapshot(docRef, (doc) => {
        if (doc.exists()) {
          const data = { id: doc.id, ...doc.data() } as T;
          this.setCache(key, data);
          this.notifySubscribers(key, data);
        }
      }, (error) => {
        console.error('Firestore subscription error:', error);
      });
      
      this.unsubscribeFunctions.set(key, unsubscribe);
    }
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.subscriptions.get(key) || [];
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
      
      // If no more callbacks, cleanup Firestore listener
      if (callbacks.length === 0) {
        const unsubscribe = this.unsubscribeFunctions.get(key);
        if (unsubscribe) {
          unsubscribe();
          this.unsubscribeFunctions.delete(key);
        }
        this.subscriptions.delete(key);
      }
    };
  }

  // Get single document
  async get<T>(collectionName: string, id: string, useCache: boolean = true): Promise<T | null> {
    const cacheKey = `${collectionName}:${id}`;
    
    // Check cache first
    if (useCache) {
      const cached = this.getCache<T>(cacheKey);
      if (cached) {
        console.log(`Cache hit for ${cacheKey}`);
        return cached;
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
      
      return null;
    } catch (error) {
      console.error(`Error getting document ${collectionName}/${id}:`, error);
      throw error;
    }
  }

  // Create document
  async create<T extends Record<string, any>>(collectionName: string, id: string, data: Omit<T, 'id'>): Promise<T> {
    const docData = {
      ...(data as Record<string, any>),
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    };

    try {
      const docRef = doc(db, collectionName, id);
      
      // Check if document already exists
      const existingDoc = await getDoc(docRef);
      if (existingDoc.exists()) {
        throw new Error(`Document ${collectionName}/${id} already exists`);
      } else {
        await setDoc(doc(db, collectionName, id), docData);
      }
      
      const result = { id, ...docData } as unknown as T;
      this.setCache(`${collectionName}:${id}`, result);
      this.invalidateQueryCaches(collectionName);
      this.notifySubscribers(`${collectionName}:${id}`, result);
      return result;
    } catch (error) {
      console.error(`Error creating document ${collectionName}/${id}:`, error);
      throw error;
    }
  }

  // Update document
  async update<T extends Record<string, any>>(collectionName: string, id: string, updates: Partial<T>): Promise<T> {
    const updateData = {
      ...(updates as Record<string, any>),
      updated_at: serverTimestamp()
    };

    try {
      const docRef = doc(db, collectionName, id);
      
      // Check if document exists
      const existingDoc = await getDoc(docRef);
      if (!existingDoc.exists()) {
        throw new Error(`Document ${collectionName}/${id} does not exist`);
      }
      
      await updateDoc(docRef, updateData);
      
      // Update cache if exists
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
      console.error(`Error updating document ${collectionName}/${id}:`, error);
      throw error;
    }
  }

  // Delete document
  async delete(collectionName: string, id: string): Promise<void> {
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
      
      // Remove from cache
      const cacheKey = `${collectionName}:${id}`;
      this.cache.delete(cacheKey);
      this.invalidateQueryCaches(collectionName);
      
      // Notify subscribers of deletion
      this.notifySubscribers(cacheKey, null);
      
      console.log(`Document ${collectionName}/${id} deleted successfully`);
    } catch (error) {
      console.error(`Error deleting document ${collectionName}/${id}:`, error);
      throw error;
    }
  }

  // Get multiple documents with filtering and sorting
  async getMany<T>(
    collectionName: string,
    filters: QueryFilter[] = [],
    orderByField?: string,
    orderDirection: 'asc' | 'desc' = 'asc',
    limitCount?: number,
    useCache: boolean = true
  ): Promise<T[]> {
    // Create cache key based on query parameters
    const cacheKey = `${collectionName}:query:${JSON.stringify({ filters, orderByField, orderDirection, limitCount })}`;
    
    // Check cache first
    if (useCache) {
      const cached = this.getCache<T[]>(cacheKey);
      if (cached) {
        console.log(`Cache hit for query ${cacheKey}`);
        return cached;
      }
    }

    try {
      const collectionRef = collection(db, collectionName);
      const constraints: QueryConstraint[] = [];

      // Add where clauses
      filters.forEach(filter => {
        constraints.push(where(filter.field, filter.operator, filter.value));
      });

      // Add ordering
      if (orderByField) {
        constraints.push(orderBy(orderByField, orderDirection));
      }

      // Add limit
      if (limitCount) {
        constraints.push(limit(limitCount));
      }

      const q = query(collectionRef, ...constraints);
      const querySnapshot = await getDocs(q);
      
      const results: T[] = [];
      querySnapshot.forEach((doc) => {
        const data = { id: doc.id, ...doc.data() } as T;
        results.push(data);
        // Cache individual documents
        this.setCache(`${collectionName}:${doc.id}`, data);
      });

      // Cache query results
      this.setCache(cacheKey, results);
      return results;
    } catch (error) {
      console.error(`Error getting documents from ${collectionName}:`, error);
      throw error;
    }
  }

  // Clear all cache
  clearCache(): void {
    this.cache.clear();
    console.log('Cache cleared');
  }

  // Get cache statistics
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  // Cleanup all subscriptions
  cleanup(): void {
    // Unsubscribe from all Firestore listeners
    this.unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
    this.unsubscribeFunctions.clear();
    this.subscriptions.clear();
    this.clearCache();
  }
}

// Export singleton instance
export const firebaseDataManager = new FirebaseDataManager();
