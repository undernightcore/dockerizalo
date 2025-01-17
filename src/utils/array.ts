export function toSet<T>(list: T[], grabber: (item: T) => string | number) {
  const set = new Set<string | number>();

  for (const item of list) {
    set.add(grabber(item));
  }

  return set;
}

export function toMap<T>(list: T[], grabber: (item: T) => string | number) {
  const map = new Map<string | number, T>();

  for (const item of list) {
    map.set(grabber(item), item);
  }

  return map;
}
