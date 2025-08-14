# AppState Module Documentation

## Overview

The `AppState` module implements a Redux-like state management pattern, serving as the single source of truth for the entire application. It provides centralized state management with predictable state transitions through pure reducer functions and event-driven updates.

## Location
`js/appState.js`

## Dependencies
- `EventBus` - Event communication system for state change notifications

## Architecture

The AppState follows the Flux/Redux pattern with these core concepts:
- **Single Source of Truth**: All application state is stored in one place
- **State is Read-Only**: State can only be changed by dispatching actions
- **Pure Reducer Functions**: State changes are predictable and testable
- **Event-Driven Updates**: State changes automatically publish events for reactive updates

### Flow Diagram
```
Action Dispatch → Reducer → New State → Event Publication → Component Updates
```

## State Structure

```javascript
{
  map: mapboxInstance,                    // Mapbox GL JS instance
  currentSelection: {
    id: "beach_123",                      // Selected entity ID
    type: "beach",                        // Entity type (beach|region|state)
    feature: geoJSONFeature               // Complete GeoJSON feature object
  },
  cache: {
    weatherData: Map(),                   // Weather data cache (id → data)
    visibleFeatures: Map(),               // Currently visible features (id → feature)
    beachData: Map()                      // Complete beach data cache (id → beach)
  },
  ui: {
    currentSidebar: "home",               // Active sidebar (home|list|detail)
    isMobile: false,                      // Mobile viewport flag
    isLoading: false,                     // Loading state flag
    elements: {},                         // Cached DOM elements
    openPopups: []                        // Array of open map popups
  }
}
```

## Public API

### Core Methods

#### `dispatch(action)`

Dispatches an action to update the state through the reducer.

**Parameters:**
- `action` (Object) - Action object with required `type` and optional `payload`
  - `action.type` (String) - Action type identifier
  - `action.payload` (Any) - Action data

**Example Usage:**
```javascript
// Set current selection
AppState.dispatch({
  type: "SET_SELECTION",
  payload: { type: "beach", id: "beach_123", feature: featureObject }
});

// Update UI state
AppState.dispatch({
  type: "SET_UI_STATE",
  payload: { currentSidebar: "detail", isLoading: false }
});

// Cache weather data
AppState.dispatch({
  type: "SET_WEATHER_DATA",
  payload: { id: "location_123", data: weatherObject }
});
```

#### `getState()`

Returns the current complete application state.

**Returns:** Object - Complete state object

**Example Usage:**
```javascript
const currentState = AppState.getState();
console.log("Current selection:", currentState.currentSelection);
console.log("UI state:", currentState.ui);
```

### Convenience Getters

#### `getMap()`

Returns the Mapbox GL JS instance.

**Returns:** mapboxgl.Map | null

**Example Usage:**
```javascript
const map = AppState.getMap();
if (map) {
  map.flyTo({ center: [-118.2437, 34.0522], zoom: 14 });
}
```

#### `getCurrentSelection()`

Returns a copy of the current selection state.

**Returns:** Object - Current selection object

**Example Usage:**
```javascript
const selection = AppState.getCurrentSelection();
if (selection.type === "beach") {
  console.log("Selected beach:", selection.id);
}
```

#### `getUICachedElement(key)`

Retrieves a cached DOM element by key.

**Parameters:**
- `key` (String) - Element key from cached elements

**Returns:** HTMLElement | undefined

**Example Usage:**
```javascript
const sidebar = AppState.getUICachedElement("SIDEBAR_WRAPPER");
if (sidebar) {
  sidebar.style.display = "block";
}
```

#### `getVisibleFeatures()`

Returns the Map of currently visible features.

**Returns:** Map - Feature cache (id → feature)

**Example Usage:**
```javascript
const visibleFeatures = AppState.getVisibleFeatures();
console.log(`${visibleFeatures.size} features currently visible`);

// Check if specific feature is visible
const feature = visibleFeatures.get("beach_123");
if (feature) {
  console.log("Beach is visible:", feature.properties.Name);
}
```

#### `getOpenPopups()`

Returns array of currently open map popups.

**Returns:** Array - Open popup instances

**Example Usage:**
```javascript
const popups = AppState.getOpenPopups();
console.log(`${popups.length} popups currently open`);

// Close all popups
popups.forEach(popup => popup.remove());
```

#### `getBeachById(id)`

Retrieves cached beach data by ID.

**Parameters:**
- `id` (String) - Beach ID

**Returns:** Object | undefined - Beach data object

**Example Usage:**
```javascript
const beach = AppState.getBeachById("beach_123");
if (beach) {
  console.log("Beach name:", beach.name);
  console.log("Temperature:", beach.temperature);
}
```

## Action Types

### Map Actions

#### `SET_MAP_INSTANCE`

Sets the Mapbox GL JS map instance.

**Payload:** mapboxgl.Map instance

