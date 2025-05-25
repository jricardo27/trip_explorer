import json
import sys
import argparse
from pathlib import Path

import requests
from bs4 import BeautifulSoup


def save_geojson(output_filename, features, style_properties):
    geojson = {
        "type": "FeatureCollection",
        "properties": style_properties,
        "features": features
    }

    with open(output_filename, "w", encoding="utf-8") as file:
        json.dump(geojson, file, indent=2)


def get_content(url, html_cache_dir):
    filename: str = url.split("/")[-1]
    if not filename.endswith(".html"):
        filename = filename + ".html"

    filepath = Path(html_cache_dir) / filename

    if filepath.exists():
        print("Loading contents for ", url)
        with open(filepath, encoding="utf-8") as file:
            return file.read()

    print("Getting content from:", url)
    try:
        response = requests.get(url)
    except requests.exceptions.RequestException as e:
        print(f"Error fetching {url}: {e}")
        sys.exit(1)

    # Check if the request was successful
    if response.status_code != 200:
        print(f"Error {response.status_code} while fetching {url}")
        sys.exit(1)

    with open(filepath, "w", encoding="utf-8") as file:
        file.write(response.content.decode("utf-8"))
    return response.content


def parse_main(base_url, output_file, html_cache_dir):
    all_features = []

    style_properties = {
        "style": {
            "layerName": "National Parks",
            "icon": "md/MdOutlinePark",
            "color": "green"
        }
    }

    # URL of the website to scrape
    url = f"{base_url}/explore-wa-parks"

    all_features.extend(process_listing(url, base_url, html_cache_dir))

    for page_num in range(15):
        all_features.extend(process_listing(url + f"?page={page_num + 1}", base_url, html_cache_dir))

    save_geojson(output_file, all_features, style_properties)


def process_listing(url, base_url, html_cache_dir):
    soup = BeautifulSoup(get_content(url, html_cache_dir), "html.parser")
    park_links = soup.find_all("a", class_="link--image")

    features = []

    for park_link in park_links:
        features.extend(process_park(park_link.get("href"), base_url, html_cache_dir))

    return features

def convert_to_coordinates(points, feature_type):
    coordinates = []

    if feature_type == "multipolygon":
        for polygon in points:
            polygon_coordinates = []
            for ring in polygon:  # Iterate over each ring (list of coordinates)
                ring_coordinates = []
                for coord in ring:  # Iterate over each coordinate (dict with lat/lon)
                    ring_coordinates.append([coord["lon"], coord["lat"]])  # GeoJSON is [lng, lat]
                polygon_coordinates.append(ring_coordinates)  # Add the ring to the polygon
            coordinates.append(polygon_coordinates)  # Add the polygon to the list of coordinates
    elif feature_type == "polygon":
        coordinates = []
        for ring in points:  # Iterate through the rings of the polygon
            ring_coordinates = []
            for coord in ring:
                ring_coordinates.append([coord['lon'], coord['lat']])
            coordinates.append(ring_coordinates)

    return coordinates


def extract_map_features(soup, link: str, html_cache_dir: str):
    features = []
    filename = Path(html_cache_dir) / (link.split("/")[-1] + ".json")

    if filename.exists():
        with open(filename, encoding="utf-8") as file:
            settings_json = json.load(file)
    else:
        script_tag = soup.find('script', {'data-drupal-selector': 'drupal-settings-json'})

        if script_tag:
            settings_json = json.loads(script_tag.string)

            with open(filename, "w", encoding="utf-8") as file:
                json.dump(settings_json, file, indent=2)
        else:
            # Handle case where script_tag is None, perhaps log or return empty features
            print(f"Warning: No 'drupal-settings-json' script tag found for {link}")
            return []


    leaflet = settings_json.get("leaflet")
    if not leaflet:
        print("No map found in ", filename)
        return []

    # Try to get the specific layer, but fall back if it doesn't exist
    layer = leaflet.get("leaflet-map-view-places-places-parks-sites-campgrounds-map")

    if not layer:
        print(f"No 'leaflet-map-view-places-places-parks-sites-campgrounds-map' layer found in {filename}. Trying first available layer.")
        if leaflet.values():
            layer = list(leaflet.values())[0]
        else:
            print(f"No layers found at all in {filename}.")
            return []


    for feat in layer["features"]:
        if "points" in feat:
            coordinates = convert_to_coordinates(feat["points"], feat["type"])
        else:
            # Ensure lat and lon are present
            if "lat" not in feat or "lon" not in feat:
                print(f"Warning: Feature in {link} is missing lat/lon: {feat.get('title', 'Untitled')}")
                continue # Skip this feature
            coordinates = [feat["lon"], feat["lat"]]

        feature = {
            "type": "Feature",
            "geometry": {
                "type": feat["type"],
                "coordinates": coordinates
            }
        }

        if "title" in feat:
            soup_title = BeautifulSoup(feat["title"], 'html.parser')
            feature["properties"] = {"title": soup_title.get_text()} # Store title under properties

        features.append(feature)

    return features


def process_park(link, base_url, html_cache_dir):
    url = f"{base_url}{link}"
    soup = BeautifulSoup(get_content(url, html_cache_dir), "html.parser")
    description_div = soup.find("div", class_="block block-layout-builder block-field-blocknodeplacebody")
    description_text = description_div.text.strip() if description_div else ""

    gallery_div = soup.find('div', class_='block block-layout-builder block-field-blocknodeplacefield-gallery')
    images = []

    if gallery_div:
        img_tags = gallery_div.find_all('img')
        images = [
            {
                "src": base_url + img.get("src"),
                "title": img.get("title")
            }
            for img in img_tags if img.get("src") # Ensure src exists
        ]

    # Extract base feature properties first
    base_features = extract_map_features(soup, link, html_cache_dir)
    
    processed_features = []
    for feature in base_features:
        # Ensure properties key exists
        if "properties" not in feature:
            feature["properties"] = {}
        
        # Add common park properties
        feature["properties"]["url"] = url
        feature["properties"]["description"] = description_text
        feature["properties"]["images"] = images
        processed_features.append(feature)

    return processed_features


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Scrape park data from Explore Parks WA.")
    parser.add_argument("--base_url", default="https://exploreparks.dbca.wa.gov.au", help="Base URL for the Explore Parks website.")
    parser.add_argument("--output_file", default="national_parks.json", help="Name of the GeoJSON output file.")
    parser.add_argument("--html_cache_dir", default="./html", help="Directory to cache downloaded HTML and JSON files.")
    args = parser.parse_args()

    Path(args.html_cache_dir).mkdir(parents=True, exist_ok=True)

    parse_main(args.base_url, args.output_file, args.html_cache_dir)
