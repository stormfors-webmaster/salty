// Test script for POI markers
(function () {
  console.log("POI Marker Test Script loaded");

  // Add test POI markers to the page
  function addTestPOIMarkers() {
    console.log("Adding test POI markers to the page");

    // Container for test POI markers
    const container = document.createElement("div");
    container.id = "test-poi-markers";
    container.style.display = "none"; // Hide container
    document.body.appendChild(container);

    // Add test POI markers
    const poiData = [
      {
        id: "test-poi-1",
        lat: 33.6559807,
        lon: -118.0033719,
        name: "Huntington Beach Pier",
        text: "Historic pier with great views",
      },
      {
        id: "test-poi-2",
        lat: 33.658,
        lon: -118.005,
        name: "Surf Shop",
        text: "Local surf equipment and rentals",
      },
      {
        id: "test-poi-3",
        lat: 33.66,
        lon: -118.002,
        name: "Beach Parking",
        text: "Public parking lot ($10/day)",
      },
      {
        id: "test-poi-4",
        lat: 33.608188,
        lon: -117.9297184,
        name: "Seaside Restaurant",
        text: "Fresh seafood with ocean views",
      },
      {
        id: "test-poi-5",
        lat: 33.61,
        lon: -117.928,
        name: "Restrooms",
        text: "Public facilities with showers",
      },
    ];

    poiData.forEach((poi) => {
      const element = document.createElement("div");
      element.setAttribute("temp-data", "poi");
      element.setAttribute("temp-id", poi.id);
      element.setAttribute("lat", poi.lat);
      element.setAttribute("lon", poi.lon);
      element.setAttribute("name", poi.name);
      element.setAttribute("popup-text", poi.text);
      container.appendChild(element);
    });

    // Add controls
    const controls = document.createElement("div");
    controls.style.position = "fixed";
    controls.style.bottom = "20px";
    controls.style.right = "20px";
    controls.style.backgroundColor = "white";
    controls.style.padding = "10px";
    controls.style.borderRadius = "5px";
    controls.style.zIndex = "1000";
    controls.innerHTML = `
            <h3>POI Marker Test Controls</h3>
            <button id="show-all-pois">Show All POIs</button>
            <button id="hide-all-pois">Hide All POIs</button>
            <button id="toggle-pier-popup">Toggle Pier Popup</button>
            <div>Current Zoom: <span id="current-zoom">--</span></div>
        `;
    document.body.appendChild(controls);

    // Add event listeners once map is initialized
    const waitForMap = setInterval(() => {
      if (window.mapModule) {
        clearInterval(waitForMap);

        document
          .getElementById("show-all-pois")
          .addEventListener("click", () => {
            console.log("Showing all POI markers");
            window.mapModule.showAllPOIMarkers();
          });

        document
          .getElementById("hide-all-pois")
          .addEventListener("click", () => {
            console.log("Hiding all POI markers");
            window.mapModule.hideAllPOIMarkers();
          });

        document
          .getElementById("toggle-pier-popup")
          .addEventListener("click", () => {
            console.log("Toggling pier popup");
            window.mapModule.togglePOIPopup("test-poi-1");
          });

        // Update zoom level display
        window.map.on("zoom", () => {
          const zoomLevel = Math.floor(window.map.getZoom() * 100) / 100;
          document.getElementById("current-zoom").textContent = zoomLevel;
        });
      }
    }, 1000);
  }

  // Wait for DOM to be ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", addTestPOIMarkers);
  } else {
    addTestPOIMarkers();
  }
})();
