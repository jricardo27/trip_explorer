import { describe, it, expect } from 'vitest'
import { GeoJsonFeature, GeoJsonProperties } from "../data/types"
import formatFeature from "./formatFeature"

describe("formatFeature", () => {
  const baseFeature: GeoJsonFeature = {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [0, 0],
    },
    properties: {
      name: "Test Feature",
      description: "Original description.",
    },
  }

  it("should return a new feature object, not modify in place", () => {
    const feature = { ...baseFeature }
    const formattedFeature = formatFeature(feature)
    expect(formattedFeature).not.toBe(feature)
    expect(feature.properties?.description).toBe("Original description.") // Original should be unchanged
  })

  it("should initialize properties if it does not exist", () => {
    const feature: GeoJsonFeature = {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [0, 0],
      },
      properties: null, // Properties is null
    }
    const formattedFeature = formatFeature(feature)
    expect(formattedFeature.properties).toBeDefined()
    expect(formattedFeature.properties).toEqual({}) // Should be an empty object after deletions
  })

  it("should convert tripNotes from HTML to Markdown and prepend to description", () => {
    const feature: GeoJsonFeature = {
      ...baseFeature,
      properties: {
        ...baseFeature.properties,
        tripNotes: "<p>Hello <strong>world</strong></p>",
        description: "Existing details.",
      },
    }
    const formattedFeature = formatFeature(feature)
    expect(formattedFeature.properties?.description).toContain("Hello **world**") // Turndown's default for strong
    expect(formattedFeature.properties?.description).toContain("\n\n--------------------\n\nExisting details.")
  })

  it("should handle existing description being undefined when tripNotes are present", () => {
    const feature: GeoJsonFeature = {
      ...baseFeature,
      properties: {
        name: "Test Feature",
        tripNotes: "<h1>Title</h1>",
        // description is undefined
      },
    }
    const formattedFeature = formatFeature(feature)
    // Check for setext style heading (Title\n=====) or atx (# Title) as turndown default can vary or be configured
    expect(formattedFeature.properties?.description).toMatch(/^Title\n=+\n/m) // Check for "Title" followed by "==="
    expect(formattedFeature.properties?.description).toContain("\n\n--------------------\n\nundefined")
  })
  
  it("should handle existing description being null when tripNotes are present", () => {
    const feature: GeoJsonFeature = {
      ...baseFeature,
      properties: {
        name: "Test Feature",
        tripNotes: "<h2>Subtitle</h2>",
        description: null,
      },
    }
    const formattedFeature = formatFeature(feature)
    expect(formattedFeature.properties?.description).toMatch(/^Subtitle\n-+\n/m) // Check for "Subtitle" followed by "---"
    expect(formattedFeature.properties?.description).toContain("\n\n--------------------\n\nnull")
  })


  it("should not modify description if tripNotes are not present", () => {
    const feature = { ...baseFeature }
    const formattedFeature = formatFeature(feature)
    expect(formattedFeature.properties?.description).toBe("Original description.")
  })

  it("should not modify description if tripNotes are empty", () => {
    const feature: GeoJsonFeature = {
      ...baseFeature,
      properties: {
        ...baseFeature.properties,
        tripNotes: "",
        description: "Existing details.",
      },
    }
    const formattedFeature = formatFeature(feature)
    // Turndown might convert empty string to empty string, or an empty line.
    // The key is that the original description is preserved and not prepended by "undefined" or similar.
    // If tripNotes is empty, the `if (tripNotes)` condition in formatFeature should be false.
    expect(formattedFeature.properties?.description).toBe("Existing details.")
  })
  
  it("should delete id, style, images, and tripNotes from properties", () => {
    const feature: GeoJsonFeature = {
      ...baseFeature,
      properties: {
        ...baseFeature.properties,
        id: "123",
        style: { color: "red" },
        images: [{ url: "test.jpg" }],
        tripNotes: "Some notes.",
      },
    }
    const formattedFeature = formatFeature(feature)
    expect(formattedFeature.properties?.id).toBeUndefined()
    expect(formattedFeature.properties?.style).toBeUndefined()
    expect(formattedFeature.properties?.images).toBeUndefined()
    expect(formattedFeature.properties?.tripNotes).toBeUndefined()
  })

  it("should retain other properties", () => {
    const customProperty = { custom: "value" }
    const feature: GeoJsonFeature = {
      ...baseFeature,
      properties: {
        ...baseFeature.properties,
        ...customProperty,
      },
    }
    const formattedFeature = formatFeature(feature)
    expect(formattedFeature.properties?.name).toBe("Test Feature")
    expect(formattedFeature.properties?.custom).toBe("value")
  })

  it("should handle feature with minimal properties", () => {
     const feature: GeoJsonFeature = {
      type: "Feature",
      geometry: { type: "Point", coordinates: [0,0]},
      properties: { name: "Minimal" }
    }
    const formattedFeature = formatFeature(feature)
    expect(formattedFeature.properties?.name).toBe("Minimal")
    expect(Object.keys(formattedFeature.properties as GeoJsonProperties).length).toBe(1) // Only name should remain
  })

  it("should handle feature with no properties initially, then add tripNotes", () => {
    // This case is more about how properties are initialized if null
    const feature: GeoJsonFeature = {
      type: "Feature",
      geometry: { type: "Point", coordinates: [0,0]},
      properties: { tripNotes: "<h1>Notes</h1>", description: "Desc" } // Properties exist here
    }
    const formattedFeature = formatFeature(feature)
    expect(formattedFeature.properties?.description).toMatch(/^Notes\n=+\n/m)
  })
})
