// =============================================================================
// SIMPLIFIED MAP CONTROLLER MODULE
// =============================================================================

import { Config } from "./config.js";
import { Utils } from "./utils.js";
import { AppState } from "./appState.js";
import { UIController } from "./uiController.js";
import { EventBus } from "./eventBus.js";
import { cityImageData } from "./cityImageData.js";
import { ActionController } from "./actionController.js";

export const MapController = {
  LAYER_IDS: {
    STATES: "state-labels",
    CALIFORNIA: "fill-california",
    HAWAII: "fill-hawaii",
    REGIONS: "region-lables",
    BEACHES: "beach-labels",
    POIS: "poi-labels",
  },
  hoveredFeature: null,

  /**
   * Initialize the Mapbox map
   */
  async init() {
    try {
      mapboxgl.accessToken = Config.MAP.ACCESS_TOKEN;

      // The map style now contains all data sources and layer styling
      const map = new mapboxgl.Map({
        container: Config.SELECTORS.MAP_CONTAINER.slice(1),
        style: Config.MAP.STYLE, // This is your Mapbox Studio style URL
        center: Utils.isMobileView()
          ? Config.MAP.MOBILE_START_POSITION
          : Config.MAP.DESKTOP_START_POSITION,
        zoom: Config.MAP.DEFAULT_ZOOM,
        pitch: Config.MAP.START_PITCH,
      });

      if (!Config.MAP.ALLOW_ROTATION) {
        map.dragRotate.disable();
        map.touchZoomRotate.disableRotation();
      }

      map.on("load", () => {
        AppState.dispatch({ type: "SET_MAP_INSTANCE", payload: map });
        this.setupEventHandlers();
        this.setupBusSubscriptions();
        console.log("✅ Map initialized with cloud-hosted data and styles.");
      });

      const mapContainer = document.querySelector(
        Config.SELECTORS.MAP_CONTAINER
      );
      const resizeObserver = new ResizeObserver(() => map.resize());
      resizeObserver.observe(mapContainer);
    } catch (error) {
      console.error("Failed to initialize map:", error);
      Utils.showError(
        document.querySelector(Config.SELECTORS.MAP_CONTAINER),
        "Failed to load map. Please check your connection and try again."
      );
    }
  },

  /**
   * Setup subscriptions to the event bus
   */
  setupBusSubscriptions() {
    EventBus.subscribe("map:flyTo", this.flyTo.bind(this));
    EventBus.subscribe("map:showPopup", (data) => {
      if (data && data.feature) {
        setTimeout(
          () => this.showPopup(data.feature, data.details, data.entityType),
          data.delay || 0
        );
      }
    });
    EventBus.subscribe("map:closeAllPopups", this.closeAllPopups.bind(this));
    EventBus.subscribe("map:zoomTo", this.zoomTo.bind(this));
  },

  /**
   * Setup general map event handlers
   */
  setupEventHandlers() {
    const interactiveLayers = Object.values(this.LAYER_IDS).filter(Boolean);

    if (interactiveLayers.length === 0) {
      console.warn(
        "⚠️ No interactive layers are defined in LAYER_IDS. Clicks will not work."
      );
      return;
    }

    // Click handler for all interactive layers
    AppState.getMap().on("click", interactiveLayers, (e) => {
      if (!e.features || e.features.length === 0) {
        return;
      }
      const feature = e.features[0];
      let entityType, actionName;

      switch (feature.layer.id) {
        case this.LAYER_IDS.BEACHES:
          entityType = "beach";
          actionName = "selectBeachFromMap";
          break;
        case this.LAYER_IDS.POIS:
          entityType = "poi";
          actionName = "selectPOIFromMap";
          break;
        case this.LAYER_IDS.REGIONS:
          entityType = "region";
          actionName = "selectRegion";
          break;
        case this.LAYER_IDS.STATES:
          entityType = "state";
          actionName = "selectState";
          break;
        default:
          return;
      }
      // Directly execute the specific action
      if (actionName) {
        ActionController.execute(actionName, { entityType, feature });
      }
    });

    // Cursor and hover state handlers
    AppState.getMap().on("mousemove", interactiveLayers, (e) => {
      if (e.features.length > 0) {
        AppState.getMap().getCanvas().style.cursor = "pointer";

        if (
          this.hoveredFeature &&
          this.hoveredFeature.id === e.features[0].id
        ) {
          // Do nothing if it's the same feature
        } else {
          // Unset state on the previously hovered feature
          if (this.hoveredFeature) {
            AppState.getMap().setFeatureState(this.hoveredFeature, {
              state: false,
            });
          }

          // Set state on the new hovered feature
          this.hoveredFeature = e.features[0];
          AppState.getMap().setFeatureState(this.hoveredFeature, {
            state: true,
          });
        }
      }
    });

    AppState.getMap().on("mouseleave", interactiveLayers, () => {
      if (this.hoveredFeature) {
        AppState.getMap().setFeatureState(this.hoveredFeature, {
          state: false,
        });
      }
      this.hoveredFeature = null;
      AppState.getMap().getCanvas().style.cursor = "";
    });

    // Update sidebar on map move
    AppState.getMap().on(
      "moveend",
      Utils.debounce(async () => {
        console.log("🗺️ Map moveend event");
        const { ui } = AppState.getState();
        // Only update the list if the list view is actually visible
        if (ui.currentSidebar !== "list") {
          console.log(
            `[MapController] Sidebar update skipped, current view is "${ui.currentSidebar}".`
          );
          return;
        }
        await this.updateSidebarListFromMap();
      }, 250)
    );
  },

  /**
   * Update sidebar list by querying the map for visible features
   */
  async updateSidebarListFromMap() {
    const map = AppState.getMap();
    if (!map) return;

    // Query for individual beaches first
    const beachFeatures = map.queryRenderedFeatures({
      layers: [this.LAYER_IDS.BEACHES],
    });
    if (beachFeatures.length > 0) {
      console.log(
        `[MapController] Found ${beachFeatures.length} individual beaches in view.`
      );
      UIController.renderFeatureList(beachFeatures, "beach");
      return;
    }

    // Query for POI features if no beaches found
    const poiFeatures = map.queryRenderedFeatures({
      layers: [this.LAYER_IDS.POIS],
    });
    if (poiFeatures.length > 0) {
      console.log(
        `[MapController] Found ${poiFeatures.length} POI features in view.`
      );
      UIController.renderFeatureList(poiFeatures, "poi");
      return;
    }

    // If no individual beaches, query for regions
    const regionFeatures = map.queryRenderedFeatures({
      layers: [this.LAYER_IDS.REGIONS],
    });
    if (regionFeatures.length > 0) {
      const sourceId = regionFeatures[0].layer.source;
      const source = map.getSource(sourceId);

      const featuresWithCounts = await Promise.all(
        regionFeatures.map((region) => {
          return new Promise((resolve) => {
            if (!region.properties.cluster) {
              region.properties.point_count = 1;
              resolve(region);
              return;
            }

            source.getClusterLeaves(
              region.properties.cluster_id,
              Infinity,
              0,
              (err, leaves) => {
                if (err) {
                  console.error("Could not get cluster leaves:", err);
                  region.properties.point_count =
                    region.properties.point_count_abbreviated || 1;
                  resolve(region);
                  return;
                }
                region.properties.point_count = leaves.length;
                resolve(region);
              }
            );
          });
        })
      );

      console.log(
        `[MapController] Found ${featuresWithCounts.length} regions in view.`
      );
      const cityImageMap = new Map(
        cityImageData.features.map((feature) => [
          feature.properties.Name,
          feature.properties.Image,
        ])
      );

      featuresWithCounts.forEach((feature) => {
        const imageName = feature.properties.name;
        if (cityImageMap.has(imageName)) {
          feature.properties.Image = cityImageMap.get(imageName);
        }
      });
      UIController.renderFeatureList(featuresWithCounts, "region");
      return;
    }

    // If no regions, query for states
    const stateFeatures = map.queryRenderedFeatures({
      layers: [this.LAYER_IDS.STATES],
    });
    if (stateFeatures.length > 0) {
      console.log(
        `[MapController] Found ${stateFeatures.length} states in view.`
      );
      UIController.renderFeatureList(stateFeatures, "state");
      return;
    }

    // If nothing is found, clear the list
    console.log("[MapController] No features found in view, clearing list.");
    UIController.renderFeatureList([]);
  },

  /**
   * Show popup for a feature
   * @param {Object} feature - Feature to show popup for
   * @param {Object} [details] - The full details object from the cache
   */
  showPopup(feature, details, entityType) {
    const coordinates = feature.geometry.coordinates.slice();
    const properties = details || feature.properties; // Use cached details if available

    const imageUrl = details
      ? details["main-image"]?.url
      : properties["Main Image"];
    const name = details ? details.name : properties.Name;
    const richTextContent = details
      ? details.richTextContent
      : properties.richTextContent;
    const address = details
      ? details["adress"]
      : properties["Formatted Adress"];
    const hours = details ? details["hours"] : properties["Hours"];
    const isPaidPartner = details
      ? details["paid-partner"]
      : properties["Paid Partner"];
    const website = details ? details["beach-website"] : properties["Website"];
    const phone = details ? details["phone"] : properties["Phone"];
    const buttonLink = details
      ? details["button-link"]
      : properties["Button Link"];

    const showButton = details ? details.button : properties.button;
    const buttonText = details ? details.buttonText : properties.buttonText;

    // Create a new URL object from the string
    const url = new URL(website);
    // Access the .hostname property
    const hostname = url.hostname;

    const popupHTML2 = `
      <div class="popup_component">
       ${
         imageUrl
           ? `<img src="${imageUrl}" alt="${name}" class="popup_image">`
           : ""
       }
       ${isPaidPartner ? '<p class="partner-badge">Paid Partner</p>' : ""}
        <div class="spacer-tiny"></div>
       <h4 class="popup_title">${name}</h4>
        ${
          richTextContent
            ? `<div class="spacer-xxsmall"></div><div class="popup_description">${richTextContent}</div>`
            : ""
        }
       ${address ? `<p class="popup_address">${address}</p>` : ""}
       ${hours ? `<p class="popup_hours">Hours: ${hours}</p>` : ""}
       ${
         website
           ? `<a href="${website}" target="_blank" class="salty-link">${hostname}</a>`
           : ""
       }
       ${
         phone
           ? `<a href="tel:${phone}" target="_blank" class="salty-link">${phone}</a><div class="spacer-xsmall"></div>`
           : ""
       }
       <div class="spacer-tiny"></div>
       ${
         entityType !== "poi"
           ? `<div class="button is-icon w-inline-block" style="background-color: rgb(0, 116, 140);">See Details</div>`
           : showButton
           ? `<a href="${buttonLink}" target="_blank" class="button is-icon w-inline-block" style="background-color: rgb(0, 116, 140); text-decoration: none;">${buttonText}</a>`
           : ""
       }
      </div>
    `;

    const popup = new mapboxgl.Popup({ offset: Config.UI.POPUP_OFFSET })
      .setLngLat(coordinates)
      .setHTML(popupHTML2)
      .addTo(AppState.getMap());

    // Track the popup
    AppState.dispatch({ type: "ADD_OPEN_POPUP", payload: popup });
    popup.on("close", () => {
      // Remove popup from the tracking array when it's closed
      AppState.dispatch({ type: "REMOVE_OPEN_POPUP", payload: popup });
    });

    // Add click listener to the popup to open the detail view
    const popupEl = popup.getElement();
    popupEl.addEventListener("click", (e) => {
      // Prevent the detail view from opening if a link within the popup is clicked
      if (e.target.tagName === "A" || e.target.closest("a")) {
        return;
      }
      if (entityType !== "poi") {
        ActionController.execute("selectBeachFromPopup", {
          entityType: "beach",
          feature: feature,
        });
        popup.remove();
      }
    });
  },

  /**
   * Closes all popups currently open on the map.
   */
  closeAllPopups() {
    AppState.getOpenPopups().forEach((popup) => popup.remove());
    AppState.dispatch({ type: "CLEAR_OPEN_POPUPS" });
  },

  /**
   * Fly to a specific location
   * @param {object} payload - The flyTo payload.
   * @param {Array} payload.coordinates - [lng, lat] coordinates
   * @param {number} payload.zoom - Target zoom level
   * @param {number} [payload.speed=Config.UI.MAP_FLY_SPEED] - Animation speed
   */
  flyTo({
    coordinates,
    zoom = Config.MAP.DETAIL_ZOOM,
    speed = Config.UI.MAP_FLY_SPEED,
  }) {
    const map = AppState.getMap();
    if (map) {
      map.flyTo({
        center: coordinates,
        zoom,
        speed: speed,
      });
    }
  },

  /**
   * Zooms to a specific zoom level without changing the center.
   * @param {object} payload - The zoomTo payload.
   * @param {number} payload.zoom - Target zoom level.
   * @param {number} [payload.speed=1.2] - Animation speed.
   */
  zoomTo({ zoom, speed = 1.2 }) {
    const map = AppState.getMap();
    if (map) {
      map.easeTo({
        zoom,
        speed,
      });
    }
  },
};
