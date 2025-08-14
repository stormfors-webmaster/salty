# UIController Module Documentation

## Overview

The `UIController` acts as a coordinator for all user interface interactions and DOM management. It serves as the central hub for UI operations, coordinating between specialized view modules, handling responsive design, and managing DOM element caching for optimal performance.

## Location
`js/uiController.js`

## Dependencies
- `Config` - Configuration system for selectors and UI settings
- `AppState` - Application state management
- `EventBus` - Event communication system
- `ActionController` - Action execution for user interactions
- `FeatureListView` - Specialized module for rendering feature lists
- `DetailView` - Specialized module for detail sidebar management
- `ResponsiveService` - Responsive design handling

## Architecture

The UIController follows a coordinator pattern where it initializes and coordinates specialized view modules rather than handling all UI operations directly. This promotes modularity and separation of concerns.

### Flow Diagram
```
User Interaction → UIController → ActionController → EventBus → View Updates
EventBus Events → UIController → DOM Updates → Visual Changes
```

## Public API

### Initialization

#### `init()`

Initializes the UI controller and all dependent view modules.

**Features:**
- Caches DOM elements for performance optimization
- Sets up global event listeners for action triggers
- Initializes specialized view modules
- Establishes EventBus subscriptions

**Example Usage:**
```javascript
UIController.init();
```

**Initialization Sequence:**
```javascript
init() {
  this.cacheElements();        // Cache DOM elements
  this.setupEventListeners();  // Set up global event handlers
  this.setupBusSubscriptions(); // Subscribe to EventBus events
  
  // Initialize specialized modules
  FeatureListView.init();
  DetailView.init();
  ResponsiveService.init();
}
```

### DOM Element Management

#### `cacheElements()`

Caches frequently used DOM elements to avoid repeated queries and improve performance.

**Features:**
- Queries all selectors from `Config.SELECTORS`
- Stores elements in `AppState.ui.elements`
- Provides warnings for missing elements
- Enables O(1) element access throughout the application

**Implementation:**
```javascript
cacheElements() {
  const elements = {};
  Object.entries(Config.SELECTORS).forEach(([key, selector]) => {
    const element = document.querySelector(selector);
    if (element) {
      elements[key] = element;
    } else {
      console.warn(`[UIController] Element not found: ${selector}`);
    }
  });
  AppState.dispatch({ type: "SET_UI_STATE", payload: { elements } });
}
```

**Usage:**
```javascript
// Access cached elements
const sidebar = AppState.getUICachedElement("SIDEBAR_WRAPPER");
const mapContainer = AppState.getUICachedElement("MAP_CONTAINER");
```

### Action-Driven Event System

#### `setupEventListeners()`

Establishes global event listeners for action-trigger interactions using event delegation.

**Features:**
- Single global click handler for all action triggers
- Event delegation for dynamic content
- Automatic action execution through ActionController
- Prevention of default behaviors for interactive elements

**Implementation:**
```javascript
setupEventListeners() {
  document.body.addEventListener("click", (e) => {
    const target = e.target.closest("[action-trigger]");
    if (!target) return;

    e.preventDefault();
    const actionName = target.getAttribute("action-trigger");
    if (actionName) {
      ActionController.execute(actionName, {
        target,
        source: "sidebar-list-item"
      });
    }
  });
}
```

**HTML Usage:**
```html
<!-- Buttons with action triggers -->
<button action-trigger="navigateHome">Home</button>
<button action-trigger="toggleFullscreen">Fullscreen</button>

<!-- List items with action triggers -->
<div action-trigger="selectBeachFromList" 
     data-entity-type="beach" 
     data-feature-id="beach_123">
  Beach Item
</div>
```

### Sidebar Management

#### `showSidebar(type)`

Displays a specific sidebar panel and handles responsive behavior.

**Parameters:**
- `type` (String) - Sidebar type: `"home"`, `"list"`, or `"detail"`

