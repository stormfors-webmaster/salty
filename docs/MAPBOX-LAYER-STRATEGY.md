# Mapbox Layer Management Strategy

## Problem

Hardcoding layer IDs from Mapbox Studio is fragile because:

- Layer names can be changed in Mapbox Studio without updating the code
- Different environments might have different layer names
- It creates tight coupling between code and map style

## Solution: Query by Source-Layer

Instead of hardcoding layer IDs like `"Beach Labels"`, we query layers dynamically based on their `source-layer` property, which is more stable as it references the actual data source.

### Implementation

1. **Configure source-layer names in map config:**

```javascript
// js/config/map.js
SOURCE_LAYERS: {
  STATES: "salty-usa-states-3wxdpv",
  US_STATES: "us-states",
  REGIONS: "place_label",
  BEACHES: "Salty_Beaches_v1",
  POIS: "Salty_Points_of_Interest_v1"
}
```

2. **Dynamically discover layers:**

```javascript
// Get all layers that use a specific source-layer
getLayersBySourceLayer(sourceLayer) {
  const map = AppState.getMap();
  if (!map || !map.getStyle()) return [];

  const style = map.getStyle();
  return style.layers
    .filter(layer => layer['source-layer'] === sourceLayer)
    .map(layer => layer.id);
}
```

3. **Use source-layer for entity type detection:**

```javascript
// Instead of checking layer.id, check source-layer
const sourceLayer = feature.layer["source-layer"];
switch (sourceLayer) {
  case Config.MAP.SOURCE_LAYERS.BEACHES:
    entityType = "beach";
    break;
  // ...
}
```

## Benefits

1. **Resilient to Style Changes**: Layer names can change in Mapbox Studio without breaking the code
2. **Environment Flexibility**: Different styles can have different layer names
3. **Single Source of Truth**: Source-layer names are defined once in config
4. **Better Debugging**: Console logs show which layers were actually found

## Alternative Approaches

### 1. Layer Metadata (Future Enhancement)

Add custom metadata to layers in Mapbox Studio:

```javascript
// In Mapbox Studio layer properties
"metadata": {
  "app-entity-type": "beach"
}
```

### 2. Configuration Mapping

External config file that maps current layer IDs:

```javascript
// layer-mapping.json
{
  "beaches": "Beach Labels",
  "pois": "POI Labels"
}
```

### 3. Layer Pattern Matching

Find layers by pattern in their ID:

```javascript
const beachLayers = style.layers
  .filter((layer) => layer.id.toLowerCase().includes("beach"))
  .map((layer) => layer.id);
```

## Migration Guide

To update when Mapbox source-layers change:

1. Check the new source-layer names in Mapbox Studio
2. Update `SOURCE_LAYERS` in `js/config/map.js`
3. That's it! The code will automatically discover the new layers

## Debugging

Enable layer discovery logging:

```javascript
console.log("✅ Found interactive layers:", interactiveLayers);
```

This will show which layers were actually found, helping diagnose issues quickly.