**Example:**
```javascript
AppState.dispatch({ 
  type: "SET_MAP_INSTANCE", 
  payload: mapInstance 
});
```

### Selection Actions

#### `SET_SELECTION`

Updates the current selection with deduplication logic.

**Payload:** Object with `id`, `type`, and `feature` properties

**Features:**
- Automatic deduplication (prevents unnecessary updates for same selection)
- Publishes `state:selectionChanged` event on change

**Example:**
```javascript
AppState.dispatch({
  type: "SET_SELECTION",
  payload: {
    id: "beach_123",
    type: "beach",
    feature: geoJSONFeature
  }
});
```

#### `CLEAR_SELECTION`

Clears the current selection.

**Payload:** None

**Example:**
```javascript
AppState.dispatch({ type: "CLEAR_SELECTION" });
```

### Feature Cache Actions

#### `SET_VISIBLE_FEATURES`

Updates the cache of currently visible features.

**Payload:** Array of GeoJSON features

**Features:**
- Automatically extracts entity IDs from feature properties
- Uses multiple ID strategies: `"Item ID"`, `NAME`, `Name`, or `feature.id`
- Converts IDs to strings for consistent Map keys

**Example:**
```javascript
AppState.dispatch({
  type: "SET_VISIBLE_FEATURES",
  payload: arrayOfFeatures
});
```

#### `CLEAR_VISIBLE_FEATURES`

Clears the visible features cache.

**Payload:** None

**Example:**
```javascript
AppState.dispatch({ type: "CLEAR_VISIBLE_FEATURES" });
```

### UI State Actions

#### `SET_UI_STATE`

Updates UI state properties with shallow merge.

**Payload:** Object with UI state properties to update

**Example:**
```javascript
AppState.dispatch({
  type: "SET_UI_STATE",
  payload: {
    currentSidebar: "detail",
    isLoading: true,
    isMobile: window.innerWidth <= 768
  }
});
```

### Weather Data Actions

#### `SET_WEATHER_DATA`

Caches weather data for a specific location.

**Payload:** Object with `id` and `data` properties

**Example:**
```javascript
AppState.dispatch({
  type: "SET_WEATHER_DATA",
  payload: {
    id: "location_123",
    data: {
      temperature: 72,
      humidity: 65,
      windSpeed: 12
    }
  }
});
```

#### `DELETE_WEATHER_DATA`

Removes cached weather data for a location.

**Payload:** Object with `id` property

**Example:**
```javascript
AppState.dispatch({
  type: "DELETE_WEATHER_DATA",
  payload: { id: "location_123" }
});
```

### Popup Management Actions

#### `ADD_OPEN_POPUP`

Adds a popup to the tracking array.

**Payload:** mapboxgl.Popup instance

**Example:**
```javascript
const popup = new mapboxgl.Popup().setLngLat(coordinates).addTo(map);
AppState.dispatch({
  type: "ADD_OPEN_POPUP",
  payload: popup
});
```

#### `REMOVE_OPEN_POPUP`

Removes a popup from the tracking array.

**Payload:** mapboxgl.Popup instance

**Example:**
```javascript
AppState.dispatch({
  type: "REMOVE_OPEN_POPUP",
  payload: popupInstance
});
```

#### `CLEAR_OPEN_POPUPS`

Clears all tracked popups.

**Payload:** None

**Example:**
```javascript
AppState.dispatch({ type: "CLEAR_OPEN_POPUPS" });
```

### Beach Data Actions

#### `SET_ALL_BEACH_DATA`

Caches complete beach data collection.

**Payload:** Array of beach objects

**Features:**
- Automatically creates Map with beach.id as keys
- Used for efficient beach data lookups

**Example:**
```javascript
AppState.dispatch({
  type: "SET_ALL_BEACH_DATA",
  payload: arrayOfBeachObjects
});
```

## Event System Integration

The AppState automatically publishes events when state changes occur:

### Generic State Change Event

**Event:** `state:changed`

Published on every state change with comprehensive change information.

**Event Data:**
```javascript
{
  newState: currentState,    // Complete new state
  oldState: previousState,   // Previous state for comparison
  action: dispatchedAction   // The action that caused the change
}
```

**Usage:**
```javascript
EventBus.subscribe("state:changed", ({ newState, oldState, action }) => {
  console.log("State changed:", action.type);
  // React to any state change
});
```

### Specific Selection Change Event

**Event:** `state:selectionChanged`

Published specifically when selection changes, providing just the selection data.

**Event Data:**
```javascript
{
  id: "beach_123",
  type: "beach",
  feature: geoJSONFeature
}
```

**Usage:**
```javascript
EventBus.subscribe("state:selectionChanged", (selection) => {
  if (selection.type === "beach") {
    // Update detail view for beach selection
  }
});
```

## Reducer Implementation

The state updates follow pure function principles:

