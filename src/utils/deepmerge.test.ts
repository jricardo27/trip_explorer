import { describe, it, expect } from 'vitest'
import deepMerge from "./deepmerge" // Assuming TAny is correctly handled or not strictly needed for tests
import { TAny } from "../data/types"; // Import TAny if your test setup requires it for type checking

describe("deepMerge", () => {
  it("should merge source properties into target", () => {
    const target = { a: 1, b: 2 }
    const source = { b: 3, c: 4 }
    const result = deepMerge(target, source)
    expect(result).toEqual({ a: 1, b: 3, c: 4 })
  })

  it("should return a new object, not modify target in place", () => {
    const target = { a: 1, b: 2 }
    const source = { b: 3, c: 4 }
    const result = deepMerge(target, source)
    expect(result).not.toBe(target)
    expect(target).toEqual({ a: 1, b: 2 }) // Target should be unchanged
  })

  it("should deeply merge nested objects", () => {
    const target = { a: 1, b: { x: 10, y: 20 } }
    const source = { b: { y: 30, z: 40 }, c: 3 }
    const result = deepMerge(target, source)
    expect(result).toEqual({ a: 1, b: { x: 10, y: 30, z: 40 }, c: 3 })
  })

  it("should add new nested objects from source", () => {
    const target = { a: 1 }
    const source = { b: { x: 10, y: 20 } }
    const result = deepMerge(target, source)
    expect(result).toEqual({ a: 1, b: { x: 10, y: 20 } })
  })

  it("should handle empty target object", () => {
    const target = {}
    const source = { a: 1, b: { x: 10 } }
    const result = deepMerge(target, source)
    expect(result).toEqual({ a: 1, b: { x: 10 } })
  })

  it("should handle empty source object", () => {
    const target = { a: 1, b: { x: 10 } }
    const source = {}
    const result = deepMerge(target, source)
    expect(result).toEqual({ a: 1, b: { x: 10 } }) // Should be a copy of target
  })
  
  it("should handle both target and source being empty objects", () => {
    const target = {}
    const source = {}
    const result = deepMerge(target, source)
    expect(result).toEqual({})
  })

  it("should overwrite non-object properties in target with source properties", () => {
    const target = { a: 1, b: "hello" }
    const source = { b: "world", c: true }
    const result = deepMerge(target, source)
    expect(result).toEqual({ a: 1, b: "world", c: true })
  })

  it("should replace a non-object in target with an object from source", () => {
    const target = { a: 1, b: "not an object" }
    const source = { b: { x: 10, y: 20 } }
    const result = deepMerge(target, source)
    expect(result).toEqual({ a: 1, b: { x: 10, y: 20 } })
  })

  it("should replace an object in target with a non-object from source", () => {
    const target = { a: 1, b: { x: 10, y: 20 } }
    const source = { b: "now a string" }
    const result = deepMerge(target, source)
    expect(result).toEqual({ a: 1, b: "now a string" })
  })

  it("should not merge arrays, but replace them (as per isObject logic)", () => {
    const target = { a: [1, 2], b: { x: 1 } }
    const source = { a: [3, 4], c: 3 } // isObject(source[key]) will be false for array 'a'
    const result = deepMerge(target, source)
    expect(result).toEqual({ a: [3, 4], b: { x: 1 }, c: 3 })
  })

  it("should handle properties with null values", () => {
    const target = { a: 1, b: null }
    const source = { b: { x: 10 }, c: null }
    const result = deepMerge(target, source)
    // b in target is null (not an object by isObject), so source.b (an object) replaces it.
    // c in source is null (not an object), so it's assigned.
    expect(result).toEqual({ a: 1, b: { x: 10 }, c: null })
  })

  it("should handle source properties that are undefined", () => {
    const target = { a: 1, b: 2 }
    const source: Record<string, TAny> = { b: undefined, c: 3 }
    const result = deepMerge(target, source)
    expect(result).toEqual({ a: 1, b: undefined, c: 3 })
  })

  it("should merge complex nested structures", () => {
    const target = {
      id: "target",
      data: {
        name: "Target Data",
        version: 1.0,
        settings: {
          theme: "dark",
          notifications: {
            email: true,
            sms: false,
          },
        },
      },
      user: {
        id: 100,
      },
    }
    const source = {
      data: {
        version: 1.1,
        settings: {
          notifications: {
            sms: true,
            push: true,
          },
          privacy: "high",
        },
        tags: ["test", "merge"],
      },
      user: {
        name: "Test User",
      },
      newProperty: {
        value: "new value"
      }
    }

    const result = deepMerge(target, source);
    expect(result).toEqual({
      id: "target", // from target
      data: {
        name: "Target Data", // from target
        version: 1.1, // from source
        settings: {
          theme: "dark", // from target
          notifications: {
            email: true, // from target
            sms: true, // from source
            push: true, // from source
          },
          privacy: "high", // from source
        },
        tags: ["test", "merge"], // from source (array replacement)
      },
      user: { // object 'user' from target merged with object 'user' from source
        id: 100, // from target
        name: "Test User" // from source
      },
      newProperty: { // from source
        value: "new value"
      }
    })
  })
})
