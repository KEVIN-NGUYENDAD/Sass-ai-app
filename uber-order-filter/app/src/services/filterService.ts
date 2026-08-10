import { UberOrder, FilterCriteria, FilterRecommendation } from '../types';

/**
 * Evaluate an order against filter criteria
 * Returns a recommendation with score and reasons
 */
export const evaluateOrder = (
  order: UberOrder,
  criteria: FilterCriteria
): FilterRecommendation => {
  const reasons: string[] = [];
  let score = 100;

  const matchedCriteria = {
    priceMatch: false,
    distanceMatch: false,
    restaurantMatch: false,
  };

  // Check price
  if (order.price >= criteria.minPrice) {
    matchedCriteria.priceMatch = true;
  } else {
    reasons.push(`Price $${order.price} below minimum $${criteria.minPrice}`);
    score -= 30;
  }

  // Check distance
  if (order.distance <= criteria.maxDistance) {
    matchedCriteria.distanceMatch = true;
  } else {
    reasons.push(`Distance ${order.distance} miles exceeds max ${criteria.maxDistance} miles`);
    score -= 35;
  }

  // Check restaurant preferences
  const isPreferred = criteria.preferredRestaurants.length === 0 ||
    criteria.preferredRestaurants.includes(order.restaurant);

  const isExcluded = criteria.excludedRestaurants.includes(order.restaurant);

  if (isExcluded) {
    reasons.push(`Restaurant "${order.restaurant}" is on exclusion list`);
    score -= 25;
  } else if (isPreferred) {
    matchedCriteria.restaurantMatch = true;
  }

  const recommendation: 'good' | 'poor' = score >= 60 ? 'good' : 'poor';

  return {
    order,
    recommendation,
    score: Math.max(0, score),
    reasons,
    matchedCriteria,
  };
};

/**
 * Calculate earnings metrics based on decision history
 */
export const calculateOptimalCriteria = (
  acceptedOrders: UberOrder[],
  rejectedOrders: UberOrder[]
): Partial<FilterCriteria> => {
  if (acceptedOrders.length === 0) {
    return {};
  }

  // Calculate average price of accepted orders
  const avgPrice = acceptedOrders.reduce((sum, o) => sum + o.price, 0) / acceptedOrders.length;
  const minPrice = Math.min(...acceptedOrders.map(o => o.price));

  // Calculate average distance of accepted orders
  const avgDistance = acceptedOrders.reduce((sum, o) => sum + o.distance, 0) / acceptedOrders.length;
  const maxDistance = Math.max(...acceptedOrders.map(o => o.distance));

  // Find most accepted restaurants
  const restaurantCounts = new Map<string, number>();
  acceptedOrders.forEach(order => {
    const count = restaurantCounts.get(order.restaurant) || 0;
    restaurantCounts.set(order.restaurant, count + 1);
  });

  const preferredRestaurants = Array.from(restaurantCounts.entries())
    .filter(([_, count]) => count >= 2)
    .map(([restaurant]) => restaurant);

  // Find rejected restaurants
  const rejectedRestaurants = new Set<string>();
  rejectedOrders.forEach(order => {
    // Only exclude if rejected multiple times
    const rejectedCount = rejectedOrders.filter(o => o.restaurant === order.restaurant).length;
    if (rejectedCount >= 2) {
      rejectedRestaurants.add(order.restaurant);
    }
  });

  return {
    minPrice: Math.round(minPrice),
    maxDistance: parseFloat(maxDistance.toFixed(1)),
    preferredRestaurants,
    excludedRestaurants: Array.from(rejectedRestaurants),
  };
};

/**
 * Score an order based on basic metrics
 */
export const scoreOrder = (order: UberOrder): number => {
  // Simple scoring: $1 per mile is good
  const perMileRate = order.price / Math.max(order.distance, 0.5);

  // Normalize score 0-100
  // Good: $2+ per mile = 100
  // Bad: <$1 per mile = 0
  let score = Math.min(100, perMileRate * 50);

  return Math.max(0, score);
};
