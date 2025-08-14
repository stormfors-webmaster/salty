import { Config } from "../config.js";
import { AppState } from "../appState.js";
import { Utils } from "../utils.js";

export const FeatureListView = {
  init() {
    // This view doesn't need a specific init at the moment,
    // but it's here for consistency and future use.
  },

  /**
   * Render a list of features (beaches, regions, states) in the sidebar
   * @param {Array} features - An array of GeoJSON features
   * @param {string} type - The type of feature ('beach', 'region', 'state')
   */
  renderFeatureList(features = [], type = "beach") {
    console.log(`[FeatureListView] renderFeatureList for type: ${type}`, features);
    const listContainer = AppState.getUICachedElement("BEACH_LIST_CONTAINER");

    if (!listContainer) {
      console.error(
        "Beach list container not found. Check config selector: BEACH_LIST_CONTAINER"
      );
      return;
    }

    listContainer.innerHTML = "";
    
    if (features.length === 0) {
      listContainer.innerHTML =
        '<p style="padding: 20px; text-align: center;">No items in view. Pan or zoom the map to find some.</p>';
      return;
    }

    // Sort features before rendering
    const getSortName = (props) =>
      props.Name || props.State || props["Location Cluster"] || "";
    features.sort((a, b) =>
      getSortName(a.properties).localeCompare(getSortName(b.properties))
    );

    const seenIds = new Set();
    const validFeatures = [];

    features.forEach((feature) => {
      if (type === "beach") {
        const beachId = feature.properties["Item ID"];
        if (beachId && !seenIds.has(beachId)) {
          seenIds.add(beachId);
          validFeatures.push(feature);
        }
      } else {
        validFeatures.push(feature);
      }
    });

    AppState.dispatch({ type: "SET_VISIBLE_FEATURES", payload: validFeatures });

    validFeatures.forEach((feature) => {
      const listItem = this.createListItem(feature, type);
      listContainer.appendChild(listItem);
    });
  },

  /**
   * Create a list item by cloning and populating a dedicated template.
   * @param {Object} feature - GeoJSON feature
   * @param {string} type - The type of feature ('beach', 'region', 'state')
   * @returns {HTMLElement} List item element
   */
  createListItem(feature, type) {
    const config = Config.FEATURE_CONFIG[type];
    if (!config) {
      console.error(`No template configuration found for type: ${type}`);
      return document.createElement("div");
    }

    const template = document.querySelector(config.templateId);
    if (!template) {
      console.error(`Template element not found for ID: ${config.templateId}`);
      return document.createElement("div");
    }

    const clone = template.content.cloneNode(true);
    const listItem = clone.firstElementChild;
    const properties = feature.properties;

    const entityId = Utils.getFeatureEntityId(feature);

    const visibleFeatures = AppState.getVisibleFeatures();
    const cachedFeature = visibleFeatures.get(String(entityId));

    if (!cachedFeature) {
      console.warn(`[UIController] Feature with ID ${entityId} not found in cache. List item may not work correctly.`);
    }

    listItem.dataset.entityType = type;
    listItem.dataset.featureId = entityId;
    listItem.setAttribute("action-trigger", config.actionName);

    for (const selector in config.dataMapping) {
      const el = listItem.querySelector(selector);
      const mapping = config.dataMapping[selector];

      if (el) {
        switch (mapping.type) {
          case "text":
            el.textContent = mapping.source(properties) || "";
            break;
          case "image":
            el.src = mapping.source(properties);
            el.alt = properties.Name || "List item image";
            break;
          case "style":
            Object.assign(el.style, mapping.style);
            break;
        }
      } else {
        console.warn(
          `[FeatureListView] Element for selector "${selector}" not found in template "${config.templateId}"`
        );
      }
    }

    return listItem;
  },
}; 