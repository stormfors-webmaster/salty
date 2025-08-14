# DataController Module Documentation

## Overview

The `DataController` is responsible for managing data fetching, caching, and pre-loading operations in the Salty Beaches application. It serves as the central data management layer, ensuring that beach data is available throughout the application lifecycle and optimizing performance through intelligent caching strategies.

## Location
`js/dataController.js`

## Dependencies
- `AppState` - Application state management for data caching
- `apiConfig` - API configuration for endpoint URLs

## Architecture

The DataController implements a pre-loading strategy where critical data is fetched during application initialization and cached in AppState for immediate access throughout the application lifecycle. This approach minimizes loading times and provides a responsive user experience.

### Design Principles
- **Pre-loading**: Fetch critical data during app initialization
- **Centralized Caching**: Store all data in AppState for global access
- **Error Resilience**: Graceful handling of network failures
- **Performance Optimization**: Minimize API calls and loading states

## Public API

### Initialization

#### `init()`

Initializes the data controller and triggers pre-fetching of all critical application data.

**Returns:** Promise - Resolves when initialization is complete

**Features:**
- Triggers pre-fetching of beach data
- Logs initialization progress
- Handles initialization errors gracefully
- Sets up data caching infrastructure

**Example Usage:**
```javascript
// In main application initialization
async function initializeApp() {
  try {
    await DataController.init();
    console.log("Data pre-loading completed");
  } catch (error) {
    console.error("Data initialization failed:", error);
    // Application can still function with reduced capabilities
  }
}
```

**Implementation:**
```javascript
async init() {
  console.log("[DataController] Initializing data pre-fetch.");
  await this.prefetchAllBeachData();
}
```

### Data Fetching

#### `prefetchAllBeachData()`

Fetches all beach data from the API and caches it in the application state for immediate access.

**Returns:** Promise - Resolves when all data is fetched and cached

**Features:**
- Fetches complete beach dataset from `/api/beaches`
- Handles HTTP errors with detailed logging
- Caches data in AppState for O(1) lookup performance
- Provides comprehensive error reporting

**Example Usage:**
```javascript
// Manual data refresh
try {
  await DataController.prefetchAllBeachData();
  console.log("Beach data refreshed successfully");
} catch (error) {
  console.error("Failed to refresh beach data:", error);
}

// Check if data is available
const beach = AppState.getBeachById("beach_123");
if (beach) {
  console.log("Beach data available:", beach.name);
} else {
  console.log("Beach data not yet loaded");
}
```

**Implementation Details:**
```javascript
async prefetchAllBeachData() {
  try {
    const response = await fetch(`${apiConfig.BASE_URL}/api/beaches`);
    console.log('[DataController] Fetch response status:', response.status);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const beachData = await response.json();
    console.log(`[DataController] Fetched ${beachData.length} beach items.`);

    AppState.dispatch({ type: "SET_ALL_BEACH_DATA", payload: beachData });
    console.log("[DataController] All beach data pre-fetched and cached.");
  } catch (error) {
    console.error("[DataController] Failed to pre-fetch beach data:", error);
  }
}
```

## Data Flow Architecture

### Initialization Sequence
```
App Start → DataController.init() → prefetchAllBeachData() → API Request → AppState Cache → Ready
```

### Data Access Pattern
```
Component Request → AppState.getBeachById() → Cached Data (O(1) lookup) → Immediate Response
```

### Error Handling Flow
```
API Error → Console Logging → Graceful Degradation → App Continues with Limited Data
```

## Caching Strategy

### Pre-loading Benefits
1. **Immediate Access**: Data available instantly after initialization
2. **Reduced Loading States**: No loading spinners for cached data
3. **Offline Resilience**: Cached data available even if API becomes unavailable
4. **Consistent Performance**: Predictable response times

### Cache Implementation
```javascript
// Data stored in AppState as Map for O(1) access
AppState.dispatch({ 
  type: "SET_ALL_BEACH_DATA", 
  payload: beachArray 
});

// Automatic Map creation in AppState reducer
case "SET_ALL_BEACH_DATA":
  const beachMap = new Map();
  action.payload.forEach(beach => beachMap.set(beach.id, beach));
  return { 
    ...state, 
    cache: { 
      ...state.cache, 
      beachData: beachMap 
    } 
  };
```

### Data Access Patterns
```javascript
// Direct access through AppState
const beach = AppState.getBeachById("beach_123");

// Bulk data access
const allBeaches = Array.from(AppState.getState().cache.beachData.values());

// Filtered access
const californiaBeaches = allBeaches.filter(beach => 
  beach.stateName === "California"
);
```

