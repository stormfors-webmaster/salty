# Utils Module Documentation

## Overview

The `Utils` module provides a collection of utility functions that are commonly needed throughout the Salty Beaches application. It includes helpers for responsive design detection, function debouncing, DOM manipulation, error handling, and data processing. The module follows a functional approach with pure functions that have no side effects.

## Location
`js/utils.js`

## Dependencies
- `Config` - Configuration system for breakpoints and settings

## Architecture

The Utils module is designed as a collection of stateless, pure functions that can be used throughout the application without creating dependencies between modules. Each function has a single, well-defined purpose and can be tested in isolation.

### Design Principles
- **Pure Functions**: No side effects, predictable outputs
- **Single Responsibility**: Each function has one clear purpose
- **Reusability**: Functions can be used across multiple modules
- **Performance**: Optimized for common use cases

## Public API

### Responsive Design Utilities

#### `isMobileView()`

Determines if the current viewport is considered mobile based on the configured breakpoint.

**Returns:** Boolean - `true` if mobile viewport, `false` if desktop

**Example Usage:**
```javascript
// Check viewport size for responsive behavior
if (Utils.isMobileView()) {
  // Apply mobile-specific logic
  showMobileLayout();
  hideDesktopFeatures();
} else {
  // Apply desktop-specific logic
  showDesktopLayout();
  enableAdvancedFeatures();
}

// Use in conditional rendering
const startPosition = Utils.isMobileView() 
  ? Config.MAP.MOBILE_START_POSITION 
  : Config.MAP.DESKTOP_START_POSITION;
```

**Implementation:**
```javascript
isMobileView() {
  return window.innerWidth <= Config.MAP.MOBILE_BREAKPOINT;
}
```

**Configuration Dependency:**
- `Config.MAP.MOBILE_BREAKPOINT` (default: 768px)

### Performance Utilities

#### `debounce(func, wait)`

Creates a debounced version of a function that delays execution until after a specified wait time has passed since the last invocation.

**Parameters:**
- `func` (Function) - The function to debounce
- `wait` (Number) - The number of milliseconds to delay

**Returns:** Function - The debounced function

**Use Cases:**
- Preventing excessive API calls during user input
- Limiting expensive operations during map movement
- Reducing DOM updates during window resize
- Throttling search operations

**Example Usage:**
```javascript
// Debounce map movement updates
const debouncedMapUpdate = Utils.debounce(() => {
  updateSidebarFromMapView();
}, 250);

AppState.getMap().on("moveend", debouncedMapUpdate);

// Debounce search input
const debouncedSearch = Utils.debounce((query) => {
  performSearch(query);
}, 300);

searchInput.addEventListener("input", (e) => {
  debouncedSearch(e.target.value);
});

// Debounce expensive calculations
const debouncedResize = Utils.debounce(() => {
  recalculateLayout();
  updateChartDimensions();
}, 100);

window.addEventListener("resize", debouncedResize);
```

**Implementation Details:**
```javascript
debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
```

**Performance Characteristics:**
- **Memory**: Maintains one timeout reference per debounced function
- **Execution**: Last call wins - only the final call in a series executes
- **Cleanup**: Automatic timeout cleanup prevents memory leaks

### UI State Management

#### `showLoading(element)`

Displays a loading state in the specified DOM element.

**Parameters:**
- `element` (HTMLElement) - The element to show loading state in

**Features:**
- Replaces element content with loading indicator
- Provides consistent loading UI across the application
- Includes basic styling for immediate usability

**Example Usage:**
```javascript
// Show loading in sidebar during data fetch
const sidebar = AppState.getUICachedElement("SIDEBAR_BEACH_LIST");
Utils.showLoading(sidebar);

try {
  const beachData = await fetchBeachData();
  renderBeachList(beachData);
} catch (error) {
  Utils.showError(sidebar, "Failed to load beach data");
}

// Show loading in any container
const mapContainer = document.querySelector("#map-container");
Utils.showLoading(mapContainer);
```

**Generated HTML:**
```html
<div class="loader" style="display: flex; justify-content: center; padding: 20px;">
  Loading...
</div>
```

