import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import { mockData } from './mock-data';

// API base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000, // Add timeout to prevent long-hanging requests
});

// Socket.io connection
let socket: Socket;

export const initializeSocket = () => {
  if (!socket) {
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    socket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });
    
    socket.on('connect', () => {
      console.log('Connected to analytics server');
    });
    
    socket.on('disconnect', () => {
      console.log('Disconnected from analytics server');
    });
  }
  
  return socket;
};

// Analytics API functions
export const fetchOverviewStats = async (dateRange: { from: Date; to: Date }) => {
  try {
    const response = await api.get('/stats/overview', {
      params: {
        startDate: dateRange.from.toISOString(),
        endDate: dateRange.to.toISOString(),
      },
    });
    return response.data;
  } catch (error) {
    // Log warning instead of error since we have a fallback
    console.warn('Error fetching overview stats (using fallback data):', error);
    return mockData;
  }
};

export const fetchActiveUsers = async () => {
  try {
    const response = await api.get('/stats/active-users');
    return response.data.activeUsers;
  } catch (error) {
    console.warn('Error fetching active users (using fallback data):', error);
    return mockData.activeUsers;
  }
};

export const fetchVisits = async (params: {
  page?: number;
  limit?: number;
  startDate?: Date;
  endDate?: Date;
  country?: string;
  device?: string;
  browser?: string;
  path?: string;
}) => {
  try {
    const response = await api.get('/visits', { 
      params: {
        ...params,
        startDate: params.startDate?.toISOString(),
        endDate: params.endDate?.toISOString(),
      }
    });
    return response.data;
  } catch (error) {
    console.warn('Error fetching visits (using fallback data):', error);
    return { visits: mockData.visits };
  }
};

export const fetchPages = async (params: {
  sortBy?: string;
  order?: 'asc' | 'desc';
  limit?: number;
  search?: string;
}) => {
  try {
    const response = await api.get('/pages', { params });
    return response.data;
  } catch (error) {
    console.warn('Error fetching pages (using fallback data):', error);
    return mockData.pageViews;
  }
};

// Tracking function to record a visit
export const recordVisit = async (visitData: {
  page: string;
  duration?: number;
  referrer?: string;
  sessionId: string;
}) => {
  try {
    // Get browser and device info
    const userAgent = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isTablet = /iPad|Android(?!.*Mobile)/i.test(userAgent);
    
    let device = 'desktop';
    if (isMobile) device = 'mobile';
    if (isTablet) device = 'tablet';
    
    let browser = 'Other';
    if (userAgent.indexOf('Chrome') !== -1) browser = 'Chrome';
    else if (userAgent.indexOf('Firefox') !== -1) browser = 'Firefox';
    else if (userAgent.indexOf('Safari') !== -1) browser = 'Safari';
    else if (userAgent.indexOf('Edge') !== -1) browser = 'Edge';
    
    // Get country (in a real app, this would be determined server-side or via a geolocation API)
    const country = 'France'; // Placeholder
    
    const response = await api.post('/visits', {
      ...visitData,
      device,
      browser,
      country,
      userAgent: userAgent.substring(0, 255) // Limit userAgent length
    });
    
    return response.data;
  } catch (error) {
    // Instead of just logging the error, return a mock response to prevent UI errors
    const mockVisit = {
      id: `visit-${Date.now()}`,
      timestamp: new Date(),
      ...visitData,
      device: 'desktop',
      browser: 'Unknown',
      country: 'Unknown'
    };
    
    // Log warning instead of error since we have a fallback
    console.warn('Error recording visit (using fallback data):', error);
    return mockVisit;
  }
};

// Generate or retrieve a session ID
export const getSessionId = () => {
  let sessionId = localStorage.getItem('analytics_session_id');
  
  if (!sessionId) {
    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    localStorage.setItem('analytics_session_id', sessionId);
  }
  
  return sessionId;
};

export default api;