import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { UberOrder, FilterRecommendation } from '../types';

interface OrderCardProps {
  order: UberOrder;
  recommendation?: FilterRecommendation;
  onAccept?: () => void;
  onReject?: () => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  recommendation,
  onAccept,
  onReject,
}) => {
  const getRecommendationColor = (rec: FilterRecommendation) => {
    return rec.recommendation === 'good' ? '#27ae60' : '#e74c3c';
  };

  const getPerMileRate = () => {
    return (order.price / Math.max(order.distance, 0.5)).toFixed(2);
  };

  return (
    <View style={styles.card}>
      {/* Header with recommendation */}
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <Text style={styles.price}>${order.price.toFixed(2)}</Text>
          <Text style={styles.distance}>{order.distance.toFixed(1)} mi</Text>
        </View>

        {recommendation && (
          <View
            style={[
              styles.recommendationBadge,
              {
                backgroundColor:
                  recommendation.recommendation === 'good'
                    ? 'rgba(39, 174, 96, 0.1)'
                    : 'rgba(231, 76, 60, 0.1)',
                borderColor: getRecommendationColor(recommendation),
              },
            ]}
          >
            <Text
              style={[
                styles.recommendationText,
                { color: getRecommendationColor(recommendation) },
              ]}
            >
              {recommendation.recommendation === 'good' ? '✓ Good' : '✗ Poor'}
            </Text>
            <Text style={styles.scoreText}>{recommendation.score}/100</Text>
          </View>
        )}
      </View>

      {/* Details */}
      <View style={styles.details}>
        <Text style={styles.restaurant}>{order.restaurant}</Text>
        <Text style={styles.location}>📍 {order.pickupLocation}</Text>
        <Text style={styles.estimate}>
          ⏱ ~{order.estimatedTime} min • ${getPerMileRate()}/mile
        </Text>
      </View>

      {/* Reasons (if poor recommendation) */}
      {recommendation && recommendation.recommendation === 'poor' && (
        <View style={styles.reasonsSection}>
          <Text style={styles.reasonsTitle}>Why this order is poor:</Text>
          {recommendation.reasons.map((reason, idx) => (
            <Text key={idx} style={styles.reason}>
              • {reason}
            </Text>
          ))}
        </View>
      )}

      {/* Action Buttons */}
      {onAccept || onReject ? (
        <View style={styles.actions}>
          {onReject && (
            <TouchableOpacity
              style={[styles.button, styles.rejectButton]}
              onPress={onReject}
            >
              <Text style={styles.buttonText}>Reject</Text>
            </TouchableOpacity>
          )}
          {onAccept && (
            <TouchableOpacity
              style={[styles.button, styles.acceptButton]}
              onPress={onAccept}
            >
              <Text style={styles.buttonText}>Accept</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleSection: {
    flex: 1,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a472a',
  },
  distance: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  recommendationBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  recommendationText: {
    fontWeight: '600',
    fontSize: 12,
  },
  scoreText: {
    fontSize: 10,
    color: '#666666',
    marginTop: 2,
  },
  details: {
    marginBottom: 12,
  },
  restaurant: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c2c2c',
    marginBottom: 8,
  },
  location: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 4,
  },
  estimate: {
    fontSize: 12,
    color: '#999999',
  },
  reasonsSection: {
    backgroundColor: 'rgba(231, 76, 60, 0.05)',
    borderLeftWidth: 3,
    borderLeftColor: '#e74c3c',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    borderRadius: 4,
  },
  reasonsTitle: {
    fontWeight: '600',
    fontSize: 12,
    color: '#e74c3c',
    marginBottom: 6,
  },
  reason: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#27ae60',
  },
  rejectButton: {
    backgroundColor: '#e74c3c',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
});
