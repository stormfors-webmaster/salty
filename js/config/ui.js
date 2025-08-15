export const selectorsConfig = {
  MAP_CONTAINER: "#map-container",
  DETAIL_SIDEBAR: "#detail-sidebar",
  DETAIL_SIDEBAR_CONTENT: "#detail-sidebar-content",
  BEACH_LIST_ITEMS: ".beach-list-item",

  // Sidebar Elements
  SIDEBAR_WRAPPER: '[sidebar="wrapper"]',
  SIDEBAR_HOME: '[sidebar="home"]',
  SIDEBAR_BEACH_LIST: '[sidebar="beach-list"]',
  SIDEBAR_BEACH: '[sidebar="beach"]',
  BEACH_LIST_CONTAINER: ".beach-list_list",
  BEACH_LIST_ITEM_TEMPLATE: "#beach-list-item-template",

  // Beach List Item Template Elements
  TEMPLATE_BEACH_LINK: ".beach-info-small_wrapper",
  TEMPLATE_BEACH_IMAGE: '[beach-list-item="image"]',
  TEMPLATE_BEACH_TITLE: '[beach-list-item="title"]',
  TEMPLATE_BEACH_LOCATION_WRAPPER: '[beach-list-item="location-wrapper"]',
  TEMPLATE_BEACH_CLUSTER: '[beach-list-item="location-cluster"]',
  TEMPLATE_BEACH_STATE: '[beach-list-item="state"]',
  TEMPLATE_BEACH_DELIMITER: ".delimiter",

  // Beach Detail Page Elements
  BEACH_DETAIL_IMAGE: '[beach-data="image"]',
  BEACH_DETAIL_TITLE: '[beach-data="title"]',
  BEACH_DETAIL_ADDRESS_LINK: '[beach-data="address-link"]',
  BEACH_DETAIL_ADDRESS_TEXT: '[beach-data="address-text"]',
  BEACH_DETAIL_WEBSITE_LINK: '[beach-data="website-link"]',
  BEACH_DETAIL_WEBSITE_TEXT: '[beach-data="website-text"]',

  // Amenity Details
  BEACH_DETAIL_RESTROOMS: '[beach-data="restrooms"]',
  BEACH_DETAIL_SHOWERS: '[beach-data="showers"]',
  BEACH_DETAIL_PETS: '[beach-data="pets"]',
  BEACH_DETAIL_PARKING: '[beach-data="parking"]',
  BEACH_DETAIL_CAMPING: '[beach-data="camping"]',

  // Weather Details
  WEATHER_AIR_TEMP: '[beach-data="air-temp"]',
  WEATHER_FEELS_LIKE: '[beach-data="feels-like"]',
  WEATHER_HUMIDITY: '[beach-data="humidity"]',
  WEATHER_WIND: '[beach-data="wind"]',
  WEATHER_WIND_DIRECTION: '[beach-data="wind-direction"]',
  WEATHER_AQI: '[beach-data="aqi"]',
  WEATHER_RAINFALL: '[beach-data="rainfall"]',
  WEATHER_PRESSURE: '[beach-data="pressure"]',
  WEATHER_PM25: '[beach-data="pm25"]',
  WEATHER_PM10: '[beach-data="pm10"]',
  WEATHER_WATER_TEMP: '[beach-data="water-temp"]',
  WEATHER_WAVE_HEIGHT: '[beach-data="wave-height"]',
  WEATHER_OCEAN_CURRENT: '[beach-data="ocean-current"]',
  WEATHER_UV_INDEX: '[beach-data="uv-index"]',
  WEATHER_CLOUD_COVER: '[beach-data="cloud-cover"]',
  WEATHER_SUNSET: '[beach-data="sunset"]',

  // Navigation Buttons
  BEACH_DETAIL_BACK_BUTTON: ".modal_back-button",
  BEACH_DETAIL_CLOSE_BUTTON: ".modal_close-button",
};

export const uiConfig = {
  MAP_FLY_SPEED: 1.5,
  RENDER_DELAY: 150,
  POPUP_OFFSET: 32,
  LIST_ITEM_HEIGHT: 80,
};

export const featureConfig = {
  state: {
    templateId: "#state-list-item-template",
    actionName: "selectState",
    dataMapping: {
      '[state-list-item="image"]': {
        type: "image",
        source: (p) =>
          p["IMAGE"] ||
          "https://cdn.prod.website-files.com/677e87dd7e4a4c73cbae4e0e/677e87dd7e4a4c73cbae4ee3_placeholder-image.svg",
      },
      '[state-list-item="title"]': {
        type: "text",
        source: (p) => p.NAME || "Unnamed State",
      },
    },
  },
  region: {
    templateId: "#city-list-item-template",
    actionName: "selectRegion",
    dataMapping: {
      '[city-list-item="image"]': {
        type: "image",
        source: (p) =>
          p.Image ||
          "https://cdn.prod.website-files.com/677e87dd7e4a4c73cbae4e0e/677e87dd7e4a4c73cbae4ee3_placeholder-image.svg",
      },
      '[city-list-item="title"]': {
        type: "text",
        source: (p) => p["name"] || "Unnamed Region",
      },
    },
  },
  beach: {
    templateId: "#beach-list-item-template",
    actionName: "selectBeachFromList",
    dataMapping: {
      '[beach-list-item="image"]': {
        type: "image",
        source: (p) =>
          p["Main Image"] ||
          "https://cdn.prod.website-files.com/677e87dd7e4a4c73cbae4e0e/677e87dd7e4a4c73cbae4ee3_placeholder-image.svg",
      },
      '[beach-list-item="title"]': {
        type: "text",
        source: (p) => p.Name || "Beach Title",
      },
      '[beach-list-item="location-cluster"]': {
        type: "text",
        source: (p) => p["Location Cluster"],
      },
      '[beach-list-item="state"]': { type: "text", source: (p) => p.State },
      '[beach-list-item="delimiter"]': {
        type: "style",
        style: { display: "inline" },
      }, // Ensure delimiter is visible
    },
  },
  poi: {
    templateId: "#beach-list-item-template", // Reuse beach template for now
    actionName: "selectPOIFromList",
    dataMapping: {
      '[beach-list-item="image"]': {
        type: "image",
        source: (p) =>
          p.mainImageUrl ||
          p["Main Image"] ||
          p.imageUrl ||
          "https://cdn.prod.website-files.com/677e87dd7e4a4c73cbae4e0e/677e87dd7e4a4c73cbae4ee3_placeholder-image.svg",
      },
      '[beach-list-item="title"]': {
        type: "text",
        source: (p) => p.name || p.Name || "Point of Interest",
      },
      '[beach-list-item="location-cluster"]': {
        type: "text",
        source: (p) => p.categoryName || p.category || p.type || "POI",
      },
      '[beach-list-item="state"]': {
        type: "text",
        source: (p) =>
          p.customIconName || p["Custom Icon"] || p.State || p.state || "",
      },
      '[beach-list-item="delimiter"]': {
        type: "style",
        style: { display: "inline" },
      },
    },
  },
};
