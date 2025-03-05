import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Filter, X } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AnalyticsData, FilterOptions } from "@/lib/types";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FilterBarProps {
  filters: FilterOptions;
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
  data: AnalyticsData;
}

export function FilterBar({ filters, setFilters, data }: FilterBarProps) {
  const [dateOpen, setDateOpen] = useState(false);
  const [pagesOpen, setPagesOpen] = useState(false);

  // Get unique pages, devices, and countries from data
  const pages = [...new Set(data.pageViews.map((p) => p.page))];
  const devices = ["desktop", "mobile", "tablet"];
  const countries = [...new Set(data.geoData.map((g) => g.country))];

  const clearFilters = () => {
    setFilters({
      dateRange: {
        from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        to: new Date(),
      },
      pages: [],
      devices: [],
      countries: [],
    });
  };

  const togglePage = (page: string) => {
    setFilters((prev) => ({
      ...prev,
      pages: prev.pages.includes(page)
        ? prev.pages.filter((p) => p !== page)
        : [...prev.pages, page],
    }));
  };

  const toggleDevice = (device: string) => {
    setFilters((prev) => ({
      ...prev,
      devices: prev.devices.includes(device)
        ? prev.devices.filter((d) => d !== device)
        : [...prev.devices, device],
    }));
  };

  const toggleCountry = (country: string) => {
    setFilters((prev) => ({
      ...prev,
      countries: prev.countries.includes(country)
        ? prev.countries.filter((c) => c !== country)
        : [...prev.countries, country],
    }));
  };

  return (
    <div className="flex flex-col space-y-4 mb-6">
      <div className="flex flex-wrap items-center gap-2">
        <Popover open={dateOpen} onOpenChange={setDateOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal",
                !filters.dateRange && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filters.dateRange?.from ? (
                filters.dateRange.to ? (
                  <>
                    {formatDate(filters.dateRange.from)} -{" "}
                    {formatDate(filters.dateRange.to)}
                  </>
                ) : (
                  formatDate(filters.dateRange.from)
                )
              ) : (
                <span>Sélectionner une période</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={filters.dateRange?.from}
              selected={{
                from: filters.dateRange?.from || new Date(),
                to: filters.dateRange?.to || new Date(),
              }}
              onSelect={(range) => {
                if (range?.from && range?.to) {
                  setFilters((prev) => ({
                    ...prev,
                    dateRange: { from: range.from, to: range.to },
                  }));
                  setDateOpen(false);
                }
              }}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>

        <Popover open={pagesOpen} onOpenChange={setPagesOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="justify-start text-left font-normal"
            >
              <Filter className="mr-2 h-4 w-4" />
              Pages
              {filters.pages.length > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-2 rounded-sm px-1 font-normal"
                >
                  {filters.pages.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Rechercher une page..." />
              <CommandList>
                <CommandEmpty>Aucune page trouvée.</CommandEmpty>
                <CommandGroup>
                  {pages.map((page) => (
                    <CommandItem
                      key={page}
                      onSelect={() => togglePage(page)}
                      className="flex items-center"
                    >
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                          filters.pages.includes(page)
                            ? "bg-primary text-primary-foreground"
                            : "opacity-50 [&_svg]:invisible"
                        )}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-3 w-3"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <span>{page}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="justify-start text-left font-normal"
            >
              <Filter className="mr-2 h-4 w-4" />
              Appareils
              {filters.devices.length > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-2 rounded-sm px-1 font-normal"
                >
                  {filters.devices.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[200px]">
            <DropdownMenuLabel>Appareils</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {devices.map((device) => (
              <DropdownMenuCheckboxItem
                key={device}
                checked={filters.devices.includes(device)}
                onCheckedChange={() => toggleDevice(device)}
              >
                {device}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="justify-start text-left font-normal"
            >
              <Filter className="mr-2 h-4 w-4" />
              Pays
              {filters.countries.length > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-2 rounded-sm px-1 font-normal"
                >
                  {filters.countries.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[200px]">
            <DropdownMenuLabel>Pays</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {countries.map((country) => (
              <DropdownMenuCheckboxItem
                key={country}
                checked={filters.countries.includes(country)}
                onCheckedChange={() => toggleCountry(country)}
              >
                {country}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {(filters.pages.length > 0 ||
          filters.devices.length > 0 ||
          filters.countries.length > 0) && (
          <Button
            variant="ghost"
            className="h-8 px-2 lg:px-3"
            onClick={clearFilters}
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.pages.map((page) => (
          <Badge key={page} variant="secondary" className="rounded-sm">
            {page}
            <button
              className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              onClick={() => togglePage(page)}
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Remove</span>
            </button>
          </Badge>
        ))}
        {filters.devices.map((device) => (
          <Badge key={device} variant="secondary" className="rounded-sm">
            {device}
            <button
              className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              onClick={() => toggleDevice(device)}
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Remove</span>
            </button>
          </Badge>
        ))}
        {filters.countries.map((country) => (
          <Badge key={country} variant="secondary" className="rounded-sm">
            {country}
            <button
              className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              onClick={() => toggleCountry(country)}
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Remove</span>
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
}
