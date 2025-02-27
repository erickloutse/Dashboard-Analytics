import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { OverviewCards } from '@/components/OverviewCards';
import { VisitorsChart } from '@/components/VisitorsChart';
import { PageViewsTable } from '@/components/PageViewsTable';
import { GeoMap } from '@/components/GeoMap';
import { DeviceStats } from '@/components/DeviceStats';
import { FilterBar } from '@/components/FilterBar';
import { mockData } from '@/lib/mock-data';
import { FilterOptions } from '@/lib/types';
import { filterData } from '@/lib/utils';

export function Dashboard() {
  const [data, setData] = useState(mockData);
  const [filteredData, setFilteredData] = useState(mockData);
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: { from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), to: new Date() },
    pages: [],
    devices: [],
    countries: []
  });

  // Simulate WebSocket connection for real-time updates
  useEffect(() => {
    const ws = {
      onmessage: (event: any) => {
        // In a real app, this would parse the event data
        // and update the state accordingly
        console.log('WebSocket message received:', event);
      }
    };

    // Simulate receiving new data every 30 seconds
    const interval = setInterval(() => {
      const newVisit = {
        id: `visit-${Date.now()}`,
        timestamp: new Date(),
        page: mockData.pageViews[Math.floor(Math.random() * mockData.pageViews.length)].page,
        duration: Math.floor(Math.random() * 300),
        country: mockData.geoData[Math.floor(Math.random() * mockData.geoData.length)].country,
        device: Math.random() > 0.5 ? 'mobile' : 'desktop',
        browser: Math.random() > 0.5 ? 'Chrome' : 'Firefox',
      };
      
      setData(prevData => ({
        ...prevData,
        visits: [newVisit, ...prevData.visits.slice(0, -1)],
        totalVisits: prevData.totalVisits + 1,
        activeUsers: Math.floor(Math.random() * 50) + 100,
      }));
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // Apply filters whenever data or filters change
  useEffect(() => {
    setFilteredData(filterData(data, filters));
  }, [data, filters]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <h1 className="text-3xl font-bold mb-6">Tableau de bord</h1>
          <FilterBar filters={filters} setFilters={setFilters} data={data} />
          <OverviewCards data={filteredData} />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <VisitorsChart data={filteredData} />
            <DeviceStats data={filteredData} />
          </div>
          
          <div className="grid grid-cols-1 gap-6 mt-6">
            <GeoMap data={filteredData} />
            <PageViewsTable data={filteredData} />
          </div>
        </main>
      </div>
    </div>
  );
}