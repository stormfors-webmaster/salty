import { customConsoleLog } from "./utils/devmode.js";
import { map } from "./modules/map.js";

const devmode = localStorage.getItem("devMode") === "true";
if (devmode) {
  customConsoleLog("Salty");
}

// console.log("active"); // Removed for production
const homepage = window.location.pathname === "/";
const store = window.location.pathname.includes("/store");

if (!homepage && !store) {
  if (devmode) {
    console.log("no script needed for this page");
  }
}

if (homepage) {
  initHomepage();
}

if (store) {
  initStore();
}

async function initHomepage() {
  if (devmode) {
    console.log("init homepage");
  }
  map();
}

function initStore() {
  if (devmode) {
    console.log("init store");
  }
  // Store related initialization logic goes here
}
