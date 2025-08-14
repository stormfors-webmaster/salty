# MockAPI Module Documentation

## Overview

The `MockAPI` module provides simulated API responses for development and testing purposes. It offers mock implementations of various data fetching operations, including beach details, weather data, and points of interest. This module is particularly useful during development when the real API is unavailable or when testing different data scenarios.

## Location
`js/mockAPI.js`

## Dependencies
None - MockAPI is a standalone module with no external dependencies.

## Status
**Deprecated**: This module has been superseded by the real API implementation in `api/beaches.js` and `DataController`. It is maintained for testing and development fallback purposes.

## Architecture

The MockAPI module follows a promise-based approach that simulates real API behavior including:
- Network delays
- Realistic data structures
- Random variations for testing
- Error simulation capabilities

### Design Principles
- **Realistic Simulation**: Mimics actual API response patterns
- **Development Support**: Enables development without backend dependencies
- **Testing Flexibility**: Provides predictable data for testing scenarios
- **Simple Integration**: Drop-in replacement for real API calls

## Public API

### Beach Data Management

#### `fetchBeachDetails(beachId)`

Simulates fetching detailed information for a specific beach.

**Parameters:**
- `beachId` (String) - The unique identifier for the beach

**Returns:** Promise - Resolves to a beach details object

**Simulated Delay:** 500ms

**Example Usage:**
```javascript
// Fetch beach details during development
try {
  const beachDetails = await MockAPI.fetchBeachDetails("beach_123");
  console.log("Beach details:", beachDetails);
  
  displayBeachInfo(beachDetails);
} catch (error) {
  console.error("Failed to fetch beach details:", error);
}

// Use in component testing
const TestBeachComponent = {
  async loadBeach(id) {
    const beach = await MockAPI.fetchBeachDetails(id);
    this.render(beach);
  }
};
```

**Response Structure:**
```javascript
{
  id: "beach_123",
  name: "Sample Beach Name",
  description: "This is a beautiful beach with crystal clear waters and golden sand. Perfect for swimming, surfing, and beach volleyball.",
  imageUrl: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400",
  address: "123 Beach Drive, Coastal City, CA 90210",
  amenities: ["Parking", "Restrooms", "Lifeguard", "Concessions"],
  rating: 4.5,
  reviews: 234
}
```

### Weather Data Simulation

#### `fetchWeather(locationId)`

Simulates fetching current weather conditions for a specific location.

**Parameters:**
- `locationId` (String) - The unique identifier for the location

**Returns:** Promise - Resolves to a weather data object

**Simulated Delay:** 300ms

**Features:**
- Randomized weather conditions for testing
- Realistic temperature ranges (65-85°F)
- Variable wind speeds (5-20 mph)
- Dynamic humidity levels (50-80%)
- Random weather conditions

**Example Usage:**
```javascript
// Fetch weather for beach location
const weather = await MockAPI.fetchWeather("location_456");
console.log(`Temperature: ${weather.temperature}°F`);
console.log(`Condition: ${weather.condition}`);

// Use in weather widget testing
const WeatherWidget = {
  async updateWeather(locationId) {
    try {
      const weather = await MockAPI.fetchWeather(locationId);
      this.displayWeather(weather);
    } catch (error) {
      this.showWeatherError();
    }
  }
};
```

**Response Structure:**
```javascript
{
  temperature: 72,              // Random 65-85°F
  condition: "Partly Cloudy",   // Random from predefined conditions
  windSpeed: 12,                // Random 5-20 mph
  humidity: 65,                 // Random 50-80%
  uvIndex: 6                    // Random 1-8
}
```

**Available Weather Conditions:**
- "Sunny"
- "Partly Cloudy"
- "Cloudy"
- "Light Rain"

### Points of Interest

#### `fetchPOIDetails(poiId)`

Simulates fetching information about points of interest near beaches.

**Parameters:**
- `poiId` (String) - The unique identifier for the POI

**Returns:** Promise - Resolves to a POI details object

**Simulated Delay:** 400ms

**Example Usage:**
```javascript
// Fetch nearby restaurant information
const poi = await MockAPI.fetchPOIDetails("poi_789");
console.log(`${poi.name} - ${poi.type}`);
console.log(`Rating: ${poi.rating} - ${poi.priceRange}`);

// Use in POI listing component
const POIList = {
  async loadNearbyPOIs(poiIds) {
    const pois = await Promise.all(
      poiIds.map(id => MockAPI.fetchPOIDetails(id))
    );
    this.renderPOIs(pois);
  }
};
```

