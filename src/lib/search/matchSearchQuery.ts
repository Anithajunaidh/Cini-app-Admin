/**
 * Trims and lowercases a search string for case-insensitive matching.
 * @param query - Raw search input.
 * @returns Normalized query string.
 */
export function normalizeSearchQuery(query: string) {
  return query.trim().toLowerCase();
}

/**
 * Returns true when the query is empty or any field contains the query.
 * @param query - Raw search input.
 * @param fields - String fields to search against.
 * @returns Whether the record matches the query.
 */
export function matchSearchQuery(query: string, fields: (string | null | undefined)[]) {
  const normalized = normalizeSearchQuery(query);

  if (normalized.length === 0) {
    return true;
  }

  return fields.some(function (field) {
    if (field == null || field.length === 0) {
      return false;
    }

    return field.toLowerCase().includes(normalized);
  });
}
