/**
 * Namespace Api
 *
 * All backend api type
 */
declare namespace Api {
  namespace Common {
    /** common params of paginating */
    interface PaginatingCommonParams {
      /** current page number */
      current: number;
      /** page size */
      size: number;
      /** total count */
      total: number;
    }

    /** common params of paginating query list data */
    interface PaginatingQueryRecord<T = any> extends PaginatingCommonParams {
      records: T[];
    }

    /** common search params of table */
    type CommonSearchParams = Pick<Common.PaginatingCommonParams, 'current' | 'size'>;

    /**
     * enable status
     *
     * - "1": enabled
     * - "2": disabled
     */
    type EnableStatus = '1' | '2';

    /** common record */
    type CommonRecord<T = any> = {
      /** record id */
      id: number;
      /** record creator */
      createBy: string;
      /** record create time */
      createTime: string;
      /** record updater */
      updateBy: string;
      /** record update time */
      updateTime: string;
      /** record status */
      status: EnableStatus | null;
    } & T;
  }

  /**
   * namespace Auth
   *
   * backend api module: "auth"
   */
  namespace Auth {
    interface LoginToken {
      token: string;
      refreshToken: string;
    }

    interface UserInfo {
      userId: string;
      userName: string;
      roles: string[];
      buttons: string[];
    }
  }

  /**
   * namespace Route
   *
   * backend api module: "route"
   */
  namespace Route {
    type ElegantConstRoute = import('@elegant-router/types').ElegantConstRoute;

    interface MenuRoute extends ElegantConstRoute {
      id: string;
    }

    interface UserRoute {
      routes: MenuRoute[];
      home: import('@elegant-router/types').LastLevelRouteKey;
    }
  }

  /**
   * namespace Report
   *
   * backend api module: "report"
   */
  namespace Report {
    /** Report granularity type */
    type Granularity = 'month' | 'quarter';

    /** KPI category type */
    type KpiCategory = 'production' | 'cost' | 'personnel' | 'order';

    /** Manufacturing report query parameters */
    interface ManufacturingReportQuery {
      /** Start date for the report period */
      startDate: string;
      /** End date for the report period */
      endDate: string;
      /** Data granularity */
      granularity: Granularity;
      /** Optional KPI category filter */
      category?: KpiCategory;
    }

    /** KPI metric data point */
    interface KpiMetric {
      /** Metric identifier */
      id: string;
      /** Metric name */
      name: string;
      /** Metric value */
      value: number;
      /** Unit of measurement */
      unit: string;
      /** Change percentage compared to previous period */
      changePercent?: number;
      /** Trend direction */
      trend: 'up' | 'down' | 'stable';
    }

    /** KPI group containing related metrics */
    interface KpiGroup {
      /** Group category */
      category: KpiCategory;
      /** Group name */
      name: string;
      /** List of KPI metrics */
      metrics: KpiMetric[];
      /** Summary value for the group */
      summaryValue: number;
      /** Summary unit */
      summaryUnit: string;
    }

    /** Trend data point for time series */
    interface TrendDataPoint {
      /** Timestamp or period label */
      period: string;
      /** Value at this point */
      value: number;
      /** Optional secondary value for comparison */
      secondaryValue?: number;
    }

    /** Trend series for a specific metric */
    interface TrendSeries {
      /** Series identifier */
      id: string;
      /** Series name */
      name: string;
      /** Data points */
      data: TrendDataPoint[];
      /** Color for visualization */
      color?: string;
    }

    /** Export row data */
    interface ExportRow {
      /** Row identifier */
      id: string;
      /** Row data as key-value pairs */
      data: Record<string, string | number>;
      /** Row category */
      category: KpiCategory;
    }

    /** Manufacturing report response */
    interface ManufacturingReportResponse {
      /** Report generation timestamp */
      generatedAt: string;
      /** Report period */
      period: {
        start: string;
        end: string;
        granularity: Granularity;
      };
      /** KPI groups data */
      kpiGroups: KpiGroup[];
      /** Trend series data */
      trendSeries: TrendSeries[];
      /** Export-ready rows */
      exportRows: ExportRow[];
      /** Summary statistics */
      summary: {
        totalProduction: number;
        totalCost: number;
        totalPersonnel: number;
        totalOrders: number;
        overallEfficiency: number;
      };
    }

    /** Report export request */
    interface ExportRequest {
      /** Report query parameters */
      query: ManufacturingReportQuery;
      /** Export format */
      format: 'csv' | 'excel' | 'pdf';
      /** Include trend data */
      includeTrends: boolean;
    }

    /** Report export response */
    interface ExportResponse {
      /** Download URL */
      downloadUrl: string;
      /** File name */
      fileName: string;
      /** File size in bytes */
      fileSize: number;
      /** Export timestamp */
      exportedAt: string;
    }
  }
}
