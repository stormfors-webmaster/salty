# Salty

Custom JavaScript modules for the Salty website, featuring interactive maps and UI components.

## Overview

This repository contains the frontend JavaScript modules for the Salty website, a beach and outdoor products company. The codebase includes:

- Interactive Mapbox-powered map for beach locations
- Development utilities

## Setup

### Prerequisites

- Node.js (v14 or higher recommended)
- npm, yarn, or pnpm

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/stormfors-webmaster/salty-testing.git
   cd salty-testing
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   pnpm install
   # or
   yarn
   ```

3. Install live-server globally (if not already installed):
   ```bash
   npm install -g live-server
   # or
   pnpm add -g live-server
   # or
   yarn global add live-server
   ```

## Development

### Running the development server

```bash
npm run dev
# or
pnpm run dev
# or
yarn dev
```

This will:

- Start a development server on port 3000
- Open the application in your default browser
- Enable live reloading for changes

### Development Mode

The application includes a development mode that can be toggled in the browser:

```javascript
// In browser console
toggleDevMode(); // Toggles dev mode on/off
```

When dev mode is active, additional debugging features and console logs are available.

### Project Structure

- `src/index.js` - Main entry point
- `src/modules/` - Core components:
  - `map.js` - Mapbox map implementation
- `src/utils/` - Utility functions
  - `devmode.js` - Development utilities

## Building for Production

```bash
npm run build
# or
pnpm run build
# or
yarn build
```

This will create a minified bundle in the `dist/` directory (e.g., `dist/bundle.js`).

## Webflow Integration

1.  **Include Script:** Copy the contents of the generated bundle file (e.g., `dist/bundle.js`) and paste it into your Webflow project's custom code settings:

    - Go to Project Settings -> Custom Code.
    - Paste the code into the "Footer Code" section, enclosed in `<script>` tags:
      ```html
      <script>
        // Paste bundled JavaScript code here
      </script>
      ```
    - Alternatively, for page-specific maps, paste it into the "Before </body> tag" section in the page settings.

2.  **Map Container:** Ensure you have an HTML Embed element or a Div Block on the page where you want the map, with the ID set to `map`:

    ```html
    <div id="map" style="width: 100%; height: 400px;"></div>
    <!-- Adjust height as needed -->
    ```

3.  **Beach Markers Data:** Add CMS items or static elements for each beach location. Each element _must_ have the following attributes:

    - `temp-data="beach"`: Identifies the element as a beach data source.
    - `temp-id="unique-beach-identifier"`: A unique ID for this beach (used for linking popups and modals).
    - `lat="latitude"`: The latitude (e.g., `34.0522`).
    - `lon="longitude"`: The longitude (e.g., `-118.2437`).
    - `popup-text="Beach Name"`: The text/HTML to display in the marker's popup.
    - It must also contain a child element with the class `beach-image-url-data` which has an `src` attribute pointing to the desired popup image.

    _Example:_

    ```html
    <div
      temp-data="beach"
      temp-id="malibu"
      lat="34.0259"
      lon="-118.7798"
      popup-text="Malibu Pier">
      <img
        class="beach-image-url-data"
        src="https://uploads-ssl.webflow.com/your/image.jpg"
        loading="lazy"
        alt="" />
      <!-- Other beach info can go here -->
    </div>
    ```

4.  **POI Markers Data:** Add CMS items or static elements for points of interest. Each element _must_ have:

    - `temp-data="poi"`: Identifies the element as a POI data source.
    - `temp-id="unique-poi-identifier"`: A unique ID for this POI.
    - `lat="latitude"`: The latitude.
    - `lon="longitude"`: The longitude.
    - `marker-type="type"`: The type of POI (e.g., `lifeguard`, `parking`, `toilet`). This determines the icon. See `mapConfig.poiIconMappings` in `src/modules/map.js` for available types.
    - `popup-text="POI Name"` (or `name="POI Name"`): Text for the POI popup.

    _Example:_

    ```html
    <div
      temp-data="poi"
      temp-id="malibu-parking"
      lat="34.0265"
      lon="-118.7780"
      marker-type="parking"
      popup-text="Parking Lot P1"></div>
    ```

5.  **Map Links (Optional):** Create elements (like buttons or links in a list) that fly to a specific beach marker when clicked. Add these attributes:

    - `map-link="item"`: Identifies the clickable element.
    - `temp-id="unique-beach-identifier"`: The ID of the beach marker to fly to (must match a beach marker's `temp-id`).
    - `lat="latitude"` and `lon="longitude"`: The coordinates to fly to (should match the corresponding beach marker).

    _Example:_

    ```html
    <div map-link="item" temp-id="malibu" lat="34.0259" lon="-118.7798">
      Fly to Malibu
    </div>
    ```

6.  **Modals (Optional):** If using popups that open modals, ensure elements exist with a `modal-id` attribute matching the `temp-id` of the corresponding beach marker.

    ```html
    <div modal-id="malibu" style="display:none;">
      <!-- Modal content for Malibu -->
    </div>
    ```

7.  **Sidebars (Optional):** The code includes logic to hide/show elements with classes `.sidebar_home` and `.sidebar_beach-list` when popups are opened. Ensure these elements exist in your Webflow structure if you need this functionality.

## Deployment

### Purging CDN Cache

If you host the bundled script on a CDN like jsDelivr, remember to purge the cache after updating the script to ensure users get the latest version. Refer to your CDN provider's documentation for specific instructions.

```bash
# Example: Purge jsDelivr cache (replace with your actual URL)
# curl https://purge.jsdelivr.net/gh/your-username/your-repo@latest/dist/bundle.js
```

## Mapbox Configuration

The map component uses Mapbox GL JS. Configuration options (token, default style, zoom, center, POI icons, etc.) are located in the `mapConfig` object at the top of `src/modules/map.js`. Modify this object to customize the map behavior.

## Development Mode

To enable development mode:

1. Open your browser's developer console.
2. Type `toggleDevMode()` and press Enter.
3. The console will log whether dev mode is now ON or OFF.
4. **Reload the page** for the changes to take effect.

When dev mode is active, additional debugging logs will appear in the console (e.g., map state changes, marker creation details).

## License

ISC
