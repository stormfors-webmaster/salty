# Salty Beaches

Salty Beaches is a modern, interactive web application for exploring beaches and nearby points of interest (POIs). It integrates with a Webflow CMS backend and renders an interactive Mapbox map UI. The app features a responsive design, modular architecture, and an event-driven system for user interactions.

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

- **Frontend**: HTML5, CSS, Vanilla JavaScript (ES modules)
- **Mapping**: Mapbox GL JS
- **Backend**: Serverless-style API routes in `/api` (run locally via Vercel CLI)
- **CMS**: Webflow (v2 API)
- **Local Development**: Vercel CLI (`vercel dev`) with `.env.local`
- **Dependencies**: `@turf/turf`, `axios`, `cors`, `dotenv`, `express`, `node-fetch`, `dotenv-cli`

## Project Structure

The project follows a modular structure, with a clear separation between the frontend application logic and the backend API handlers.

```
salty/
├── api/
│   ├── beaches.js              # Fetches & transforms Beaches collection from Webflow
│   └── pois.js                 # Fetches & transforms POIs collection from Webflow
├── js/
│   ├── appState.js             # Global state store
│   ├── config.js               # Centralized config aggregator
│   ├── config/
│   │   ├── actions.js          # Declarative UI/action sequences
│   │   ├── api.js              # API/base URL + Webflow config
│   │   ├── map.js              # Mapbox tokens, style, camera
│   │   └── ui.js               # DOM selectors and UI constants
│   ├── dataController.js       # Prefetches / caches API data
│   ├── eventBus.js             # Pub/Sub event bus
│   ├── mapController.js        # Mapbox GL JS integration & events
│   ├── uiController.js         # DOM rendering & sidebars
│   ├── utils.js                # Utilities
│   └── mockAPI.js              # Frontend-only mock fallbacks (used on failure)
├── index.js                    # App entry point
├── server.js                   # Optional static server (use Vercel CLI for API)
├── vercel.json                 # CORS headers for deployment
└── README.md                   # This file
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Vercel CLI (`npm i -g vercel`)
- A Mapbox access token and style URL
- A Webflow API token and collection IDs

### Installation & Setup

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/salty.git
    cd salty
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Create `.env.local`:**
    Create a file named `.env.local` in the project root with the following variables:

    ```bash
    # Webflow API credentials (required)
    WEBFLOW_API_TOKEN="YOUR_WEBFLOW_API_TOKEN"
    BEACHES_COLLECTION_ID="YOUR_WEBFLOW_BEACHES_COLLECTION_ID"
    POI_COLLECTION_ID="YOUR_WEBFLOW_POI_COLLECTION_ID"
    ```

4.  **Configure the application:**
    Update the following files:

    - `js/config/map.js`
      - `ACCESS_TOKEN`: Your Mapbox token
      - `STYLE`: Your Mapbox Studio style URL
    - `js/config/api.js`
      - `apiConfig.BASE_URL`
        - For local development: `http://localhost:3000`
        - For production: your deployed domain (e.g., `https://your-app.vercel.app`)

5.  **Run locally:**
    Use the Vercel CLI to run the static site and serverless API locally with your env vars loaded:

    ```bash
    npm run dev:local
    ```

    Your app will be available at `http://localhost:3000`.

    Note: `npm start` will run `server.js` (simple static server). Prefer `npm run dev:local` for full API emulation.

## Configuration (`config.js`)

The `js/config.js` file aggregates configuration from `js/config/`.

### Map (`js/config/map.js`)

- `ACCESS_TOKEN`, `STYLE`, default camera settings.

### API (`js/config/api.js`)

- `apiConfig.BASE_URL`: The base origin that serves your API routes (`/api/*`).
- `webflowConfig`: Static identifiers used by the frontend where needed.

### UI & Actions

- `js/config/ui.js`: DOM selectors and UI constants.
- `js/config/actions.js`: Declarative action sequences dispatched by the `ActionController`.

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

### Backend: Serverless-style API Routes

The project uses Vercel-style serverless functions under `/api` and is intended to run locally with `vercel dev`.

- Any `.js` file placed in the `/api` directory becomes an API endpoint.
- For example, `GET /api/beaches` is handled by `api/beaches.js`, and `GET /api/pois` by `api/pois.js`.
- `server.js` can serve static files, but for API development you should use `npm run dev:local` (Vercel CLI).

## API Integration

The application fetches data from a live Webflow CMS via the serverless functions in `/api`. The frontend may fall back to `mockAPI.js` only when live calls fail.

### Endpoints

- `GET /api/beaches`

  - Fetches all items from the Beaches collection (with pagination) and transforms them into a frontend-friendly format.
  - Requires environment vars: `WEBFLOW_API_TOKEN`, `BEACHES_COLLECTION_ID`.

- `GET /api/pois`
  - Fetches all items from the POIs collection and transforms them.
  - Requires environment vars: `WEBFLOW_API_TOKEN`, `POI_COLLECTION_ID`.

### Quick test (from terminal)

```bash
curl -s http://localhost:3000/api/beaches | head -n 20
curl -s http://localhost:3000/api/pois | head -n 20
```

Both endpoints use Webflow v2 APIs and map `Option` field IDs to readable names where possible.

## Deployment

This project is optimized for deployment on Vercel.

1. Push your code to a Git repository (GitHub, GitLab, etc.).
2. Import the project into Vercel.
3. Set Environment Variables in Vercel:
   - `WEBFLOW_API_TOKEN`
   - `BEACHES_COLLECTION_ID`
   - `POI_COLLECTION_ID`
   - (Optional) Make your Mapbox token private and inject it at build time or via runtime config.
4. Deploy. Vercel will expose `/api/*` endpoints.

### CORS

`vercel.json` sets permissive headers for production domains. Update `vercel.json` (and `server.js` CORS origins if you use it) to match your domains.
