// =============================================================================
// UI CONTROLLER MODULE (COORDINATOR)
// =============================================================================

import { Config } from "./config.js";
import { AppState } from "./appState.js";
import { EventBus } from "./eventBus.js";
import { ActionController } from "./actionController.js";
import { FeatureListView } from "./views/FeatureListView.js";
import { DetailView } from "./views/DetailView.js";
import { ResponsiveService } from "./services/ResponsiveService.js";

export const UIController = {
  /**
   * Initialize UI controller and cache DOM elements
   */
  init() {
    console.log("[UIController] init as coordinator");
    this.cacheElements();
    this.setupEventListeners();
    this.setupBusSubscriptions();

    // Initialize the decomposed modules
    FeatureListView.init();
    DetailView.init();
    ResponsiveService.init();
  },

  /**
   * Cache frequently used DOM elements
   */
  cacheElements() {
    console.log("[UIController] cacheElements");
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
  },

  /**
   * Setup event listeners for UI interactions
   */
  setupEventListeners() {
    console.log("[UIController] setupEventListeners");

    // Use a generic handler for all elements with an action-trigger attribute
    document.body.addEventListener("click", (e) => {
      const target = e.target.closest("[action-trigger]");
      if (!target) return;

      e.preventDefault();
      const actionName = target.getAttribute("action-trigger");
      if (actionName) {
        console.log(`[UIController] Action triggered: ${actionName}`);
        ActionController.execute(actionName, {
          target,
          source: "sidebar-list-item", // Assume all UI-driven actions originate from the sidebar
        });
      }
    });
  },

  /**
   * Setup subscriptions to the event bus.
   */
  setupBusSubscriptions() {
    EventBus.subscribe("state:selectionChanged", (selection) => {
      if (selection?.type === "beach" || selection?.type === "poi") {
        DetailView.updateDetailSidebar();
      }
    });
    EventBus.subscribe("ui:sidebarRequested", (data) => this.showSidebar(data.sidebar));
    EventBus.subscribe("ui:fullscreenToggled", this.toggleFullscreen.bind(this));
    EventBus.subscribe("ui:viewChanged", () => this.showSidebar(AppState.getState().ui.currentSidebar));
  },

  /**
   * Handles state changes for the current selection.
   * @param {object} selection - The new selection state.
   */
  handleSelectionChange(selection) {
    // This function is now only responsible for hiding the detail sidebar if the
    // selection is cleared or changed to a non-beach entity.
    // The showing of the sidebar is handled by the SHOW_SIDEBAR action.
    if (
      (!selection || selection.type !== "beach") &&
      AppState.getState().ui.currentSidebar === "detail"
    ) {
      this.showSidebar("list");
    }
  },

  /**
   * Show specific sidebar panel
   * @param {string} type - 'home', 'list', or 'detail'
   */
  showSidebar(type) {
    console.log(`[UIController] showSidebar: ${type}`);
    AppState.dispatch({
      type: "SET_UI_STATE",
      payload: { currentSidebar: type },
    });

    const {
      SIDEBAR_WRAPPER,
      SIDEBAR_HOME,
      SIDEBAR_BEACH_LIST,
      SIDEBAR_BEACH,
    } = AppState.getState().ui.elements;

    if (!SIDEBAR_WRAPPER) return;

    // Hide all sidebars first
    if (SIDEBAR_HOME) SIDEBAR_HOME.style.display = "none";
    if (SIDEBAR_BEACH_LIST) SIDEBAR_BEACH_LIST.style.display = "none";
    if (SIDEBAR_BEACH) SIDEBAR_BEACH.style.display = "none";

    // Show the correct one
    let sidebarToShow;
    switch (type) {
      case "home":
        sidebarToShow = SIDEBAR_HOME;
        break;
      case "list":
        sidebarToShow = SIDEBAR_BEACH_LIST;
        break;
      case "detail":
        sidebarToShow = SIDEBAR_BEACH;
        break;
    }

    if (sidebarToShow) {
      sidebarToShow.style.display = "block";
    }

    // Ensure the wrapper itself is visible.
    SIDEBAR_WRAPPER.style.display = "block";
    // Remove the dataset attribute as it's no longer used for this logic
    delete SIDEBAR_WRAPPER.dataset.activeSidebar;

    // Handle map visibility on mobile.
    if (AppState.getState().ui.isMobile) {
      this.hideMap();
    } else {
      this.showMap();
    }
  },

  /**
   * Show map
   */
  showMap() {
    console.log("[UIController] showMap");
    const sidebarMap = AppState.getUICachedElement("SIDEBAR_MAP");
    if (sidebarMap) {
      sidebarMap.style.display = "block";
    }
  },

  /**
   * Hide map
   */
  hideMap() {
    console.log("[UIController] hideMap");
    const sidebarMap = AppState.getUICachedElement("SIDEBAR_MAP");
    if (sidebarMap) {
      sidebarMap.style.display = "none";
    }
  },

  /**
   * Toggle fullscreen mode
   */
  toggleFullscreen() {
    console.log("[UIController] toggleFullscreen");
    const { SIDEBAR_MAP, SIDEBAR_WRAPPER } = AppState.getState().ui.elements;
    if (AppState.getState().ui.isMobile) {
      // On mobile, toggle between map and sidebar
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
      // On desktop, toggle sidebar visibility
      if (SIDEBAR_WRAPPER) {
        const isVisible = SIDEBAR_WRAPPER.style.display !== "none";
        SIDEBAR_WRAPPER.style.display = isVisible ? "none" : "block";
      }
      this.showMap();
    }
  },

  /**
   * Render a list of features (beaches, regions, states) in the sidebar
   * @param {Array} features - An array of GeoJSON features
   * @param {string} type - The type of feature ('beach', 'region', 'state')
   */
  renderFeatureList(features, type) {
    console.log(`[UIController] renderFeatureList for type: ${type}`, features);
    FeatureListView.renderFeatureList(features, type);
  },
};