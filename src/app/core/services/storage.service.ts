import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private _storage: Storage | null = null;
  private _initPromise: Promise<void> | null = null;

  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    if (this._storage) {
      return;
    }

    if (!this._initPromise) {
      this._initPromise = (async () => {
        const storage = await this.storage.create();
        this._storage = storage;
      })();
    }

    return this._initPromise;
  }

  async set(key: string, value: any): Promise<void> {
    await this.init();
    await this._storage?.set(key, value);
  }

  async get(key: string): Promise<any> {
    await this.init();
    return await this._storage?.get(key);
  }

  async remove(key: string): Promise<void> {
    await this.init();
    await this._storage?.remove(key);
  }

  async clear(): Promise<void> {
    await this.init();
    await this._storage?.clear();
  }
}
