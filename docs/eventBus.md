# EventBus Module Documentation

## Overview

The `EventBus` is a simple but powerful Pub/Sub (Publish/Subscribe) event system that enables loose coupling between modules in the Salty Beaches application. It serves as the central communication hub, allowing modules to communicate without direct dependencies, promoting modularity and maintainability.

## Location
`js/eventBus.js`

## Dependencies
None - EventBus is a standalone module with no external dependencies.

## Architecture

The EventBus implements the Observer pattern using a Map-based event registry. It provides synchronous event delivery with automatic subscription management and built-in logging for debugging purposes.

### Flow Diagram
```
Module A → EventBus.publish() → Event Registry → EventBus → Module B callback
                                              → Module C callback
                                              → Module D callback
```

## Core Concepts

### Event-Driven Architecture
- **Loose Coupling**: Modules communicate without knowing about each other
- **Single Responsibility**: Each module focuses on its specific functionality
- **Scalability**: Easy to add new modules without modifying existing ones
- **Testability**: Individual modules can be tested in isolation

### Synchronous Event Delivery
- Events are delivered immediately when published
- All subscribers receive events in registration order
- No async/await complexity for simple use cases
- Predictable execution flow for debugging

## Public API

### Subscription Management

#### `subscribe(eventName, callback)`

Subscribes to an event with a callback function that will be invoked when the event is published.

**Parameters:**
- `eventName` (String) - The name of the event to subscribe to
- `callback` (Function) - Function to call when the event is published

**Returns:** Object with `unsubscribe()` method for cleanup

**Example Usage:**
```javascript
// Subscribe to map events
const subscription = EventBus.subscribe("map:flyTo", (data) => {
  console.log("Flying to coordinates:", data.coordinates);
  map.flyTo({
    center: data.coordinates,
    zoom: data.zoom
  });
});

// Subscribe to state changes
EventBus.subscribe("state:selectionChanged", (selection) => {
  if (selection.type === "beach") {
    updateDetailView(selection);
  }
});

// Subscribe to UI events
EventBus.subscribe("ui:sidebarRequested", ({ sidebar }) => {
  showSidebar(sidebar);
});
```

**Subscription Cleanup:**
```javascript
// Store subscription for later cleanup
const mapSubscription = EventBus.subscribe("map:flyTo", handleMapFlyTo);

// Clean up when no longer needed
mapSubscription.unsubscribe();

// Or store multiple subscriptions for batch cleanup
const subscriptions = [
  EventBus.subscribe("event1", handler1),
  EventBus.subscribe("event2", handler2),
  EventBus.subscribe("event3", handler3)
];

// Clean up all subscriptions
subscriptions.forEach(sub => sub.unsubscribe());
```

#### `publish(eventName, data)`

Publishes an event to all registered subscribers with optional data payload.

**Parameters:**
- `eventName` (String) - The name of the event to publish
- `data` (Any) - Data to pass to all subscribers (optional)

**Returns:** void

**Example Usage:**
```javascript
// Publish map navigation events
EventBus.publish("map:flyTo", {
  coordinates: [-118.2437, 34.0522],
  zoom: 14,
  speed: 1.5
});

// Publish state changes
EventBus.publish("state:selectionChanged", {
  id: "beach_123",
  type: "beach",
  feature: geoJSONFeature
});

// Publish UI events
EventBus.publish("ui:sidebarRequested", {
  sidebar: "detail"
});

// Publish events without data
EventBus.publish("map:closeAllPopups");
EventBus.publish("ui:fullscreenToggled");
```

## Standard Event Catalog

The Salty Beaches application uses a standardized set of events with consistent naming conventions:

### Map Events

#### `map:flyTo`
Requests the map to fly to a specific location.

**Data Structure:**
```javascript
{
  coordinates: [longitude, latitude],  // Required
  zoom: 14,                           // Optional, defaults to config
  speed: 1.5                          // Optional, defaults to config
}
```

**Publishers:** ActionController
**Subscribers:** MapController

#### `map:zoomTo`
Requests the map to zoom to a specific level without changing center.

