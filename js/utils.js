// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

import { Config } from "./config.js";

export const Utils = {
  /**
   * Check if current view is mobile
   * @returns {boolean} True if mobile view
   */
  isMobileView() {
    return window.innerWidth <= Config.MAP.MOBILE_BREAKPOINT;
  },

  /**
   * Debounce function calls
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function} Debounced function
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * Show loading state
   * @param {HTMLElement} element - Element to show loading in
   */
  showLoading(element) {
    element.innerHTML =
      '<div class="loader" style="display: flex; justify-content: center; padding: 20px;">Loading...</div>';
  },

  /**
   * Show error message
   * @param {HTMLElement} element - Element to show error in
   * @param {string} message - Error message
   */
  showError(element, message) {
    element.innerHTML = `<div class="error" style="padding: 20px; text-align: center; color: #d32f2f;">${message}</div>`;
  },

  /**
   * Gets a unique and consistent ID from a feature's properties.
   * @param {object} feature - The GeoJSON feature.
   * @returns {string|number|null} The unique ID of the feature.
   */
  getFeatureEntityId(feature) {
    if (!feature) return null;
    const p = feature.properties || {};
    // Order is important. Check properties first, then the top-level feature ID as a fallback.
    return (
      p["Item ID"] || p["Location Cluster"] || p.NAME || p.Name || feature.id
    );
  },

  /**
   * Updates a DOM element with a value, supporting various update types.
   * @param {object} mapping - The mapping object.
   * @param {HTMLElement} mapping.element - The DOM element to update.
   * @param {*} mapping.value - The value to apply.
   * @param {string} [mapping.type='text'] - 'text', 'href', 'src', 'html'.
   * @param {string} [mapping.defaultValue='N/A'] - Fallback value.
   * @param {function(value): *} [mapping.transform] - A function to transform the value before setting.
   */
  updateElement({
    element,
    value,
    type = "text",
    defaultValue = "N/A",
    transform,
  }) {
    if (!element) return;

    let finalValue =
      value !== undefined && value !== null ? value : defaultValue;
    if (transform) {
      finalValue = transform(finalValue);
    }

    switch (type) {
      case "href":
        element.href = finalValue;
        break;
      case "src":
        element.src = finalValue;
        break;
      case "html":
        element.innerHTML = finalValue;
        break;
      default:
        element.textContent = finalValue;
    }
  },

  /**
   * Populates elements in a container with data from an object.
   * It looks for elements with a `data-bind` attribute and uses the attribute's
   * value to look up the corresponding key in the data object.
   * @param {HTMLElement} container - The parent element containing elements to populate.
   * @param {object} data - The data object.
   */
  renderView(container, data) {
    if (!container || !data) return;

    container.querySelectorAll("[data-bind]").forEach((element) => {
      const key = element.dataset.bind;
      const value = data[key];

      if (value !== undefined && value !== null) {
        if (element.tagName === "A") {
          element.href = value;
        } else if (element.tagName === "IMG") {
          element.src = value;
        } else {
          element.textContent = value;
        }
      } else {
        // Optional: Hide element or set to default if data is missing
        element.textContent = ""; // Or some placeholder
      }
    });
  },
};
