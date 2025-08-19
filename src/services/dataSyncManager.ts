
/**
 * Data Synchronization Manager
 * Handles data sharing and syncing across all mini-apps
 */

interface CachedItem {
  data: any;
  timestamp: number;
  ttl: number;
}

interface SyncItem {
  key: string;
  data: any;
  appContext: string | null;
  timestamp: number;
  conflictResolution: string;
  retryCount: number;
  operation?: 'delete';
}

interface ConflictData {
  clientTimestamp: number;
  serverTimestamp: number;
}

class DataSyncManager {
  private apiBase: string;
  private localCache: Map<string, CachedItem>;
  private syncQueue: SyncItem[];
  private isOnline: boolean;
  private subscribers: Map<string, Set<(event: any) => void>>;
  private conflictResolvers: Map<string, (localData: any, serverData: any, context: ConflictData) => Promise<any>>;

  constructor() {
    this.apiBase = 'https://api.webkemet.com/v1';
    this.localCache = new Map();
    this.syncQueue = [];
    this.isOnline = navigator.onLine;
    this.subscribers = new Map();
    this.conflictResolvers = new Map();
    
    this.init();
  }

  private init() {
    this.setupEventListeners();
    this.startPeriodicSync();
    this.loadFromLocalStorage();
  }

  private setupEventListeners() {
    // Online/offline detection
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processSyncQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Before page unload, save pending changes
    window.addEventListener('beforeunload', () => {
      this.saveToLocalStorage();
      this.processSyncQueue();
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

    // Try to fetch from server (mock for now - will integrate with your auth system)
    if (this.isOnline) {
      try {
        // Mock API call - replace with actual implementation
        console.log(`Mock API GET: /data/${key}`);
        // For now, return cached data if available
      } catch (error) {
        console.error('Failed to fetch data from server:', error);
      }
    }

    // Fallback to cache if available
    if (fallbackToCache && this.localCache.has(cacheKey)) {
      return this.localCache.get(cacheKey)!.data;
    }

    return null;
  }

  async set(key: string, data: any, options: {
    appContext?: string | null;
    syncImmediately?: boolean;
    conflictResolution?: string;
  } = {}): Promise<boolean> {
    const {
      appContext = null,
      syncImmediately = false,
      conflictResolution = 'client-wins'
    } = options;

    const cacheKey = this.getCacheKey(key, appContext);
    
    // Update local cache
    this.setCache(cacheKey, data);
    this.notifySubscribers(key, data, appContext);

    // Add to sync queue
    const syncItem: SyncItem = {
      key,
      data,
      appContext,
      timestamp: Date.now(),
      conflictResolution,
      retryCount: 0
    };

    this.syncQueue.push(syncItem);

    // Sync immediately if requested and online
    if (syncImmediately && this.isOnline) {
      await this.syncItem(syncItem);
    }

    return true;
  }

  async delete(key: string, options: { appContext?: string | null } = {}): Promise<boolean> {
    const { appContext = null } = options;
    const cacheKey = this.getCacheKey(key, appContext);
    
    // Remove from cache
    this.localCache.delete(cacheKey);
    this.notifySubscribers(key, null, appContext);

    // Add deletion to sync queue
    this.syncQueue.push({
      key,
      data: null,
      appContext,
      timestamp: Date.now(),
      operation: 'delete',
      conflictResolution: 'client-wins',
      retryCount: 0
    });

    return true;
  }

  // ===============================================
  // Synchronization
  // ===============================================

  private async processSyncQueue() {
    if (!this.isOnline) {
      return;
    }

    const itemsToSync = [...this.syncQueue];
    this.syncQueue = [];

    for (const item of itemsToSync) {
      try {
        await this.syncItem(item);
      } catch (error) {
        console.error('Sync failed for item:', item, error);
        
        // Retry logic
        if (item.retryCount < 3) {
          item.retryCount++;
          this.syncQueue.push(item);
        }
      }
    }
  }

  private async syncItem(item: SyncItem): Promise<boolean> {
    // Mock sync - replace with actual API integration
    console.log('Mock sync item:', item);
    return true;
  }

  private startPeriodicSync() {
    // Sync every 5 minutes
    setInterval(() => {
      if (this.isOnline) {
        this.processSyncQueue();
      }
    }, 5 * 60 * 1000);
  }

  // ===============================================
  // Cache Management
  // ===============================================

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

  // ===============================================
  // Local Storage Persistence
  // ===============================================

  private saveToLocalStorage() {
    try {
      const cacheData: Record<string, CachedItem> = {};
      const queueData = this.syncQueue;

      // Save cache (excluding TTL expired items)
      for (const [key, value] of this.localCache) {
        if (this.isCacheValid(value)) {
          cacheData[key] = value;
        }
      }

      localStorage.setItem('webkemet_data_cache', JSON.stringify(cacheData));
      localStorage.setItem('webkemet_sync_queue', JSON.stringify(queueData));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }

  private loadFromLocalStorage() {
    try {
      const cacheData = localStorage.getItem('webkemet_data_cache');
      const queueData = localStorage.getItem('webkemet_sync_queue');

      if (cacheData) {
        const parsed = JSON.parse(cacheData);
        Object.entries(parsed).forEach(([key, value]) => {
          if (this.isCacheValid(value as CachedItem)) {
            this.localCache.set(key, value as CachedItem);
          }
        });
      }

      if (queueData) {
        this.syncQueue = JSON.parse(queueData);
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
    }
  }

  // ===============================================
  // Event System
  // ===============================================

  subscribe(key: string, callback: (event: any) => void, appContext: string | null = null): () => void {
    const subscriptionKey = this.getCacheKey(key, appContext);
    
    if (!this.subscribers.has(subscriptionKey)) {
      this.subscribers.set(subscriptionKey, new Set());
    }
    
    this.subscribers.get(subscriptionKey)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      const subs = this.subscribers.get(subscriptionKey);
      if (subs) {
        subs.delete(callback);
        if (subs.size === 0) {
          this.subscribers.delete(subscriptionKey);
        }
      }
    };
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
  // Utility Methods
  // ===============================================

  getStats() {
    return {
      cacheSize: this.localCache.size,
      queueSize: this.syncQueue.length,
      isOnline: this.isOnline,
      subscriberCount: Array.from(this.subscribers.values())
        .reduce((total, subs) => total + subs.size, 0)
    };
  }
}

// Create and export global instance
export const dataSyncManager = new DataSyncManager();

// Make it globally available
declare global {
  interface Window {
    dataSyncManager: DataSyncManager;
  }
}

if (typeof window !== 'undefined') {
  window.dataSyncManager = dataSyncManager;
}
