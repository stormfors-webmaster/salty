import { Config } from "./config.js";
import { AppState } from "./appState.js";
import { EventBus } from "./eventBus.js";
import { Utils } from "./utils.js";

const ActionController = {
  /**
   * Executes a named action sequence.
   * @param {string} actionName - The key from Config.EVENT_ACTIONS.
   * @param {object} context - Contextual data (e.g., feature, target).
   */
  execute(actionName, context = {}) {
    const actionConfig = Config.EVENT_ACTIONS[actionName];
    if (!actionConfig) {
      console.warn(
        `[ActionController] No action configured for '${actionName}'.`
      );
      return;
    }

    if (!context.feature && context.target) {
      const { entityType, featureId } = context.target.dataset;
      if (entityType && featureId) {
        context.feature =
          AppState.getState().cache.visibleFeatures.get(featureId);
        context.entityType = entityType;
      }
    }

    console.log(
      `[ActionController] Executing action: '${actionName}'`,
      context
    );

    actionConfig.actions.forEach((action) => {
      if (action.when) {
        const conditionKey = Object.keys(action.when)[0];
        const expectedValue = action.when[conditionKey];
        let conditionMet = false;

        if (conditionKey === "context") {
          if (expectedValue === "isMobile") conditionMet = Utils.isMobileView();
          if (expectedValue === "isDesktop")
            conditionMet = !Utils.isMobileView();
        }

        if (!conditionMet) return;
      }

      this.runAction(action, context);
    });
  },

  /**
   * Runs a single action.
   * @param {object} action - The action object from the config.
   * @param {object} context - The context for this execution.
   */
  runAction(action, context) {
    const { feature, entityType } = context;

    switch (action.type) {
      case "FLY_TO":
        if (feature && feature.geometry) {
          EventBus.publish("map:flyTo", {
            coordinates: feature.geometry.coordinates,
            zoom: action.zoomLevel,
            speed: action.speed,
          });
        }
        break;

      case "FLY_TO_DEFAULT_POSITION":
        const position = Utils.isMobileView()
          ? Config.MAP.MOBILE_START_POSITION
          : Config.MAP.DESKTOP_START_POSITION;
        const zoom = Config.MAP.DEFAULT_ZOOM;
        EventBus.publish("map:flyTo", { coordinates: position, zoom: zoom });
        break;

      case "UPDATE_APP_STATE":
        if (feature && entityType) {
          const entityId = feature.properties["Item ID"] || feature.id;
          AppState.dispatch({
            type: "SET_SELECTION",
            payload: { type: entityType, id: entityId, feature },
          });
        }
        break;

      case "SHOW_SIDEBAR":
        EventBus.publish("ui:sidebarRequested", { sidebar: action.sidebar });
        break;

      case "SHOW_POPUP":
        if (feature) {
          const entityId = feature.properties["Item ID"] || feature.id;
          let details;
          if (entityType === "poi") {
            details = AppState.getPOIById(entityId);
          } else {
            details = AppState.getBeachById(entityId);
          }
          EventBus.publish("map:showPopup", {
            feature,
            details,
            delay: action.delay,
            entityType,
          });
        }
        break;

      case "CLOSE_ALL_POPUPS":
        EventBus.publish("map:closeAllPopups");
        break;

      case "ZOOM_TO":
        EventBus.publish("map:zoomTo", {
          zoom: action.zoomLevel,
          speed: action.speed,
        });
        break;

      case "TOGGLE_FULLSCREEN":
        EventBus.publish("ui:fullscreenToggled");
        break;

      default:
        console.warn(
          `[ActionController] Unknown action type: '${action.type}'`
        );
    }
  },
};

export { ActionController };
