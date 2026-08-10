import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FilterCriteria } from '../types';

interface FilterCardProps {
  filter: FilterCriteria;
  isActive: boolean;
  onSelect?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const FilterCard: React.FC<FilterCardProps> = ({
  filter,
  isActive,
  onSelect,
  onEdit,
  onDelete,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.card,
        isActive && styles.activeCard,
      ]}
      onPress={onSelect}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <Text style={styles.name}>{filter.name}</Text>
          {isActive && (
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>✓ Active</Text>
            </View>
          )}
        </View>
        <View style={styles.actions}>
          {onEdit && (
            <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
              <Text style={styles.actionIcon}>✏️</Text>
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity onPress={onDelete} style={styles.actionButton}>
              <Text style={styles.actionIcon}>🗑</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.criteria}>
        <View style={styles.criteriaItem}>
          <Text style={styles.criteriaLabel}>Min Price</Text>
          <Text style={styles.criteriaValue}>${filter.minPrice}</Text>
        </View>

        <View style={styles.criteriaItem}>
          <Text style={styles.criteriaLabel}>Max Distance</Text>
          <Text style={styles.criteriaValue}>{filter.maxDistance} mi</Text>
        </View>

        {filter.preferredRestaurants.length > 0 && (
          <View style={styles.criteriaItem}>
            <Text style={styles.criteriaLabel}>Preferred</Text>
            <Text style={styles.criteriaValue}>
              {filter.preferredRestaurants.length} restaurants
            </Text>
          </View>
        )}
      </View>

      {filter.excludedRestaurants.length > 0 && (
        <View style={styles.excludedSection}>
          <Text style={styles.excludedLabel}>Excluded Restaurants:</Text>
          <Text style={styles.excludedList}>
            {filter.excludedRestaurants.join(', ')}
          </Text>
        </View>
      )}

      <Text style={styles.updatedAt}>
        Updated {new Date(filter.updatedAt).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#999999',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activeCard: {
    borderLeftColor: '#1a472a',
    backgroundColor: 'rgba(26, 71, 42, 0.05)',
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
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a472a',
  },
  activeBadge: {
    backgroundColor: '#27ae60',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  activeBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#f8f7f5',
  },
  actionIcon: {
    fontSize: 18,
  },
  criteria: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  criteriaItem: {
    flex: 1,
    backgroundColor: '#f8f7f5',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  criteriaLabel: {
    fontSize: 11,
    color: '#666666',
    marginBottom: 4,
  },
  criteriaValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a472a',
  },
  excludedSection: {
    backgroundColor: 'rgba(231, 76, 60, 0.05)',
    borderLeftWidth: 3,
    borderLeftColor: '#e74c3c',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  excludedLabel: {
    fontSize: 11,
    color: '#e74c3c',
    fontWeight: '600',
    marginBottom: 4,
  },
  excludedList: {
    fontSize: 12,
    color: '#666666',
  },
  updatedAt: {
    fontSize: 11,
    color: '#999999',
    marginTop: 8,
  },
});
