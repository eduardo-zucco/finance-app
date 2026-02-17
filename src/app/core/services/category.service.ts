import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Category } from '../models/category.model';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private categoriesSubject = new BehaviorSubject<Category[]>([]);
  public categories$ = this.categoriesSubject.asObservable();
  private readonly STORAGE_KEY = 'categories';

  constructor(private storageService: StorageService) {
    this.loadCategories();
  }

  private async loadCategories() {
    const storedCategories = await this.storageService.get(this.STORAGE_KEY);
    if (storedCategories && storedCategories.length > 0) {
      this.categoriesSubject.next(storedCategories);
    } else {
      await this.seedDefaultCategories();
    }
  }

  private async seedDefaultCategories() {
    const defaults: Category[] = [
      {
        id: crypto.randomUUID(),
        name: 'Salary',
        icon: 'cash-outline',
        color: '#10b981',
        type: 'income',
      },
      {
        id: crypto.randomUUID(),
        name: 'Food',
        icon: 'fast-food-outline',
        color: '#f59e0b',
        type: 'expense',
      },
      {
        id: crypto.randomUUID(),
        name: 'Transport',
        icon: 'car-outline',
        color: '#3b82f6',
        type: 'expense',
      },
      {
        id: crypto.randomUUID(),
        name: 'Home',
        icon: 'home-outline',
        color: '#8b5cf6',
        type: 'expense',
      },
      {
        id: crypto.randomUUID(),
        name: 'Shopping',
        icon: 'cart-outline',
        color: '#ec4899',
        type: 'expense',
      },
      {
        id: crypto.randomUUID(),
        name: 'Entertainment',
        icon: 'film-outline',
        color: '#ef4444',
        type: 'expense',
      },
      {
        id: crypto.randomUUID(),
        name: 'Health',
        icon: 'medkit-outline',
        color: '#06b6d4',
        type: 'expense',
      },
      {
        id: crypto.randomUUID(),
        name: 'Other',
        icon: 'ellipsis-horizontal-circle-outline',
        color: '#6b7280',
        type: 'expense',
      },
    ];
    await this.storageService.set(this.STORAGE_KEY, defaults);
    this.categoriesSubject.next(defaults);
  }

  getCategories(): Observable<Category[]> {
    return this.categories$;
  }

  async addCategory(category: Omit<Category, 'id'>) {
    const newCategory = { ...category, id: crypto.randomUUID() };
    const current = this.categoriesSubject.value;
    const updated = [...current, newCategory];
    await this.updateCategories(updated);
  }

  async updateCategory(category: Category) {
    const current = this.categoriesSubject.value;
    const index = current.findIndex((c) => c.id === category.id);
    if (index > -1) {
      const updated = [...current];
      updated[index] = category;
      await this.updateCategories(updated);
    }
  }

  async deleteCategory(id: string) {
    const current = this.categoriesSubject.value;
    const updated = current.filter((c) => c.id !== id);
    await this.updateCategories(updated);
  }

  private async updateCategories(categories: Category[]) {
    await this.storageService.set(this.STORAGE_KEY, categories);
    this.categoriesSubject.next(categories);
  }
}