**Response Structure:**
```javascript
{
  id: "poi_789",
  name: "Sample Point of Interest",
  description: "An interesting landmark or facility near the beach.",
  imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400",
  type: "Restaurant",
  rating: 4.2,
  priceRange: "$$"
}
```

## Implementation Details

### Delay Simulation

All mock functions include realistic network delays to simulate actual API behavior:

```javascript
// Simulated API delay
await new Promise(resolve => setTimeout(resolve, 500));
```

**Benefits:**
- Tests loading states and spinners
- Simulates real-world network conditions
- Helps identify race conditions
- Validates timeout handling

### Randomization for Testing

Weather data includes randomization to test various scenarios:

```javascript
// Random weather conditions
const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain'];
const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];

// Random temperature range
temperature: Math.floor(Math.random() * 20) + 65, // 65-85°F

// Random wind speed
windSpeed: Math.floor(Math.random() * 15) + 5, // 5-20 mph
```

**Testing Benefits:**
- Validates UI behavior with different data
- Tests edge cases and boundary conditions
- Ensures robust error handling
- Simulates data variability

## Development Usage Patterns

### API Fallback Pattern

```javascript
// Use MockAPI as fallback during development
const DataService = {
  async fetchBeachDetails(id) {
    if (process.env.NODE_ENV === 'development' && !navigator.onLine) {
      return MockAPI.fetchBeachDetails(id);
    }
    
    try {
      return await RealAPI.fetchBeachDetails(id);
    } catch (error) {
      console.warn("Real API failed, falling back to mock data");
      return MockAPI.fetchBeachDetails(id);
    }
  }
};
```

### Testing Integration

```javascript
// Use MockAPI in unit tests
describe('BeachDetailComponent', () => {
  beforeEach(() => {
    // Replace real API with mock
    jest.spyOn(API, 'fetchBeachDetails')
      .mockImplementation(MockAPI.fetchBeachDetails);
  });
  
  test('should display beach information', async () => {
    const component = new BeachDetailComponent();
    await component.loadBeach("test_beach");
    
    expect(component.beachName).toBe("Sample Beach Name");
    expect(component.amenities).toContain("Parking");
  });
});
```

### Development Environment Setup

```javascript
// Configure development environment
const API = process.env.NODE_ENV === 'development' ? MockAPI : RealAPI;

// Use throughout application
const beach = await API.fetchBeachDetails(beachId);
const weather = await API.fetchWeather(locationId);
```

## Migration Strategy

### Transitioning from Mock to Real API

1. **Gradual Migration:**
```javascript
const APIService = {
  // Start with mock implementations
  fetchBeachDetails: MockAPI.fetchBeachDetails,
  fetchWeather: MockAPI.fetchWeather,
  
  // Gradually replace with real implementations
  // fetchBeachDetails: RealAPI.fetchBeachDetails,
  // fetchWeather: RealAPI.fetchWeather,
};
```

2. **Feature Flags:**
```javascript
const useRealAPI = {
  beaches: true,      // Real API ready
  weather: false,     // Still using mock
  pois: false         // Still using mock
};

const APIService = {
  fetchBeachDetails: useRealAPI.beaches 
    ? RealAPI.fetchBeachDetails 
    : MockAPI.fetchBeachDetails,
    
  fetchWeather: useRealAPI.weather 
    ? RealAPI.fetchWeather 
    : MockAPI.fetchWeather
};
```

3. **Configuration-Based:**
```javascript
// config/api.js
export const apiConfig = {
  useRealAPI: {
    beaches: process.env.REAL_BEACHES_API === 'true',
    weather: process.env.REAL_WEATHER_API === 'true',
    pois: process.env.REAL_POIS_API === 'true'
  }
};
```

## Testing Enhancements

### Custom Mock Responses

```javascript
// Extend MockAPI for specific test scenarios
const CustomMockAPI = {
  ...MockAPI,
  
  // Override with specific test data
  async fetchBeachDetails(beachId) {
    const testData = {
      "test_beach_1": {
        id: "test_beach_1",
        name: "Test Beach One",
        rating: 5.0,
        amenities: ["Parking", "Restrooms"]
      },
      "test_beach_2": {
        id: "test_beach_2", 
        name: "Test Beach Two",
        rating: 3.5,
        amenities: ["Lifeguard"]
      }
    };
    
    await new Promise(resolve => setTimeout(resolve, 100)); // Faster for tests
    return testData[beachId] || MockAPI.fetchBeachDetails(beachId);
  }
};
```