**Features:**
- Hides all other sidebars before showing target
- Handles mobile-specific map visibility logic
- Updates application state to track current sidebar
- Provides smooth transitions between views

**Example Usage:**
```javascript
// Show different sidebar types
UIController.showSidebar("home");    // Home/welcome view
UIController.showSidebar("list");    // Feature list view
UIController.showSidebar("detail");  // Detail view for selected feature
```

**Implementation Logic:**
```javascript
showSidebar(type) {
  // Update state
  AppState.dispatch({
    type: "SET_UI_STATE",
    payload: { currentSidebar: type }
  });

  // Get cached elements
  const { SIDEBAR_WRAPPER, SIDEBAR_HOME, SIDEBAR_BEACH_LIST, SIDEBAR_BEACH } = 
    AppState.getState().ui.elements;

  // Hide all sidebars
  if (SIDEBAR_HOME) SIDEBAR_HOME.style.display = "none";
  if (SIDEBAR_BEACH_LIST) SIDEBAR_BEACH_LIST.style.display = "none";
  if (SIDEBAR_BEACH) SIDEBAR_BEACH.style.display = "none";

  // Show target sidebar
  const sidebarMap = {
    "home": SIDEBAR_HOME,
    "list": SIDEBAR_BEACH_LIST,
    "detail": SIDEBAR_BEACH
  };
  
  const targetSidebar = sidebarMap[type];
  if (targetSidebar) {
    targetSidebar.style.display = "block";
  }

  // Handle responsive behavior
  if (AppState.getState().ui.isMobile) {
    this.hideMap();
  } else {
    this.showMap();
  }
}
```

### Responsive Map Management

#### `showMap()`

Shows the map container, primarily used for responsive layout management.

**Features:**
- Makes map visible on desktop
- Part of responsive design system
- Coordinates with sidebar visibility

**Example Usage:**
```javascript
UIController.showMap();
```

#### `hideMap()`

Hides the map container, primarily used on mobile devices when sidebar is active.

**Features:**
- Hides map on mobile to show sidebar
- Optimizes mobile user experience
- Prevents layout conflicts

**Example Usage:**
```javascript
UIController.hideMap();
```

#### `toggleFullscreen()`

Toggles between fullscreen and normal view with responsive behavior.

**Mobile Behavior:**
- Toggles between map-only and sidebar-only views
- Provides immersive map experience
- Switches context based on current view

**Desktop Behavior:**
- Toggles sidebar visibility
- Maintains map visibility
- Provides more screen space for map when needed

**Example Usage:**
```javascript
UIController.toggleFullscreen();
```

**Implementation:**
```javascript
toggleFullscreen() {
  const { SIDEBAR_MAP, SIDEBAR_WRAPPER } = AppState.getState().ui.elements;
  
  if (AppState.getState().ui.isMobile) {
    // Mobile: toggle between map and sidebar
    const isMapHidden = SIDEBAR_MAP && SIDEBAR_MAP.style.display === "none";
    if (isMapHidden) {
      this.hideMap();
      this.showSidebar(AppState.getState().ui.currentSidebar);
    } else {
      this.showMap();
      if (SIDEBAR_WRAPPER) {
        SIDEBAR_WRAPPER.style.display = "none";
      }
    }
  } else {
    // Desktop: toggle sidebar visibility
    if (SIDEBAR_WRAPPER) {
      const isVisible = SIDEBAR_WRAPPER.style.display !== "none";
      SIDEBAR_WRAPPER.style.display = isVisible ? "none" : "block";
    }
    this.showMap();
  }
}
```

### Feature List Delegation

#### `renderFeatureList(features, type)`

Delegates feature list rendering to the specialized FeatureListView module.

**Parameters:**
- `features` (Array) - Array of GeoJSON features to render
- `type` (String) - Feature type: `"beach"`, `"region"`, or `"state"`

**Features:**
- Delegates to specialized module for maintainability
- Handles different feature types consistently
- Provides unified interface for feature rendering

