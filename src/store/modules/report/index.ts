import { computed, reactive, ref } from 'vue';
import { defineStore } from 'pinia';
import { useLoading } from '@sa/hooks';
import { exportManufacturingReport, fetchManufacturingReport } from '@/service/api';
import { SetupStoreId } from '@/enum';

export const useReportStore = defineStore(SetupStoreId.Report, () => {
  const { loading: reportLoading, startLoading, endLoading } = useLoading();
  const { loading: exportLoading, startLoading: startExportLoading, endLoading: endExportLoading } = useLoading();

  // State
  const currentQuery = ref<Api.Report.ManufacturingReportQuery | null>(null);
  const reportData = ref<Api.Report.ManufacturingReportResponse | null>(null);
  const error = ref<string | null>(null);
  const lastUpdated = ref<string | null>(null);

  // Reactive filters state
  const filters = reactive({
    startDate: '',
    endDate: '',
    granularity: 'month' as Api.Report.Granularity,
    category: undefined as Api.Report.KpiCategory | undefined
  });

  // Computed getters for KPI categories
  const productionKpis = computed(() => {
    return reportData.value?.kpiGroups.find(group => group.category === 'production') || null;
  });

  const costKpis = computed(() => {
    return reportData.value?.kpiGroups.find(group => group.category === 'cost') || null;
  });

  const personnelKpis = computed(() => {
    return reportData.value?.kpiGroups.find(group => group.category === 'personnel') || null;
  });

  const orderKpis = computed(() => {
    return reportData.value?.kpiGroups.find(group => group.category === 'order') || null;
  });

  // Summary metrics getter
  const summaryMetrics = computed(() => {
    return (
      reportData.value?.summary || {
        totalProduction: 0,
        totalCost: 0,
        totalPersonnel: 0,
        totalOrders: 0,
        overallEfficiency: 0
      }
    );
  });

  // Trend data getter
  const trendData = computed(() => {
    return reportData.value?.trendSeries || [];
  });

  // Export data getter
  const exportData = computed(() => {
    return reportData.value?.exportRows || [];
  });

  // Loading states
  const isLoading = computed(() => reportLoading.value);
  const isExporting = computed(() => exportLoading.value);

  // Has data flag
  const hasData = computed(() => reportData.value !== null);

  // Actions
  /**
   * Fetch manufacturing report data
   * @param query Report query parameters
   */
  async function fetchReport(query: Api.Report.ManufacturingReportQuery) {
    startLoading();
    error.value = null;

    try {
      const { data, error: serviceError } = await fetchManufacturingReport(query);

      if (!error && data) {
        reportData.value = data;
        currentQuery.value = query;
        lastUpdated.value = new Date().toISOString();

        // Update filters
        filters.startDate = query.startDate;
        filters.endDate = query.endDate;
        filters.granularity = query.granularity;
        filters.category = query.category;

        return true;
      }

      if (serviceError) {
        error.value = 'Failed to fetch report data';
      }

      return false;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An unexpected error occurred';
      return false;
    } finally {
      endLoading();
    }
  }

  /**
   * Export report data
   * @param format Export format
   * @param includeTrends Whether to include trend data
   */
  async function exportReport(format: 'csv' | 'excel' | 'pdf', includeTrends = true) {
    if (!currentQuery.value) {
      error.value = 'No report data available to export';
      return null;
    }

    startExportLoading();
    error.value = null;

    try {
      const exportRequest: Api.Report.ExportRequest = {
        query: currentQuery.value,
        format,
        includeTrends
      };

      const { data, error: serviceError } = await exportManufacturingReport(exportRequest);

      if (!error && data) {
        return data;
      }

      if (serviceError) {
        error.value = 'Failed to export report';
      }

      return null;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An unexpected error occurred during export';
      return null;
    } finally {
      endExportLoading();
    }
  }

  /**
   * Update filters and optionally refetch data
   * @param newFilters New filter values
   * @param autoFetch Whether to automatically fetch data after filter update
   */
  function updateFilters(newFilters: Partial<typeof filters>, autoFetch = true) {
    Object.assign(filters, newFilters);

    if (autoFetch && filters.startDate && filters.endDate) {
      const query: Api.Report.ManufacturingReportQuery = {
        startDate: filters.startDate,
        endDate: filters.endDate,
        granularity: filters.granularity,
        category: filters.category
      };

      fetchReport(query);
    }
  }

  /**
   * Reset report store to initial state
   */
  function resetStore() {
    reportData.value = null;
    currentQuery.value = null;
    error.value = null;
    lastUpdated.value = null;

    // Reset filters to defaults
    filters.startDate = '';
    filters.endDate = '';
    filters.granularity = 'month';
    filters.category = undefined;

    // Reset loading states
    endLoading();
    endExportLoading();
  }

  /**
   * Clear error state
   */
  function clearError() {
    error.value = null;
  }

  /**
   * Refresh current report data
   */
  async function refreshReport() {
    if (currentQuery.value) {
      return fetchReport(currentQuery.value);
    }

    error.value = 'No report query available for refresh';
    return false;
  }

  return {
    // State
    currentQuery,
    reportData,
    error,
    lastUpdated,
    filters,

    // Computed
    productionKpis,
    costKpis,
    personnelKpis,
    orderKpis,
    summaryMetrics,
    trendData,
    exportData,
    isLoading,
    isExporting,
    hasData,

    // Actions
    fetchReport,
    exportReport,
    updateFilters,
    resetStore,
    clearError,
    refreshReport
  };
});