## Integration with Application Modules

### MapController Integration
```javascript
// Map popups use cached data for rich content
const showBeachPopup = (feature) => {
  const beachId = feature.properties["Item ID"];
  const beachDetails = AppState.getBeachById(beachId);
  
  MapController.showPopup(feature, beachDetails);
};
```

### DetailView Integration
```javascript
// Detail view immediately populates with cached data
EventBus.subscribe("state:selectionChanged", (selection) => {
  if (selection.type === "beach") {
    const beachData = AppState.getBeachById(selection.id);
    if (beachData) {
      DetailView.populateWithData(beachData);
    }
  }
});
```

### FeatureListView Integration
```javascript
// Enhanced list items with cached data
const enhanceFeatureWithData = (feature) => {
  const beachId = Utils.getFeatureEntityId(feature);
  const beachData = AppState.getBeachById(beachId);
  
  return {
    ...feature,
    enhancedData: beachData || {}
  };
};
```

## Error Handling and Resilience

### Network Error Handling
```javascript
async prefetchAllBeachData() {
  try {
    const response = await fetch(`${apiConfig.BASE_URL}/api/beaches`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Process successful response
  } catch (error) {
    console.error("[DataController] Failed to pre-fetch beach data:", error);
    // Application continues with graceful degradation
  }
}
```

### Graceful Degradation Strategies
1. **Fallback to Feature Properties**: Use basic map feature data if cache unavailable
2. **Progressive Enhancement**: Core functionality works without cached data
3. **User Feedback**: Inform users when enhanced features are unavailable
4. **Retry Mechanisms**: Future enhancement could include automatic retries

### Error Monitoring
```javascript
// Comprehensive error logging
console.log('[DataController] Fetch response status:', response.status);
console.log(`[DataController] Fetched ${beachData.length} beach items.`);
console.error("[DataController] Failed to pre-fetch beach data:", error);
```

## Performance Characteristics

### Time Complexity
- **Data Fetching**: O(n) where n = number of beaches
- **Data Storage**: O(n) for Map creation
- **Data Access**: O(1) for individual beach lookup
- **Bulk Operations**: O(n) for filtering/mapping operations

### Memory Usage
- **Storage Efficiency**: Map structure for optimal lookup performance
- **Memory Footprint**: Complete dataset loaded into memory
- **Cache Persistence**: Data persists for entire application session

### Network Optimization
- **Single Request**: All data fetched in one API call
- **Compression**: API responses can be gzipped
- **Caching Headers**: Future enhancement for HTTP caching

## Configuration Dependencies

### API Configuration
```javascript
// Dependent on API configuration
import { apiConfig } from "./config/api.js";

// Uses configured base URL
const response = await fetch(`${apiConfig.BASE_URL}/api/beaches`);
```

### Required Configuration Values
- `apiConfig.BASE_URL` - Base URL for API requests

## Future Enhancements

### Incremental Loading
```javascript
// Future: Load data in chunks for better performance
async prefetchBeachDataIncremental() {
  const pageSize = 50;
  let offset = 0;
  let allData = [];
  
  while (true) {
    const pageData = await this.fetchBeachPage(offset, pageSize);
    if (pageData.length === 0) break;
    
    allData = allData.concat(pageData);
    offset += pageSize;
    
    // Update cache incrementally
    AppState.dispatch({ 
      type: "ADD_BEACH_DATA", 
      payload: pageData 
    });
  }
}
```

### Smart Caching
```javascript
// Future: Intelligent cache invalidation
class SmartDataController extends DataController {
  constructor() {
    this.cacheTimestamp = null;
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }
  
  async getBeachData(force = false) {
    const now = Date.now();
    const isCacheStale = !this.cacheTimestamp || 
      (now - this.cacheTimestamp) > this.cacheTimeout;
    
    if (force || isCacheStale) {
      await this.prefetchAllBeachData();
      this.cacheTimestamp = now;
    }
    
    return AppState.getState().cache.beachData;
  }
}
```

### Background Sync
```javascript
// Future: Background data synchronization
async enableBackgroundSync() {
  setInterval(async () => {
    try {
      await this.prefetchAllBeachData();
      console.log("[DataController] Background sync completed");
    } catch (error) {
      console.warn("[DataController] Background sync failed:", error);
    }
  }, 10 * 60 * 1000); // Sync every 10 minutes
}
```

## Testing Strategies

