// Search Analytics Service
// This service tracks search queries and results to improve search experience

class SearchAnalyticsService {
  constructor() {
    this.searchHistory = this.getSearchHistory();
  }

  // Get search history from localStorage
  getSearchHistory() {
    try {
      const history = localStorage.getItem('searchHistory');
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Error loading search history:', error);
      return [];
    }
  }

  // Save search history to localStorage
  saveSearchHistory() {
    try {
      localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory));
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  }

  // Track a search query
  trackSearch(query, resultsCount) {
    if (!query || typeof query !== 'string') return;

    const searchEntry = {
      query: query.trim(),
      timestamp: new Date().toISOString(),
      resultsCount: resultsCount || 0
    };

    // Add to history (limit to 50 recent searches)
    this.searchHistory.unshift(searchEntry);
    if (this.searchHistory.length > 50) {
      this.searchHistory = this.searchHistory.slice(0, 50);
    }

    this.saveSearchHistory();
  }

  // Get popular search queries
  getPopularSearches(limit = 10) {
    if (this.searchHistory.length === 0) return [];

    // Count query occurrences
    const queryCounts = {};
    this.searchHistory.forEach(entry => {
      const query = entry.query.toLowerCase();
      queryCounts[query] = (queryCounts[query] || 0) + 1;
    });

    // Sort by count and return top queries
    return Object.entries(queryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([query]) => query);
  }

  // Get recent search queries (unique)
  getRecentSearches(limit = 5) {
    const uniqueQueries = [];
    const seenQueries = new Set();

    for (const entry of this.searchHistory) {
      const query = entry.query.toLowerCase();
      if (!seenQueries.has(query)) {
        uniqueQueries.push(entry.query);
        seenQueries.add(query);
        if (uniqueQueries.length >= limit) break;
      }
    }

    return uniqueQueries;
  }

  // Clear search history
  clearSearchHistory() {
    this.searchHistory = [];
    this.saveSearchHistory();
  }

  // Get search statistics
  getSearchStats() {
    if (this.searchHistory.length === 0) return null;

    const totalSearches = this.searchHistory.length;
    const searchesWithResults = this.searchHistory.filter(entry => entry.resultsCount > 0).length;
    const successRate = totalSearches > 0 ? (searchesWithResults / totalSearches) * 100 : 0;

    // Most searched query
    const queryCounts = {};
    this.searchHistory.forEach(entry => {
      const query = entry.query.toLowerCase();
      queryCounts[query] = (queryCounts[query] || 0) + 1;
    });

    const mostSearched = Object.entries(queryCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    return {
      totalSearches,
      successRate: successRate.toFixed(1),
      mostSearched,
      recentSearches: this.getRecentSearches(5)
    };
  }
}

// Export singleton instance
const searchAnalyticsService = new SearchAnalyticsService();
export default searchAnalyticsService;