### Error Simulation

```javascript
// Add error simulation capabilities
const ErrorMockAPI = {
  ...MockAPI,
  
  async fetchBeachDetails(beachId) {
    // Simulate network errors for testing
    if (beachId === "error_test") {
      await new Promise(resolve => setTimeout(resolve, 500));
      throw new Error("Network connection failed");
    }
    
    if (beachId === "timeout_test") {
      await new Promise(resolve => setTimeout(resolve, 10000)); // Long delay
      throw new Error("Request timeout");
    }
    
    return MockAPI.fetchBeachDetails(beachId);
  }
};
```

### Performance Testing

```javascript
// Variable delay simulation
const PerformanceMockAPI = {
  ...MockAPI,
  
  async fetchBeachDetails(beachId) {
    // Simulate different network conditions
    const networkConditions = {
      fast: 100,
      medium: 500,
      slow: 2000,
      very_slow: 5000
    };
    
    const condition = process.env.NETWORK_CONDITION || 'medium';
    const delay = networkConditions[condition];
    
    await new Promise(resolve => setTimeout(resolve, delay));
    return MockAPI.fetchBeachDetails(beachId);
  }
};
```

## Best Practices

### Development
1. **Use for Offline Development**: Enable development without backend dependencies
2. **Realistic Data**: Provide data that closely matches real API responses
3. **Consistent Delays**: Use realistic delays to test loading states
4. **Error Scenarios**: Include error simulation for robust testing

### Testing
1. **Deterministic Responses**: Use predictable data for unit tests
2. **Edge Case Coverage**: Test with various data combinations
3. **Performance Testing**: Simulate different network conditions
4. **Error Handling**: Test failure scenarios and recovery

### Migration
1. **Gradual Replacement**: Replace mock APIs incrementally
2. **Feature Flags**: Use configuration to switch between mock and real APIs
3. **Compatibility**: Maintain consistent interfaces between mock and real APIs
4. **Fallback Strategy**: Keep mock APIs as fallback for development

## Future Enhancements

### Advanced Simulation

```javascript
// Stateful mock API with persistence
class StatefulMockAPI {
  constructor() {
    this.beaches = new Map();
    this.weather = new Map();
  }
  
  async fetchBeachDetails(beachId) {
    if (!this.beaches.has(beachId)) {
      // Generate new beach data
      this.beaches.set(beachId, this.generateBeachData(beachId));
    }
    
    await this.simulateDelay();
    return this.beaches.get(beachId);
  }
  
  generateBeachData(id) {
    return {
      id,
      name: `Generated Beach ${id}`,
      rating: Math.random() * 2 + 3, // 3-5 stars
      // ... more generated data
    };
  }
}
```

### GraphQL Simulation

```javascript
// Mock GraphQL API responses
const GraphQLMockAPI = {
  async query(query, variables) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (query.includes('beachDetails')) {
      return {
        data: {
          beach: MockAPI.generateBeachData(variables.id)
        }
      };
    }
    
    if (query.includes('weather')) {
      return {
        data: {
          weather: MockAPI.generateWeatherData(variables.locationId)
        }
      };
    }
    
    throw new Error('Unknown query');
  }
};
```

### Real-time Simulation

```javascript
// Mock WebSocket connections
class MockWebSocket {
  constructor(url) {
    this.url = url;
    this.onmessage = null;
    this.onopen = null;
    this.onclose = null;
    
    setTimeout(() => {
      if (this.onopen) this.onopen();
      this.startSimulation();
    }, 100);
  }
  
  startSimulation() {
    // Simulate real-time weather updates
    setInterval(() => {
      if (this.onmessage) {
        this.onmessage({
          data: JSON.stringify({
            type: 'weather_update',
            data: MockAPI.generateWeatherData()
          })
        });
      }
    }, 30000); // Every 30 seconds
  }
  
  send(data) {
    console.log('Mock WebSocket send:', data);
  }
  
  close() {
    if (this.onclose) this.onclose();
  }
}
```