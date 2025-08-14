# Salty Beaches

Salty Beaches is a modern, interactive web application designed to display geographical data with a focus on beaches. It is built to integrate seamlessly with a Webflow CMS backend, providing a powerful and flexible solution for dynamic, map-based content. The application features a responsive design, a modular architecture, and a highly configurable event-driven system for user interactions.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Configuration (`config.js`)](#configuration-configjs)
- [Architecture Deep Dive](#architecture-deep-dive)
- [Working with the UI](#working-with-the-ui)
- [API Integration](#api-integration)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Interactive Map**: Utilizes Mapbox GL JS to display clustered and individual points of interest.
- **Live Data Integration**: Fetches and displays data directly from a Webflow CMS collection.
- **Modular & Maintainable**: Code is split into logical modules (UI, Map, State, etc.) for easy maintenance and scalability.
- **Event-Driven Architecture**: Modules communicate through a central Event Bus, promoting loose coupling and flexibility.
- **Configuration-Centric**: Core behaviors, UI elements, and map settings are defined in a central `config.js` file, allowing for easy customization without deep code changes.
- **Responsive Design**: A fluid user experience across desktop and mobile devices.
- **Dynamic Sidebars**: Multiple sidebar panels for displaying home content, lists of features, and detailed information.
- **Serverless-Ready Backend**: Local development environment mimics a Vercel-like serverless setup, handling API requests to the Webflow backend.

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Mapping**: Mapbox GL JS
- **Backend**: Node.js / Express
- **CMS**: Webflow
- **Local Development**: Vercel CLI (`vercel dev`)
- **Dependencies**: `axios`, `cors`, `dotenv`, `express`, `node-fetch`, `@turf/turf`.

## Project Structure

The project follows a modular structure, with a clear separation between the frontend application logic and the backend API handlers.

```
salty-development-2/
├── api/
│   └── beaches.js          # Serverless function to fetch and transform data from Webflow
├── js/
│   ├── appState.js             # Manages global application state
│   ├── config.js               # Central configuration file
│   ├── mapController.js        # Handles all Mapbox logic and interactions
│   ├── uiController.js         # Manages all DOM manipulation and UI events
│   ├── actionController.js     # Executes action sequences from the config
│   ├── eventBus.js             # Simple Pub/Sub event bus for module communication
│   └── utils.js                # General utility functions
│
├── index.js                    # Main application entry point
├── server.js                   # Express server that emulates Vercel's routing for local dev
├── vercel.json                 # Vercel deployment configuration
├── .env.local.example          # Example environment variables file
└── README.md                   # This file
```

## Getting Started

### Prerequisites

- Node.js (v14 or later recommended)
- npm (usually comes with Node.js)
- Vercel CLI (`npm i -g vercel`)
- A Mapbox Access Token
- A Webflow API Token and Collection ID

### Installation & Setup

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/salty-development-2.git
    cd salty-development-2
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env.local` file in the root of the project by copying the example file:
    ```bash
    cp .env.local.example .env.local
    ```
    Open `.env.local` and add your secret keys and IDs:
    ```
    WEBFLOW_API_TOKEN="YOUR_WEBFLOW_API_TOKEN"
    BEACHES_COLLECTION_ID="YOUR_WEBFLOW_BEACHES_COLLECTION_ID"
    ```

4.  **Configure the application:**
    Open `js/config/api.js` and `js/config/map.js` to update the following values:
    - `MAP.ACCESS_TOKEN`: Add your Mapbox access token here.
    - `MAP.STYLE`: Set this to your Mapbox Studio style URL.
    - `API.BASE_URL`: Ensure this points to `http://localhost:3000` for local development.

5.  **Start the development server:**
    The `server.js` file combined with the Vercel CLI creates a local environment that mirrors the production serverless setup.
    ```bash
    npm run dev:local
    ```
    The application will be available at `http://localhost:3000`.

## Configuration (`config.js`)

The `js/config.js` file and the surrounding `js/config/` directory are the most important places for customizing the application's behavior.

### Map Configuration (`js/config/map.js`)

The `MAP` object contains all settings for the Mapbox instance (token, style URL, initial camera position, zoom levels, etc.).

### API Configuration (`js/config/api.js`)

The `API` object defines the endpoints for the backend. The `server.js` file will route requests from the frontend to the corresponding files in the `/api` directory.

### Event Actions (`js/config/actions.js`)

`EVENT_ACTIONS` is the core of the application's interactivity. It defines named sequences of actions that can be triggered by user interactions.

**Example:**

```javascript
selectBeach: {
  description: "Action when a single beach is clicked.",
  actions: [
    { type: "FLY_TO", zoomLevel: 14, speed: 1.5 },
    { type: "UPDATE_APP_STATE" },
    { type: "SHOW_SIDEBAR", sidebar: "detail" },
    { type: "SHOW_POPUP", delay: 100 },
  ],
},
```

### DOM Selectors (`js/config/ui.js`)

The `SELECTORS` object maps logical names to CSS selectors. It is highly recommended to use `data-` attributes (e.g., `[data-sidebar="wrapper"]`) for stability.

## Architecture Deep Dive

### Core Principles

- **Separation of Concerns**: Each module has a single, well-defined responsibility.
- **Single Source of Truth**: `AppState` holds the current application state.
- **Loose Coupling via Events**: Modules communicate through the `EventBus`.

### Application Flow: A User Click

1.  **User Interaction**: A user clicks a feature on the map.
2.  **MapController**: The Mapbox `click` event fires, identifies the feature, and determines the correct action name (e.g., `selectBeach`).
3.  **ActionController**: The "conductor." It looks up the `selectBeach` sequence in the config and publishes an event to the `EventBus` for each step in the sequence.
4.  **Event Subscriptions**: Other modules (`MapController`, `UIController`) are subscribed to these events and perform their respective actions (flying the map, showing a sidebar, etc.).
5.  **State Changes**: `AppState` is updated, which may trigger further events (like `state:selectionChanged`) to cause UI components to re-render with new data.

### Backend: Vercel-style API Routes

The project uses a local Express server (`server.js`) to emulate the behavior of Vercel's serverless functions.

- Any `.js` file placed in the `/api` directory automatically becomes an API endpoint.
- For example, a request to `GET /api/beaches` on the frontend will be handled by the logic in `api/beaches.js` on the backend.
- This structure allows for a clean separation of frontend and backend concerns and makes deployment to a platform like Vercel seamless.

## API Integration

The application is architected to fetch data from a live Webflow CMS backend. The `mockAPI.js` file has been deprecated.

### `api/beaches.js`

This file is the heart of the backend integration. It is responsible for:
1.  **Fetching All Items**: It handles the pagination of the Webflow API to retrieve the complete list of beach items.
2.  **Fetching the Schema**: It dynamically fetches the Webflow Collection's schema to understand the structure of the data, particularly for `Option` fields.
3.  **Data Transformation**: It contains a powerful `transformBeaches` function that cleans, formats, and restructures the raw JSON from Webflow into a format that is easy for the frontend to consume. This includes:
    - Mapping relational IDs (for amenities, states) to human-readable names.
    - Parsing and cleaning numerical data from string fields.
    - Normalizing the data structure for consistency.

To connect to your Webflow instance, you must provide your API token and Collection ID in the `.env.local` file.

## Deployment

This project is optimized for deployment on [Vercel](https://vercel.com). The `vercel.json` file is pre-configured to handle the serverless API routes.

To deploy:
1.  Push your code to a Git repository (GitHub, GitLab, etc.).
2.  Import the project into Vercel.
3.  Configure the Environment Variables (`WEBFLOW_API_TOKEN`, `BEACHES_COLLECTION_ID`, and your Mapbox token if you choose to make it private) in the Vercel project settings.
4.  Vercel will automatically build and deploy the application.

While it can be deployed to other static hosting services, Vercel's handling of the `/api` directory provides the most seamless experience.