**Data Structure:**
```javascript
{
  zoom: 12,        // Required
  speed: 1.2       // Optional
}
```

#### `map:showPopup`
Requests display of a popup for a feature.

**Data Structure:**
```javascript
{
  feature: geoJSONFeature,     // Required
  details: beachDataObject,    // Optional cached details
  delay: 100                   // Optional delay in milliseconds
}
```

#### `map:closeAllPopups`
Requests closure of all open popups.

**Data Structure:** None

### State Events

#### `state:changed`
Published automatically on any state change.

**Data Structure:**
```javascript
{
  newState: currentState,      // Complete new state object
  oldState: previousState,     // Previous state for comparison
  action: dispatchedAction     // The action that caused the change
}
```

**Publisher:** AppState
**Subscribers:** Various modules for reactive updates

#### `state:selectionChanged`
Published when the current selection changes.

**Data Structure:**
```javascript
{
  id: "beach_123",            // Selected entity ID
  type: "beach",              // Entity type (beach|region|state)
  feature: geoJSONFeature     // Complete feature object
}
```

**Publisher:** AppState
**Subscribers:** UIController, DetailView

### UI Events

#### `ui:sidebarRequested`
Requests display of a specific sidebar.

**Data Structure:**
```javascript
{
  sidebar: "home|list|detail"  // Target sidebar type
}
```

**Publishers:** ActionController
**Subscribers:** UIController

#### `ui:fullscreenToggled`
Requests toggle of fullscreen mode.

**Data Structure:** None

**Publishers:** ActionController
**Subscribers:** UIController

#### `ui:viewChanged`
Published when responsive view changes (mobile/desktop).

**Data Structure:**
```javascript
{
  isMobile: boolean            // Current mobile state
}
```

**Publisher:** ResponsiveService
**Subscribers:** UIController

## Event Naming Conventions

### Module Prefixes
Events are prefixed with the target module name for clear organization:

- `map:*` - Events for MapController
- `state:*` - Events from/for AppState
- `ui:*` - Events for UI modules
- `data:*` - Events for data operations
- `custom:*` - Custom application events

### Action Types
Event names use clear, descriptive action verbs:

- `flyTo`, `zoomTo` - Navigation actions
- `show`, `hide`, `toggle` - Visibility actions
- `changed`, `updated` - State notifications
- `requested` - Request events

### Examples
```javascript
// Good event names
"map:flyTo"              // Clear target and action
"state:selectionChanged" // Clear source and event type
"ui:sidebarRequested"    // Clear target and action type

// Poor event names
"fly"                    // Unclear target
"changed"                // Unclear source
"sidebar"                // Unclear action
```

## Implementation Details

### Internal Event Registry

The EventBus maintains an internal Map of event subscriptions:

```javascript
const events = new Map();

// Structure:
// Map {
//   "map:flyTo" => [callback1, callback2, callback3],
//   "state:changed" => [callback1, callback2],
//   "ui:sidebarRequested" => [callback1]
// }
```

### Subscription Process

```javascript
subscribe(eventName, callback) {
  // Create array for new events
  if (!events.has(eventName)) {
    events.set(eventName, []);
  }
  
  // Add callback to subscribers
  const subscriptions = events.get(eventName);
  subscriptions.push(callback);

  // Return unsubscribe function
  return {
    unsubscribe() {
      const index = subscriptions.indexOf(callback);
      if (index > -1) {
        subscriptions.splice(index, 1);
      }
    }
  };
}
```

### Publication Process

```javascript
publish(eventName, data) {
  if (events.has(eventName)) {
    console.log(`[EventBus] Publishing "${eventName}"`, data);
    
    // Call all subscribers synchronously
    events.get(eventName).forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`[EventBus] Error in subscriber for "${eventName}":`, error);
      }
    });
  }
}
```

## Performance Characteristics

### Time Complexity
- **Subscribe**: O(1) - Simple array push operation
- **Publish**: O(n) where n = number of subscribers for the event
- **Unsubscribe**: O(n) where n = number of subscribers (linear search + splice)

