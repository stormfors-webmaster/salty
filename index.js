console.log("🗺️ Salty Map Application Loading...");

// =============================================================================
// MODULAR SALTY MAP APPLICATION
// =============================================================================

import { Config } from "./js/config.js";
import { Utils } from "./js/utils.js";
import { MockAPI } from "./js/mockAPI.js";
import { AppState } from "./js/appState.js";
import { MapController } from "./js/mapController.js";
import { UIController } from "./js/uiController.js";
import { EventBus } from "./js/eventBus.js";
import { ActionController } from "./js/actionController.js";
import { apiConfig } from "./js/config/api.js";
import { ResponsiveService } from "./js/services/ResponsiveService.js";
import { DataController } from "./js/dataController.js";

// =============================================================================
// MAIN APPLICATION OBJECT
// =============================================================================

const App = {
  async init() {
    console.log("🚀 Salty Map Application Starting...");
    try {
      // Pass App context to controllers
      UIController.init();
      await MapController.init();
      ResponsiveService.init();
      await DataController.init();
      console.log("✅ Application initialized successfully!");
    } catch (error) {
      console.error("❌ Failed to initialize application:", error);
      const mapContainer = document.querySelector(
        Config.SELECTORS.MAP_CONTAINER
      );
      if (mapContainer) {
        Utils.showError(
          mapContainer,
          "Sorry, we couldn't load the map. Please refresh the page to try again."
        );
      }
    }
  },
};

// =============================================================================
// APPLICATION INITIALIZATION
// =============================================================================

document.addEventListener("DOMContentLoaded", () => App.init());

// =============================================================================
// GLOBAL ERROR HANDLING
// =============================================================================

window.addEventListener("error", function (e) {
  console.error("Global error:", e.error);
  // You could send this to an error reporting service here
});

window.addEventListener("unhandledrejection", function (e) {
  console.error("Unhandled promise rejection:", e.reason);
  // You could send this to an error reporting service here
});

// =============================================================================
// EXPORT FOR TESTING (OPTIONAL)
// =============================================================================

// Export modules for potential testing or external access
export {
  App,
  Config,
  Utils,
  MockAPI,
  AppState,
  MapController,
  UIController,
};

console.log("📋 Salty Map Application Loaded");
