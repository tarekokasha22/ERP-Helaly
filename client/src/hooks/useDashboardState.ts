import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useRef, useEffect } from 'react';

/**
 * SENIOR DEVELOPER PATTERN: Centralized Dashboard State Management Hook
 * 
 * This hook provides bulletproof state management for dashboard synchronization.
 * It implements professional patterns for immediate state invalidation,
 * optimistic updates, and comprehensive debugging.
 */

interface DashboardStateOptions {
  enableDebugging?: boolean;
  enableOptimisticUpdates?: boolean;
  refetchDelay?: number;
}

export const useDashboardState = (options: DashboardStateOptions = {}) => {
  const queryClient = useQueryClient();
  const {
    enableDebugging = true,
    enableOptimisticUpdates = true,
    refetchDelay = 0
  } = options;

  // Debugging reference for tracking operations
  const operationCount = useRef(0);
  const lastOperation = useRef<string>('');

  const debugLog = useCallback((message: string, data?: any) => {
    if (enableDebugging) {
      const timestamp = new Date().toISOString();
      const operationId = ++operationCount.current;
      console.log(`🎯 [DashboardState-${operationId}] ${timestamp}: ${message}`, data || '');
      lastOperation.current = message;
    }
  }, [enableDebugging]);

  /**
   * CRITICAL FUNCTION: Immediate State Invalidation
   * This is the nuclear option - it forces ALL related data to refresh
   */
  const invalidateAllDashboardData = useCallback(async () => {
    debugLog('🚀 EXECUTING IMMEDIATE STATE INVALIDATION...');

    const startTime = performance.now();

    try {
      // Phase 1: Invalidate all related queries
      const invalidationPromises = [
        queryClient.invalidateQueries(['dashboard']),
        queryClient.invalidateQueries(['projects']),
        queryClient.invalidateQueries(['sections']),
        queryClient.invalidateQueries(['spendings']),
        queryClient.invalidateQueries(['inventory']),
        queryClient.invalidateQueries(['employees']),
        queryClient.invalidateQueries(['payments']),
        queryClient.invalidateQueries(['users'])
      ];

      await Promise.all(invalidationPromises);
      debugLog('✅ Cache invalidation completed');

      // Phase 2: Force immediate refetch of critical data
      if (refetchDelay === 0) {
        const refetchPromises = [
          queryClient.refetchQueries(['dashboard']),
          queryClient.refetchQueries(['projects']),
          queryClient.refetchQueries(['sections']),
          queryClient.refetchQueries(['spendings'])
        ];

        await Promise.all(refetchPromises);
        debugLog('⚡ Immediate refetch completed for all critical queries');
      } else {
        // Delayed refetch for performance optimization
        setTimeout(async () => {
          await Promise.all([
            queryClient.refetchQueries(['dashboard']),
            queryClient.refetchQueries(['projects']),
            queryClient.refetchQueries(['sections']),
            queryClient.refetchQueries(['spendings'])
          ]);
          debugLog('⏰ Delayed refetch completed for all critical queries');
        }, refetchDelay);
      }

      const endTime = performance.now();
      debugLog(`🏁 State invalidation completed in ${(endTime - startTime).toFixed(2)}ms`);

      return true;
    } catch (error) {
      debugLog('❌ State invalidation failed', error);
      console.error('Dashboard state invalidation error:', error);
      return false;
    }
  }, [queryClient, debugLog, refetchDelay]);

  /**
   * OPTIMISTIC UPDATE: Project Operations
   * Updates UI immediately, then syncs with server
   */
  const optimisticProjectUpdate = useCallback((operation: 'create' | 'update' | 'delete', projectData?: any) => {
    if (!enableOptimisticUpdates) return;

    debugLog(`🔮 Optimistic ${operation} for project`, projectData);

    try {
      // Get current projects data
      const currentProjects = queryClient.getQueryData(['projects']) as any[] || [];

      let optimisticProjects;

      switch (operation) {
        case 'create':
          optimisticProjects = [...currentProjects, { ...projectData, id: `temp-${Date.now()}` }];
          break;
        case 'update':
          optimisticProjects = currentProjects.map(p =>
            p.id === projectData.id ? { ...p, ...projectData } : p
          );
          break;
        case 'delete':
          optimisticProjects = currentProjects.filter(p => p.id !== projectData.id);
          break;
        default:
          return;
      }

      // Update cache immediately
      queryClient.setQueryData(['projects'], optimisticProjects);
      debugLog(`✨ Optimistic UI updated for ${operation}`);

    } catch (error) {
      debugLog('❌ Optimistic update failed', error);
    }
  }, [queryClient, enableOptimisticUpdates, debugLog]);

  /**
   * ROLLBACK FUNCTION: For failed operations
   */
  const rollbackOptimisticUpdate = useCallback(() => {
    debugLog('🔄 Rolling back optimistic updates...');
    invalidateAllDashboardData();
  }, [invalidateAllDashboardData, debugLog]);

  /**
   * PROJECT OPERATIONS: Professional wrappers with full state management
   */
  const projectOperations = {
    onCreate: async (projectData: any) => {
      debugLog('📝 Project creation initiated', projectData);
      if (enableOptimisticUpdates) {
        optimisticProjectUpdate('create', projectData);
      }
      await invalidateAllDashboardData();

      // Dispatch event for cross-component communication
      window.dispatchEvent(new CustomEvent('projectAdded', {
        detail: { project: projectData, timestamp: Date.now() }
      }));
    },

    onUpdate: async (projectData: any) => {
      debugLog('✏️ Project update initiated', projectData);
      if (enableOptimisticUpdates) {
        optimisticProjectUpdate('update', projectData);
      }
      await invalidateAllDashboardData();

      window.dispatchEvent(new CustomEvent('projectUpdated', {
        detail: { project: projectData, timestamp: Date.now() }
      }));
    },

    onDelete: async (projectId: string) => {
      debugLog('🗑️ Project deletion initiated', { projectId });
      if (enableOptimisticUpdates) {
        optimisticProjectUpdate('delete', { id: projectId });
      }
      await invalidateAllDashboardData();

      window.dispatchEvent(new CustomEvent('projectDeleted', {
        detail: { projectId, timestamp: Date.now() }
      }));
    }
  };

  /**
   * SECTION OPERATIONS: Similar pattern for sections
   */
  const sectionOperations = {
    onCreate: async (sectionData: any) => {
      debugLog('📋 Section creation initiated', sectionData);
      await invalidateAllDashboardData();
      window.dispatchEvent(new CustomEvent('sectionAdded', { detail: sectionData }));
    },

    onUpdate: async (sectionData: any) => {
      debugLog('✏️ Section update initiated', sectionData);
      await invalidateAllDashboardData();
      window.dispatchEvent(new CustomEvent('sectionUpdated', { detail: sectionData }));
    },

    onDelete: async (sectionId: string) => {
      debugLog('🗑️ Section deletion initiated', { sectionId });
      await invalidateAllDashboardData();
      window.dispatchEvent(new CustomEvent('sectionDeleted', { detail: { sectionId } }));
    }
  };

  /**
   * SPENDING OPERATIONS: Financial data management
   */
  const spendingOperations = {
    onCreate: async (spendingData: any) => {
      debugLog('💰 Spending creation initiated', spendingData);
      await invalidateAllDashboardData();
      window.dispatchEvent(new CustomEvent('spendingAdded', { detail: spendingData }));
    },

    onUpdate: async (spendingData: any) => {
      debugLog('✏️ Spending update initiated', spendingData);
      await invalidateAllDashboardData();
      window.dispatchEvent(new CustomEvent('spendingUpdated', { detail: spendingData }));
    },

    onDelete: async (spendingId: string) => {
      debugLog('🗑️ Spending deletion initiated', { spendingId });
      await invalidateAllDashboardData();
      window.dispatchEvent(new CustomEvent('spendingDeleted', { detail: { spendingId } }));
    }
  };

  /**
   * HEALTH CHECK: Verify state management is working
   */
  const healthCheck = useCallback(() => {
    const health = {
      queryClient: !!queryClient,
      lastOperation: lastOperation.current,
      operationCount: operationCount.current,
      timestamp: new Date().toISOString()
    };

    debugLog('🏥 Dashboard state health check', health);
    return health;
  }, [queryClient, debugLog]);

  // Auto-health check on mount
  useEffect(() => {
    debugLog('🚀 Dashboard state management initialized');
    healthCheck();
  }, [debugLog, healthCheck]);

  return {
    // Core functions
    invalidateAllDashboardData,
    rollbackOptimisticUpdate,
    healthCheck,

    // Operation handlers
    projectOperations,
    sectionOperations,
    spendingOperations,

    // Debugging
    debugLog,
    lastOperation: lastOperation.current,
    operationCount: operationCount.current
  };
};

export default useDashboardState;
