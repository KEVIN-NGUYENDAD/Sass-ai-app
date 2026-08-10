import { useState, useEffect, useCallback } from 'react';
import { DriverDecision, DailyStats } from '../types';
import { decisionStorage } from '../services/storageService';

export const useDecisions = () => {
  const [decisions, setDecisions] = useState<DriverDecision[]>([]);
  const [loading, setLoading] = useState(true);

  // Load decisions on mount
  useEffect(() => {
    const loadDecisions = async () => {
      setLoading(true);
      const allDecisions = await decisionStorage.getAll();
      setDecisions(allDecisions);
      setLoading(false);
    };

    loadDecisions();
  }, []);

  const addDecision = useCallback(async (decision: DriverDecision) => {
    await decisionStorage.save(decision);
    setDecisions(prev => [...prev, decision]);
  }, []);

  const getTodayStats = useCallback((): DailyStats => {
    const today = new Date().toISOString().split('T')[0];
    const todayDecisions = decisions.filter(d =>
      d.timestamp.toString().startsWith(today)
    );

    const accepted = todayDecisions.filter(d => d.action === 'accepted').length;
    const rejected = todayDecisions.filter(d => d.action === 'rejected').length;
    const totalEarnings = todayDecisions
      .filter(d => d.action === 'accepted')
      .reduce((sum, d) => sum + d.estimatedEarnings, 0);

    return {
      date: today,
      totalOrders: todayDecisions.length,
      acceptedOrders: accepted,
      rejectedOrders: rejected,
      totalEarnings,
      averageEarningsPerOrder: accepted > 0 ? totalEarnings / accepted : 0,
      bestTime: 'N/A',
      worstTime: 'N/A',
    };
  }, [decisions]);

  const getWeeklyStats = useCallback((): DailyStats[] => {
    const stats: Map<string, DailyStats> = new Map();

    decisions.forEach(d => {
      const date = d.timestamp.toString().split('T')[0];

      if (!stats.has(date)) {
        stats.set(date, {
          date,
          totalOrders: 0,
          acceptedOrders: 0,
          rejectedOrders: 0,
          totalEarnings: 0,
          averageEarningsPerOrder: 0,
          bestTime: 'N/A',
          worstTime: 'N/A',
        });
      }

      const stat = stats.get(date)!;
      stat.totalOrders++;

      if (d.action === 'accepted') {
        stat.acceptedOrders++;
        stat.totalEarnings += d.estimatedEarnings;
      } else {
        stat.rejectedOrders++;
      }

      stat.averageEarningsPerOrder = stat.acceptedOrders > 0
        ? stat.totalEarnings / stat.acceptedOrders
        : 0;
    });

    return Array.from(stats.values());
  }, [decisions]);

  return {
    decisions,
    loading,
    addDecision,
    getTodayStats,
    getWeeklyStats,
  };
};
