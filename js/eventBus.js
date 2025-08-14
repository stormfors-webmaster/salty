const events = new Map();

/**
 * A simple Pub/Sub Event Bus.
 */
export const EventBus = {
  /**
   * Subscribe to an event.
   * @param {string} eventName - The name of the event.
   * @param {Function} callback - The function to call when the event is published.
   * @returns {object} An object with an `unsubscribe` method.
   */
  subscribe(eventName, callback) {
    if (!events.has(eventName)) {
      events.set(eventName, []);
    }
    const subscriptions = events.get(eventName);
    subscriptions.push(callback);

    console.log(`[EventBus] Subscribed to "${eventName}"`);

    return {
      unsubscribe() {
        const index = subscriptions.indexOf(callback);
        if (index > -1) {
          subscriptions.splice(index, 1);
        }
      },
    };
  },

  /**
   * Publish an event.
   * @param {string} eventName - The name of the event.
   * @param {*} data - The data to pass to subscribers.
   */
  publish(eventName, data) {
    if (events.has(eventName)) {
      console.log(`[EventBus] Publishing "${eventName}"`, data);
      events.get(eventName).forEach((callback) => callback(data));
    }
  },
};
