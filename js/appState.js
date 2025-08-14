// =============================================================================
// APPLICATION STATE MODULE (with Reducer Pattern)
// =============================================================================

import { EventBus } from "./eventBus.js";

// The single source of truth for the application state.
let currentState = {
  map: null,
  currentSelection: {
    id: null,
    type: null,
    feature: null,
  },
  cache: {
    weatherData: new Map(),
    visibleFeatures: new Map(),
    beachData: new Map(), // Cache for all beach details
    poiData: new Map(), // Cache for all POI details
  },
  ui: {
    currentSidebar: "home",
    isMobile: false,
    isLoading: false,
    elements: {},
    openPopups: [],
  },
};

/**
 * The reducer function is a pure function that takes the current state and an
 * action, and returns the next state.
 * @param {object} state - The current state.
 * @param {object} action - The action to perform.
 * @returns {object} The new state.
 */
function appReducer(state, action) {
  switch (action.type) {
    case "SET_MAP_INSTANCE":
      return { ...state, map: action.payload };

    case "SET_SELECTION":
      console.log("[DEBUG] SET_SELECTION payload:", action.payload);
      // Avoid unnecessary updates if selection is the same
      if (
        state.currentSelection.id === action.payload.id &&
        state.currentSelection.type === action.payload.type
      ) {
        return state;
      }
      return { ...state, currentSelection: action.payload };

    case "CLEAR_SELECTION":
      return {
        ...state,
        currentSelection: { id: null, type: null, feature: null },
      };

    case "SET_VISIBLE_FEATURES":
      const newVisibleFeatures = new Map();
      action.payload.forEach(feature => {
        const entityId = feature.properties["Item ID"] || feature.properties.NAME || feature.properties.Name || feature.id;
        if (entityId) {
          newVisibleFeatures.set(String(entityId), feature);
        }
      });
      return { ...state, cache: { ...state.cache, visibleFeatures: newVisibleFeatures } };

    case "CLEAR_VISIBLE_FEATURES":
      return { ...state, cache: { ...state.cache, visibleFeatures: new Map() } };

    case "SET_UI_STATE":
      return { ...state, ui: { ...state.ui, ...action.payload } };
    
    case "SET_WEATHER_DATA":
      const newWeatherData = new Map(state.cache.weatherData);
      newWeatherData.set(action.payload.id, action.payload.data);
      return { ...state, cache: { ...state.cache, weatherData: newWeatherData } };

    case "DELETE_WEATHER_DATA":
      const updatedWeatherData = new Map(state.cache.weatherData);
      updatedWeatherData.delete(action.payload.id);
      return { ...state, cache: { ...state.cache, weatherData: updatedWeatherData } };

    case "ADD_OPEN_POPUP":
      return { ...state, ui: { ...state.ui, openPopups: [...state.ui.openPopups, action.payload] } };

    case "REMOVE_OPEN_POPUP":
      return { ...state, ui: { ...state.ui, openPopups: state.ui.openPopups.filter(p => p !== action.payload) } };
      
    case "CLEAR_OPEN_POPUPS":
      return { ...state, ui: { ...state.ui, openPopups: [] } };

    case "SET_ALL_BEACH_DATA":
      const beachMap = new Map();
      action.payload.forEach(beach => beachMap.set(beach.id, beach));
      return { ...state, cache: { ...state.cache, beachData: beachMap } };

    case "SET_ALL_POI_DATA":
      const poiMap = new Map();
      action.payload.forEach(poi => poiMap.set(poi.id, poi));
      return { ...state, cache: { ...state.cache, poiData: poiMap } };

    default:
      return state;
  }
}

// The AppState object now provides methods to interact with the state.
export const AppState = {
  /**
   * Dispatches an action to update the state.
   * @param {object} action - The action to dispatch (e.g., { type: 'SET_SELECTION', payload: ... }).
   */
  dispatch(action) {
    const oldState = currentState;
    currentState = appReducer(currentState, action);
    
    console.log(`[AppState] Action Dispatched: ${action.type}`, action.payload);

    // Publish a generic event for any state change
    EventBus.publish("state:changed", {
      newState: currentState,
      oldState: oldState,
      action: action,
    });
    
    // For more granular subscriptions, you can still publish specific events
    if (action.type === 'SET_SELECTION') {
      EventBus.publish("state:selectionChanged", currentState.currentSelection);
    }
  },

  /**
   * Gets the current state.
   * @returns {object} The current application state.
   */
  getState() {
    return currentState;
  },

  // Example of specific getters for convenience
  getMap() {
    return currentState.map;
  },

  getCurrentSelection() {
    return { ...currentState.currentSelection };
  },

  getUICachedElement(key) {
    return currentState.ui.elements[key];
  },

  getVisibleFeatures() {
    return currentState.cache.visibleFeatures;
  },

  getOpenPopups() {
    return currentState.ui.openPopups;
  },

  getBeachById(id) {
    return currentState.cache.beachData.get(id);
  },

  getPOIById(id) {
    return currentState.cache.poiData.get(id);
  },
};
