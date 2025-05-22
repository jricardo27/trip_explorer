import { TAny } from "../data/types"

export default function deepMerge(target: Record<string, TAny>, source: Record<string, TAny>): Record<string, TAny> {
  const output = { ...target }

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      const sourceValue = source[key];
      const targetValue = target[key];

      if (isObject(sourceValue)) {
        if (isObject(targetValue)) {
          // Both source and target values are objects, so merge them
          output[key] = deepMerge(targetValue as Record<string, TAny>, sourceValue as Record<string, TAny>);
        } else {
          // Source value is an object, but target value is not (or doesn't exist at all)
          // Overwrite whatever was in target[key] with the source object value
          output[key] = sourceValue;
        }
      } else {
        // Source value is not an object, so assign it directly (overwrite)
        output[key] = sourceValue;
      }
    });
  }
  return output
}

function isObject(item: TAny) {
  return (item && typeof item === "object" && !Array.isArray(item))
}
