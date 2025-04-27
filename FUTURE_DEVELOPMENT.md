# Potential Future Development for Salty Map Module

This document outlines potential improvements and new features for the Mapbox map implementation (`src/modules/map.js`) used on the Salty Webflow site.

## 1. Performance & Scalability

### 1.1. Use GeoJSON Layers for Markers

- **Current:** Individual DOM-based markers (`mapboxgl.Marker`) are created for each beach and POI based on HTML attributes. This can lead to performance degradation with a large number of points (hundreds/thousands).
- **Proposal:** Transition to using Mapbox GL JS [GeoJSON sources and symbol layers](https://docs.mapbox.com/mapbox-gl-js/api/sources/#geojsonsource). Store beach/POI data as GeoJSON objects, add them as a source, and use layers for display and styling.
- **Benefits:**
  - Significant performance improvement, especially with many points.
  - Enables efficient clustering.
  - Simplifies zoom-based styling/filtering.

### 1.2. Optimize POI Visibility Logic

- **Current:** A `zoom` event listener manually iterates through all POI markers to add/remove them based on the zoom level.
- **Proposal:** If using GeoJSON layers (see 1.1), leverage the layer's `minzoom` property. Mapbox handles visibility automatically.
- **Benefits:** More efficient, less custom code to maintain.

### 1.3. Implement Marker Clustering

- **Current:** Markers can overlap heavily at lower zoom levels, making interaction difficult.
- **Proposal:** Utilize Mapbox's built-in clustering options available for GeoJSON sources.
- **Benefits:** Cleaner map view, improved performance at lower zooms.

## 2. User Experience (UX)

### 2.1. Add Map Style Toggle

- **Current:** Uses satellite style only. A standard style URL is available but unused.
- **Proposal:** Add a UI control (e.g., button) allowing users to switch between satellite and standard map styles using `map.setStyle()`.
- **Benefits:** User preference, potentially better visibility in certain conditions.

### 2.2. Refine Popup/Modal Interaction

- **Current:** Popup HTML contains `onclick` triggering modals/sidebars. Closing popups doesn't reset UI state explicitly.
- **Proposal:** Handle all interactions (flyTo, popup, sidebar/modal changes) within JavaScript event listeners. Manage UI state more explicitly (e.g., dedicated functions like `showBeachDetails(id)`).
- **Benefits:** More robust logic, less fragile coupling, predictable UI state.

### 2.3. Implement Loading Indicator

- **Current:** No visual feedback while markers are being created from HTML.
- **Proposal:** Display a simple loading indicator on the map container during initialization.
- **Benefits:** Better user feedback, especially on slower connections or with many markers.

### 2.4. Improve Initial Map View

- **Current:** Map starts centered on a fixed global position.
- **Proposal:** Use browser geolocation (with permission) to center the map initially, or default to a more relevant regional center.
- **Benefits:** More immediate relevance for the user.

## 3. Robustness & Data Management

### 3.1. Decouple Data from HTML Attributes

- **Current:** Code relies heavily on specific `[temp-data]`, `lat`, `lon`, etc., attributes within the Webflow HTML structure.
- **Proposal:** Store location data in a dedicated JavaScript object/array or fetch it from a JSON endpoint (potentially managed by `salty-lambda`). Iterate over this data structure instead of querying the DOM.
- **Benefits:**
  - More resilient to changes in Webflow structure.
  - Easier data management and updates.
  - Potentially faster initialization than numerous DOM queries.

## 4. Potential New Features

### 4.1. Search & Filtering

- **Proposal:** Add an input field for searching beaches/locations by name or filtering based on criteria (e.g., POIs like 'parking', 'toilets').
- **Requires:** Likely dependent on implementing GeoJSON sources (see 1.1) for efficient filtering.

### 4.2. Driving Directions

- **Proposal:** Integrate the Mapbox Directions API to allow users to get directions to a selected beach marker.

## 5. Entry Point (`src/index.js`) Improvements

### 5.1. Dynamic Module Imports

- **Current:** Modules like `map.js` (including the Mapbox library) are imported statically, increasing the initial bundle size for all pages.
- **Proposal:** Use dynamic `import()` within the page-specific initialization functions (e.g., load `map.js` only inside `initHomepage`).
- **Benefits:** Reduces initial JavaScript load/parse time on pages that don't use specific features (like the map on the store page), improving performance.

### 5.2. More Robust Page Detection/Routing

- **Current:** Uses simple string comparison (`=== '/'`, `.includes('/store')`) to determine which code to run.
- **Proposal:** Encapsulate page detection in a dedicated function. Consider using regular expressions or a more structured approach if URL patterns become more complex (e.g., localization, deeper paths).
- **Benefits:** Improves maintainability and adaptability to future URL structure changes.

### 5.3. Error Handling for Initializers

- **Current:** Initialization calls (`map()`, `initStore()`) lack specific error handling.
- **Proposal:** Wrap module initialization calls in `try...catch` blocks.
- **Benefits:** Prevents an error in one part of the site's script (e.g., map failing) from breaking other functionality. Allows for more graceful error logging.
