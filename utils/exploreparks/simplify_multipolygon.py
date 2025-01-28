import json
from shapely.geometry import shape
from shapely import simplify

def simplify_multipolygon(geojson, tolerance=0.001):
    """Simplifies a GeoJSON MultiPolygon using Shapely."""

    for feature in geojson["features"]:
        try:
            name = feature["properties"]["name"]
            print(f"Simplifying {name}")
            geometry = shape(feature["geometry"])
            simplified_geometry = simplify(geometry, tolerance, preserve_topology=True)
            feature["geometry"] = simplified_geometry.__geo_interface__
        except (ValueError, KeyError, TypeError) as e:
            print(f"Error simplifying {name}: {e}")

    print(f"Features in file:", len(geojson["features"]))

    return geojson


def fix_title(geojson):
    for feature in geojson["features"]:
        feature["properties"]["name"] = feature["name"]
        del feature["name"]

    return geojson


if __name__ == "__main__":
    with open("national_parks.json", "r", encoding="utf-8") as file:
        geojson_data = json.load(file)

    simplified_geojson = simplify_multipolygon(geojson_data, 0.005)

    with open("national_parks_simplified.json", "w", encoding="utf-8") as file:
        json.dump(simplified_geojson, file, indent=2)

    # with open("national_parks_fixed.json", "w", encoding="utf-8") as file:
    #     json.dump(fix_title(geojson_data), file, indent=2)
