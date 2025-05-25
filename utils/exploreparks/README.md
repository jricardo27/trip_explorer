# Explore Parks WA Scraper

This Python script (`parser.py`) is designed to scrape data about national parks and other points of interest from the [Explore Parks WA website](https://exploreparks.dbca.wa.gov.au). It extracts information such as park names, locations (latitude/longitude), descriptions, and images, then saves this data as a GeoJSON file.

This GeoJSON file can then be used as a data source for applications like the main Trip Explorer.

## Dependencies

The script relies on the following Python libraries:

- `requests` (for making HTTP requests)
- `beautifulsoup4` (for parsing HTML content)

These dependencies are listed in `requirements.txt`.

## Setup

1.  **Navigate to the script directory:**
    ```bash
    cd utils/exploreparks
    ```

2.  **Create a Python virtual environment:**
    It's highly recommended to use a virtual environment to manage dependencies for this script separately from your global Python installation.
    ```bash
    python -m venv .venv
    ```

3.  **Activate the virtual environment:**
    *   On macOS and Linux:
        ```bash
        source .venv/bin/activate
        ```
    *   On Windows:
        ```bash
        .\.venv\Scripts\activate
        ```
    You should see `(.venv)` at the beginning of your command prompt.

4.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

## Running the Scraper

Once the setup is complete, you can run the scraper using the `parser.py` script.

```bash
python parser.py [OPTIONS]
```

### Options (Command-Line Arguments):

*   `--base_url URL`:
    Sets the base URL for the Explore Parks WA website.
    Default: `https://exploreparks.dbca.wa.gov.au`

*   `--output_file FILENAME`:
    Specifies the name of the GeoJSON file to be generated.
    Default: `national_parks.json` (will be saved in the current directory, i.e., `utils/exploreparks/`)

*   `--html_cache_dir DIRECTORY`:
    Defines the directory where downloaded HTML and JSON content from the website will be cached to speed up subsequent runs and reduce redundant requests.
    Default: `./html` (relative to the script's location)

### Example Usage:

*   **Run with default settings:**
    ```bash
    python parser.py
    ```
    This will use the default base URL, save the output as `national_parks.json` in the `utils/exploreparks/` directory, and use `./html` for caching.

*   **Specify a different output file:**
    ```bash
    python parser.py --output_file wa_parks_data.geojson
    ```

*   **Specify a different cache directory:**
    ```bash
    python parser.py --html_cache_dir ../../temp_cache
    ```

The script will log its progress to the console, including information about fetching data, caching, and any errors encountered. The generated GeoJSON file can be found in the specified output location upon completion.

## How it Works

The scraper performs the following main steps:
1.  Fetches an initial listing of parks from the main exploration page.
2.  Paginates through subsequent listing pages to gather all park links.
3.  For each park link:
    a.  Fetches the individual park page.
    b.  Parses the HTML to extract details like description and image gallery URLs.
    c.  Looks for embedded JSON data (often within `<script>` tags) that contains map feature information (polygons, points, etc.).
    d.  Converts this map data into GeoJSON features.
    e.  Combines all extracted features into a single GeoJSON FeatureCollection.
4.  Saves the FeatureCollection to the specified output file.
5.  HTML and JSON content fetched from the website are cached locally in the specified `--html_cache_dir` to avoid re-downloading on subsequent runs.
