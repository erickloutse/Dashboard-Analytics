import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnalyticsData } from '@/lib/types';

interface GeoMapProps {
  data: AnalyticsData;
}

export function GeoMap({ data }: GeoMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<'map' | 'list'>('map');
  const [mapLoaded, setMapLoaded] = useState(false);

  // Process data for the map
  const countryData = data.geoData.sort((a, b) => b.visitors - a.visitors);

  // Simulate loading a map library
  useEffect(() => {
    if (view === 'map' && mapRef.current && !mapLoaded) {
      // In a real app, this would initialize a map library like Leaflet
      // For this demo, we'll just simulate a map with a placeholder
      const loadMap = setTimeout(() => {
        setMapLoaded(true);
      }, 500);
      
      return () => clearTimeout(loadMap);
    }
  }, [view, mapLoaded]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Répartition Géographique</CardTitle>
        <Tabs defaultValue="map" className="w-[200px]" onValueChange={(value) => setView(value as 'map' | 'list')}>
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="map">Carte</TabsTrigger>
            <TabsTrigger value="list">Liste</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {view === 'map' ? (
          <div 
            ref={mapRef} 
            className="h-[400px] w-full bg-muted rounded-md overflow-hidden relative"
          >
            {!mapLoaded ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-muted-foreground mb-2">Carte interactive des visiteurs</p>
                  <p className="text-xs text-muted-foreground">
                    Dans une application réelle, une carte Leaflet ou Mapbox serait affichée ici
                  </p>
                  <div className="mt-4 grid grid-cols-5 gap-2">
                    {countryData.slice(0, 5).map((country, index) => (
                      <div 
                        key={index}
                        className="h-16 rounded-md flex items-center justify-center"
                        style={{ 
                          backgroundColor: `hsl(var(--chart-${index + 1}))`,
                          opacity: 0.7 + (0.3 * (5 - index) / 5)
                        }}
                      >
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="h-[400px] overflow-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Pays</th>
                  <th className="text-right py-2">Visiteurs</th>
                  <th className="text-right py-2">% du Total</th>
                </tr>
              </thead>
              <tbody>
                {countryData.map((country, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2">{country.country}</td>
                    <td className="text-right py-2">{country.visitors.toLocaleString()}</td>
                    <td className="text-right py-2">
                      {((country.visitors / data.totalVisits) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}