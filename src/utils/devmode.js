/**
 * Toggles development mode on/off by setting a flag in localStorage.
 * Reload the page after toggling for changes to take effect.
 * Can be called from the browser's developer console.
 * @returns {boolean} The new state of dev mode (true if ON, false if OFF).
 */
export function toggleDevMode() {
  const current = localStorage.getItem("devMode") === "true";
  localStorage.setItem("devMode", (!current).toString());
  console.log(`Dev mode is now ${!current ? "ON" : "OFF"}. Reload page.`);
  return !current;
}

// Removed loadScript and loadModule as they are likely handled by the build process
/*
export function loadScript(path) {
  ...
}

export function loadModule(path) {
  ...
}
*/

// Removed DevModeStop error class as it is unused
/*
export class DevModeStop extends Error {
  ...
}
*/

/**
 * Logs a styled message to the console indicating that dev mode is active.
 * @param {string} name - The name to include in the log message (e.g., 'Salty').
 */
export function customConsoleLog(name) {
  console.log(
    `%c🛠️ ${name} Dev Mode Active`,
    "color: #2ecc71; font-weight: bold; font-size: 14px;"
  );
}