#### `showError(element, message)`

Displays an error message in the specified DOM element with user-friendly styling.

**Parameters:**
- `element` (HTMLElement) - The element to show error message in
- `message` (String) - The error message to display

**Features:**
- Replaces element content with styled error message
- Consistent error presentation across the application
- User-friendly styling with appropriate color coding

**Example Usage:**
```javascript
// Show API error
const container = document.querySelector("#data-container");
Utils.showError(container, "Unable to load data. Please check your connection.");

// Show map initialization error
const mapContainer = document.querySelector("#map-container");
Utils.showError(mapContainer, "Failed to load map. Please refresh the page.");

// Show validation error
const formContainer = document.querySelector("#form-container");
Utils.showError(formContainer, "Please fill in all required fields.");
```

**Generated HTML:**
```html
<div class="error" style="padding: 20px; text-align: center; color: #d32f2f;">
  Unable to load data. Please check your connection.
</div>
```

### Data Processing Utilities

#### `getFeatureEntityId(feature)`

Extracts a unique and consistent ID from a GeoJSON feature's properties using multiple fallback strategies.

**Parameters:**
- `feature` (Object) - GeoJSON feature object

**Returns:** String|Number|null - The unique ID of the feature

**ID Resolution Strategy:**
1. `feature.properties["Item ID"]` - Primary ID from CMS
2. `feature.properties["Location Cluster"]` - Cluster identifier
3. `feature.properties.NAME` - Name property (uppercase)
4. `feature.properties.Name` - Name property (title case)
5. `feature.id` - GeoJSON feature ID (fallback)

**Example Usage:**
```javascript
// Extract ID from various feature types
const beachFeature = {
  properties: { "Item ID": "beach_123", "Name": "Malibu Beach" }
};
const beachId = Utils.getFeatureEntityId(beachFeature); // "beach_123"

const regionFeature = {
  properties: { "Location Cluster": "region_456", "NAME": "Los Angeles" }
};
const regionId = Utils.getFeatureEntityId(regionFeature); // "region_456"

const stateFeature = {
  id: "state_789",
  properties: { "NAME": "California" }
};
const stateId = Utils.getFeatureEntityId(stateFeature); // "California"

// Use in feature processing
const processFeatures = (features) => {
  return features.map(feature => ({
    id: Utils.getFeatureEntityId(feature),
    name: feature.properties.Name || feature.properties.NAME,
    feature: feature
  }));
};
```

**Error Handling:**
```javascript
// Graceful handling of malformed features
const invalidFeature = { properties: null };
const id = Utils.getFeatureEntityId(invalidFeature); // null

// Safe usage with validation
const safeGetId = (feature) => {
  const id = Utils.getFeatureEntityId(feature);
  return id || `fallback_${Date.now()}`;
};
```

### Advanced DOM Utilities

#### `updateElement(options)`

Updates a DOM element with a value, supporting various update types and transformations.

**Parameters:**
- `options` (Object) - Configuration object
  - `element` (HTMLElement) - The DOM element to update
  - `value` (Any) - The value to apply
  - `type` (String) - Update type: `'text'`, `'href'`, `'src'`, `'html'` (default: `'text'`)
  - `defaultValue` (String) - Fallback value for null/undefined (default: `'N/A'`)
  - `transform` (Function) - Optional transformation function

**Example Usage:**
```javascript
// Update text content
Utils.updateElement({
  element: titleElement,
  value: beach.name,
  defaultValue: "Unknown Beach"
});

// Update link href
Utils.updateElement({
  element: websiteLink,
  value: beach.website,
  type: "href",
  defaultValue: "#"
});

// Update image src with transformation
Utils.updateElement({
  element: beachImage,
  value: beach.imageUrl,
  type: "src",
  defaultValue: "/images/placeholder.jpg",
  transform: (url) => url ? `${url}?w=400` : url
});

// Update HTML content with formatting
Utils.updateElement({
  element: descriptionElement,
  value: beach.description,
  type: "html",
  transform: (text) => text ? `<p>${text}</p>` : ""
});

// Update with complex transformation
Utils.updateElement({
  element: temperatureElement,
  value: beach.temperature,
  transform: (temp) => temp ? `${Math.round(temp)}°F` : "N/A"
});
```

