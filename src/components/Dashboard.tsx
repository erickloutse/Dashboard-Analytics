import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { OverviewCards } from "@/components/OverviewCards";
import { VisitorsChart } from "@/components/VisitorsChart";
import { PageViewsTable } from "@/components/PageViewsTable";
import { GeoMap } from "@/components/GeoMap";
import { DeviceStats } from "@/components/DeviceStats";
import { FilterBar } from "@/components/FilterBar";
import { mockData } from "@/lib/mock-data";
import { FilterOptions } from "@/lib/types";
import { filterData } from "@/lib/utils";
import {
  fetchOverviewStats,
  fetchActiveUsers,
  initializeSocket,
  getSessionId,
  recordVisit,
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export function Dashboard() {
  const [data, setData] = useState(mockData);
  const [filteredData, setFilteredData] = useState(mockData);
  const [loading, setLoading] = useState(true);
  const [usingMockData, setUsingMockData] = useState(true);
  const { toast } = useToast();

  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: {
      from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      to: new Date(),
    },
    pages: [],
    devices: [],
    countries: [],
  });

  // Initialize Socket.io connection and fetch data
  useEffect(() => {
    const socket = initializeSocket();
    const sessionId = getSessionId();

    // Record the current visit
    const recordCurrentVisit = async () => {
      try {
        await recordVisit({
          page: window.location.pathname,
          referrer: document.referrer,
          sessionId,
          duration: 0,
        });
      } catch (error) {
        // Continue with mock data if API fails
        setUsingMockData(true);
      }
    };

    // Fetch real data from API
    const fetchData = async () => {
      try {
        setLoading(true);
        const stats = await fetchOverviewStats({
          from: filters.dateRange.from,
          to: filters.dateRange.to,
        });

        const activeUsers = await fetchActiveUsers();

        const apiData = {
          ...stats,
          activeUsers,
          visits: mockData.visits, // Use mock visits data for demo
        };

        setData(apiData);
        setUsingMockData(false);
      } catch (error) {
        toast({
          title: "Mode démonstration",
          description:
            "Utilisation des données de démonstration car le serveur n'est pas disponible.",
          variant: "default",
        });
        setUsingMockData(true);
      } finally {
        setLoading(false);
      }
    };

    // Try to record visit and fetch data
    recordCurrentVisit();
    fetchData();

    // Listen for real-time updates
    socket.on("newVisit", () => {
      if (!usingMockData) {
        fetchActiveUsers().then((activeUsers) => {
          setData((prev) => ({
            ...prev,
            activeUsers,
            totalVisits: prev.totalVisits + 1,
          }));
        });
      }
    });

    socket.on("pageUpdate", (page) => {
      if (!usingMockData) {
        setData((prev) => ({
          ...prev,
          pageViews: prev.pageViews.map((p) =>
            p.page === page.path
              ? {
                  page: page.path,
                  views: page.views,
                  avgTimeOnPage: page.avgTimeOnPage,
                }
              : p
          ),
        }));
      }
    });

    // Simulate real-time updates with mock data
    let interval: number | undefined;
    if (usingMockData) {
      interval = window.setInterval(() => {
        const newVisit = {
          id: `visit-${Date.now()}`,
          timestamp: new Date(),
          page: mockData.pageViews[
            Math.floor(Math.random() * mockData.pageViews.length)
          ].page,
          duration: Math.floor(Math.random() * 300),
          country:
            mockData.geoData[
              Math.floor(Math.random() * mockData.geoData.length)
            ].country,
          device: Math.random() > 0.5 ? "mobile" : "desktop",
          browser: Math.random() > 0.5 ? "Chrome" : "Firefox",
        };

        setData((prevData) => ({
          ...prevData,
          visits: [newVisit, ...prevData.visits.slice(0, -1)],
          totalVisits: prevData.totalVisits + 1,
          activeUsers: Math.floor(Math.random() * 50) + 100,
        }));
      }, 30000);
    }

    return () => {
      socket.off("newVisit");
      socket.off("pageUpdate");
      if (interval) clearInterval(interval);
    };
  }, [filters.dateRange, usingMockData, toast]);

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
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Tableau de bord</h1>
            {usingMockData && (
              <div className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-3 py-1 rounded-md text-sm">
                Mode démo (données fictives)
              </div>
            )}
          </div>

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
