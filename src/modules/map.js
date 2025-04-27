/**
 * Configuration for the Mapbox map.
 */
const mapConfig = {
  mapboxToken:
    "pk.eyJ1IjoiZmVsaXhoZWxsc3Ryb20iLCJhIjoiY20zaXhucjcwMDVwdTJqcG83ZjMxemJlciJ9._TipZd1k8nMEslWbCDg6Eg",
  satelliteStyle:
    "mapbox://styles/felixhellstrom/cm7x0dpvq011w01sm5bdzap1c?optimize=true",
  standardStyle: "mapbox://styles/cv-mapbox/cm5zh2w0i002g01sfdcrs6dgj", // Currently unused, but kept for reference
  defaultZoom: 3,
  startPosition: [-144.81125912, 33.6893667], // LngLat array
  startPitch: 0,
  flyToZoom: 18, // Zoom level when flying to a marker
  flyToPitch: 75, // Pitch level when flying to a marker
  poiMinZoom: 15, // Minimum zoom level to show POI markers
  // Material Icons hex codes for POI markers
  poiIconMappings: {
    default: "e55f", // place
    lifeguard: "ef73", // support
    firstaid: "e3f3", // local_hospital
    firstaidstation: "e3f3", // local_hospital
    toilet: "e05a", // wc
    showers: "e547", // shower
    parking: "e54f", // local_parking
    restaurant: "e56c", // restaurant
    picnic: "ea48", // park
    picnicarea: "ea48", // park
    camping: "e3fa", // outdoor_grill
    pier: "e568", // directions_boat
  },
};

const devmode = localStorage.getItem("devMode") === "true";

/**
 * Initializes and manages the Mapbox map functionality.
 */
