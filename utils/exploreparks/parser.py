import json
import sys
from pathlib import Path

import requests
from bs4 import BeautifulSoup

BASE_URL = "https://exploreparks.dbca.wa.gov.au"


def save_geojson(filename, features):
    geojson = {
        "type": "FeatureCollection",
        "properties": {
            "style": {
                "layerName": "National Parks",
                "icon": "md/MdOutlinePark",
                "color": "green"
            }
        },
        "features": features
    }

    with open(filename, "w", encoding="utf-8") as file:
        json.dump(geojson, file, indent=2)


def get_content(url):
    filename: str = url.split("/")[-1]
    if not filename.endswith(".html"):
        filename = filename + ".html"

    filepath = Path("./html") / filename

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


def parse_main():
    all_features = []

    # URL of the website to scrape
    url = f"{BASE_URL}/explore-wa-parks"

    all_features.extend(process_listing(url))

    for page_num in range(15):
        all_features.extend(process_listing(url + f"?page={page_num + 1}"))

    save_geojson("national_parks.json", all_features)


def process_listing(url):
    soup = BeautifulSoup(get_content(url), "html.parser")
    park_links = soup.find_all("a", class_="link--image")

    features = []

    for park_link in park_links:
        features.extend(process_park(park_link.get("href")))

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


def extract_map_features(soup, link: str):
    features = []
    filename = Path("./html/" + link.split("/")[-1] + ".json")

    if filename.exists():
        with open(filename, encoding="utf-8") as file:
            settings_json = json.load(file)
    else:
        script_tag = soup.find('script', {'data-drupal-selector': 'drupal-settings-json'})

        if script_tag:
            settings_json = json.loads(script_tag.string)

            with open(filename, "w", encoding="utf-8") as file:
                json.dump(settings_json, file, indent=2)

    leaflet = settings_json.get("leaflet")
    if not leaflet:
        print("No map found in ", filename)

    layer = leaflet.get("leaflet-map-view-places-places-parks-sites-campgrounds-map")

    if not layer:
        print("No default layer found in ", filename)

    layer = list(leaflet.values())[0]

    for feat in layer["features"]:
        if "points" in feat:
            coordinates = convert_to_coordinates(feat["points"], feat["type"])
        else:
            coordinates = [feat["lon"], feat["lat"]]

        feature = {
            "type": "Feature",
            "geometry": {
                "type": feat["type"],
                "coordinates": coordinates
            }
        }

        if "title" in feat:
            soup = BeautifulSoup(feat["title"], 'html.parser')
            feature["title"] = soup.get_text(),

        features.append(feature)

    return features


def process_park(link):
    url = f"{BASE_URL}{link}"
    soup = BeautifulSoup(get_content(url), "html.parser")
    description = soup.find("div", class_="block block-layout-builder block-field-blocknodeplacebody")
    gallery_div = soup.find('div', class_='block block-layout-builder block-field-blocknodeplacefield-gallery')
    images = []

    if gallery_div:
        img_tags = gallery_div.find_all('img')
        images = [
            {
                "src": BASE_URL + img.get("src"),
                "title": img.get("title")
            }
            for img in img_tags
        ]

    properties = {
        "properties": {
            "url": url,
            "description": description.text,
            "images": images
        }
    }

    return [
        {**feature, **properties}
        for feature in extract_map_features(soup, link)
    ]


if __name__ == "__main__":
    parse_main()
