import { Utils } from "../utils.js";
import { AppState } from "../appState.js";
import { EventBus } from "../eventBus.js";

export const ResponsiveService = {
  init() {
    console.log("[ResponsiveService] init");
    this.updateLayout(); // Initial check
    
    window.addEventListener(
      "resize",
      Utils.debounce(() => {
        this.updateLayout();
      }, 250)
    );
  },

  updateLayout() {
    const isMobile = Utils.isMobileView();
    const wasMobile = AppState.getState().ui.isMobile;

    if (isMobile !== wasMobile) {
      console.log(`[ResponsiveService] View changed to ${isMobile ? 'mobile' : 'desktop'}`);
      AppState.dispatch({ type: "SET_UI_STATE", payload: { isMobile } });
      EventBus.publish("ui:viewChanged", { isMobile });
    }
  }
}; 