### Memory Usage
- Minimal overhead: Only stores event names and callback arrays
- Automatic cleanup: Unsubscribed callbacks are removed from memory
- No memory leaks: Proper unsubscription prevents accumulation

### Execution Model
- **Synchronous**: All callbacks execute immediately in sequence
- **Ordered**: Callbacks execute in subscription order
- **Error Isolation**: Individual callback errors don't affect others

## Error Handling

### Subscriber Error Isolation

The EventBus includes built-in error handling to prevent one subscriber's error from affecting others:

```javascript
publish(eventName, data) {
  if (events.has(eventName)) {
    events.get(eventName).forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`[EventBus] Error in subscriber for "${eventName}":`, error);
        // Continue processing other subscribers
      }
    });
  }
}
```

### Silent Event Publishing

If no subscribers exist for an event, it's silently ignored without errors:

```javascript
EventBus.publish("nonexistent:event", data); // No error, no effect
```

### Subscription Validation

The EventBus performs basic validation but trusts callers for performance:

```javascript
// Trusted usage
EventBus.subscribe("map:flyTo", validCallback);

// Potentially problematic usage (but handled gracefully)
EventBus.subscribe("", null);           // Creates empty event with null callback
EventBus.subscribe(null, callback);     // Creates null event
```

## Integration Patterns

### Module Initialization Pattern

```javascript
// In each module's init() method
export const SomeModule = {
  init() {
    // Set up subscriptions
    this.subscriptions = [
      EventBus.subscribe("relevant:event1", this.handleEvent1.bind(this)),
      EventBus.subscribe("relevant:event2", this.handleEvent2.bind(this)),
    ];
  },
  
  cleanup() {
    // Clean up subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  },
  
  handleEvent1(data) {
    // Handle event
  }
};
```

### Request-Response Pattern

```javascript
// Module A requests data
EventBus.publish("data:beachRequested", { id: "beach_123" });

// Module B responds with data
EventBus.subscribe("data:beachRequested", async ({ id }) => {
  const beach = await fetchBeachData(id);
  EventBus.publish("data:beachReceived", { id, beach });
});

// Module A receives response
EventBus.subscribe("data:beachReceived", ({ id, beach }) => {
  updateUI(beach);
});
```

### State Synchronization Pattern

```javascript
// Central state publishes changes
EventBus.subscribe("state:changed", ({ newState, action }) => {
  // Multiple modules can react to any state change
  if (action.type === "SET_SELECTION") {
    updateSelection(newState.currentSelection);
  }
  if (action.type === "SET_UI_STATE") {
    updateUI(newState.ui);
  }
});
```

### Command Pattern

```javascript
// High-level commands through EventBus
EventBus.publish("app:navigateToBeach", { id: "beach_123" });

// Command handler coordinates multiple actions
EventBus.subscribe("app:navigateToBeach", ({ id }) => {
  // Coordinate multiple modules
  EventBus.publish("state:selectBeach", { id });
  EventBus.publish("map:flyToBeach", { id });
  EventBus.publish("ui:showBeachDetail", { id });
});
```

## Debugging and Development

### Event Logging

The EventBus automatically logs all published events:

```javascript
// Automatic logging output
[EventBus] Publishing "map:flyTo" {coordinates: [-118.2437, 34.0522], zoom: 14}
[EventBus] Publishing "state:selectionChanged" {id: "beach_123", type: "beach"}
```

### Subscription Logging

Subscription events are also logged:

```javascript
[EventBus] Subscribed to "map:flyTo"
[EventBus] Subscribed to "state:selectionChanged"
```

### Development Tools

#### Event Monitor

```javascript
// Monitor all events during development
const eventMonitor = {
  init() {
    // Track original publish method
    const originalPublish = EventBus.publish;
    
    // Override with monitoring
    EventBus.publish = function(eventName, data) {
      console.group(`📡 Event: ${eventName}`);
      console.log("Data:", data);
      console.log("Subscribers:", events.get(eventName)?.length || 0);
      console.time(`Event: ${eventName}`);
      
      originalPublish.call(this, eventName, data);
      
      console.timeEnd(`Event: ${eventName}`);
      console.groupEnd();
    };
  }
};
```

