require("dotenv").config({
  path: require("path").resolve(process.cwd(), ".env.local"),
});

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

async function testPOIFetch() {
  try {
    console.log("[test-poi-fetch] Fetching POI collection schema...");
    const schema = await fetchCollectionSchema();
    console.log("[test-poi-fetch] POI Collection Schema:", schema);
  } catch (error) {
    console.error("[test-poi-fetch] Detailed error:", error);
  }
}

testPOIFetch();
