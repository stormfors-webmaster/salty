// =============================================================================
// POI API MODULE - Following beaches.js Pattern
// =============================================================================

// Fetch collection schema to understand field structure
async function fetchCollectionSchema() {
  const url = `https://api.webflow.com/v2/collections/${process.env.POI_COLLECTION_ID}`;
  const options = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${process.env.WEBFLOW_API_TOKEN}`,
      accept: "application/json",
    },
  };

  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch collection schema. Status: ${response.status}`
    );
  }

  const data = await response.json();
  return data.fields;
}

async function buildDynamicMaps() {
  const fields = await fetchCollectionSchema();
  const dynamicMaps = {
    categoryMap: new Map(),
    iconMap: new Map(),
  };

  fields.forEach((field) => {
    if (field.type === "Option" && field.validations?.options) {
      field.validations.options.forEach((option) => {
        // Map category and icon options
        if (field.slug === "category") {
          dynamicMaps.categoryMap.set(option.id, option.name);
        } else if (field.slug === "custom-icon") {
          dynamicMaps.iconMap.set(option.id, option.name);
        } else {
          // Generic mapping for other option fields
          dynamicMaps.categoryMap.set(option.id, option.name);
        }
      });
    }
  });

  return dynamicMaps;
}

// Helper to safely parse coordinates
const parseCoordinate = (coord) => {
  if (typeof coord === "string") {
    const parsed = parseFloat(coord);
    return isNaN(parsed) ? null : parsed;
  }
  return typeof coord === "number" ? coord : null;
};

function transformPOIs(pois, maps) {
  const { categoryMap, iconMap } = maps;

  return pois.map((item) => {
    const transformedPOI = { id: item.id, ...item.fieldData };

    // Transform core POI fields as specified
    transformedPOI.name =
      transformedPOI.name || transformedPOI.Name || "Unnamed POI";
    transformedPOI.slug = transformedPOI.slug || transformedPOI.Slug || "";

    // Parse coordinates
    transformedPOI.longitude = parseCoordinate(
      transformedPOI.longitude || transformedPOI.Longitude
    );
    transformedPOI.latitude = parseCoordinate(
      transformedPOI.latitude || transformedPOI.Latitude
    );

    // Transform category using dynamic mapping
    if (transformedPOI.category && categoryMap.has(transformedPOI.category)) {
      transformedPOI.categoryName = categoryMap.get(transformedPOI.category);
    } else {
      transformedPOI.categoryName = transformedPOI.category || "Uncategorized";
    }

    // Transform custom icon using dynamic mapping
    if (
      transformedPOI["custom-icon"] &&
      iconMap.has(transformedPOI["custom-icon"])
    ) {
      transformedPOI.customIconName = iconMap.get(
        transformedPOI["custom-icon"]
      );
    } else {
      transformedPOI.customIconName =
        transformedPOI["custom-icon"] || "default";
    }

    // Handle image fields
    transformedPOI.mainImageUrl = transformedPOI["main-image"]?.url || null;
    transformedPOI.mainImageAlt =
      transformedPOI["main-image"]?.alt || transformedPOI.name;

    // Handle rich text content
    transformedPOI.richTextContent =
      transformedPOI["rich-text"] || transformedPOI.description || "";

    // Handle button fields
    transformedPOI.button = transformedPOI["button"] || false;
    transformedPOI.buttonText = transformedPOI["button-text"] || "Learn More";
    transformedPOI.buttonLink = transformedPOI["button-link"] || "#";

    // Create geometry for GeoJSON compatibility (if coordinates exist)
    if (transformedPOI.longitude && transformedPOI.latitude) {
      transformedPOI.geometry = {
        type: "Point",
        coordinates: [transformedPOI.longitude, transformedPOI.latitude],
      };
    }

    return transformedPOI;
  });
}

async function fetchAllPOIs() {
  let items = [];
  let offset = 0;
  const limit = 100;
  let total = 0;

  do {
    const url = `https://api.webflow.com/v2/collections/${process.env.POI_COLLECTION_ID}/items/live?limit=${limit}&offset=${offset}`;
    const options = {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.WEBFLOW_API_TOKEN}`,
        accept: "application/json",
      },
    };

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorData = await response.text();
      console.error(
        `[api/pois] Webflow API Error: ${response.status}`,
        errorData
      );
      throw new Error(
        `Failed to fetch from Webflow API. Status: ${response.status}`
      );
    }

    const data = await response.json();
    items = items.concat(data.items);
    total = data.pagination.total;
    offset += limit;
  } while (offset < total);

  return items;
}

export default async function handler(req, res) {
  try {
    console.log("[api/pois] Fetching POI collection schema and data...");

    const maps = await buildDynamicMaps();
    const rawPOIs = await fetchAllPOIs();
    const formattedPOIs = transformPOIs(rawPOIs, maps);

    console.log(
      `[api/pois] Successfully fetched and transformed ${formattedPOIs.length} POI items.`
    );
    res.status(200).json(formattedPOIs);
  } catch (error) {
    console.error("[api/pois] Detailed error:", error);

    // Provide comprehensive mock data as fallback
    const mockPOIData = [
      {
        id: "huntington-city-beach-lifeguard-tower-1",
        name: "Huntington City Beach Lifeguard Tower 1",
        slug: "huntington-lifeguard-tower-1",
        longitude: -118.0052,
        latitude: 33.6553,
        categoryName: "Safety & Emergency",
        customIconName: "lifeguard-tower",
        mainImageUrl:
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400",
        mainImageAlt: "Huntington City Beach Lifeguard Tower 1",
        richTextContent:
          "<p>Professional lifeguard station providing safety services and emergency response at Huntington City Beach. Staffed during peak hours with certified lifeguards.</p>",
        geometry: {
          type: "Point",
          coordinates: [-118.0052, 33.6553],
        },
      },
      {
        id: "santa-monica-pier-info-center",
        name: "Santa Monica Pier Information Center",
        slug: "santa-monica-pier-info",
        longitude: -118.4965,
        latitude: 34.0085,
        categoryName: "Information & Services",
        customIconName: "info-center",
        mainImageUrl:
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
        mainImageAlt: "Santa Monica Pier Information Center",
        richTextContent:
          "<p>Visitor information center providing maps, event schedules, and assistance for Santa Monica Pier attractions and activities.</p>",
        geometry: {
          type: "Point",
          coordinates: [-118.4965, 34.0085],
        },
      },
      {
        id: "venice-beach-skate-park",
        name: "Venice Beach Skate Park",
        slug: "venice-beach-skate-park",
        longitude: -118.4681,
        latitude: 33.985,
        categoryName: "Recreation & Sports",
        customIconName: "skate-park",
        mainImageUrl:
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
        mainImageAlt: "Venice Beach Skate Park",
        richTextContent:
          "<p>Famous concrete skate park featuring bowls, ramps, and street course elements. Open to skateboarders, BMX riders, and roller skaters.</p>",
        geometry: {
          type: "Point",
          coordinates: [-118.4681, 33.985],
        },
      },
    ];

    console.log("[api/pois] Returning mock data due to API error");
    res.status(200).json(mockPOIData);
  }
}
