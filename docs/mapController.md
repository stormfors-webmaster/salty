# MapController Module Documentation

## Overview

The `MapController` is the central module responsible for all Mapbox GL JS map interactions, rendering, and event handling. It manages map initialization, user interactions, feature visualization, popup display, and coordinate map movements with other application modules through the EventBus.

## Location
`js/mapController.js`

## Dependencies
- `Config` - Configuration system for map settings and selectors
- `Utils` - Utility functions for mobile detection and error handling
- `AppState` - Application state management
- `UIController` - UI coordination and updates
- `EventBus` - Event communication system
- `cityImageData` - Static city image data for region features
- `ActionController` - Action execution for user interactions

## Architecture

The MapController follows an event-driven architecture where map interactions trigger configured actions, and external requests are handled through EventBus subscriptions. It manages multiple layers of geographic data with different interaction behaviors.

### Flow Diagram
```
Map Interaction → Layer Detection → Action Trigger → EventBus → Module Response
External Request → EventBus → MapController → Map API → Visual Update
```

## Constants

### Layer IDs
```javascript
LAYER_IDS: {
  STATES: "salty-state",
  CALIFORNIA: "California",
  HAWAII: "Hawaii", 
  REGIONS: "salty-city",
  BEACHES: "salty-beaches"
}
```

These correspond to layer IDs in the Mapbox Studio style and determine interaction behavior.

## Public API

### Initialization

#### `init()`

Initializes the Mapbox map with configured style and settings.

**Returns:** Promise - Resolves when map is loaded

**Features:**
- Responsive initial positioning (mobile vs desktop)
- Cloud-hosted style with embedded data sources
- Automatic resize handling
- Error handling with user-friendly messages

**Example Usage:**
```javascript
try {
  await MapController.init();
  console.log("Map initialized successfully");
} catch (error) {
  console.error("Map initialization failed:", error);
}
```

**Configuration Dependencies:**
- `Config.MAP.ACCESS_TOKEN` - Mapbox access token
- `Config.MAP.STYLE` - Mapbox Studio style URL
- `Config.MAP.DEFAULT_ZOOM` - Initial zoom level
- `Config.MAP.DESKTOP_START_POSITION` - Desktop starting coordinates
- `Config.MAP.MOBILE_START_POSITION` - Mobile starting coordinates
- `Config.SELECTORS.MAP_CONTAINER` - DOM container selector

### Map Navigation

#### `flyTo(options)`

Animates the map to fly to a specific location with smooth transitions.

**Parameters:**
- `options` (Object)
  - `coordinates` (Array) - [longitude, latitude] target coordinates
  - `zoom` (Number) - Target zoom level (default: `Config.MAP.DETAIL_ZOOM`)
  - `speed` (Number) - Animation speed multiplier (default: `Config.UI.MAP_FLY_SPEED`)

**Example Usage:**
```javascript
// Fly to Los Angeles
MapController.flyTo({
  coordinates: [-118.2437, 34.0522],
  zoom: 14,
  speed: 1.5
});

// Quick navigation with defaults
MapController.flyTo({
  coordinates: beachFeature.geometry.coordinates
});
```

**EventBus Integration:**
```javascript
EventBus.subscribe("map:flyTo", MapController.flyTo.bind(MapController));
```

#### `zoomTo(options)`

Zooms the map to a specific level without changing the center point.

**Parameters:**
- `options` (Object)
  - `zoom` (Number) - Target zoom level
  - `speed` (Number) - Animation speed (default: 1.2)

**Example Usage:**
```javascript
// Zoom out to show more area
MapController.zoomTo({
  zoom: 8,
  speed: 2.0
});
```

**EventBus Integration:**
```javascript
EventBus.subscribe("map:zoomTo", MapController.zoomTo.bind(MapController));
```

### Popup Management

#### `showPopup(feature, details)`

Displays an interactive popup for a map feature with rich content.

**Parameters:**
- `feature` (Object) - GeoJSON feature object containing geometry and properties
- `details` (Object) - Additional cached details from AppState (optional)

**Features:**
- Responsive popup positioning with offset
- Rich HTML content with images and links
- Click-through functionality to detail view
- Automatic popup tracking for cleanup
- Fallback content for missing data