### Unit Testing
```javascript
describe('DataController', () => {
  beforeEach(() => {
    // Mock fetch
    global.fetch = jest.fn();
    
    // Reset AppState
    AppState.dispatch({ type: "CLEAR_ALL_DATA" });
  });
  
  test('should fetch and cache beach data', async () => {
    const mockBeaches = [
      { id: "beach_1", name: "Test Beach 1" },
      { id: "beach_2", name: "Test Beach 2" }
    ];
    
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockBeaches)
    });
    
    await DataController.prefetchAllBeachData();
    
    expect(AppState.getBeachById("beach_1")).toEqual(mockBeaches[0]);
    expect(AppState.getBeachById("beach_2")).toEqual(mockBeaches[1]);
  });
  
  test('should handle fetch errors gracefully', async () => {
    fetch.mockRejectedValue(new Error("Network error"));
    
    // Should not throw
    await expect(DataController.prefetchAllBeachData()).resolves.toBeUndefined();
    
    // Cache should remain empty
    expect(AppState.getState().cache.beachData.size).toBe(0);
  });
});
```

### Integration Testing
```javascript
describe('DataController Integration', () => {
  test('should enable immediate data access after initialization', async () => {
    // Mock successful API response
    const mockData = [{ id: "beach_1", name: "Test Beach" }];
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData)
    });
    
    await DataController.init();
    
    // Data should be immediately available
    const beach = AppState.getBeachById("beach_1");
    expect(beach).toBeDefined();
    expect(beach.name).toBe("Test Beach");
  });
});
```

## Best Practices

### Initialization
1. **Early Loading**: Initialize DataController early in app lifecycle
2. **Error Tolerance**: Don't block app initialization on data loading failures
3. **Progress Feedback**: Log loading progress for debugging
4. **Timeout Handling**: Consider adding request timeouts for poor network conditions

### Caching
1. **Efficient Storage**: Use Map structures for O(1) lookups
2. **Memory Management**: Monitor memory usage for large datasets
3. **Cache Invalidation**: Plan for data freshness requirements
4. **Fallback Strategies**: Provide graceful degradation when cache is empty

### Error Handling
1. **Comprehensive Logging**: Log all error details for debugging
2. **User Communication**: Inform users when data is unavailable
3. **Recovery Mechanisms**: Provide manual refresh capabilities
4. **Monitoring**: Track error rates and performance metrics

### Performance
1. **Single Source**: Minimize API calls through centralized data management
2. **Lazy Access**: Only fetch data when actually needed
3. **Batch Operations**: Group related data operations
4. **Memory Efficiency**: Clean up unnecessary cached data when possible

## Integration Examples

### Custom Data Sources
```javascript
// Extend DataController for additional data sources
class ExtendedDataController extends DataController {
  async init() {
    await super.init();
    await this.prefetchWeatherData();
    await this.prefetchPOIData();
  }
  
  async prefetchWeatherData() {
    try {
      const response = await fetch(`${apiConfig.BASE_URL}/api/weather`);
      const weatherData = await response.json();
      
      AppState.dispatch({ 
        type: "SET_WEATHER_DATA", 
        payload: weatherData 
      });
    } catch (error) {
      console.error("Failed to pre-fetch weather data:", error);
    }
  }
}
```

### Data Transformation
```javascript
// Add data transformation pipeline
async prefetchAllBeachData() {
  try {
    const response = await fetch(`${apiConfig.BASE_URL}/api/beaches`);
    const rawData = await response.json();
    
    // Transform data before caching
    const transformedData = rawData.map(beach => ({
      ...beach,
      displayName: `${beach.name} - ${beach.city}`,
      searchableText: `${beach.name} ${beach.city} ${beach.state}`.toLowerCase()
    }));
    
    AppState.dispatch({ 
      type: "SET_ALL_BEACH_DATA", 
      payload: transformedData 
    });
  } catch (error) {
    console.error("Failed to pre-fetch beach data:", error);
  }
}
```

### Real-time Updates
```javascript
// Add real-time data updates
class RealtimeDataController extends DataController {
  constructor() {
    super();
    this.websocket = null;
  }
  
  async init() {
    await super.init();
    this.setupRealtimeUpdates();
  }
  
  setupRealtimeUpdates() {
    this.websocket = new WebSocket('ws://api.example.com/updates');
    
    this.websocket.onmessage = (event) => {
      const update = JSON.parse(event.data);
      
      if (update.type === 'beach_update') {
        AppState.dispatch({
          type: "UPDATE_BEACH_DATA",
          payload: update.data
        });
      }
    };
  }
}
```