export function parseNumericStrings<T extends Record<string, any>>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => {
      if (typeof value === 'string') {
        const num = Number(value);
        return [key, Number.isNaN(num) ? value : num];
      }
      return [key, value];
    }),
  ) as T;
}
