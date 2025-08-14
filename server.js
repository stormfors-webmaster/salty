require("dotenv").config({ path: ".env.local" }); // Load .env.local
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const port = 3000; // Match the port in your api config

// Set up CORS
const corsOptions = {
  origin: [
    "https://salty-dev.webflow.io",
    "http://localhost:8080",
    "https://salty.co",
  ], // Add other origins if needed
};
app.use(cors(corsOptions));

// Serve static files
app.use(express.static(__dirname));

// Dynamically handle API routes
const apiDirectory = path.join(__dirname, "api");
fs.readdirSync(apiDirectory, { withFileTypes: true }).forEach((dirent) => {
  if (dirent.isDirectory()) {
    const subDirPath = path.join(apiDirectory, dirent.name);
    fs.readdirSync(subDirPath).forEach((file) => {
      if (file.endsWith(".js")) {
        const routePath = `/api/${dirent.name}/:id`;
        const modulePath = path.join(subDirPath, file);

        app.get(routePath, async (req, res) => {
          try {
            // Using dynamic import for ES Modules
            const { default: handler } = await import(`file://${modulePath}`);
            await handler(req, res);
          } catch (error) {
            console.error(`Error handling request for ${routePath}:`, error);
            res.status(500).send("Internal Server Error");
          }
        });

        console.log(`Registered API route: GET ${routePath}`);
      }
    });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
