import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useDecisions } from '../hooks';
import { DriverDecision, DailyStats } from '../types';

export const HistoryScreen: React.FC = () => {
  const { decisions, getTodayStats, getWeeklyStats } = useDecisions();
  const [todayStats, setTodayStats] = useState<DailyStats | null>(null);
  const [weeklyStats, setWeeklyStats] = useState<DailyStats[]>([]);
  const [activeTab, setActiveTab] = useState<'today' | 'weekly' | 'history'>(
    'today'
  );

  useEffect(() => {
    setTodayStats(getTodayStats());
    setWeeklyStats(getWeeklyStats());
  }, [decisions, getTodayStats, getWeeklyStats]);

  const getDecisionColor = (action: string) => {
    return action === 'accepted' ? '#27ae60' : '#e74c3c';
  };

  const renderStatsCard = (stat: DailyStats) => (
    <View style={styles.statsCard}>
      <View style={styles.statRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Total Orders</Text>
          <Text style={styles.statValue}>{stat.totalOrders}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Accepted</Text>
          <Text style={[styles.statValue, { color: '#27ae60' }]}>
            {stat.acceptedOrders}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Rejected</Text>
          <Text style={[styles.statValue, { color: '#e74c3c' }]}>
            {stat.rejectedOrders}
          </Text>
        </View>
      </View>

      <View style={styles.statRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Total Earnings</Text>
          <Text style={[styles.statValue, { color: '#1a472a' }]}>
            ${stat.totalEarnings.toFixed(2)}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Avg/Order</Text>
          <Text style={styles.statValue}>
            ${stat.averageEarningsPerOrder.toFixed(2)}
          </Text>
        </View>
      </View>

      {stat.date && (
        <Text style={styles.statDate}>
          {new Date(stat.date).toLocaleDateString()}
        </Text>
      )}
    </View>
  );

  const renderDecisionItem = (item: DriverDecision) => (
    <View style={styles.decisionItem}>
      <View style={styles.decisionHeader}>
        <Text style={styles.decisionId}>Order {item.orderId}</Text>
        <View
          style={[
            styles.decisionBadge,
            {
              backgroundColor:
                item.action === 'accepted'
                  ? 'rgba(39, 174, 96, 0.1)'
                  : 'rgba(231, 76, 60, 0.1)',
            },
          ]}
        >
          <Text
            style={[
              styles.decisionAction,
              { color: getDecisionColor(item.action) },
            ]}
          >
            {item.action === 'accepted' ? '✓ Accepted' : '✗ Rejected'}
          </Text>
        </View>
      </View>

      <View style={styles.decisionDetails}>
        <Text style={styles.detailText}>
          💰 ${item.estimatedEarnings.toFixed(2)}
        </Text>
        <Text style={styles.detailText}>
          🕐 {new Date(item.timestamp).toLocaleTimeString()}
        </Text>
        {item.reason && <Text style={styles.reason}>📝 {item.reason}</Text>}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'today' && styles.tabActive]}
          onPress={() => setActiveTab('today')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'today' && styles.tabTextActive,
            ]}
          >
            Today
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'weekly' && styles.tabActive]}
          onPress={() => setActiveTab('weekly')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'weekly' && styles.tabTextActive,
            ]}
          >
            Weekly
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.tabActive]}
          onPress={() => setActiveTab('history')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'history' && styles.tabTextActive,
            ]}
          >
            History
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'today' && todayStats && (
          <>
            {renderStatsCard(todayStats)}
            <Text style={styles.sectionTitle}>Today's Decisions</Text>
            {decisions.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No decisions yet today</Text>
              </View>
            ) : (
              <FlatList
                data={decisions.filter(d =>
                  d.timestamp
                    .toString()
                    .startsWith(
                      new Date().toISOString().split('T')[0]
                    )
                )}
                renderItem={({ item }) => renderDecisionItem(item)}
                keyExtractor={item => item.id}
                scrollEnabled={false}
              />
            )}
          </>
        )}

        {activeTab === 'weekly' && (
          <>
            <Text style={styles.sectionTitle}>Weekly Breakdown</Text>
            {weeklyStats.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No data for this week</Text>
              </View>
            ) : (
              weeklyStats.map(stat => (
                <View key={stat.date}>{renderStatsCard(stat)}</View>
              ))
            )}
          </>
        )}

        {activeTab === 'history' && (
          <>
            <Text style={styles.sectionTitle}>All Decisions</Text>
            {decisions.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No decisions recorded yet</Text>
              </View>
            ) : (
              <FlatList
                data={[...decisions].reverse()}
                renderItem={({ item }) => renderDecisionItem(item)}
                keyExtractor={item => item.id}
                scrollEnabled={false}
              />
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f7f5',
  },
  tabBar: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0dbd5',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#1a472a',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#999999',
  },
  tabTextActive: {
    color: '#1a472a',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a472a',
    marginBottom: 12,
    marginTop: 16,
  },
  statsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    backgroundColor: '#f8f7f5',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: '#666666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a472a',
  },
  statDate: {
    fontSize: 11,
    color: '#999999',
    marginTop: 8,
  },
  decisionItem: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
  },
  decisionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  decisionId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c2c2c',
  },
  decisionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  decisionAction: {
    fontSize: 11,
    fontWeight: '600',
  },
  decisionDetails: {
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#666666',
  },
  reason: {
    fontSize: 12,
    color: '#1a472a',
    fontStyle: 'italic',
  },
  emptyState: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999999',
  },
});
