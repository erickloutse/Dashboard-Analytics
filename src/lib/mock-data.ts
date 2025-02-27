import { AnalyticsData } from './types';

// Generate dates for the past 30 days
const generateDates = (days: number) => {
  const dates = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    dates.push(date);
  }
  
  return dates;
};

// Generate random visits
const generateVisits = (count: number) => {
  const visits = [];
  const pages = [
    '/accueil',
    '/produits',
    '/blog',
    '/contact',
    '/a-propos',
    '/services',
    '/faq',
    '/politique-de-confidentialite',
  ];
  
  const countries = [
    'France',
    'États-Unis',
    'Allemagne',
    'Royaume-Uni',
    'Canada',
    'Espagne',
    'Italie',
    'Japon',
    'Australie',
    'Brésil',
  ];
  
  const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge', 'Other'];
  const devices = ['desktop', 'mobile', 'tablet'];
  
  const dates = generateDates(30);
  
  for (let i = 0; i < count; i++) {
    const randomDate = dates[Math.floor(Math.random() * dates.length)];
    const randomHour = Math.floor(Math.random() * 24);
    const randomMinute = Math.floor(Math.random() * 60);
    
    randomDate.setHours(randomHour, randomMinute);
    
    visits.push({
      id: `visit-${i}`,
      timestamp: new Date(randomDate),
      page: pages[Math.floor(Math.random() * pages.length)],
      duration: Math.floor(Math.random() * 600), // 0-10 minutes in seconds
      country: countries[Math.floor(Math.random() * countries.length)],
      device: devices[Math.floor(Math.random() * devices.length)],
      browser: browsers[Math.floor(Math.random() * browsers.length)],
    });
  }
  
  return visits;
};

// Generate page views statistics
const generatePageViews = (visits: AnalyticsData['visits']) => {
  const pageMap = new Map<string, { views: number; totalTime: number }>();
  
  visits.forEach(visit => {
    const existing = pageMap.get(visit.page) || { views: 0, totalTime: 0 };
    pageMap.set(visit.page, {
      views: existing.views + 1,
      totalTime: existing.totalTime + visit.duration,
    });
  });
  
  return Array.from(pageMap.entries()).map(([page, data]) => ({
    page,
    views: data.views,
    avgTimeOnPage: Math.round(data.totalTime / data.views),
  }));
};

// Generate geo data
const generateGeoData = (visits: AnalyticsData['visits']) => {
  const countryMap = new Map<string, number>();
  
  visits.forEach(visit => {
    const existing = countryMap.get(visit.country) || 0;
    countryMap.set(visit.country, existing + 1);
  });
  
  return Array.from(countryMap.entries()).map(([country, visitors]) => ({
    country,
    visitors,
  }));
};

// Generate daily visits
const generateDailyVisits = (visits: AnalyticsData['visits']) => {
  const dates = generateDates(30);
  
  return dates.map(date => {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);
    
    const dayVisits = visits.filter(
      visit => visit.timestamp >= dayStart && visit.timestamp <= dayEnd
    );
    
    // Count unique visitors (simplified)
    const uniqueVisitors = new Set(dayVisits.map(visit => visit.id.split('-')[0])).size;
    
    return {
      date,
      visitors: uniqueVisitors,
      pageviews: dayVisits.length,
    };
  });
};

// Generate device statistics
const generateDeviceStats = (visits: AnalyticsData['visits']) => {
  const devices = {
    desktop: 0,
    mobile: 0,
    tablet: 0,
  };
  
  visits.forEach(visit => {
    if (visit.device === 'desktop') devices.desktop++;
    else if (visit.device === 'mobile') devices.mobile++;
    else if (visit.device === 'tablet') devices.tablet++;
  });
  
  return devices;
};

// Generate browser statistics
const generateBrowserStats = (visits: AnalyticsData['visits']) => {
  const browsers = {
    chrome: 0,
    firefox: 0,
    safari: 0,
    edge: 0,
    other: 0,
  };
  
  visits.forEach(visit => {
    if (visit.browser === 'Chrome') browsers.chrome++;
    else if (visit.browser === 'Firefox') browsers.firefox++;
    else if (visit.browser === 'Safari') browsers.safari++;
    else if (visit.browser === 'Edge') browsers.edge++;
    else browsers.other++;
  });
  
  return browsers;
};

// Calculate bounce rate
const calculateBounceRate = (visits: AnalyticsData['visits']) => {
  // Group visits by session (simplified)
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
};

// Generate mock data
const visits = generateVisits(1000);
const pageViews = generatePageViews(visits);
const geoData = generateGeoData(visits);
const dailyVisits = generateDailyVisits(visits);
const devices = generateDeviceStats(visits);
const browsers = generateBrowserStats(visits);
const bounceRate = calculateBounceRate(visits);

// Calculate average session duration
const avgSessionDuration = Math.round(
  visits.reduce((sum, visit) => sum + visit.duration, 0) / visits.length
);

export const mockData: AnalyticsData = {
  totalVisits: visits.length,
  activeUsers: Math.floor(Math.random() * 100) + 50, // Random number between 50-150
  avgSessionDuration,
  bounceRate,
  visits,
  pageViews,
  geoData,
  dailyVisits,
  devices,
  browsers,
};