```javascript
function appReducer(state, action) {
  switch (action.type) {
    case "SET_SELECTION":
      // Deduplication logic
      if (
        state.currentSelection.id === action.payload.id &&
        state.currentSelection.type === action.payload.type
      ) {
        return state; // No change needed
      }
      return { ...state, currentSelection: action.payload };
    
    case "SET_UI_STATE":
      // Shallow merge UI state
      return { 
        ...state, 
        ui: { ...state.ui, ...action.payload } 
      };
    
    // ... other cases
  }
}
```

**Key Principles:**
- **Immutability**: Always return new state objects
- **Shallow Updates**: Use object spread for performance
- **Deduplication**: Prevent unnecessary updates
- **Deep Copying for Nested Objects**: Ensure proper immutability

## Caching Strategy

The AppState implements several caching mechanisms:

### Feature Caching
- **Purpose**: Store currently visible map features for quick access
- **Key Strategy**: Multiple fallback ID extraction methods
- **Lifecycle**: Updated on map movement/zoom
- **Access Pattern**: O(1) lookup by feature ID

### Beach Data Caching
- **Purpose**: Store complete beach information for detail views
- **Key Strategy**: Use beach.id as Map key
- **Lifecycle**: Pre-loaded at application startup
- **Access Pattern**: O(1) lookup by beach ID

### Weather Data Caching
- **Purpose**: Temporary cache for weather API responses
- **Key Strategy**: Location ID as Map key
- **Lifecycle**: 5-minute TTL with automatic cleanup
- **Access Pattern**: Check cache before API calls

### DOM Element Caching
- **Purpose**: Avoid repeated DOM queries
- **Key Strategy**: Configuration-based selector mapping
- **Lifecycle**: Cached at application startup
- **Access Pattern**: Direct property access

## Performance Considerations

### Memory Management
1. **Map Structures**: Use Map objects for O(1) lookups instead of linear array searches
2. **Weather Cache TTL**: Automatic cleanup prevents memory leaks
3. **Popup Tracking**: Ensures popups are properly disposed
4. **Shallow Merging**: Minimizes object creation overhead

### Update Optimization
1. **Deduplication**: Prevents unnecessary state updates and re-renders
2. **Selective Updates**: Only update changed properties
3. **Event Throttling**: Debounced map events prevent excessive updates
4. **Lazy Loading**: Beach data loaded on demand

## Error Handling

The AppState includes defensive programming practices:

```javascript
// Safe feature ID extraction
const entityId = feature.properties["Item ID"] || feature.properties.NAME || 
                 feature.properties.Name || feature.id;
if (entityId) {
  newVisibleFeatures.set(String(entityId), feature);
}

// Safe cache access
getBeachById(id) {
  return currentState.cache.beachData.get(id); // Returns undefined if not found
}
```

## Integration Examples

### React-like Component Updates

```javascript
// Component subscribes to state changes
EventBus.subscribe("state:selectionChanged", (selection) => {
  updateDetailView(selection);
});

// Component updates based on UI state
EventBus.subscribe("state:changed", ({ newState, action }) => {
  if (action.type === "SET_UI_STATE") {
    updateResponsiveLayout(newState.ui.isMobile);
  }
});
```

### Advanced Caching Usage

```javascript
// Check cache before API call
async function getBeachWeather(beachId) {
  const cached = AppState.getState().cache.weatherData.get(beachId);
  if (cached) {
    return cached;
  }
  
  const weather = await fetchWeatherAPI(beachId);
  AppState.dispatch({
    type: "SET_WEATHER_DATA",
    payload: { id: beachId, data: weather }
  });
  
  return weather;
}
```

### Custom State Slices

```javascript
// Add custom state management
case "SET_CUSTOM_DATA":
  return {
    ...state,
    customSlice: {
      ...state.customSlice,
      ...action.payload
    }
  };
```

## Best Practices

### State Design
1. **Keep State Flat**: Minimize nesting for easier updates
2. **Normalize Data**: Use Maps with IDs as keys for relational data
3. **Separate Concerns**: Group related state into logical slices
4. **Immutable Updates**: Always return new objects/arrays

### Action Design
1. **Descriptive Types**: Use clear, descriptive action type names
2. **Consistent Payloads**: Standardize payload structure across similar actions
3. **Single Responsibility**: Each action should handle one specific state change
4. **Validation**: Include payload validation for critical actions

### Performance
1. **Batch Updates**: Group related state changes when possible
2. **Selective Subscriptions**: Subscribe only to relevant state changes
3. **Memoization**: Cache computed values that are expensive to calculate
4. **Cleanup**: Remove event listeners and clear caches when appropriate

### Debugging
1. **Action Logging**: All actions are automatically logged with payloads
2. **State Snapshots**: Use browser dev tools to inspect state changes
3. **Event Tracing**: Monitor EventBus publications for reactive updates
4. **Time Travel**: State history can be tracked for debugging complex flows