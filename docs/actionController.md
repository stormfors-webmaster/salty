# ActionController Module Documentation

## Overview

The `ActionController` is a central orchestrator that executes predefined action sequences based on user interactions. It acts as a "conductor" that interprets configuration-defined actions and publishes corresponding events through the EventBus, enabling complex, coordinated behaviors across multiple modules.

## Location
`js/actionController.js`

## Dependencies
- `Config` - Configuration system for action definitions
- `AppState` - Application state management
- `EventBus` - Event communication system
- `Utils` - Utility functions

## Architecture

The ActionController follows a configuration-driven approach where user interactions trigger named action sequences defined in `Config.EVENT_ACTIONS`. Each action sequence contains multiple atomic actions that are executed in order.

### Flow Diagram
```
User Interaction → ActionController.execute() → runAction() → EventBus.publish() → Module Response
```

## Public API

### Methods

#### `execute(actionName, context)`

Executes a named action sequence defined in the configuration.

**Parameters:**
- `actionName` (String) - Key from `Config.EVENT_ACTIONS` that defines the action sequence
- `context` (Object) - Contextual data for the execution
  - `context.feature` (Object) - GeoJSON feature object (optional)
  - `context.entityType` (String) - Type of entity ('beach', 'region', 'state') (optional)
  - `context.target` (HTMLElement) - DOM element that triggered the action (optional)

**Example Usage:**
```javascript
// Execute beach selection from map
ActionController.execute("selectBeachFromMap", {
  entityType: "beach",
  feature: geoJSONFeature
});

// Execute navigation action
ActionController.execute("navigateHome");

// Execute action with DOM target
ActionController.execute("selectBeachFromList", {
  target: clickedElement
});
```

#### `runAction(action, context)` (Internal)

Executes a single atomic action. This method is called internally by `execute()` for each action in a sequence.

**Parameters:**
- `action` (Object) - Single action configuration object
- `context` (Object) - Execution context

## Action Types

The ActionController supports the following atomic action types:

### Geographic Actions

#### `FLY_TO`
Animates the map to fly to a feature's location.

**Configuration:**
```javascript
{
  type: "FLY_TO",
  zoomLevel: 14.5,     // Target zoom level (optional, default from config)
  speed: 2             // Animation speed (optional, default from config)
}
```

**Published Event:** `map:flyTo`

#### `FLY_TO_DEFAULT_POSITION`
Returns the map to its default starting position.

**Configuration:**
```javascript
{
  type: "FLY_TO_DEFAULT_POSITION"
}
```

**Published Event:** `map:flyTo`

#### `ZOOM_TO`
Zooms the map to a specific level without changing center.

**Configuration:**
```javascript
{
  type: "ZOOM_TO",
  zoomLevel: 12,       // Target zoom level
  speed: 1.2           // Animation speed (optional)
}
```

**Published Event:** `map:zoomTo`

### State Management Actions

#### `UPDATE_APP_STATE`
Updates the application state with the current feature selection.

**Configuration:**
```javascript
{
  type: "UPDATE_APP_STATE"
}
```

**Published Event:** State dispatch to AppState

**Requirements:** Context must include `feature` and `entityType`

### UI Actions

#### `SHOW_SIDEBAR`
Displays a specific sidebar panel.

**Configuration:**
```javascript
{
  type: "SHOW_SIDEBAR",
  sidebar: "home|list|detail"    // Target sidebar type
}
```

**Published Event:** `ui:sidebarRequested`

#### `TOGGLE_FULLSCREEN`
Toggles fullscreen mode (mobile: map/sidebar toggle, desktop: sidebar visibility).

**Configuration:**
```javascript
{
  type: "TOGGLE_FULLSCREEN"
}
```

**Published Event:** `ui:fullscreenToggled`

### Map Interaction Actions

#### `SHOW_POPUP`
Displays a popup for the current feature.

**Configuration:**
```javascript
{
  type: "SHOW_POPUP",
  delay: 100           // Delay in milliseconds before showing (optional)
}
```

**Published Event:** `map:showPopup`

**Requirements:** Context must include `feature`

#### `CLOSE_ALL_POPUPS`
Closes all open popups on the map.

**Configuration:**
```javascript
{
  type: "CLOSE_ALL_POPUPS"
}
```

**Published Event:** `map:closeAllPopups`

## Conditional Actions

Actions can include conditional execution using the `when` property:

### Available Conditions

#### Context-Based Conditions
```javascript
{
  type: "FLY_TO",
  zoomLevel: 14,
  when: { context: "isMobile" }    // Only execute on mobile
}

{
  type: "SHOW_POPUP",
  when: { context: "isDesktop" }   // Only execute on desktop
}
```

### Condition Types
- `"isMobile"` - Execute only when viewport width ≤ mobile breakpoint
- `"isDesktop"` - Execute only when viewport width > mobile breakpoint

## Configuration Examples

### Beach Selection Actions