**Example Usage:**
```javascript
// Show popup with cached beach details
const beach = AppState.getBeachById("beach_123");
MapController.showPopup(beachFeature, beach);

// Show popup with basic feature properties
MapController.showPopup(regionFeature);
```

**Popup Content Structure:**
```html
<div class="popup_component">
  <img src="beach-image.jpg" alt="Beach Name" class="popup_image">
  <p class="partner-badge">Paid Partner</p> <!-- if applicable -->
  <h4 class="popup_title">Beach Name</h4>
  <p class="popup_address">123 Beach Drive, City, CA</p>
  <p class="popup_hours">Hours: 6AM - 10PM</p>
  <a href="website.com" class="salty-link">website.com</a>
  <a href="tel:555-0123" class="salty-link">555-0123</a>
  <div class="button is-icon">See Details</div>
</div>
```

**EventBus Integration:**
```javascript
EventBus.subscribe("map:showPopup", (data) => {
  setTimeout(
    () => MapController.showPopup(data.feature, data.details),
    data.delay || 0
  );
});
```

#### `closeAllPopups()`

Closes all currently open popups and cleans up tracking.

**Features:**
- Removes all tracked popups from the map
- Clears popup tracking in AppState
- Safe operation (no errors if no popups exist)

**Example Usage:**
```javascript
MapController.closeAllPopups();
```

**EventBus Integration:**
```javascript
EventBus.subscribe("map:closeAllPopups", MapController.closeAllPopups.bind(MapController));
```

## Feature Interaction System

### Click Handling

The MapController implements intelligent click handling that determines the appropriate action based on the clicked layer:

```javascript
AppState.getMap().on("click", interactiveLayers, (e) => {
  if (!e.features || e.features.length === 0) return;
  
  const feature = e.features[0];
  let entityType, actionName;

  switch (feature.layer.id) {
    case this.LAYER_IDS.BEACHES:
      entityType = "beach";
      actionName = "selectBeachFromMap";
      break;
    case this.LAYER_IDS.REGIONS:
      entityType = "region"; 
      actionName = "selectRegion";
      break;
    case this.LAYER_IDS.STATES:
      entityType = "state";
      actionName = "selectState";
      break;
  }
  
  ActionController.execute(actionName, { entityType, feature });
});
```

### Hover Effects

Interactive hover states provide visual feedback:

**Features:**
- Cursor changes to pointer over interactive features
- Feature state updates for visual highlighting
- Efficient state management to prevent redundant updates
- Automatic cleanup when mouse leaves features

**Implementation:**
```javascript
// Mouse enter - set hover state
AppState.getMap().on("mousemove", interactiveLayers, (e) => {
  if (e.features.length > 0) {
    AppState.getMap().getCanvas().style.cursor = "pointer";
    
    if (this.hoveredFeature && this.hoveredFeature.id !== e.features[0].id) {
      // Clear previous hover state
      AppState.getMap().setFeatureState(this.hoveredFeature, { state: false });
    }
    
    // Set new hover state
    this.hoveredFeature = e.features[0];
    AppState.getMap().setFeatureState(this.hoveredFeature, { state: true });
  }
});

// Mouse leave - clear hover state
AppState.getMap().on("mouseleave", interactiveLayers, () => {
  if (this.hoveredFeature) {
    AppState.getMap().setFeatureState(this.hoveredFeature, { state: false });
  }
  this.hoveredFeature = null;
  AppState.getMap().getCanvas().style.cursor = "";
});
```

## Dynamic Content Updates

### Sidebar List Updates

#### `updateSidebarListFromMap()`

Updates the sidebar list based on currently visible map features with intelligent feature prioritization.

**Algorithm:**
1. **Beach Priority**: Query for individual beach features first
2. **Region Fallback**: If no beaches, query for region clusters
3. **State Fallback**: If no regions, query for state features
4. **Empty State**: Show "no items" message if nothing found

**Features:**
- Debounced execution (250ms) to prevent excessive updates
- Intelligent feature type detection
- Cluster leaf expansion for accurate counts
- City image integration for regions
- Automatic UI updates through UIController

