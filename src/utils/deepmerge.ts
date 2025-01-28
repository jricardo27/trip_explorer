export default function deepMerge<T extends Record<string, unknown>>(target: T, source: Record<string, unknown>): T {
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceValue = source[key]
      const targetValue = target[key]

      if (
        typeof sourceValue === "object" &&
        sourceValue !== null &&
        typeof targetValue === "object" &&
        targetValue !== null
      ) {
        // Recursive merge, maintaining type safety
        target[key] = deepMerge(targetValue || {} as unknown, sourceValue) as T[keyof T]
      } else {
        // Simple assignment, type-safe
        target[key] = sourceValue as T[keyof T]
      }
    }
  }
  return target
}
