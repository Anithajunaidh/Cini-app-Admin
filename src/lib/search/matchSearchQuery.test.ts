import { describe, expect, it } from 'vitest';
import { matchSearchQuery, normalizeSearchQuery } from './matchSearchQuery';

describe('normalizeSearchQuery', () => {
  it('trims and lowercases input', () => {
    expect(normalizeSearchQuery('  Aditi  ')).toBe('aditi');
  });
});

describe('matchSearchQuery', () => {
  it('matches all rows when query is empty or whitespace', () => {
    expect(matchSearchQuery('', ['Aditi'])).toBe(true);
    expect(matchSearchQuery('   ', ['Aditi'])).toBe(true);
  });

  it('matches when any field contains the query case-insensitively', () => {
    expect(matchSearchQuery('adi', ['Aditi Menon', 'aditi@example.com', 'u_2291'])).toBe(true);
    expect(matchSearchQuery('U_2291', ['Aditi Menon', 'aditi@example.com', 'u_2291'])).toBe(true);
    expect(matchSearchQuery('example.com', ['Aditi Menon', 'aditi@example.com'])).toBe(true);
  });

  it('rejects when no field contains the query', () => {
    expect(matchSearchQuery('zzz', ['Aditi Menon', 'aditi@example.com', 'u_2291'])).toBe(false);
  });

  it('ignores null and undefined fields', () => {
    expect(matchSearchQuery('adi', [null, undefined, 'Aditi'])).toBe(true);
    expect(matchSearchQuery('adi', [null, undefined, ''])).toBe(false);
  });
});
