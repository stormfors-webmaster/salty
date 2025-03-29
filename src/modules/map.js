export function map() {
  console.log("map.js module loaded");
  const mapboxToken =
    "pk.eyJ1Ijoid2VhcmVzYWx0eSIsImEiOiJjbThwMjd5YTkwNnpwMmtvZG9nYzI4dHNwIn0.dnXq6AxHz2OIrHsRYN_d0g";

  let sateliteMap =
    "mapbox://styles/wearesalty/cm8qfnumn00dq01srh0p148qs?optimize=true";
  let standardMap =
    "mapbox://styles/wearesalty/cm8qg3lor00dc01snbvr00nra?optimize=true";

  let mapDefaultZoom = 6.042708567826556;
  let desktopStartPosition = [-123.046253, 33.837038];
  let mobileStartPosition = [-118.3628729, 33.900661];
  let mapStartPitch = 0;

  //mapbox://styles/cv-mapbox/cm5zgyf7a002m01sgf936d3u6
  //mapbox://styles/mapbox/outdoors-v12
  mapboxgl.accessToken = mapboxToken;
  const map = new mapboxgl.Map({
    container: "map",
    style: sateliteMap,
    projection: "globe",
    zoom: mapDefaultZoom,
    center:
      window.innerWidth <= 991 ? mobileStartPosition : desktopStartPosition,
    pitch: mapStartPitch,
  });

  map.addControl(new mapboxgl.NavigationControl(), "bottom-right");

  map.addControl(
    new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
      showUserHeading: true,
    }),
    "bottom-right"
  );

  window.dev = {
    openHome: openHomeSidebar,
    closeHome: closeHomeSidebar,
    openBeachList: openBeachListSidebar,
    closeBeachList: closeBeachListSidebar,
    openBeach: openBeachSidebar,
    closeBeach: closeBeachSidebar,
    openShop: openShopPage,
  };

  const markers = new Map(); // Store markers with their IDs
  const poiMarkers = new Map(); // Store POI markers separately

  init();

  async function init() {
    addClickEvents();
    setBeachMarkersFromHTML();
    setupPOIMarkers();

    if (window.location.search.includes("beaches")) {
      console.log("beaches query found");
      closeHomeSidebar();
      openBeachListSidebar();
      window.history.pushState({}, "", window.location.pathname);
    }

    if (window.innerWidth <= 991) {
      $(".mapboxgl-ctrl-bottom-right").hide();
    }
    logMapCoordinates();
  }

  function setBeachMarkersFromHTML() {
    let beachElements = document.querySelectorAll("[temp-data=beach]");
    beachElements.forEach((element) => {
      let id = element.getAttribute("temp-id");
      let lat = parseFloat(element.getAttribute("lat"));
      let lon = parseFloat(element.getAttribute("lon"));
      if (
        isNaN(lat) ||
        isNaN(lon) ||
        lat < -90 ||
        lat > 90 ||
        lon < -180 ||
        lon > 180
      ) {
        console.warn(
          `Invalid coordinates for beach ${id}: lat=${lat}, lon=${lon}`
        );
        return;
      }
      let coordinates = [lon, lat];
      let popuptext = element.getAttribute("popup-text");
      createMarker(coordinates, popuptext, id);
    });
  }

  function createMarker(coordinates, popupText, id) {
    let popup = new mapboxgl.Popup({ offset: 25 }).setText(popupText);

    let markerElementX = document.createElement("div");
    markerElementX.className = "beach-marker";
    markerElementX.id = id;

    const marker = new mapboxgl.Marker(markerElementX)
      .setLngLat(coordinates)
      .setPopup(popup)
      .addTo(map);

    // Store the marker reference
    markers.set(id, marker);

    popup.on("open", () => {
      let lng = popup.getLngLat().lng;
      let lat = popup.getLngLat().lat;
      console.log("popup opened");
      console.log(id);
      map.flyTo({
        center: [lng, lat],
        zoom: 18,
        pitch: 0,
      });
      hideAllSidebars();
      openBeachListSidebar();
      openBeachSidebar(id);
      window.scrollTo({ top: 0, behavior: "instant" });
    });

    popup.on("close", () => {
      console.log("popup closed");
      console.log(id);
      window.scrollTo({ top: 0, behavior: "instant" });
    });
  }

  function addClickEvents() {
    document.addEventListener("click", (e) => {
      //open home sidebar
      /* if (e.target.matches("[open-sidebar=home], [open-sidebar=home] *")) {
        e.preventDefault();
        hideAllSidebars();
        openHomeSidebar();
        resetMapPosition();
      } */
      //click on beach list buttons
      /* if (
        e.target.matches(
          "[open-sidebar=beach-list], [open-sidebar=beach-list] *"
        )
      ) {
        e.preventDefault();
        hideAllSidebars();
        if (window.innerWidth > 479) {
          openBeachListSidebar();
        }
        if (window.innerWidth <= 991) {
          expandMap();
        }
        if (window.innerWidth <= 479) {
          openBeachListSidebar();
        }
      } */
      //click on beach list item
      if (e.target.matches("[map-link=item], [map-link=item] *")) {
        const target = e.target.matches("[map-link=item]")
          ? e.target
          : e.target.closest("[map-link=item]");
        let lat = target.getAttribute("lat");
        let lon = target.getAttribute("lon");
        let tempID = target.getAttribute("temp-id");
        toggleMarkerPopup(tempID);
        map.flyTo({
          center: [lon, lat],
          zoom: 18,
          pitch: 0,
        });
        openBeachSidebar(tempID);
      }
      if (
        e.target.matches(
          ".modal_close-button, .modal_close-button *, .mobile-back, .mobile-back *"
        )
      ) {
        closeBeachSidebar();
      }

      if (e.target.matches("[close-sidebar=beach]")) {
        closeAllPopups();
        openBeachListSidebar();
      }

      /* if (e.target.matches("[map-function=expand]")) {
        expandMap();
        setTimeout(() => {
          $("[sidebar-toggle=beach-list]").show();
          $(".mapboxgl-ctrl-bottom-right").show();
        }, 1000);
      } */
      /*  if (
        e.target.matches("[map-function=collapse] *, [map-function=collapse]")
      ) {
        collapseMap();
        $("[sidebar=beach-list]").css({
          transform: "translateX(-100%)",
          transition: "none",
        });
        $("[sidebar=home]").css({
          transform: "translateX(0%)",
          transition: "none",
        });
        $("[sidebar-toggle=beach-list]").hide();
        $(".mapboxgl-ctrl-bottom-right").hide();
      } */
      /* if (e.target.matches("[toggle-sidebar=home]")) {
        toggleHomeSidebar();
      }
      if (e.target.matches("[toggle-sidebar=beach-list]")) {
        toggleBeachListSidebar();
      } */
      //mobile beach close button
      /* if (e.target.matches(".mob-beach-top-inner, .mob-beach-top-inner *")) {
        console.log("mob-beach-top-inner clicked");
        closeBeachSidebar();
        openBeachListSidebar();
      } */
      if (e.target.matches("[stormfors-sort=reverse]")) {
        const beachList = document.querySelector(".beach-list_list");
        const beachItems = [...beachList.children];
        beachItems.reverse();
        beachItems.forEach((item) => beachList.appendChild(item));
      }
      //end of click events
    });
  }

  function toggleHomeSidebar() {
    let open = $("[sidebar-toggle=home]").hasClass("folded");
    if (open) {
      openHomeSidebar();
    } else {
      closeHomeSidebar();
    }
  }

  function toggleBeachListSidebar() {
    let open = $("[sidebar-toggle=beach-list]").hasClass("folded");
    if (open) {
      openBeachListSidebar();
    } else {
      closeBeachListSidebar();
      closeBeachSidebar();
    }
  }

  function expandMap() {
    $("[map-function=expand]").hide();
    $("[map-function=container]").addClass("expanded");
    for (let i = 0; i < 100; i++) {
      setTimeout(() => {
        map.resize();
      }, i * 10);
    }
    //extra resize to fix map position visual bug
    map.resize();
    setTimeout(() => {
      map.resize();
      $("[map-function=collapse]").show();
    }, 1000);
  }

  function collapseMap() {
    $("[map-function=collapse]").hide();
    $("[map-function=container]").removeClass("expanded");
    for (let i = 0; i < 100; i++) {
      setTimeout(() => {
        map.resize();
      }, i * 10);
    }
    setTimeout(() => {
      $("[map-function=expand]").show();
    }, 1000);
  }

  function openShopPage() {
    window.scrollTo({ top: 0, behavior: "instant" });
    $("[page=shop]").removeClass("hide");
  }

  function closeShopPage() {
    window.scrollTo({ top: 0, behavior: "instant" });
    $("[page=shop]").addClass("hide");
  }

  function openHomeSidebar() {
    window.scrollTo({ top: 0, behavior: "instant" });
    $("[sidebar=home]").show();
    $("[sidebar-toggle=home]").show();
    setTimeout(() => {
      $("[map-function=expand]").show();
    }, 500);
  }

  function closeHomeSidebar() {
    window.scrollTo({ top: 0, behavior: "instant" });
    $("[sidebar=home]").hide();
    $("[sidebar-toggle=home]").hide();
  }

  function openBeachListSidebar() {
    window.scrollTo({ top: 0, behavior: "instant" });
    if (window.innerWidth <= 479) {
      $("[sidebar=beach-list]").css({
        transition: "none",
        transform: "translateX(0%)",
      });
    }
    $("[sidebar-toggle=beach-list]").removeClass("folded");
    $("[sidebar=beach-list]").removeClass("folded");
  }

  function closeBeachListSidebar() {
    window.scrollTo({ top: 0, behavior: "instant" });
    $("[sidebar-toggle=beach-list]").addClass("folded");
    $("[sidebar=beach-list]").addClass("folded");
  }

  function openBeachSidebar(name) {
    window.scrollTo({ top: 0, behavior: "instant" });
    $("[sidebar=beach]").show();
    $("[sidebar=" + name + "]").show();
    $("[sidebar=" + name + "]")
      .parent()
      .show();
  }

  function closeBeachSidebar(name) {
    window.scrollTo({ top: 0, behavior: "instant" });
    $("[sidebar=beach]").hide();
    $("[sidebar=" + name + "]").hide();
    $("[sidebar=" + name + "]")
      .parent()
      .hide();
  }

  function hideAllSidebars() {
    window.history.pushState({}, "", window.location.pathname);
    window.scrollTo({ top: 0, behavior: "instant" });
    closeHomeSidebar();
    closeBeachListSidebar();
    closeBeachSidebar();
    //this excludes the home sidebar from being hidden (causes issues with the image notch animation on the sliders otherwise)
    /* $("[beach-item=container]").hide(); */
  }

  function resetMapPosition() {
    map.flyTo({
      center:
        window.innerWidth <= 991 ? mobileStartPosition : desktopStartPosition,
      zoom: mapDefaultZoom,
      pitch: mapStartPitch,
    });
  }

  function getMapCenter() {
    // Get the map's center coordinates
    const center = map.getCenter();
    console.log(`Map center: ${center.lng}, ${center.lat}`);
  }

  function getMapZoomLevel() {
    const zoom = map.getZoom();
    console.log(`Map zoom level: ${zoom}`);
  }

  function getMapPitch() {
    const pitch = map.getPitch();
    console.log(`Map pitch: ${pitch}`);
  }

  function logMapCoordinates() {
    // Log center whenever map moves
    map.on("moveend", () => {
      getMapCenter();
      getMapZoomLevel();
      getMapPitch();
    });

    // Log current coordinates to console on mouse click
    map.on("click", (e) => {
      console.log(`${e.lngLat.lng}, ${e.lngLat.lat}`);
      console.log(e);

      /* if (e.target.matches(".beach-marker")) {
                  console.log("beach-marker clicked");
                  console.log(e.target.id);
                } */
    });
  }

  // Example of how to toggle a specific marker's popup
  function toggleMarkerPopup(id) {
    const marker = markers.get(id);
    if (marker) {
      marker.togglePopup();
    }
  }

  function closeAllPopups() {
    markers.forEach((marker) => {
      const popup = marker.getPopup();
      if (popup.isOpen()) {
        popup.remove();
      }
    });
  }

  function setupPOIMarkers() {
    console.log("Setting up POI markers...");

    // Define Material Icons mappings for different POI types
    const poiIconMappings = {
      lifeguard: "ef73", // "Support" icon for lifeguard
      firstaidstation: "e3f3", // "local_hospital"
      restroom: "e05a", // "wc"
      showers: "e547", // "shower"
      parking: "e54f", // "local_parking"
      food: "e56c", // "restaurant"
      picnicarea: "ea48", // "park"
      camping: "e3fa", // "outdoor_grill"
      pier: "e568", // "directions_boat"
    };

    // Find all POI elements in the DOM
    let poiElements = document.querySelectorAll("[temp-data=poi]");
    console.log(`Found ${poiElements.length} POI elements in the DOM`);

    poiElements.forEach((element) => {
      let id = element.getAttribute("temp-id");
      let lat = parseFloat(element.getAttribute("lat"));
      let lon = parseFloat(element.getAttribute("lon"));
      // Get the POI type for custom icon from marker-type attribute
      let markerType = element.getAttribute("marker-type") || "default";

      // Validate coordinates
      if (
        isNaN(lat) ||
        isNaN(lon) ||
        lat < -90 ||
        lat > 90 ||
        lon < -180 ||
        lon > 180
      ) {
        console.warn(
          `Invalid coordinates for POI ${id}: lat=${lat}, lon=${lon}`
        );
        return;
      }

      let coordinates = [lon, lat];
      let popupText =
        element.getAttribute("popup-text") ||
        element.getAttribute("name") ||
        `POI ${id}`;

      console.log(
        `Creating POI marker: ${id} at [${lon}, ${lat}] with text: ${popupText}, type: ${markerType}`
      );

      // Create marker element with appropriate styling
      let markerElement = document.createElement("div");

      // Add base classes for all POI markers
      markerElement.className = "beach-marker poi-marker";

      // Format marker type for class name (replace spaces with hyphens)
      const cssClassName = markerType.toLowerCase().replace(/\s+/g, "-");
      markerElement.classList.add(`marker-type-${cssClassName}`);

      // Create icon element using Material Icons
      const lowerMarkerType = markerType.toLowerCase();
      const iconKey = lowerMarkerType.replace(/\s+/g, ""); // Remove spaces for object lookup
      const iconCode = poiIconMappings[iconKey] || "e55f"; // "place" is default marker

      // Create the icon element using Material Icons font
      const iconSpan = document.createElement("span");
      iconSpan.className = "material-icons poi-icon";
      iconSpan.innerHTML = `&#x${iconCode};`; // Use the hex code point

      // Add icon to marker element
      markerElement.appendChild(iconSpan);

      markerElement.id = `poi-${id}`;

      // Create the popup
      let popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
        `<div>${popupText}</div>`
      );

      // Create the marker but don't add to map yet
      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat(coordinates)
        .setPopup(popup);

      // Store in POI markers collection
      poiMarkers.set(id, marker);

      // Setup popup events (similar to beach markers)
      popup.on("open", () => {
        let lng = popup.getLngLat().lng;
        let lat = popup.getLngLat().lat;
        console.log(`POI popup opened: ${id}`);
        map.flyTo({
          center: [lng, lat],
          zoom: 18,
          pitch: 0,
        });
      });
    });

    // Update POI marker visibility based on zoom level
    updatePOIVisibility();

    // Add zoom change listener
    map.on("zoom", updatePOIVisibility);
  }

  function updatePOIVisibility() {
    const currentZoom = map.getZoom();
    console.log(`Current zoom level: ${currentZoom}`);

    poiMarkers.forEach((marker, id) => {
      if (currentZoom >= 15) {
        // Show marker if it's not already on the map
        if (!marker.getElement().parentNode) {
          console.log(`Adding POI marker: ${id} at zoom level ${currentZoom}`);
          marker.addTo(map);
        }
      } else {
        // Remove marker if it's on the map
        if (marker.getElement().parentNode) {
          console.log(
            `Removing POI marker: ${id} at zoom level ${currentZoom}`
          );
          marker.remove();
        }
      }
    });
  }

  // Toggle a specific POI marker's popup
  function togglePOIPopup(id) {
    const marker = poiMarkers.get(id);
    if (marker) {
      marker.togglePopup();
    }
  }

  // Show/hide all POI markers (regardless of zoom level)
  function showAllPOIMarkers() {
    poiMarkers.forEach((marker) => {
      if (!marker.getElement().parentNode) {
        marker.addTo(map);
      }
    });
  }

  function hideAllPOIMarkers() {
    poiMarkers.forEach((marker) => {
      if (marker.getElement().parentNode) {
        marker.remove();
      }
    });
  }
}