export function map() {
  if (devmode) {
    console.log("map.js: Module loaded");
  }

  mapboxgl.accessToken = mapConfig.mapboxToken;

  const map = new mapboxgl.Map({
    container: "map", // HTML element ID to render the map
    style: mapConfig.satelliteStyle,
    projection: "globe",
    zoom: mapConfig.defaultZoom,
    center: mapConfig.startPosition,
    pitch: mapConfig.startPitch,
  });

  // Add map controls
  map.addControl(new mapboxgl.NavigationControl(), "bottom-right");
  map.addControl(
    new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
      showUserHeading: true,
    }),
    "bottom-right"
  );

  // Store markers for beaches and POIs
  const markers = new Map(); // Beach markers: { id -> Mapbox GL Marker }
  const poiMarkers = new Map(); // POI markers: { id -> Mapbox GL Marker }

  /**
   * Initializes map features after the map loads.
   */
  function init() {
    addClickEvents();
    setBeachMarkersFromHTML();
    setupPOIMarkers();

    // Check for 'beaches' query parameter to potentially open a sidebar
    if (window.location.search.includes("beaches")) {
      if (devmode) {
        console.log("map.js: 'beaches' query found");
      }
      // Example: Assume functions exist to control sidebars
      // closeHomeSidebar(); // Hypothetical function
      // openBeachListSidebar(); // Hypothetical function
      window.history.pushState({}, "", window.location.pathname); // Clean URL
    }

    // Hide controls on smaller screens (replaces jQuery)
    if (window.innerWidth <= 991) {
      const controls = document.querySelector(".mapboxgl-ctrl-bottom-right");
      if (controls) {
        controls.style.display = "none";
      }
    }

    // Enable coordinate logging if in dev mode
    if (devmode) {
      logMapCoordinates();
    }
  }

  /**
   * Sets up beach markers based on data embedded in the HTML.
   * Expects elements with [temp-data="beach"] attribute and specific
   * data attributes (temp-id, lat, lon, popup-text) and a child
   * element .beach-image-url-data[src].
   */
  function setBeachMarkersFromHTML() {
    let beachElements = document.querySelectorAll('[temp-data="beach"]');
    beachElements.forEach((element) => {
      let id = element.getAttribute("temp-id");
      let lat = parseFloat(element.getAttribute("lat"));
      let lon = parseFloat(element.getAttribute("lon"));
      if (
        !id ||
        isNaN(lat) ||
        isNaN(lon) ||
        lat < -90 ||
        lat > 90 ||
        lon < -180 ||
        lon > 180
      ) {
        console.warn(
          `map.js: Invalid data for beach element. ID: ${id}, Lat: ${lat}, Lon: ${lon}`
        );
        return; // Skip this marker
      }
      let coordinates = [lon, lat];
      let popuptext = element.getAttribute("popup-text") || `Beach ${id}`; // Default text

      // Selector for the image URL, using a class for robustness
      const imageElement = element.querySelector(".beach-image-url-data");
      const imageUrl = imageElement?.getAttribute("src") || "";

      createMarker(coordinates, popuptext, id, imageUrl);
    });
    if (devmode) {
      console.log(`map.js: Initialized ${markers.size} beach markers.`);
    }
  }

  /**
   * Creates a single beach marker and adds it to the map.
   * @param {Array<number>} coordinates - [longitude, latitude] array.
   * @param {string} popupText - Text content for the popup.
   * @param {string} id - Unique identifier for the marker (from temp-id).
   * @param {string} imageUrl - URL for the image in the popup.
   */
  function createMarker(coordinates, popupText, id, imageUrl) {
    // Create popup with HTML content including the image, making the container clickable
    // Note: The onclick directly calls a querySelector. Ensure the modal element exists.
    const popupHtml = `
      <div class="popup-content" style="overflow: hidden; border-radius: 8px; cursor: pointer;" onclick="document.querySelector('[modal-id=\"${id}\"]')?.click()">
        ${
          imageUrl
            ? `<img src="${imageUrl}" alt="${popupText}" class="popup-image" style="width: 100%; display: block;">`
            : ""
        }
        <div class="popup-text" style="width: 100%; padding: 8px;">${popupText}</div>
      </div>`;

    let popup = new mapboxgl.Popup({ offset: 25 }).setHTML(popupHtml);

    // Create a DOM element for the marker
    let markerElement = document.createElement("div");
    markerElement.className = "beach-marker"; // CSS class for styling
    markerElement.id = `beach-${id}`; // Unique ID for the marker element

    const marker = new mapboxgl.Marker(markerElement)
      .setLngLat(coordinates)
      .setPopup(popup)
      .addTo(map);

    // Store the marker reference using its ID
    markers.set(id, marker);

    // Add event listeners for popup open/close
    popup.on("open", () => {
      let lngLat = marker.getLngLat();
      if (devmode) {
        console.log(`map.js: Beach popup opened: ${id}`);
      }
      // Assumes sidebar elements exist
      const homeSidebar = document.querySelector(".sidebar_home");
      const beachListSidebar = document.querySelector(".sidebar_beach-list");
      if (homeSidebar) homeSidebar.style.display = "none";
      if (beachListSidebar) beachListSidebar.style.display = "block";

      // Hide all modals, then show the relevant one
      document.querySelectorAll("[modal-id]").forEach((modal) => {
        modal.style.display = "none";
      });
      const targetModal = document.querySelector(`[modal-id="${id}"]`);
      if (targetModal) {
        targetModal.style.display = "block";
      } else {
        console.warn(`map.js: Modal with id "${id}" not found.`);
      }

      // Fly to the marker location
      map.flyTo({
        center: [lngLat.lng, lngLat.lat],
        zoom: mapConfig.flyToZoom,
        pitch: mapConfig.flyToPitch,
      });
      window.scrollTo({ top: 0, behavior: "instant" }); // Scroll page to top
    });

    popup.on("close", () => {
      if (devmode) {
        console.log(`map.js: Beach popup closed: ${id}`);
      }
      window.scrollTo({ top: 0, behavior: "instant" }); // Ensure page is scrolled top
    });
  }

  /**
   * Adds global click event listeners for map-related interactions.
   * Specifically listens for clicks on elements with [map-link="item"].
   */
  function addClickEvents() {
    document.addEventListener("click", (e) => {
      // Check if the click target or its parent has the map-link attribute
      const mapLinkTarget = e.target.closest('[map-link="item"]');
      if (mapLinkTarget) {
        let lat = parseFloat(mapLinkTarget.getAttribute("lat"));
        let lon = parseFloat(mapLinkTarget.getAttribute("lon"));
        let tempID = mapLinkTarget.getAttribute("temp-id");

        if (tempID && !isNaN(lat) && !isNaN(lon)) {
          if (devmode) {
            console.log(`map.js: Map link clicked for ID: ${tempID}`);
          }
          toggleMarkerPopup(tempID); // Open or close the popup for this marker
          map.flyTo({
            center: [lon, lat],
            zoom: mapConfig.flyToZoom,
            pitch: mapConfig.flyToPitch,
          });
        } else {
          console.warn(
            `map.js: Invalid data on map-link item. ID: ${tempID}, Lat: ${lat}, Lon: ${lon}`
          );
        }
      }
    });
  }

  /**
   * Resets the map to its initial position, zoom, and pitch.
   */
  function resetMapPosition() {
    if (devmode) {
      console.log("map.js: Resetting map position.");
    }
    map.flyTo({
      center: mapConfig.startPosition,
      zoom: mapConfig.defaultZoom,
      pitch: mapConfig.startPitch,
    });
  }

  /**
   * Logs the map's current center, zoom, and pitch. (Dev Mode Only)
   */
  function logMapState() {
    const center = map.getCenter();
    const zoom = map.getZoom();
    const pitch = map.getPitch();
    console.log(
      `map.js (Dev): Center=${center.lng.toFixed(4)}, ${center.lat.toFixed(
        4
      )} | Zoom=${zoom.toFixed(2)} | Pitch=${pitch.toFixed(2)}`
    );
  }

  /**
   * Sets up map event listeners for logging coordinates and state changes. (Dev Mode Only)
   */
  function logMapCoordinates() {
    console.log("map.js (Dev): Initializing map state logging.");
    // Log state whenever map movement ends
    map.on("moveend", logMapState);

    // Log clicked coordinates
    map.on("click", (e) => {
      console.log(
        `map.js (Dev): Clicked at Lng: ${e.lngLat.lng}, Lat: ${e.lngLat.lat}`
      );
      // console.log(e); // Keep commented unless deep debugging needed
    });

    // Initial log
    logMapState();
  }

  /**
   * Toggles the popup visibility for a specific beach marker.
   * @param {string} id - The ID of the marker whose popup should be toggled.
   */
  function toggleMarkerPopup(id) {
    const marker = markers.get(id);
    if (marker) {
      marker.togglePopup();
      if (devmode) {
        console.log(`map.js: Toggled popup for beach marker ID: ${id}`);
      }
    } else {
      console.warn(`map.js: Marker with ID ${id} not found for popup toggle.`);
    }
  }

  /**
   * Closes all currently open beach marker popups.
   */
  function closeAllPopups() {
    let closedCount = 0;
    markers.forEach((marker) => {
      const popup = marker.getPopup();
      if (popup.isOpen()) {
        popup.remove();
        closedCount++;
      }
    });
    if (devmode && closedCount > 0) {
      console.log(`map.js: Closed ${closedCount} beach popups.`);
    }
  }

  /**
   * Sets up POI (Point of Interest) markers based on HTML data.
   * Expects elements with [temp-data="poi"] and attributes like
   * temp-id, lat, lon, marker-type, and popup-text or name.
   */
  function setupPOIMarkers() {
    if (devmode) {
      console.log("map.js: Setting up POI markers...");
    }

    // Find all POI elements in the DOM
    let poiElements = document.querySelectorAll('[temp-data="poi"]');

    poiElements.forEach((element) => {
      let id = element.getAttribute("temp-id");
      let lat = parseFloat(element.getAttribute("lat"));
      let lon = parseFloat(element.getAttribute("lon"));
      // Get the POI type for custom icon; default to 'default' if missing
      let markerType = (element.getAttribute("marker-type") || "default")
        .toLowerCase()
        .replace(/\s+/g, ""); // Normalize type for lookup

      // Validate data
      if (
        !id ||
        isNaN(lat) ||
        isNaN(lon) ||
        lat < -90 ||
        lat > 90 ||
        lon < -180 ||
        lon > 180
      ) {
        console.warn(
          `map.js: Invalid data for POI element. ID: ${id}, Lat: ${lat}, Lon: ${lon}, Type: ${markerType}`
        );
        return; // Skip this POI
      }

      let coordinates = [lon, lat];
      let popupText =
        element.getAttribute("popup-text") ||
        element.getAttribute("name") ||
        `POI ${id}`; // Default text

      if (devmode) {
        console.log(
          `map.js: Processing POI - ID: ${id}, Coords: [${lon}, ${lat}], Type: ${markerType}`
        );
      }

      // Create marker element with appropriate styling
      let markerElement = document.createElement("div");
      markerElement.className = "beach-marker poi-marker"; // Base classes

      // Add type-specific class
      markerElement.classList.add(`marker-type-${markerType}`);

      // Create icon using Material Icons font
      const iconCode =
        mapConfig.poiIconMappings[markerType] ||
        mapConfig.poiIconMappings.default;
      const iconSpan = document.createElement("span");
      iconSpan.className = "material-icons poi-icon";
      iconSpan.innerHTML = `&#x${iconCode};`; // Set icon using hex code

      markerElement.appendChild(iconSpan);
      markerElement.id = `poi-${id}`; // Unique ID for the POI marker element

      // Create the popup
      let popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
        `<div class="poi-popup-text">${popupText}</div>` // Added class for potential styling
      );

      // Create the marker instance but *don't* add to map yet
      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat(coordinates)
        .setPopup(popup);

      // Store in POI markers collection
      poiMarkers.set(id, marker);

      // Setup popup open event (optional behavior, like flying)
      popup.on("open", () => {
        let lngLat = marker.getLngLat();
        if (devmode) {
          console.log(`map.js: POI popup opened: ${id}`);
        }
        // Optional: Fly to POI on popup open
        /* map.flyTo({
          center: [lngLat.lng, lngLat.lat],
          zoom: mapConfig.flyToZoom,
          pitch: mapConfig.flyToPitch,
        }); */
      });
    });
    if (devmode) {
      console.log(
        `map.js: Processed ${poiElements.length} POI elements, created ${poiMarkers.size} POI markers.`
      );
    }

    // Set initial visibility based on zoom
    updatePOIVisibility();

    // Add listener to update visibility on zoom changes
    map.on("zoom", updatePOIVisibility);
  }

  /**
   * Updates the visibility of POI markers based on the current map zoom level.
   * Shows markers at or above `mapConfig.poiMinZoom`, hides them below.
   */
  function updatePOIVisibility() {
    const currentZoom = map.getZoom();
    if (devmode) {
      // console.log(`map.js: Checking POI visibility at zoom: ${currentZoom.toFixed(2)}`); // Can be noisy
    }

    poiMarkers.forEach((marker, id) => {
      const element = marker.getElement();
      const isOnMap = !!element.parentNode; // Check if the marker element is currently in the DOM

      if (currentZoom >= mapConfig.poiMinZoom) {
        // Show marker if it's not already on the map
        if (!isOnMap) {
          if (devmode) {
            console.log(
              `map.js: Adding POI marker ${id} (Zoom >= ${mapConfig.poiMinZoom})`
            );
          }
          marker.addTo(map);
        }
      } else {
        // Remove marker if it's currently on the map
        if (isOnMap) {
          if (devmode) {
            console.log(
              `map.js: Removing POI marker ${id} (Zoom < ${mapConfig.poiMinZoom})`
            );
          }
          marker.remove();
        }
      }
    });
  }

  /**
   * Toggles the popup visibility for a specific POI marker.
   * @param {string} id - The ID of the POI marker.
   */
  function togglePOIPopup(id) {
    const marker = poiMarkers.get(id);
    if (marker) {
      marker.togglePopup();
      if (devmode) {
        console.log(`map.js: Toggled popup for POI marker ID: ${id}`);
      }
    } else {
      console.warn(
        `map.js: POI marker with ID ${id} not found for popup toggle.`
      );
    }
  }

  // --- Functions for explicitly controlling POI visibility (optional) ---

  /**
   * Forces all POI markers to be added to the map, regardless of zoom level.
   */
  function showAllPOIMarkers() {
    let addedCount = 0;
    poiMarkers.forEach((marker, id) => {
      if (!marker.getElement().parentNode) {
        marker.addTo(map);
        addedCount++;
      }
    });
    if (devmode && addedCount > 0) {
      console.log(`map.js: Force-showed ${addedCount} POI markers.`);
    }
  }

  /**
   * Removes all POI markers from the map.
   */
  function hideAllPOIMarkers() {
    let removedCount = 0;
    poiMarkers.forEach((marker, id) => {
      if (marker.getElement().parentNode) {
        marker.remove();
        removedCount++;
      }
    });
    if (devmode && removedCount > 0) {
      console.log(`map.js: Force-hid ${removedCount} POI markers.`);
    }
  }

  // Initialize the map functionality after the Mapbox map instance is ready.
  map.on("load", init);
}
