import { 
  Users, 
  Clock, 
  MousePointerClick, 
  ArrowUpRight, 
  ArrowDownRight 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnalyticsData } from '@/lib/types';

interface OverviewCardsProps {
  data: AnalyticsData;
}

export function OverviewCards({ data }: OverviewCardsProps) {
  // Calculate percentage changes (in a real app, this would compare to previous period)
  const visitsChange = 12.5;
  const usersChange = 8.2;
  const durationChange = -3.1;
  const bounceRateChange = -5.7;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Visites Totales</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.totalVisits.toLocaleString()}</div>
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            {visitsChange > 0 ? (
              <>
                <ArrowUpRight className="mr-1 h-4 w-4 text-emerald-500" />
                <span className="text-emerald-500">{visitsChange}%</span>
              </>
            ) : (
              <>
                <ArrowDownRight className="mr-1 h-4 w-4 text-rose-500" />
                <span className="text-rose-500">{Math.abs(visitsChange)}%</span>
              </>
            )}
            <span className="ml-1">depuis la période précédente</span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Utilisateurs Actifs</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.activeUsers.toLocaleString()}</div>
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            {usersChange > 0 ? (
              <>
                <ArrowUpRight className="mr-1 h-4 w-4 text-emerald-500" />
                <span className="text-emerald-500">{usersChange}%</span>
              </>
            ) : (
              <>
                <ArrowDownRight className="mr-1 h-4 w-4 text-rose-500" />
                <span className="text-rose-500">{Math.abs(usersChange)}%</span>
              </>
            )}
            <span className="ml-1">depuis la période précédente</span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Durée Moyenne</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {Math.floor(data.avgSessionDuration / 60)}m {data.avgSessionDuration % 60}s
          </div>
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            {durationChange > 0 ? (
              <>
                <ArrowUpRight className="mr-1 h-4 w-4 text-emerald-500" />
                <span className="text-emerald-500">{durationChange}%</span>
              </>
            ) : (
              <>
                <ArrowDownRight className="mr-1 h-4 w-4 text-rose-500" />
                <span className="text-rose-500">{Math.abs(durationChange)}%</span>
              </>
            )}
            <span className="ml-1">depuis la période précédente</span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Taux de Rebond</CardTitle>
          <MousePointerClick className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.bounceRate.toFixed(1)}%</div>
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            {bounceRateChange > 0 ? (
              <>
                <ArrowUpRight className="mr-1 h-4 w-4 text-rose-500" />
                <span className="text-rose-500">{bounceRateChange}%</span>
              </>
            ) : (
              <>
                <ArrowDownRight className="mr-1 h-4 w-4 text-emerald-500" />
                <span className="text-emerald-500">{Math.abs(bounceRateChange)}%</span>
              </>
            )}
            <span className="ml-1">depuis la période précédente</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}