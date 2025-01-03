export function toSet<T>(list: T[], grabber: (item: T) => string | number) {
  const set = new Set<string | number>();

  for (const item of list) {
    set.add(grabber(item));
  }

  return set;
}
