// =============================================================================
// CONFIGURATION MODULE
// =============================================================================

import { mapConfig } from "./config/map.js";
import { eventActionsConfig } from "./config/actions.js";
import { apiConfig, webflowConfig } from "./config/api.js";
import { selectorsConfig, uiConfig, featureConfig } from "./config/ui.js";

export const Config = {
  MAP: mapConfig,
  EVENT_ACTIONS: eventActionsConfig,
  API: apiConfig,
  WEBFLOW: webflowConfig,
  SELECTORS: selectorsConfig,
  UI: uiConfig,
  FEATURE_CONFIG: featureConfig,
};
