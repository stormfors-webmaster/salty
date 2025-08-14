// =============================================================================
// MOCK API MODULE
// =============================================================================

export const MockAPI = {
  /**
   * Mock beach details API
   * @param {string} beachId - The beach ID
   * @returns {Promise} Promise resolving to beach details
   */
  async fetchBeachDetails(beachId) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      id: beachId,
      name: 'Sample Beach Name',
      description: 'This is a beautiful beach with crystal clear waters and golden sand. Perfect for swimming, surfing, and beach volleyball.',
      imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400',
      address: '123 Beach Drive, Coastal City, CA 90210',
      amenities: ['Parking', 'Restrooms', 'Lifeguard', 'Concessions'],
      rating: 4.5,
      reviews: 234
    };
  },

  /**
   * Mock weather API
   * @param {string} locationId - The location ID
   * @returns {Promise} Promise resolving to weather data
   */
  async fetchWeather(locationId) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain'];
    const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
    
    return {
      temperature: Math.floor(Math.random() * 20) + 65, // 65-85°F
      condition: randomCondition,
      windSpeed: Math.floor(Math.random() * 15) + 5, // 5-20 mph
      humidity: Math.floor(Math.random() * 30) + 50, // 50-80%
      uvIndex: Math.floor(Math.random() * 8) + 1 // 1-8
    };
  },

  /**
   * Mock POI details API
   * @param {string} poiId - The POI ID
   * @returns {Promise} Promise resolving to POI details
   */
  async fetchPOIDetails(poiId) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return {
      id: poiId,
      name: 'Sample Point of Interest',
      description: 'An interesting landmark or facility near the beach.',
      imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
      type: 'Restaurant',
      rating: 4.2,
      priceRange: '$$'
    };
  }
}; 