```javascript
// From map click
selectBeachFromMap: {
  description: "Action when a beach is selected directly from the map",
  actions: [
    { type: "UPDATE_APP_STATE" },
    { 
      type: "FLY_TO", 
      zoomLevel: 14.5, 
      speed: 2, 
      when: { context: "isMobile" } 
    },
    { type: "SHOW_POPUP", delay: 100 },
    { 
      type: "SHOW_SIDEBAR", 
      sidebar: "detail", 
      when: { context: "isMobile" } 
    }
  ]
}

// From sidebar list
selectBeachFromList: {
  description: "Action when a beach is selected from a sidebar list",
  actions: [
    { type: "UPDATE_APP_STATE" },
    { type: "SHOW_SIDEBAR", sidebar: "detail" },
    { type: "FLY_TO", zoomLevel: 14.5, speed: 2 },
    { type: "SHOW_POPUP", delay: 100, when: { context: "isDesktop" } }
  ]
}
```

### Navigation Actions

```javascript
navigateHome: {
  description: "Action for buttons navigating to the home screen",
  actions: [
    { type: "SHOW_SIDEBAR", sidebar: "home" }
  ]
}

closeDetailAndReset: {
  description: "Close detail view and reset map to default position",
  actions: [
    { type: "SHOW_SIDEBAR", sidebar: "list" },
    { type: "FLY_TO_DEFAULT_POSITION" }
  ]
}
```

## Context Resolution

The ActionController can resolve context from DOM elements when a `target` is provided:

```javascript
// If context.feature is not provided but context.target exists
if (!context.feature && context.target) {
  const { entityType, featureId } = context.target.dataset;
  if (entityType && featureId) {
    context.feature = AppState.getState().cache.visibleFeatures.get(featureId);
    context.entityType = entityType;
  }
}
```

**Required DOM attributes:**
- `data-entity-type` - Type of entity
- `data-feature-id` - ID of the feature

## Event Integration

The ActionController publishes events that are consumed by various modules:

### Map Events
- `map:flyTo` → Consumed by `MapController`
- `map:zoomTo` → Consumed by `MapController`  
- `map:showPopup` → Consumed by `MapController`
- `map:closeAllPopups` → Consumed by `MapController`

### UI Events
- `ui:sidebarRequested` → Consumed by `UIController`
- `ui:fullscreenToggled` → Consumed by `UIController`

### State Events
- Direct dispatch to `AppState` for state updates

## Error Handling

The ActionController includes robust error handling:

```javascript
// Unknown action configuration
if (!actionConfig) {
  console.warn(`[ActionController] No action configured for '${actionName}'.`);
  return;
}

// Unknown action type
default:
  console.warn(`[ActionController] Unknown action type: '${action.type}'`);
```

## Best Practices

### Configuration Design
1. **Keep actions atomic** - Each action should perform a single, well-defined operation
2. **Use descriptive names** - Action names should clearly indicate their purpose
3. **Group related actions** - Combine actions that naturally belong together
4. **Use conditions wisely** - Apply conditional logic for responsive behavior

### Context Management
1. **Provide sufficient context** - Include all necessary data for action execution
2. **Handle missing context** - Actions should gracefully handle missing context data
3. **Use feature caching** - Leverage AppState's visible features cache for performance

### Debugging
1. **Enable console logging** - ActionController provides detailed execution logs
2. **Monitor event flow** - Use browser dev tools to track EventBus publications
3. **Validate configurations** - Ensure action configurations are properly defined

## Integration Examples

### Adding Custom Actions

1. **Define the action type:**
```javascript
case "CUSTOM_ACTION":
  // Custom logic here
  EventBus.publish("custom:actionExecuted", {
    customData: action.customParameter
  });
  break;
```

2. **Configure the action:**
```javascript
customActionSequence: {
  description: "Custom action sequence",
  actions: [
    { type: "CUSTOM_ACTION", customParameter: "value" },
    { type: "SHOW_SIDEBAR", sidebar: "list" }
  ]
}
```

3. **Execute the action:**
```javascript
ActionController.execute("customActionSequence", { 
  additionalContext: "data" 
});
```

### DOM Integration

Set up DOM elements to trigger actions:

```html
<button action-trigger="navigateHome">Home</button>
<div action-trigger="selectBeachFromList" 
     data-entity-type="beach" 
     data-feature-id="beach_123">
  Beach Item
</div>
```

The UIController will automatically handle clicks on elements with `action-trigger` attributes.

## Performance Considerations

1. **Action execution is synchronous** - Actions are executed immediately in sequence
2. **Event publishing is asynchronous** - EventBus publications don't block execution
3. **Context resolution is cached** - Feature lookups use efficient Map structures
4. **Conditional evaluation is fast** - Condition checking has minimal overhead

## Future Extensions

The ActionController architecture supports easy extension:

1. **New action types** - Add cases to `runAction()` method
2. **Complex conditions** - Extend condition evaluation logic
3. **Action middleware** - Add pre/post action hooks
4. **Action composition** - Support nested action sequences