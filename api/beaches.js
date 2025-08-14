import fetch from 'node-fetch';

async function fetchCollectionSchema() {
    const url = `https://api.webflow.com/v2/collections/${process.env.BEACHES_COLLECTION_ID}`;
    const options = {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${process.env.WEBFLOW_API_TOKEN}`,
            accept: 'application/json',
        },
    };
    const response = await fetch(url, options);
    if (!response.ok) {
        throw new Error(`Failed to fetch collection schema. Status: ${response.status}`);
    }
    const data = await response.json();
    return data.fields;
}

async function buildDynamicMaps() {
    const fields = await fetchCollectionSchema();
    const dynamicMaps = {
        amenityMap: new Map(),
        stateMap: new Map(),
        countryMap: new Map(),
    };

    fields.forEach(field => {
        if (field.type === 'Option' && field.validations?.options) {
            field.validations.options.forEach(option => {
                // This assumes all 'Option' types are generic amenities.
                // You might need more specific logic if you have multiple Option fields
                // with different meanings, perhaps based on field.slug.
                dynamicMaps.amenityMap.set(option.id, option.name);
            });
        }
        // NOTE: For 'Reference' fields, this approach is limited.
        // To get the *name* of a referenced item (like a state), you would typically need
        // to fetch all items from that referenced collection.
        // For now, we will stick to the hardcoded map for states/countries as it's more efficient
        // than fetching entire other collections. The dynamic approach works best for Option fields.
    });

    // Add hardcoded maps as fallbacks or for reference fields
    dynamicMaps.stateMap = new Map([["6786e2af9c6a2351063637c3", "California"]]);
    dynamicMaps.countryMap = new Map([["6786e284e2c900faabaa0a18", "USA"]]);
    
    // Manually add IDs for boolean-like reference fields that are not 'Option' type
    dynamicMaps.amenityMap.set("6b73d4e3d426194b7f9f6ea26c80ddc6", "Yes"); // Parking
    dynamicMaps.amenityMap.set("1532e5124d30cb244fee23fb09719cac", "Yes"); // Restrooms
    dynamicMaps.amenityMap.set("1b92df02c5428483beac58c208249779", "Yes"); // Showers

    return dynamicMaps;
}

// Helper to safely parse floats from strings like "51.4℉"
const parseFloatFromString = (str) => {
    if (typeof str !== 'string') return str;
    return parseFloat(str);
};

function transformBeaches(beaches, maps) {
    const { amenityMap, stateMap, countryMap } = maps;
    return beaches.map(item => {
        const transformedBeach = { id: item.id, ...item.fieldData };

        // Transform relational amenity fields
        Object.keys(transformedBeach).forEach(key => {
            if (amenityMap.has(transformedBeach[key])) {
                transformedBeach[key] = amenityMap.get(transformedBeach[key]);
            }
        });

        // Transform direct boolean fields
        if (typeof transformedBeach['bonfire-availabiliity'] === 'boolean') {
            transformedBeach['bonfire-availabiliity'] = transformedBeach['bonfire-availabiliity'] ? 'Yes' : 'No';
        }
        
        // Transform relational location fields
        if (stateMap.has(transformedBeach.state)) {
            transformedBeach.stateName = stateMap.get(transformedBeach.state);
        }
        if (countryMap.has(transformedBeach.country)) {
            transformedBeach.countryName = countryMap.get(transformedBeach.country);
        }
        
        // Map and clean up weather data
        transformedBeach.temperature = parseFloatFromString(transformedBeach['api-current-temp']);
        transformedBeach.feels_like = parseFloatFromString(transformedBeach['api-feels-like']);
        transformedBeach.humidity = parseFloatFromString(transformedBeach['api-humidity']);
        transformedBeach.windSpeed = parseFloatFromString(transformedBeach['api-wind-speed']);
        transformedBeach.windDirection = parseFloatFromString(transformedBeach['api-wind-direction']);
        transformedBeach.aqi = parseFloatFromString(transformedBeach['api-aqi']);
        transformedBeach.rainfall = parseFloatFromString(transformedBeach['api-precipitation']);
        transformedBeach.pressure = parseFloatFromString(transformedBeach['api-air-pressure']);
        transformedBeach.pm25 = parseFloatFromString(transformedBeach['api-pm2-5']);
        transformedBeach.pm10 = parseFloatFromString(transformedBeach['api-pm10']);
        transformedBeach.water_temp = parseFloatFromString(transformedBeach['api-water-temp']);
        transformedBeach.wave_height = parseFloatFromString(transformedBeach['api-wave-height-2']);
        transformedBeach.ocean_current = parseFloatFromString(transformedBeach['api-current-speed']);
        transformedBeach.uv_index = parseFloatFromString(transformedBeach['api-uv-index']);
        transformedBeach.cloud_cover = parseFloatFromString(transformedBeach['api-cloud-cover']);
        transformedBeach.sunset = transformedBeach['api-sunset'];

        return transformedBeach;
    });
}

async function fetchAllBeaches() {
    let items = [];
    let offset = 0;
    const limit = 100;
    let total = 0;

    do {
        const url = `https://api.webflow.com/v2/collections/${process.env.BEACHES_COLLECTION_ID}/items/live?limit=${limit}&offset=${offset}`;
        const options = {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${process.env.WEBFLOW_API_TOKEN}`,
                accept: 'application/json',
            },
        };

        const response = await fetch(url, options);

        if (!response.ok) {
            const errorData = await response.text();
            console.error(`[api/beaches] Webflow API Error: ${response.status}`, errorData);
            throw new Error(`Failed to fetch from Webflow API. Status: ${response.status}`);
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
        const maps = await buildDynamicMaps();
        const rawBeaches = await fetchAllBeaches();
        const formattedBeaches = transformBeaches(rawBeaches, maps);
        res.status(200).json(formattedBeaches);
    } catch (error) {
        console.error('[api/beaches] Detailed error:', error);
        res.status(500).json({ error: 'Failed to fetch all beach data', details: error.message });
    }
} 