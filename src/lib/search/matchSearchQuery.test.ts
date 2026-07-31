import { describe, expect, it } from 'vitest';
import { matchSearchQuery, normalizeSearchQuery } from './matchSearchQuery';

describe(normalizeSearchQuery, () => {
  it('trims and lowercases input', () => {
    expect(normalizeSearchQuery('  Aditi  ')).toBe('aditi');
  });
});

describe(matchSearchQuery, () => {
  it('matches all rows when query is empty or whitespace', () => {
    expect(matchSearchQuery('', ['Aditi'])).toBeTruthy();
    expect(matchSearchQuery('   ', ['Aditi'])).toBeTruthy();
  });

  it('matches when any field contains the query case-insensitively', () => {
    expect(matchSearchQuery('adi', ['Aditi Menon', 'aditi@example.com', 'u_2291'])).toBeTruthy();
    expect(matchSearchQuery('U_2291', ['Aditi Menon', 'aditi@example.com', 'u_2291'])).toBeTruthy();
    expect(matchSearchQuery('example.com', ['Aditi Menon', 'aditi@example.com'])).toBeTruthy();
  });

  it('rejects when no field contains the query', () => {
    expect(matchSearchQuery('zzz', ['Aditi Menon', 'aditi@example.com', 'u_2291'])).toBeFalsy();
  });

  it('ignores null and undefined fields', () => {
    expect(matchSearchQuery('adi', [null, undefined, 'Aditi'])).toBeTruthy();
    expect(matchSearchQuery('adi', [null, undefined, ''])).toBeFalsy();
  });
});
