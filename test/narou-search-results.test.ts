import { describe, it, expect } from 'vitest';
import NarouSearchResults from '../src/narou-search-results';
import type { SearchParams } from '../src/params.js';

describe('NarouSearchResults', () => {
  interface MockData {
    id: number;
    title: string;
    author: string;
  }

  it('should correctly initialize with default params', () => {
    const header = { allcount: 100 };
    const data: Pick<MockData, 'id' | 'title'>[] = [
      { id: 1, title: 'Test Novel 1' },
      { id: 2, title: 'Test Novel 2' },
    ];
    const params: SearchParams = {};

    const results = new NarouSearchResults<MockData, 'id' | 'title'>([header, ...data], params);

    expect(results.allcount).toBe(100);
    expect(results.limit).toBe(20); // Default limit
    expect(results.start).toBe(0); // Default start
    expect(results.page).toBe(0); // 0/20 = 0
    expect(results.length).toBe(2);
    expect(results.values).toEqual(data);
  });

  it('should correctly initialize with custom params', () => {
    const header = { allcount: 500 };
    const data: Pick<MockData, 'id' | 'author'>[] = [
      { id: 1, author: 'Author 1' },
      { id: 2, author: 'Author 2' },
      { id: 3, author: 'Author 3' },
    ];
    const params: SearchParams = {
      lim: 10,
      st: 20
    };

    const results = new NarouSearchResults<MockData, 'id' | 'author'>([header, ...data], params);

    expect(results.allcount).toBe(500);
    expect(results.limit).toBe(10);
    expect(results.start).toBe(20);
    expect(results.page).toBe(2); // 20/10 = 2
    expect(results.length).toBe(3);
    expect(results.values).toEqual(data);
  });

  it('should handle empty results', () => {
    const header = { allcount: 0 };
    const data: Pick<MockData, 'id'>[] = [];
    const params: SearchParams = {
      lim: 30,
      st: 0
    };

    const results = new NarouSearchResults<MockData, 'id'>([header, ...data], params);

    expect(results.allcount).toBe(0);
    expect(results.limit).toBe(30);
    expect(results.start).toBe(0);
    expect(results.page).toBe(0);
    expect(results.length).toBe(0);
    expect(results.values).toEqual([]);
  });
});