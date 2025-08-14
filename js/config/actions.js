export const eventActionsConfig = {
  selectState: {
    description: "Action when a state is clicked on the map or in the list.",
    actions: [
      { type: "FLY_TO", zoomLevel: 5, speed: 2 },
      { type: "UPDATE_APP_STATE" },
      { type: "SHOW_SIDEBAR", sidebar: "list" },
    ],
  },
  selectRegion: {
    description: "Action when a region/city cluster is clicked.",
    actions: [
      { type: "FLY_TO", zoomLevel: 9, speed: 2 },
      { type: "UPDATE_APP_STATE" },
      { type: "SHOW_SIDEBAR", sidebar: "list" },
    ],
  },
  selectBeachFromMap: {
    description: "Action when a beach is selected directly from the map.",
    actions: [
      { type: "UPDATE_APP_STATE" },
      {
        type: "FLY_TO",
        zoomLevel: 14.5,
        speed: 2,
        when: { context: "isMobile" },
      },
      { type: "SHOW_POPUP", delay: 100 },
      {
        type: "SHOW_SIDEBAR",
        sidebar: "detail",
        when: { context: "isMobile" },
      },
    ],
  },
  selectBeachFromList: {
    description: "Action when a beach is selected from a sidebar list.",
    actions: [
      { type: "UPDATE_APP_STATE" },
      { type: "SHOW_SIDEBAR", sidebar: "detail" },
      { type: "FLY_TO", zoomLevel: 14.5, speed: 2 },
      { type: "SHOW_POPUP", delay: 100, when: { context: "isDesktop" } },
    ],
  },
  selectBeachFromPopup: {
    description: "Action when a beach popup is clicked.",
    actions: [
      { type: "UPDATE_APP_STATE" },
      { type: "SHOW_SIDEBAR", sidebar: "detail" },
      {
        type: "FLY_TO",
        zoomLevel: 14,
        speed: 1.2,
        when: { context: "isMobile" },
      },
    ],
  },
  selectPOIFromMap: {
    description: "Action when a POI marker is clicked directly from the map.",
    actions: [
      { type: "UPDATE_APP_STATE" },
      {
        type: "FLY_TO",
        zoomLevel: 16,
        speed: 2,
        when: { context: "isMobile" },
      },
      { type: "SHOW_POPUP", delay: 100 },
      {
        type: "SHOW_SIDEBAR",
        sidebar: "detail",
        when: { context: "isMobile" },
      },
    ],
  },
  selectPOIFromList: {
    description: "Action when a POI is selected from a sidebar list.",
    actions: [
      { type: "UPDATE_APP_STATE" },
      { type: "SHOW_SIDEBAR", sidebar: "detail" },
      { type: "FLY_TO", zoomLevel: 16, speed: 2 },
      { type: "SHOW_POPUP", delay: 100, when: { context: "isDesktop" } },
    ],
  },
  selectPOIFromPopup: {
    description: "Action when a POI popup is clicked.",
    actions: [
      { type: "UPDATE_APP_STATE" },
      { type: "SHOW_SIDEBAR", sidebar: "detail" },
      {
        type: "FLY_TO",
        zoomLevel: 16,
        speed: 1.2,
        when: { context: "isMobile" },
      },
    ],
  },

  // Defines actions for static UI buttons
  navigateHome: {
    description: "Action for buttons navigating to the home screen.",
    actions: [{ type: "SHOW_SIDEBAR", sidebar: "home" }],
  },
  navigateToList: {
    description: "Action for buttons that should open the list view.",
    actions: [{ type: "SHOW_SIDEBAR", sidebar: "list" }],
  },
  closeDetailAndReset: {
    description:
      "Action for the close button in the detail view to reset the map.",
    actions: [
      { type: "SHOW_SIDEBAR", sidebar: "list" },
      { type: "FLY_TO_DEFAULT_POSITION" },
    ],
  },
  backToList: {
    description:
      "Action for the back button in detail view to return to the list, close popups, and zoom out.",
    actions: [
      { type: "SHOW_SIDEBAR", sidebar: "list" },
      { type: "CLOSE_ALL_POPUPS" },
    ],
  },
  toggleFullscreen: {
    description: "Action for the fullscreen toggle button.",
    actions: [{ type: "TOGGLE_FULLSCREEN" }],
  },
};
