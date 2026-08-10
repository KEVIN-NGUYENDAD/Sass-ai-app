import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { OrderCard } from '../components';
import { useFilters, useDecisions, useAudio } from '../hooks';
import { evaluateOrder } from '../services/filterService';
import { UberOrder } from '../types';
import { settingsStorage } from '../services/storageService';

export const HomeScreen: React.FC = () => {
  const { activeFilter } = useFilters();
  const { addDecision } = useDecisions();
  const [settings, setSettings] = useState<any>(null);
  const { playAlert } = useAudio(settings || {});

  // Sample orders for demo
  const [orders, setOrders] = useState<UberOrder[]>([
    {
      id: '1',
      price: 12.5,
      distance: 2.1,
      restaurant: 'Chipotle',
      pickupLocation: 'Downtown Mall',
      deliveryLocation: 'Riverside Apartments',
      estimatedTime: 18,
      timestamp: new Date(),
    },
    {
      id: '2',
      price: 5.5,
      distance: 8.5,
      restaurant: 'McDonald\'s',
      pickupLocation: 'Airport Terminal',
      deliveryLocation: 'Industrial Area',
      estimatedTime: 35,
      timestamp: new Date(),
    },
    {
      id: '3',
      price: 18.0,
      distance: 1.5,
      restaurant: 'Sushi Palace',
      pickupLocation: 'Shopping Center',
      deliveryLocation: 'Downtown Office',
      estimatedTime: 15,
      timestamp: new Date(),
    },
  ]);

  useEffect(() => {
    const loadSettings = async () => {
      const s = await settingsStorage.get();
      setSettings(s);
    };
    loadSettings();
  }, []);

  const handleAcceptOrder = async (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    await addDecision({
      id: `decision_${Date.now()}`,
      orderId,
      action: 'accepted',
      timestamp: new Date(),
      estimatedEarnings: order.price,
      filterId: activeFilter?.id || '',
    });

    setOrders(prev => prev.filter(o => o.id !== orderId));
    Alert.alert('Success', `Order accepted! Estimated earnings: $${order.price.toFixed(2)}`);
  };

  const handleRejectOrder = async (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    await addDecision({
      id: `decision_${Date.now()}`,
      orderId,
      action: 'rejected',
      timestamp: new Date(),
      estimatedEarnings: 0,
      filterId: activeFilter?.id || '',
    });

    setOrders(prev => prev.filter(o => o.id !== orderId));
  };

  if (!settings) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Order Queue</Text>
        {activeFilter && (
          <View style={styles.filterBadge}>
            <Text style={styles.filterBadgeText}>
              Filter: {activeFilter.name}
            </Text>
          </View>
        )}
      </View>

      {orders.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyText}>No orders at the moment</Text>
          <Text style={styles.emptySubtext}>
            New orders will appear here in real-time
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.ordersList}>
          {orders.map(order => {
            const recommendation = activeFilter
              ? evaluateOrder(order, activeFilter)
              : undefined;

            // Play alert if poor recommendation
            useEffect(() => {
              if (
                recommendation?.recommendation === 'poor' &&
                settings.enableAudio
              ) {
                playAlert(settings.audioType);
              }
            }, [recommendation, settings, playAlert]);

            return (
              <OrderCard
                key={order.id}
                order={order}
                recommendation={recommendation}
                onAccept={() => handleAcceptOrder(order.id)}
                onReject={() => handleRejectOrder(order.id)}
              />
            );
          })}
        </ScrollView>
      )}

      {!activeFilter && (
        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            ⚠️ No active filter. Set one in the Filters tab to enable recommendations.
          </Text>
        </View>
      )}
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
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a472a',
    marginBottom: 8,
  },
  filterBadge: {
    backgroundColor: '#1a472a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  filterBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  ordersList: {
    flex: 1,
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
  },
  warningBox: {
    backgroundColor: 'rgba(230, 126, 34, 0.1)',
    borderTopWidth: 1,
    borderTopColor: '#e67e22',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  warningText: {
    color: '#e67e22',
    fontSize: 13,
    fontWeight: '500',
  },
});
