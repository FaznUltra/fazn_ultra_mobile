// In-memory mock of expo-secure-store for tests.
const store = new Map<string, string>();

export function setItemAsync(key: string, value: string): Promise<void> {
  store.set(key, value);
  return Promise.resolve();
}

export function getItemAsync(key: string): Promise<string | null> {
  return Promise.resolve(store.has(key) ? (store.get(key) as string) : null);
}

export function deleteItemAsync(key: string): Promise<void> {
  store.delete(key);
  return Promise.resolve();
}

export function __reset(): void {
  store.clear();
}