**Example Flow:**
```javascript
// Called on map moveend with debouncing
AppState.getMap().on(
  "moveend",
  Utils.debounce(async () => {
    if (ui.currentSidebar !== "list") return; // Skip if not needed
    await this.updateSidebarListFromMap();
  }, 250)
);
```

**Feature Type Detection:**
```javascript
// 1. Query beaches first
const beachFeatures = map.queryRenderedFeatures({
  layers: [this.LAYER_IDS.BEACHES]
});

if (beachFeatures.length > 0) {
  UIController.renderFeatureList(beachFeatures, "beach");
  return;
}

// 2. Fallback to regions
const regionFeatures = map.queryRenderedFeatures({
  layers: [this.LAYER_IDS.REGIONS]
});

// 3. Process cluster data for regions
const featuresWithCounts = await Promise.all(
  regionFeatures.map(region => {
    if (!region.properties.cluster) {
      region.properties.point_count = 1;
      return Promise.resolve(region);
    }
    
    return new Promise(resolve => {
      source.getClusterLeaves(
        region.properties.cluster_id,
        Infinity,
        0,
        (err, leaves) => {
          region.properties.point_count = leaves ? leaves.length : 1;
          resolve(region);
        }
      );
    });
  })
);
```

## Event System Integration

The MapController subscribes to several EventBus events for external control:

### Event Subscriptions

#### `map:flyTo`
Handles external fly-to requests from other modules.

**Event Data:**
```javascript
{
  coordinates: [-118.2437, 34.0522],
  zoom: 14,
  speed: 1.5
}
```

#### `map:showPopup`
Handles external popup display requests with optional delay.

**Event Data:**
```javascript
{
  feature: geoJSONFeature,
  details: beachDataObject, // optional
  delay: 100 // optional
}
```

#### `map:closeAllPopups`
Handles external requests to close all popups.

#### `map:zoomTo`
Handles external zoom requests without changing center.

**Event Data:**
```javascript
{
  zoom: 12,
  speed: 1.2
}
```

### Setup Method
```javascript
setupBusSubscriptions() {
  EventBus.subscribe("map:flyTo", this.flyTo.bind(this));
  EventBus.subscribe("map:showPopup", (data) => {
    if (data && data.feature) {
      setTimeout(
        () => this.showPopup(data.feature, data.details),
        data.delay || 0
      );
    }
  });
  EventBus.subscribe("map:closeAllPopups", this.closeAllPopups.bind(this));
  EventBus.subscribe("map:zoomTo", this.zoomTo.bind(this));
}
```

## City Image Integration

The MapController integrates static city image data for enhanced region visualization:

```javascript
// Load city images from static data
const cityImageMap = new Map(
  cityImageData.features.map(feature => [
    feature.properties.Name,
    feature.properties.Image
  ])
);

// Apply images to region features
featuresWithCounts.forEach(feature => {
  const imageName = feature.properties.name;
  if (cityImageMap.has(imageName)) {
    feature.properties.Image = cityImageMap.get(imageName);
  }
});
```

**City Image Data Structure:**
```javascript
{
  "type": "FeatureCollection",
  "features": [
    {
      "properties": {
        "Name": "Los Angeles",
        "Image": "https://cdn.prod.website-files.com/.../la-min.jpg"
      }
    }
  ]
}
```

## Error Handling

### Initialization Errors
```javascript
try {
  // Map initialization
  await MapController.init();
} catch (error) {
  console.error("Failed to initialize map:", error);
  Utils.showError(
    document.querySelector(Config.SELECTORS.MAP_CONTAINER),
    "Failed to load map. Please check your connection and try again."
  );
}
```

### Interactive Layer Validation
```javascript
const interactiveLayers = Object.values(this.LAYER_IDS).filter(Boolean);

if (interactiveLayers.length === 0) {
  console.warn(
    "⚠️ No interactive layers are defined in LAYER_IDS. Clicks will not work."
  );
  return;
}
```

### Cluster Data Handling
```javascript
source.getClusterLeaves(
  region.properties.cluster_id,
  Infinity,
  0,
  (err, leaves) => {
    if (err) {
      console.error("Could not get cluster leaves:", err);
      region.properties.point_count =
        region.properties.point_count_abbreviated || 1;
      resolve(region);
      return;
    }
    region.properties.point_count = leaves.length;
    resolve(region);
  }
);
```

