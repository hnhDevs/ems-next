// Utility to parse date strings to Date objects for specified keys
export function parseDates<T extends Record<string, unknown>>(obj: T, keys: string[]): T {
  const newObj = { ...obj };
  for (const key of keys) {
    if (key in newObj && newObj[key]) {
      (newObj as Record<string, unknown>)[key] = new Date(newObj[key] as string);
    }
  }
  return newObj;
} 