**Example Usage:**
```javascript
// Render beach features
UIController.renderFeatureList(beachFeatures, "beach");

// Render region clusters
UIController.renderFeatureList(regionFeatures, "region");

// Render state features
UIController.renderFeatureList(stateFeatures, "state");
```

**Delegation:**
```javascript
renderFeatureList(features, type) {
  FeatureListView.renderFeatureList(features, type);
}
```

## EventBus Integration

The UIController subscribes to several events for reactive UI updates:

### Event Subscriptions

#### `state:selectionChanged`

Responds to selection changes by updating the detail view.

**Event Data:** Selection object with `id`, `type`, and `feature`

**Handler:**
```javascript
EventBus.subscribe("state:selectionChanged", (selection) => {
  if (selection?.type === "beach") {
    DetailView.updateDetailSidebar();
  }
});
```

#### `ui:sidebarRequested`

Handles external requests to change sidebars.

**Event Data:** Object with `sidebar` property

**Handler:**
```javascript
EventBus.subscribe("ui:sidebarRequested", (data) => {
  this.showSidebar(data.sidebar);
});
```

#### `ui:fullscreenToggled`

Handles external requests to toggle fullscreen mode.

**Handler:**
```javascript
EventBus.subscribe("ui:fullscreenToggled", this.toggleFullscreen.bind(this));
```

#### `ui:viewChanged`

Responds to responsive view changes (mobile/desktop).

**Handler:**
```javascript
EventBus.subscribe("ui:viewChanged", () => {
  this.showSidebar(AppState.getState().ui.currentSidebar);
});
```

### Event Publishing

The UIController primarily responds to events rather than publishing them, maintaining its role as a coordinator.

## Module Coordination

### FeatureListView Integration

The UIController coordinates with FeatureListView for rendering lists:

```javascript
// UIController delegates list rendering
renderFeatureList(features, type) {
  FeatureListView.renderFeatureList(features, type);
}

// FeatureListView handles the actual rendering logic
FeatureListView.renderFeatureList(features, type) {
  // Complex rendering logic
  // Template cloning
  // Data binding
  // Event setup
}
```

### DetailView Integration

The UIController triggers detail view updates through EventBus:

```javascript
// Selection change triggers detail update
EventBus.subscribe("state:selectionChanged", (selection) => {
  if (selection?.type === "beach") {
    DetailView.updateDetailSidebar();
  }
});
```

### ResponsiveService Integration

The UIController responds to responsive changes:

```javascript
// ResponsiveService detects viewport changes
ResponsiveService.updateLayout() {
  const isMobile = Utils.isMobileView();
  AppState.dispatch({ type: "SET_UI_STATE", payload: { isMobile } });
  EventBus.publish("ui:viewChanged", { isMobile });
}

// UIController responds to responsive changes
EventBus.subscribe("ui:viewChanged", () => {
  this.showSidebar(AppState.getState().ui.currentSidebar);
});
```

## Performance Optimizations

### DOM Element Caching

```javascript
// Cache elements once at initialization
cacheElements() {
  const elements = {};
  Object.entries(Config.SELECTORS).forEach(([key, selector]) => {
    elements[key] = document.querySelector(selector);
  });
  AppState.dispatch({ type: "SET_UI_STATE", payload: { elements } });
}

// Access cached elements efficiently
const sidebar = AppState.getUICachedElement("SIDEBAR_WRAPPER");
```

### Event Delegation

```javascript
// Single global handler instead of multiple handlers
document.body.addEventListener("click", (e) => {
  const target = e.target.closest("[action-trigger]");
  // Handle all action triggers with one listener
});
```

### Modular Architecture

```javascript
// Delegate complex operations to specialized modules
init() {
  FeatureListView.init();  // List rendering
  DetailView.init();       // Detail management
  ResponsiveService.init(); // Responsive handling
}
```

## Error Handling

### Missing DOM Elements

