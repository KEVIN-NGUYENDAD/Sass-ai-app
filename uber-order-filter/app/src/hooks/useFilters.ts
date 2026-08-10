import { useState, useEffect, useCallback } from 'react';
import { FilterCriteria } from '../types';
import { filterStorage } from '../services/storageService';

export const useFilters = () => {
  const [filters, setFilters] = useState<FilterCriteria[]>([]);
  const [activeFilter, setActiveFilterState] = useState<FilterCriteria | null>(null);
  const [loading, setLoading] = useState(true);

  // Load all filters on mount
  useEffect(() => {
    const loadFilters = async () => {
      setLoading(true);
      const allFilters = await filterStorage.getAll();
      setFilters(allFilters);

      const active = await filterStorage.getActive();
      setActiveFilterState(active);
      setLoading(false);
    };

    loadFilters();
  }, []);

  const addFilter = useCallback(async (filter: FilterCriteria) => {
    await filterStorage.save(filter);
    setFilters(prev => [...prev, filter]);
  }, []);

  const updateFilter = useCallback(async (filter: FilterCriteria) => {
    await filterStorage.save(filter);
    setFilters(prev => prev.map(f => f.id === filter.id ? filter : f));
    if (activeFilter?.id === filter.id) {
      setActiveFilterState(filter);
    }
  }, [activeFilter?.id]);

  const deleteFilter = useCallback(async (id: string) => {
    await filterStorage.delete(id);
    setFilters(prev => prev.filter(f => f.id !== id));
    if (activeFilter?.id === id) {
      setActiveFilterState(null);
    }
  }, [activeFilter?.id]);

  const setActiveFilter = useCallback(async (filter: FilterCriteria | null) => {
    if (filter) {
      await filterStorage.setActive(filter.id);
      setActiveFilterState(filter);
    }
  }, []);

  return {
    filters,
    activeFilter,
    loading,
    addFilter,
    updateFilter,
    deleteFilter,
    setActiveFilter,
  };
};
