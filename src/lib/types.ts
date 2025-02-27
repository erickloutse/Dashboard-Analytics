export interface Visit {
  id: string;
  timestamp: Date;
  page: string;
  duration: number;
  country: string;
  device: string;
  browser: string;
}

export interface PageView {
  page: string;
  views: number;
  avgTimeOnPage: number;
}

export interface GeoData {
  country: string;
  visitors: number;
}

export interface DailyVisit {
  date: Date;
  visitors: number;
  pageviews: number;
}

export interface AnalyticsData {
  totalVisits: number;
  activeUsers: number;
  avgSessionDuration: number;
  bounceRate: number;
  visits: Visit[];
  pageViews: PageView[];
  geoData: GeoData[];
  dailyVisits: DailyVisit[];
  devices: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  browsers: {
    chrome: number;
    firefox: number;
    safari: number;
    edge: number;
    other: number;
  };
}

export interface FilterOptions {
  dateRange: {
    from: Date;
    to: Date;
  };
  pages: string[];
  devices: string[];
  countries: string[];
}