## Performance Optimizations

### Debounced Updates
```javascript
// Prevent excessive sidebar updates during map movement
AppState.getMap().on(
  "moveend",
  Utils.debounce(async () => {
    await this.updateSidebarListFromMap();
  }, 250)
);
```

### Efficient Feature Queries
```javascript
// Query specific layers only when needed
const beachFeatures = map.queryRenderedFeatures({
  layers: [this.LAYER_IDS.BEACHES]
});
```

### Popup Tracking
```javascript
// Track popups for efficient cleanup
AppState.dispatch({ type: "ADD_OPEN_POPUP", payload: popup });
popup.on("close", () => {
  AppState.dispatch({ type: "REMOVE_OPEN_POPUP", payload: popup });
});
```

### Hover State Optimization
```javascript
// Prevent redundant hover state updates
if (
  this.hoveredFeature &&
  this.hoveredFeature.id === e.features[0].id
) {
  // Do nothing if it's the same feature
} else {
  // Update hover state
}
```

## Responsive Design

### Mobile Adaptations
```javascript
// Different starting positions for mobile vs desktop
center: Utils.isMobileView()
  ? Config.MAP.MOBILE_START_POSITION
  : Config.MAP.DESKTOP_START_POSITION
```

### Container Resize Handling
```javascript
// Automatic map resize on container changes
const mapContainer = document.querySelector(Config.SELECTORS.MAP_CONTAINER);
const resizeObserver = new ResizeObserver(() => map.resize());
resizeObserver.observe(mapContainer);
```

## Integration Examples

### Custom Layer Addition
```javascript
// Add new layer to LAYER_IDS
LAYER_IDS: {
  // ... existing layers
  CUSTOM_POIS: "custom-poi-layer"
}

// Add to click handler
switch (feature.layer.id) {
  // ... existing cases
  case this.LAYER_IDS.CUSTOM_POIS:
    entityType = "poi";
    actionName = "selectPOI";
    break;
}
```

### Custom Popup Content
```javascript
showCustomPopup(feature, customData) {
  const popupHTML = `
    <div class="custom-popup">
      <h3>${customData.title}</h3>
      <p>${customData.description}</p>
      <button onclick="handleCustomAction()">Custom Action</button>
    </div>
  `;
  
  const popup = new mapboxgl.Popup({ offset: Config.UI.POPUP_OFFSET })
    .setLngLat(feature.geometry.coordinates)
    .setHTML(popupHTML)
    .addTo(AppState.getMap());
    
  AppState.dispatch({ type: "ADD_OPEN_POPUP", payload: popup });
}
```

### External Map Control
```javascript
// From other modules
EventBus.publish("map:flyTo", {
  coordinates: targetCoordinates,
  zoom: 15,
  speed: 2.0
});

EventBus.publish("map:showPopup", {
  feature: selectedFeature,
  details: additionalData,
  delay: 500
});
```

## Best Practices

### Event Handler Management
1. **Use Consistent Layer IDs**: Ensure LAYER_IDS match Mapbox Studio configuration
2. **Handle Missing Features**: Always check for feature existence before processing
3. **Cleanup Resources**: Properly dispose of popups and event listeners
4. **Debounce Frequent Events**: Prevent performance issues with rapid updates

### State Management
1. **Cache Frequently Accessed Data**: Use AppState for feature and UI element caching
2. **Minimize Direct DOM Manipulation**: Prefer EventBus communication over direct calls
3. **Handle Async Operations**: Properly await cluster data expansion and API calls
4. **Validate Layer Existence**: Check if layers exist before setting up interactions

### Performance
1. **Limit Feature Queries**: Query only necessary layers for each operation
2. **Use Efficient Data Structures**: Leverage Maps for O(1) lookups
3. **Implement Progressive Enhancement**: Start with basic features and add complexity
4. **Monitor Memory Usage**: Clean up resources and prevent memory leaks

### Error Recovery
1. **Graceful Degradation**: Provide fallbacks when map features fail
2. **User-Friendly Messages**: Show helpful error messages for users
3. **Console Logging**: Maintain detailed logs for debugging
4. **Validation**: Validate configuration and data before using