**Implementation:**
```javascript
updateElement({
  element,
  value,
  type = "text",
  defaultValue = "N/A",
  transform
}) {
  if (!element) return;

  let finalValue = value !== undefined && value !== null ? value : defaultValue;
  if (transform) {
    finalValue = transform(finalValue);
  }

  switch (type) {
    case "href":
      element.href = finalValue;
      break;
    case "src":
      element.src = finalValue;
      break;
    case "html":
      element.innerHTML = finalValue;
      break;
    default:
      element.textContent = finalValue;
  }
}
```

#### `renderView(container, data)`

Populates elements in a container with data using data binding attributes.

**Parameters:**
- `container` (HTMLElement) - The parent element containing elements to populate
- `data` (Object) - The data object with key-value pairs

**Data Binding Convention:**
Elements with `data-bind` attributes are automatically populated with corresponding data values.

**Example Usage:**
```javascript
// HTML template with data binding
/*
<div id="beach-detail">
  <h1 data-bind="name">Beach Name</h1>
  <p data-bind="description">Beach description</p>
  <a data-bind="website" href="#">Website</a>
  <img data-bind="image" src="#" alt="Beach image">
</div>
*/

// Data object
const beachData = {
  name: "Malibu Beach",
  description: "Beautiful Pacific coast beach",
  website: "https://malibubeach.com",
  image: "https://images.example.com/malibu.jpg"
};

// Populate the template
const container = document.querySelector("#beach-detail");
Utils.renderView(container, beachData);

// Result: All elements with data-bind attributes are populated
// with corresponding values from beachData
```

**Advanced Usage:**
```javascript
// Dynamic template population
const renderBeachCard = (beach) => {
  const template = document.querySelector("#beach-card-template");
  const clone = template.content.cloneNode(true);
  
  Utils.renderView(clone, {
    name: beach.name,
    location: `${beach.city}, ${beach.state}`,
    rating: `${beach.rating}/5 stars`,
    image: beach.mainImage?.url
  });
  
  return clone;
};

// Batch data population
const populateMultipleViews = (containers, dataArray) => {
  containers.forEach((container, index) => {
    if (dataArray[index]) {
      Utils.renderView(container, dataArray[index]);
    }
  });
};
```

**Element Type Handling:**
```javascript
// Automatic element type detection
renderView(container, data) {
  if (!container || !data) return;

  container.querySelectorAll("[data-bind]").forEach((element) => {
    const key = element.dataset.bind;
    const value = data[key];

    if (value !== undefined && value !== null) {
      if (element.tagName === "A") {
        element.href = value;
      } else if (element.tagName === "IMG") {
        element.src = value;
      } else {
        element.textContent = value;
      }
    } else {
      element.textContent = ""; // Clear missing values
    }
  });
}
```

## Usage Patterns

### Responsive Design Pattern

```javascript
// Responsive initialization
const initializeResponsive = () => {
  const updateLayout = () => {
    if (Utils.isMobileView()) {
      enableMobileFeatures();
      hideDesktopElements();
    } else {
      enableDesktopFeatures();
      showDesktopElements();
    }
  };

  // Initial check
  updateLayout();

  // Listen for resize with debouncing
  window.addEventListener("resize", Utils.debounce(updateLayout, 250));
};
```

### Error Handling Pattern

```javascript
// Consistent error handling across modules
const handleAsyncOperation = async (element, operation) => {
  try {
    Utils.showLoading(element);
    const result = await operation();
    return result;
  } catch (error) {
    console.error("Operation failed:", error);
    Utils.showError(element, "Operation failed. Please try again.");
    throw error;
  }
};

// Usage
await handleAsyncOperation(
  document.querySelector("#data-container"),
  () => fetchBeachData()
);
```

### Data Processing Pattern

```javascript
// Feature processing pipeline
const processMapFeatures = (features) => {
  return features
    .map(feature => ({
      id: Utils.getFeatureEntityId(feature),
      name: feature.properties.Name || "Unknown",
      feature: feature
    }))
    .filter(item => item.id) // Remove items without valid IDs
    .sort((a, b) => a.name.localeCompare(b.name));
};
```

