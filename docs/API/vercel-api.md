# Salty Beaches - API Documentation

## Table of Contents

1. [Backend APIs](#backend-apis)
2. [Frontend Core Modules](#frontend-core-modules)
3. [Configuration System](#configuration-system)
4. [Views & Services](#views--services)
5. [Event System](#event-system)
6. [Usage Examples](#usage-examples)
7. [Development Patterns](#development-patterns)

---

## Backend APIs

### Beaches API

**Endpoint:** `GET /api/beaches`

Fetches all beach data from Webflow CMS with comprehensive data transformation.

#### Response Format
```json
[
  {
    "id": "beach_id_123",
    "name": "Malibu Beach",
    "adress": "123 Beach St, Malibu, CA",
    "main-image": {
      "url": "https://images.example.com/beach.jpg"
    },
    "temperature": 72.5,
    "feels_like": 75.2,
    "humidity": 68.0,
    "windSpeed": 12.3,
    "water_temp": 65.8,
    "wave_height": 3.2,
    "stateName": "California",
    "countryName": "USA",
    // ... more weather and amenity data
  }
]
```

#### Implementation Details
- **Pagination Handling**: Automatically fetches all items from Webflow API
- **Schema Dynamic Mapping**: Fetches collection schema for Option field transformations
- **Data Transformation**: Converts raw Webflow data to frontend-friendly format
- **Weather Data Parsing**: Parses numeric weather data from string fields

#### Environment Variables Required
```env
WEBFLOW_API_TOKEN=your_webflow_api_token
BEACHES_COLLECTION_ID=your_collection_id
```

---

## Frontend Core Modules

### AppState

Global state management using Redux-like reducer pattern.

#### Public Methods

##### `dispatch(action)`
Dispatches an action to update the application state.

**Parameters:**
- `action` (Object): Action object with `type` and optional `payload`

**Example:**
```javascript
AppState.dispatch({
  type: "SET_SELECTION",
  payload: { type: "beach", id: "beach_123", feature: featureObject }
});
```

##### `getState()`
Returns the current application state.

**Returns:** Complete state object

**Example:**
```javascript
const currentState = AppState.getState();
console.log(currentState.currentSelection);
```

##### Specialized Getters

```javascript
// Get map instance
const map = AppState.getMap();

// Get current selection
const selection = AppState.getCurrentSelection();

// Get cached beach data by ID
const beach = AppState.getBeachById("beach_123");

// Get visible features
const features = AppState.getVisibleFeatures();

// Get open popups
const popups = AppState.getOpenPopups();
```

#### State Structure
```javascript
{
  map: mapboxInstance,
  currentSelection: {
    id: "beach_123",
    type: "beach",
    feature: geoJSONFeature
  },
  cache: {
    weatherData: Map(),
    visibleFeatures: Map(),
    beachData: Map()
  },
  ui: {
    currentSidebar: "home|list|detail",
    isMobile: boolean,
    isLoading: boolean,
    elements: {},
    openPopups: []
  }
}
```

#### Available Actions

| Action Type | Payload | Description |
|-------------|---------|-------------|
| `SET_MAP_INSTANCE` | `mapInstance` | Sets the Mapbox map instance |
| `SET_SELECTION` | `{id, type, feature}` | Updates current selection |
| `CLEAR_SELECTION` | none | Clears current selection |
| `SET_VISIBLE_FEATURES` | `features[]` | Updates visible features cache |
| `SET_UI_STATE` | `uiState` | Updates UI state properties |
| `SET_WEATHER_DATA` | `{id, data}` | Caches weather data for a location |
| `SET_ALL_BEACH_DATA` | `beaches[]` | Caches all beach data |

---

### MapController

Handles all Mapbox map interactions and rendering.

#### Public Methods

##### `init()`
Initializes the Mapbox map with configured style and settings.

**Example:**
```javascript
await MapController.init();
```

##### `flyTo(options)`
Animates the map to a specific location.

**Parameters:**
- `options.coordinates` (Array): `[longitude, latitude]`
- `options.zoom` (Number): Target zoom level
- `options.speed` (Number): Animation speed

**Example:**
```javascript
MapController.flyTo({
  coordinates: [-118.2437, 34.0522],
  zoom: 14,
  speed: 1.5
});
```

##### `showPopup(feature, details)`
Displays a popup for a map feature.

**Parameters:**
- `feature` (Object): GeoJSON feature
- `details` (Object): Additional details from cache

**Example:**
```javascript
MapController.showPopup(beachFeature, cachedBeachData);
```

##### `closeAllPopups()`
Closes all open popups on the map.

##### `zoomTo(options)`
Zooms to a specific level without changing center.

**Parameters:**
- `options.zoom` (Number): Target zoom level
- `options.speed` (Number): Animation speed

#### Layer IDs
```javascript
LAYER_IDS: {
  STATES: "salty-state",
  CALIFORNIA: "California", 
  HAWAII: "Hawaii",
  REGIONS: "salty-city",
  BEACHES: "salty-beaches"
}
```

---

### UIController

Coordinates UI interactions and manages DOM elements.

#### Public Methods

##### `init()`
Initializes the UI controller, caches DOM elements, and sets up event listeners.

##### `showSidebar(type)`
Shows a specific sidebar panel.

**Parameters:**
- `type` (String): `"home"`, `"list"`, or `"detail"`

**Example:**
```javascript
UIController.showSidebar("detail");
```

##### `renderFeatureList(features, type)`
Renders a list of features in the sidebar.

**Parameters:**
- `features` (Array): Array of GeoJSON features
- `type` (String): Feature type (`"beach"`, `"region"`, `"state"`)

**Example:**
```javascript
UIController.renderFeatureList(beachFeatures, "beach");
```

##### `toggleFullscreen()`
Toggles fullscreen mode (mobile: map/sidebar toggle, desktop: sidebar visibility).

##### Mobile-Specific Methods
```javascript
UIController.showMap();    // Show map on mobile
UIController.hideMap();    // Hide map on mobile
```

---

### EventBus

Simple Pub/Sub event system for module communication.

#### Public Methods

##### `subscribe(eventName, callback)`
Subscribes to an event.

**Parameters:**
- `eventName` (String): Name of the event
- `callback` (Function): Function to call when event is published

**Returns:** Object with `unsubscribe()` method

**Example:**
```javascript
const subscription = EventBus.subscribe("map:flyTo", (data) => {
  console.log("Flying to:", data.coordinates);
});

// Later...
subscription.unsubscribe();
```

##### `publish(eventName, data)`
Publishes an event to all subscribers.

**Parameters:**
- `eventName` (String): Name of the event
- `data` (Any): Data to pass to subscribers

**Example:**
```javascript
EventBus.publish("map:flyTo", {
  coordinates: [-118.2437, 34.0522],
  zoom: 14
});
```

#### Standard Events

| Event Name | Data | Description |
|------------|------|-------------|
| `state:changed` | `{newState, oldState, action}` | Fired on any state change |
| `state:selectionChanged` | `selection` | Fired when selection changes |
| `map:flyTo` | `{coordinates, zoom, speed}` | Request map to fly to location |
| `map:showPopup` | `{feature, details, delay}` | Request popup display |
| `map:closeAllPopups` | none | Close all popups |
| `ui:sidebarRequested` | `{sidebar}` | Request sidebar change |
| `ui:fullscreenToggled` | none | Toggle fullscreen mode |

---

### ActionController

Executes predefined action sequences based on configuration.

#### Public Methods

##### `execute(actionName, context)`
Executes a named action sequence.

**Parameters:**
- `actionName` (String): Key from `Config.EVENT_ACTIONS`
- `context` (Object): Contextual data (feature, entityType, etc.)

**Example:**
```javascript
ActionController.execute("selectBeachFromMap", {
  entityType: "beach",
  feature: beachFeature
});
```

#### Action Types

| Action Type | Parameters | Description |
|-------------|------------|-------------|
| `FLY_TO` | `zoomLevel`, `speed` | Fly map to feature location |
| `UPDATE_APP_STATE` | none | Update app state with current feature |
| `SHOW_SIDEBAR` | `sidebar` | Show specific sidebar |
| `SHOW_POPUP` | `delay` | Show popup for current feature |
| `CLOSE_ALL_POPUPS` | none | Close all map popups |
| `ZOOM_TO` | `zoomLevel`, `speed` | Zoom map to level |
| `TOGGLE_FULLSCREEN` | none | Toggle fullscreen mode |
| `FLY_TO_DEFAULT_POSITION` | none | Return to default map position |

#### Conditional Actions
Actions can include `when` conditions:

```javascript
{
  type: "FLY_TO",
  zoomLevel: 14,
  when: { context: "isMobile" }
}
```

---

### DataController

Manages data fetching and caching.

#### Public Methods

##### `init()`
Initializes data controller and pre-fetches beach data.

##### `prefetchAllBeachData()`
Fetches all beach data from the API and caches it in AppState.

**Example:**
```javascript
await DataController.prefetchAllBeachData();
```

---

### Utils

Collection of utility functions for common operations.

#### Public Methods

##### `isMobileView()`
Checks if current viewport is mobile size.

**Returns:** Boolean

**Example:**
```javascript
if (Utils.isMobileView()) {
  // Mobile-specific logic
}
```

##### `debounce(func, wait)`
Creates a debounced version of a function.

**Parameters:**
- `func` (Function): Function to debounce
- `wait` (Number): Delay in milliseconds

**Returns:** Debounced function

**Example:**
```javascript
const debouncedSearch = Utils.debounce(() => {
  // Search logic
}, 300);
```

##### DOM Utilities

```javascript
// Show loading state
Utils.showLoading(element);

// Show error message
Utils.showError(element, "Error message");

// Get unique feature ID
const id = Utils.getFeatureEntityId(feature);

// Update DOM element with value
Utils.updateElement({
  element: domElement,
  value: "New Value",
  type: "text", // or "href", "src", "html"
  defaultValue: "N/A",
  transform: (val) => val.toUpperCase()
});

// Populate elements with data binding
Utils.renderView(container, dataObject);
```

---

## Configuration System

### Config Structure

The configuration is modular and split across multiple files:

```javascript
Config = {
  MAP: mapConfig,           // Map settings
  EVENT_ACTIONS: eventActionsConfig,  // Action definitions
  API: apiConfig,           // API endpoints
  WEBFLOW: webflowConfig,   // Webflow settings
  SELECTORS: selectorsConfig,  // DOM selectors
  UI: uiConfig,             // UI settings
  FEATURE_CONFIG: featureConfig  // Feature rendering config
}
```

### Map Configuration (`js/config/map.js`)

```javascript
{
  ACCESS_TOKEN: "pk.eyJ1...",
  STYLE: "mapbox://styles/...",
  DEFAULT_ZOOM: 2,
  DESKTOP_START_POSITION: [-123.046253, 33.837038],
  MOBILE_START_POSITION: [-140.3628729, 33.900661],
  START_PITCH: 0,
  DETAIL_ZOOM: 15,
  MOBILE_BREAKPOINT: 768
}
```

### API Configuration (`js/config/api.js`)

```javascript
{
  BASE_URL: "https://salty-development-2.vercel.app",
  WEATHER_PROXY_URL: ""
}
```

### Event Actions Configuration (`js/config/actions.js`)

Defines predefined action sequences:

```javascript
{
  selectBeachFromMap: {
    description: "Action when a beach is selected from the map",
    actions: [
      { type: "UPDATE_APP_STATE" },
      { type: "FLY_TO", zoomLevel: 14.5, speed: 2, when: { context: "isMobile" } },
      { type: "SHOW_POPUP", delay: 100 },
      { type: "SHOW_SIDEBAR", sidebar: "detail", when: { context: "isMobile" } }
    ]
  }
}
```

### UI Configuration (`js/config/ui.js`)

```javascript
selectorsConfig = {
  MAP_CONTAINER: "#map-container",
  SIDEBAR_WRAPPER: '[sidebar="wrapper"]',
  BEACH_DETAIL_TITLE: '[beach-data="title"]',
  // ... more selectors
}

uiConfig = {
  MAP_FLY_SPEED: 1.5,
  RENDER_DELAY: 150,
  POPUP_OFFSET: 32
}
```

---

## Views & Services

### FeatureListView

Handles rendering of feature lists in the sidebar.

#### Public Methods

##### `init()`
Initializes the feature list view.

##### `renderFeatureList(features, type)`
Renders a list of features using configured templates.

**Parameters:**
- `features` (Array): Features to render
- `type` (String): Feature type for template selection

### DetailView

Manages the detail sidebar for individual beach information.

#### Public Methods

##### `init()`
Initializes the detail view.

##### `updateDetailSidebar()`
Updates the detail sidebar with current selection data.

### ResponsiveService

Handles responsive design and viewport changes.

#### Public Methods

##### `init()`
Initializes responsive service and sets up viewport listeners.

---

## Event System

### Event Flow Architecture

```
User Interaction → ActionController → EventBus → Module Response
```

1. **User clicks** on map feature or UI element
2. **ActionController** executes predefined action sequence
3. **EventBus** publishes events for each action
4. **Modules** (Map, UI, State) respond to relevant events
5. **State changes** trigger additional events as needed

### Custom Event Registration

To add new event handlers:

```javascript
// In module initialization
EventBus.subscribe("custom:event", (data) => {
  // Handle custom event
});

// To trigger the event
EventBus.publish("custom:event", { 
  customData: "value" 
});
```

---

## Usage Examples

### Adding a New Feature Type

1. **Add layer configuration:**
```javascript
// In MapController.LAYER_IDS
NEW_FEATURE: "new-feature-layer"
```

2. **Configure feature rendering:**
```javascript
// In js/config/ui.js featureConfig
newFeature: {
  templateId: "#new-feature-template",
  actionName: "selectNewFeature",
  dataMapping: {
    '[new-feature="title"]': {
      type: "text",
      source: (p) => p.Name || "Unnamed Feature"
    }
  }
}
```

3. **Define action sequence:**
```javascript
// In js/config/actions.js
selectNewFeature: {
  description: "Action when new feature is selected",
  actions: [
    { type: "UPDATE_APP_STATE" },
    { type: "FLY_TO", zoomLevel: 12 },
    { type: "SHOW_SIDEBAR", sidebar: "list" }
  ]
}
```

### Custom Action Implementation

```javascript
// In ActionController.runAction()
case "CUSTOM_ACTION":
  // Custom logic here
  EventBus.publish("custom:actionExecuted", action);
  break;
```

### Adding Weather Data Display

```javascript
// Fetch weather data
const weatherData = await fetch('/api/weather');

// Update state
AppState.dispatch({
  type: "SET_WEATHER_DATA",
  payload: { id: beachId, data: weatherData }
});

// Access in components
const weather = AppState.getState().cache.weatherData.get(beachId);
```

---

## Development Patterns

### State Management Pattern
- Use `AppState.dispatch()` for all state changes
- Subscribe to `state:changed` for reactive updates
- Implement pure reducer functions for predictable state transitions

### Event-Driven Communication
- Modules communicate only through EventBus
- Use descriptive event names with module prefixes
- Avoid direct module dependencies

### Configuration-Driven Features
- Define behavior in configuration files
- Use ActionController for complex interaction sequences
- Implement data mapping for flexible UI rendering

### Error Handling
```javascript
try {
  await SomeOperation();
} catch (error) {
  console.error("[ModuleName] Operation failed:", error);
  Utils.showError(container, "User-friendly error message");
}
```

### Performance Considerations
- Use `Utils.debounce()` for frequent events (map movements, resize)
- Cache DOM elements in AppState.ui.elements
- Pre-fetch data in DataController.init()

---

## API Integration Guidelines

### Adding New Endpoints

1. **Create API handler:**
```javascript
// api/newEndpoint.js
export default async function handler(req, res) {
  try {
    // API logic
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

2. **Update configuration:**
```javascript
// js/config/api.js
export const apiConfig = {
  BASE_URL: "...",
  NEW_ENDPOINT: "/api/newEndpoint"
};
```

3. **Use in frontend:**
```javascript
const response = await fetch(`${Config.API.BASE_URL}${Config.API.NEW_ENDPOINT}`);
const data = await response.json();
```

### Data Transformation Best Practices

- Transform data at the API level for consistent frontend consumption
- Use meaningful property names in transformed data
- Handle missing/null values gracefully
- Document data structure changes in API responses

---

This documentation provides comprehensive coverage of all public APIs, functions, and components in the Salty Beaches application. For specific implementation details, refer to the individual module files in the codebase.