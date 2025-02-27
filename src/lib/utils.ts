import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { AnalyticsData, FilterOptions } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
  }).format(new Date(date));
}

export function filterData(data: AnalyticsData, filters: FilterOptions): AnalyticsData {
  // Filter visits based on date range, pages, devices, and countries
  const filteredVisits = data.visits.filter(visit => {
    const visitDate = new Date(visit.timestamp);
    const isInDateRange = visitDate >= filters.dateRange.from && visitDate <= filters.dateRange.to;
    const isMatchingPage = filters.pages.length === 0 || filters.pages.includes(visit.page);
    const isMatchingDevice = filters.devices.length === 0 || filters.devices.includes(visit.device);
    const isMatchingCountry = filters.countries.length === 0 || filters.countries.includes(visit.country);
    
    return isInDateRange && isMatchingPage && isMatchingDevice && isMatchingCountry;
  });

  // Calculate filtered page views
  const pageViewsMap = new Map<string, { views: number, totalTime: number }>();
  filteredVisits.forEach(visit => {
    const existing = pageViewsMap.get(visit.page) || { views: 0, totalTime: 0 };
    pageViewsMap.set(visit.page, {
      views: existing.views + 1,
      totalTime: existing.totalTime + visit.duration,
    });
  });

  const filteredPageViews = Array.from(pageViewsMap.entries()).map(([page, data]) => ({
    page,
    views: data.views,
    avgTimeOnPage: data.views > 0 ? Math.round(data.totalTime / data.views) : 0,
  }));

  // Calculate filtered geo data
  const geoDataMap = new Map<string, number>();
  filteredVisits.forEach(visit => {
    const existing = geoDataMap.get(visit.country) || 0;
    geoDataMap.set(visit.country, existing + 1);
  });

  const filteredGeoData = Array.from(geoDataMap.entries()).map(([country, visitors]) => ({
    country,
    visitors,
  }));

  // Filter daily visits based on date range
  const filteredDailyVisits = data.dailyVisits.filter(day => {
    const dayDate = new Date(day.date);
    return dayDate >= filters.dateRange.from && dayDate <= filters.dateRange.to;
  });

  // Calculate device and browser stats
  const devices = {
    desktop: 0,
    mobile: 0,
    tablet: 0,
  };

  const browsers = {
    chrome: 0,
    firefox: 0,
    safari: 0,
    edge: 0,
    other: 0,
  };

  filteredVisits.forEach(visit => {
    // Update device counts
    if (visit.device === 'desktop') devices.desktop++;
    else if (visit.device === 'mobile') devices.mobile++;
    else if (visit.device === 'tablet') devices.tablet++;

    // Update browser counts
    if (visit.browser === 'Chrome') browsers.chrome++;
    else if (visit.browser === 'Firefox') browsers.firefox++;
    else if (visit.browser === 'Safari') browsers.safari++;
    else if (visit.browser === 'Edge') browsers.edge++;
    else browsers.other++;
  });

  return {
    ...data,
    totalVisits: filteredVisits.length,
    avgSessionDuration: filteredVisits.length > 0 
      ? Math.round(filteredVisits.reduce((sum, visit) => sum + visit.duration, 0) / filteredVisits.length) 
      : 0,
    bounceRate: calculateBounceRate(filteredVisits),
    visits: filteredVisits,
    pageViews: filteredPageViews,
    geoData: filteredGeoData,
    dailyVisits: filteredDailyVisits,
    devices,
    browsers,
  };
}

function calculateBounceRate(visits: AnalyticsData['visits']): number {
  if (visits.length === 0) return 0;
  
  // Group visits by session (simplified for this example)
  const sessions = new Map<string, number>();
  visits.forEach(visit => {
    const sessionId = visit.id.split('-')[0]; // Simplified session grouping
    const count = (sessions.get(sessionId) || 0) + 1;
    sessions.set(sessionId, count);
  });
  
  // Count single-page sessions
  const singlePageSessions = Array.from(sessions.values()).filter(count => count === 1).length;
  
  // Calculate bounce rate
  return (singlePageSessions / sessions.size) * 100;
}