### Template Rendering Pattern

```javascript
// Dynamic template rendering with Utils
const createFeatureListItem = (feature, template) => {
  const clone = template.content.cloneNode(true);
  
  // Use Utils for safe element updates
  const titleElement = clone.querySelector("[data-bind='title']");
  Utils.updateElement({
    element: titleElement,
    value: feature.properties.Name,
    defaultValue: "Unnamed Location"
  });

  const imageElement = clone.querySelector("[data-bind='image']");
  Utils.updateElement({
    element: imageElement,
    value: feature.properties.Image,
    type: "src",
    defaultValue: "/images/placeholder.jpg"
  });

  return clone;
};
```

## Performance Considerations

### Debounce Optimization
```javascript
// Reuse debounced functions instead of creating new ones
const debouncedMapUpdate = Utils.debounce(updateMapSidebar, 250);
const debouncedSearch = Utils.debounce(performSearch, 300);

// Avoid creating new debounced functions in loops
// Bad:
features.forEach(feature => {
  const debouncedProcess = Utils.debounce(() => process(feature), 100);
  debouncedProcess();
});

// Good:
const debouncedProcess = Utils.debounce(processFeature, 100);
features.forEach(feature => {
  debouncedProcess(feature);
});
```

### DOM Operation Efficiency
```javascript
// Batch DOM updates
const updateMultipleElements = (updates) => {
  // Use requestAnimationFrame for smooth updates
  requestAnimationFrame(() => {
    updates.forEach(({ element, value, type }) => {
      Utils.updateElement({ element, value, type });
    });
  });
};
```

### Memory Management
```javascript
// Clean up event listeners with debounced functions
class ResponsiveManager {
  constructor() {
    this.debouncedResize = Utils.debounce(this.handleResize.bind(this), 250);
  }

  init() {
    window.addEventListener("resize", this.debouncedResize);
  }

  cleanup() {
    window.removeEventListener("resize", this.debouncedResize);
  }

  handleResize() {
    // Handle resize logic
  }
}
```

## Testing Utilities

### Mock Utilities for Testing
```javascript
// Test helpers for Utils functions
const TestUtils = {
  mockMobileView: (isMobile) => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: isMobile ? 500 : 1200
    });
  },

  createMockElement: (tagName = 'div') => {
    const element = document.createElement(tagName);
    document.body.appendChild(element);
    return element;
  },

  waitForDebounce: (ms = 100) => {
    return new Promise(resolve => setTimeout(resolve, ms + 10));
  }
};

// Example test
describe('Utils.isMobileView', () => {
  test('returns true for mobile viewport', () => {
    TestUtils.mockMobileView(true);
    expect(Utils.isMobileView()).toBe(true);
  });

  test('returns false for desktop viewport', () => {
    TestUtils.mockMobileView(false);
    expect(Utils.isMobileView()).toBe(false);
  });
});
```

## Best Practices

### Function Design
1. **Keep Functions Pure**: Avoid side effects for predictable behavior
2. **Single Responsibility**: Each function should have one clear purpose
3. **Null Safety**: Handle null/undefined inputs gracefully
4. **Type Consistency**: Return consistent types for similar functions

### Performance
1. **Reuse Debounced Functions**: Create once, use multiple times
2. **Batch DOM Operations**: Group DOM updates when possible
3. **Cache Element References**: Store frequently accessed elements
4. **Validate Inputs**: Check for null/undefined before processing

### Error Handling
1. **Graceful Degradation**: Provide fallback values for missing data
2. **User-Friendly Messages**: Show helpful error messages to users
3. **Console Logging**: Log detailed errors for developers
4. **Safe Operations**: Check for element existence before manipulation

### Maintenance
1. **Document Edge Cases**: Note special behavior in complex functions
2. **Version Breaking Changes**: Consider impact when modifying utilities
3. **Test Coverage**: Ensure good test coverage for all utilities
4. **Consistent Interfaces**: Maintain similar patterns across related functions