import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { FilterCard } from '../components';
import { useFilters } from '../hooks';
import { FilterCriteria } from '../types';

export const FiltersScreen: React.FC = () => {
  const { filters, activeFilter, addFilter, deleteFilter, setActiveFilter } =
    useFilters();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    minPrice: '8',
    maxDistance: '3',
  });

  const handleCreateFilter = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter a filter name');
      return;
    }

    const newFilter: FilterCriteria = {
      id: `filter_${Date.now()}`,
      name: formData.name,
      minPrice: parseInt(formData.minPrice) || 8,
      maxDistance: parseFloat(formData.maxDistance) || 3,
      preferredRestaurants: [],
      excludedRestaurants: [],
      isActive: filters.length === 0, // Auto-activate if first filter
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await addFilter(newFilter);

    if (newFilter.isActive) {
      await setActiveFilter(newFilter);
    }

    setFormData({ name: '', minPrice: '8', maxDistance: '3' });
    setShowCreateModal(false);
    Alert.alert('Success', 'Filter created successfully!');
  };

  const handleDeleteFilter = (id: string) => {
    Alert.alert('Delete Filter', 'Are you sure?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Delete',
        onPress: async () => {
          await deleteFilter(id);
          Alert.alert('Success', 'Filter deleted');
        },
        style: 'destructive',
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Filters</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Text style={styles.createButtonText}>+ New Filter</Text>
        </TouchableOpacity>
      </View>

      {filters.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>⚙️</Text>
          <Text style={styles.emptyText}>No filters yet</Text>
          <Text style={styles.emptySubtext}>
            Create a filter to start getting recommendations on orders
          </Text>
          <TouchableOpacity
            style={styles.emptyCreateButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Text style={styles.emptyCreateButtonText}>Create First Filter</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.filtersList}>
          {filters.map(filter => (
            <FilterCard
              key={filter.id}
              filter={filter}
              isActive={activeFilter?.id === filter.id}
              onSelect={() => setActiveFilter(filter)}
              onDelete={() => handleDeleteFilter(filter.id)}
            />
          ))}
        </ScrollView>
      )}

      {/* Create Filter Modal */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Filter</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <Text style={styles.label}>Filter Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Rush Hour"
                placeholderTextColor="#ccc"
                value={formData.name}
                onChangeText={text => setFormData({ ...formData, name: text })}
              />

              <Text style={styles.label}>Minimum Price ($)</Text>
              <TextInput
                style={styles.input}
                placeholder="8"
                placeholderTextColor="#ccc"
                keyboardType="decimal-pad"
                value={formData.minPrice}
                onChangeText={text => setFormData({ ...formData, minPrice: text })}
              />

              <Text style={styles.label}>Maximum Distance (miles)</Text>
              <TextInput
                style={styles.input}
                placeholder="3"
                placeholderTextColor="#ccc"
                keyboardType="decimal-pad"
                value={formData.maxDistance}
                onChangeText={text =>
                  setFormData({ ...formData, maxDistance: text })
                }
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowCreateModal(false)}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.submitButton]}
                  onPress={handleCreateFilter}
                >
                  <Text style={[styles.modalButtonText, { color: '#ffffff' }]}>
                    Create
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f7f5',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0dbd5',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a472a',
  },
  createButton: {
    backgroundColor: '#1a472a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  createButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 12,
  },
  filtersList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c2c2c',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 32,
  },
  emptyCreateButton: {
    backgroundColor: '#1a472a',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyCreateButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingBottom: 32,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0dbd5',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a472a',
  },
  closeButton: {
    fontSize: 24,
    color: '#999999',
  },
  modalForm: {
    paddingVertical: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c2c2c',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#f8f7f5',
    borderWidth: 1,
    borderColor: '#e0dbd5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#2c2c2c',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f8f7f5',
  },
  submitButton: {
    backgroundColor: '#1a472a',
  },
  modalButtonText: {
    fontWeight: '600',
    fontSize: 14,
    color: '#2c2c2c',
  },
});