```javascript
cacheElements() {
  Object.entries(Config.SELECTORS).forEach(([key, selector]) => {
    const element = document.querySelector(selector);
    if (element) {
      elements[key] = element;
    } else {
      console.warn(`[UIController] Element not found: ${selector}`);
    }
  });
}
```

### Safe Element Access

```javascript
showSidebar(type) {
  const elements = AppState.getState().ui.elements;
  if (!elements.SIDEBAR_WRAPPER) return; // Safe exit if element missing
  
  // Proceed with operations
}
```

### Graceful Degradation

```javascript
toggleFullscreen() {
  const { SIDEBAR_MAP, SIDEBAR_WRAPPER } = AppState.getState().ui.elements;
  
  // Check for element existence before manipulation
  if (SIDEBAR_MAP) {
    // Manipulate only if element exists
  }
}
```

## Integration Examples

### Custom Sidebar Addition

1. **Add to Config Selectors:**
```javascript
// js/config/ui.js
selectorsConfig = {
  // ... existing selectors
  SIDEBAR_CUSTOM: '[sidebar="custom"]'
};
```

2. **Extend showSidebar:**
```javascript
showSidebar(type) {
  // ... existing logic
  
  const sidebarMap = {
    "home": SIDEBAR_HOME,
    "list": SIDEBAR_BEACH_LIST,
    "detail": SIDEBAR_BEACH,
    "custom": elements.SIDEBAR_CUSTOM  // Add custom sidebar
  };
  
  // ... rest of logic
}
```

3. **Add Action Trigger:**
```html
<button action-trigger="showCustomSidebar">Custom View</button>
```

4. **Configure Action:**
```javascript
// js/config/actions.js
showCustomSidebar: {
  description: "Show custom sidebar",
  actions: [
    { type: "SHOW_SIDEBAR", sidebar: "custom" }
  ]
}
```

### Custom Event Handlers

```javascript
setupBusSubscriptions() {
  // ... existing subscriptions
  
  // Add custom event handling
  EventBus.subscribe("ui:customEvent", (data) => {
    // Handle custom UI event
    this.handleCustomInteraction(data);
  });
}

handleCustomInteraction(data) {
  // Custom UI logic
  const customElement = AppState.getUICachedElement("CUSTOM_ELEMENT");
  if (customElement) {
    customElement.style.display = data.visible ? "block" : "none";
  }
}
```

### Dynamic Content Integration

```javascript
// Handle dynamic content with action triggers
setupEventListeners() {
  document.body.addEventListener("click", (e) => {
    const target = e.target.closest("[action-trigger]");
    if (!target) return;

    e.preventDefault();
    const actionName = target.getAttribute("action-trigger");
    const customData = target.dataset.customData;
    
    ActionController.execute(actionName, {
      target,
      customData,
      source: "dynamic-content"
    });
  });
}
```

## Best Practices

### Architecture Design
1. **Delegate Complex Operations**: Use specialized modules for complex UI operations
2. **Maintain Single Responsibility**: UIController coordinates, doesn't implement everything
3. **Use Event-Driven Communication**: Prefer EventBus over direct method calls
4. **Cache DOM Elements**: Avoid repeated DOM queries for performance

### Event Management
1. **Use Event Delegation**: Single listeners for multiple similar elements
2. **Prevent Default Behaviors**: Handle preventDefault for action triggers
3. **Subscribe to Relevant Events**: Only subscribe to events the controller needs
4. **Clean Up Resources**: Remove event listeners when appropriate

### Responsive Design
1. **Mobile-First Approach**: Design for mobile, enhance for desktop
2. **Graceful Degradation**: Ensure functionality works across devices
3. **Performance Optimization**: Minimize layout thrashing on responsive changes
4. **User Experience**: Prioritize user experience over technical complexity

### State Management
1. **Use AppState for UI State**: Store UI state centrally for consistency
2. **React to State Changes**: Subscribe to state changes for reactive updates
3. **Minimize Direct DOM Manipulation**: Prefer state-driven UI updates
4. **Handle Edge Cases**: Account for missing elements and invalid states