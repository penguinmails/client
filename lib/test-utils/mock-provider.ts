/**
 * Generic Mock Data Provider
 * 
 * Reusable mock data provider implementation for testing
 */

import { MockDataProvider } from '@/types';

/**
 * Generic Mock Data Provider Implementation
 * 
 * Provides CRUD operations for mock data in tests
 */
export class BaseMockProvider<T extends { id: string | number }> implements MockDataProvider<T> {
  constructor(private data: T[]) {}

  getData(): T[] {
    return [...this.data];
  }

  getById(id: string | number): T | undefined {
    return this.data.find(item => item.id === id);
  }

  create(data: Partial<T>): T {
    const newItem = {
      ...data,
      id: data.id || Date.now(),
    } as T;
    this.data.push(newItem);
    return newItem;
  }

  update(id: string | number, data: Partial<T>): T | undefined {
    const index = this.data.findIndex(item => item.id === id);
    if (index === -1) return undefined;
    
    this.data[index] = { ...this.data[index], ...data };
    return this.data[index];
  }

  delete(id: string | number): boolean {
    const index = this.data.findIndex(item => item.id === id);
    if (index === -1) return false;
    
    this.data.splice(index, 1);
    return true;
  }
}
