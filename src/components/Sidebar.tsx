import { useState } from 'react';
import { 
  BarChart3, 
  Users, 
  Globe, 
  Settings, 
  HelpCircle, 
  ChevronLeft, 
  ChevronRight,
  Home,
  Smartphone,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarItemProps {
  icon: React.ReactNode;
  title: string;
  isActive?: boolean;
  isCollapsed?: boolean;
}

function SidebarItem({ icon, title, isActive, isCollapsed }: SidebarItemProps) {
  return (
    <Button
      variant={isActive ? "secondary" : "ghost"}
      className={cn(
        "w-full justify-start",
        isCollapsed ? "px-2" : "px-4"
      )}
    >
      {icon}
      {!isCollapsed && <span className="ml-2">{title}</span>}
    </Button>
  );
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={cn(
        "h-screen border-r bg-background transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex flex-col h-full py-4">
        <div className="px-4 mb-6 flex justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
        
        <div className="space-y-1 px-2">
          <SidebarItem 
            icon={<Home className="h-5 w-5" />} 
            title="Accueil" 
            isActive={true} 
            isCollapsed={collapsed} 
          />
          <SidebarItem 
            icon={<BarChart3 className="h-5 w-5" />} 
            title="Statistiques" 
            isCollapsed={collapsed} 
          />
          <SidebarItem 
            icon={<Users className="h-5 w-5" />} 
            title="Visiteurs" 
            isCollapsed={collapsed} 
          />
          <SidebarItem 
            icon={<Globe className="h-5 w-5" />} 
            title="Géographie" 
            isCollapsed={collapsed} 
          />
          <SidebarItem 
            icon={<Smartphone className="h-5 w-5" />} 
            title="Appareils" 
            isCollapsed={collapsed} 
          />
          <SidebarItem 
            icon={<Clock className="h-5 w-5" />} 
            title="Temps réel" 
            isCollapsed={collapsed} 
          />
        </div>
        
        <div className="mt-auto space-y-1 px-2">
          <SidebarItem 
            icon={<Settings className="h-5 w-5" />} 
            title="Paramètres" 
            isCollapsed={collapsed} 
          />
          <SidebarItem 
            icon={<HelpCircle className="h-5 w-5" />} 
            title="Aide" 
            isCollapsed={collapsed} 
          />
        </div>
      </div>
    </div>
  );
}