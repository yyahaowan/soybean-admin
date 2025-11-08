// import { request } from '../request';

/**
 * Fetch manufacturing report data
 *
 * @param query Report query parameters
 * @returns Promise resolving to manufacturing report response
 */
export async function fetchManufacturingReport(query: Api.Report.ManufacturingReportQuery) {
  // For now, return mock data. This will be replaced with actual HTTP calls later.
  return mockManufacturingReportResponse(query);
}

/**
 * Export manufacturing report
 *
 * @param exportRequest Export request parameters
 * @returns Promise resolving to export response
 */
export async function exportManufacturingReport(exportRequest: Api.Report.ExportRequest) {
  // Mock export functionality
  const mockResponse: Api.Report.ExportResponse = {
    downloadUrl: `/api/reports/download/${Date.now()}.${exportRequest.format}`,
    fileName: `manufacturing-report-${new Date().toISOString().split('T')[0]}.${exportRequest.format}`,
    fileSize: 1024 * 1024 * 2.5, // 2.5 MB mock size
    exportedAt: new Date().toISOString()
  };

  return { data: mockResponse, error: null };
}

/**
 * Mock data generator for manufacturing report
 * This simulates the backend response structure
 */
function mockManufacturingReportResponse(query: Api.Report.ManufacturingReportQuery) {
  const generatedAt = new Date().toISOString();

  // Generate mock KPI groups
  const kpiGroups: Api.Report.KpiGroup[] = [
    {
      category: 'production',
      name: 'Production Metrics',
      summaryValue: 125000,
      summaryUnit: 'units',
      metrics: [
        {
          id: 'total-output',
          name: 'Total Output',
          value: 125000,
          unit: 'units',
          changePercent: 8.5,
          trend: 'up'
        },
        {
          id: 'production-efficiency',
          name: 'Production Efficiency',
          value: 92.3,
          unit: '%',
          changePercent: 2.1,
          trend: 'up'
        },
        {
          id: 'quality-rate',
          name: 'Quality Rate',
          value: 98.7,
          unit: '%',
          changePercent: -0.3,
          trend: 'down'
        }
      ]
    },
    {
      category: 'cost',
      name: 'Cost Analysis',
      summaryValue: 2500000,
      summaryUnit: 'USD',
      metrics: [
        {
          id: 'total-cost',
          name: 'Total Cost',
          value: 2500000,
          unit: 'USD',
          changePercent: 5.2,
          trend: 'up'
        },
        {
          id: 'cost-per-unit',
          name: 'Cost Per Unit',
          value: 20.0,
          unit: 'USD',
          changePercent: -3.1,
          trend: 'down'
        },
        {
          id: 'material-cost',
          name: 'Material Cost',
          value: 1500000,
          unit: 'USD',
          changePercent: 4.8,
          trend: 'up'
        }
      ]
    },
    {
      category: 'personnel',
      name: 'Personnel Metrics',
      summaryValue: 450,
      summaryUnit: 'employees',
      metrics: [
        {
          id: 'total-employees',
          name: 'Total Employees',
          value: 450,
          unit: 'employees',
          changePercent: 2.3,
          trend: 'up'
        },
        {
          id: 'productivity-per-employee',
          name: 'Productivity Per Employee',
          value: 278,
          unit: 'units/employee',
          changePercent: 6.0,
          trend: 'up'
        },
        {
          id: 'overtime-hours',
          name: 'Overtime Hours',
          value: 1250,
          unit: 'hours',
          changePercent: -8.5,
          trend: 'down'
        }
      ]
    },
    {
      category: 'order',
      name: 'Order Management',
      summaryValue: 3200,
      summaryUnit: 'orders',
      metrics: [
        {
          id: 'total-orders',
          name: 'Total Orders',
          value: 3200,
          unit: 'orders',
          changePercent: 12.5,
          trend: 'up'
        },
        {
          id: 'on-time-delivery',
          name: 'On-Time Delivery Rate',
          value: 94.2,
          unit: '%',
          changePercent: 1.8,
          trend: 'up'
        },
        {
          id: 'order-cycle-time',
          name: 'Order Cycle Time',
          value: 4.2,
          unit: 'days',
          changePercent: -5.2,
          trend: 'down'
        }
      ]
    }
  ];

  // Filter by category if specified
  const filteredKpiGroups = query.category ? kpiGroups.filter(group => group.category === query.category) : kpiGroups;

  // Generate mock trend series
  const trendSeries: Api.Report.TrendSeries[] = [
    {
      id: 'production-trend',
      name: 'Production Output',
      color: '#10b981',
      data: generateTrendData(query, 100000, 130000)
    },
    {
      id: 'cost-trend',
      name: 'Total Cost',
      color: '#ef4444',
      data: generateTrendData(query, 2000000, 2800000)
    },
    {
      id: 'efficiency-trend',
      name: 'Efficiency Rate',
      color: '#3b82f6',
      data: generateTrendData(query, 85, 95)
    }
  ];

  // Generate mock export rows
  const exportRows: Api.Report.ExportRow[] = [];
  let rowId = 1;

  filteredKpiGroups.forEach(group => {
    group.metrics.forEach(metric => {
      exportRows.push({
        id: `row-${rowId}`,
        category: group.category,
        data: {
          Category: group.name,
          Metric: metric.name,
          Value: `${metric.value} ${metric.unit}`,
          Change: metric.changePercent ? `${metric.changePercent > 0 ? '+' : ''}${metric.changePercent}%` : 'N/A',
          Trend: metric.trend,
          Period: `${query.startDate} - ${query.endDate}`
        }
      });
      rowId += 1;
    });
  });

  const response: Api.Report.ManufacturingReportResponse = {
    generatedAt,
    period: {
      start: query.startDate,
      end: query.endDate,
      granularity: query.granularity
    },
    kpiGroups: filteredKpiGroups,
    trendSeries,
    exportRows,
    summary: {
      totalProduction: 125000,
      totalCost: 2500000,
      totalPersonnel: 450,
      totalOrders: 3200,
      overallEfficiency: 92.3
    }
  };

  return { data: response, error: null };
}

/**
 * Generate trend data points based on query parameters
 */
function generateTrendData(
  query: Api.Report.ManufacturingReportQuery,
  minValue: number,
  maxValue: number
): Api.Report.TrendDataPoint[] {
  const startDate = new Date(query.startDate);
  const endDate = new Date(query.endDate);
  const dataPoints: Api.Report.TrendDataPoint[] = [];

  if (query.granularity === 'month') {
    const loopDate = new Date(startDate);
    for (;;) {
      if (loopDate > endDate) break;

      const value = minValue + Math.random() * (maxValue - minValue);
      dataPoints.push({
        period: loopDate.toISOString().split('T')[0],
        value: Math.round(value * 100) / 100
      });
      loopDate.setMonth(loopDate.getMonth() + 1);
    }
  } else {
    // Quarterly granularity
    const loopDate = new Date(startDate);
    for (;;) {
      if (loopDate > endDate) break;

      const value = minValue + Math.random() * (maxValue - minValue);
      const quarter = Math.floor(loopDate.getMonth() / 3) + 1;
      dataPoints.push({
        period: `${loopDate.getFullYear()}-Q${quarter}`,
        value: Math.round(value * 100) / 100
      });
      loopDate.setMonth(loopDate.getMonth() + 3);
    }
  }

  return dataPoints;
}