#### Subscription Tracker

```javascript
// Track subscription counts
const getSubscriptionStats = () => {
  const stats = {};
  for (const [eventName, subscribers] of events.entries()) {
    stats[eventName] = subscribers.length;
  }
  return stats;
};

// Usage
console.table(getSubscriptionStats());
```

## Testing Strategies

### Unit Testing Events

```javascript
// Test event publishing
describe("EventBus", () => {
  test("should call subscribers when event is published", () => {
    const mockCallback = jest.fn();
    EventBus.subscribe("test:event", mockCallback);
    
    EventBus.publish("test:event", { test: "data" });
    
    expect(mockCallback).toHaveBeenCalledWith({ test: "data" });
  });
  
  test("should support multiple subscribers", () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    
    EventBus.subscribe("test:event", callback1);
    EventBus.subscribe("test:event", callback2);
    
    EventBus.publish("test:event", "data");
    
    expect(callback1).toHaveBeenCalledWith("data");
    expect(callback2).toHaveBeenCalledWith("data");
  });
});
```

### Integration Testing

```javascript
// Test module communication
describe("Module Communication", () => {
  test("should update UI when selection changes", () => {
    const uiUpdateSpy = jest.spyOn(UIController, "updateDetailView");
    
    // Simulate state change
    EventBus.publish("state:selectionChanged", {
      id: "beach_123",
      type: "beach"
    });
    
    expect(uiUpdateSpy).toHaveBeenCalled();
  });
});
```

## Best Practices

### Event Design
1. **Use Descriptive Names**: Clear event names improve debugging and maintenance
2. **Consistent Data Structures**: Standardize data formats for similar events
3. **Document Event Contracts**: Clearly define what data events carry
4. **Version Event Schemas**: Consider versioning for major data structure changes

### Subscription Management
1. **Always Unsubscribe**: Prevent memory leaks by cleaning up subscriptions
2. **Group Related Subscriptions**: Store related subscriptions together for batch cleanup
3. **Use Method Binding**: Ensure proper `this` context in callback methods
4. **Handle Missing Data**: Design callbacks to handle undefined/null data gracefully

### Performance Optimization
1. **Minimize Subscriber Count**: Avoid excessive subscribers for single events
2. **Batch Related Events**: Group related operations to reduce event overhead
3. **Use Specific Events**: Prefer specific events over generic ones with filtering
4. **Profile Event Usage**: Monitor event frequency and performance impact

### Error Prevention
1. **Validate Critical Data**: Check important data before publishing
2. **Handle Async Operations**: Be careful with async operations in synchronous events
3. **Avoid Circular Events**: Prevent infinite event loops
4. **Use Try-Catch**: Wrap event handlers in try-catch for error isolation

## Advanced Usage

### Event Middleware

```javascript
// Add middleware for event processing
const EventBusMiddleware = {
  beforePublish: [],
  afterPublish: [],
  
  addBeforePublish(middleware) {
    this.beforePublish.push(middleware);
  },
  
  addAfterPublish(middleware) {
    this.afterPublish.push(middleware);
  }
};

// Usage
EventBusMiddleware.addBeforePublish((eventName, data) => {
  console.log(`About to publish: ${eventName}`);
  return data; // Can modify data
});
```

### Event Filtering

```javascript
// Subscribe with filters
const subscribeWithFilter = (eventName, callback, filter) => {
  return EventBus.subscribe(eventName, (data) => {
    if (filter(data)) {
      callback(data);
    }
  });
};

// Usage
subscribeWithFilter(
  "state:changed",
  handleSelectionChange,
  (data) => data.action.type === "SET_SELECTION"
);
```

### Event Namespacing

```javascript
// Create namespaced event buses
const createNamespacedBus = (namespace) => {
  return {
    subscribe: (event, callback) => EventBus.subscribe(`${namespace}:${event}`, callback),
    publish: (event, data) => EventBus.publish(`${namespace}:${event}`, data)
  };
};

const mapBus = createNamespacedBus("map");
mapBus.publish("flyTo", coordinates); // Publishes "map:flyTo"
```