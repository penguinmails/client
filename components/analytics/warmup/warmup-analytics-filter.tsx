import { DropDownFilter, Filter } from "@/shared/ui/custom/Filter";
import Icon from "@/shared/ui/custom/Icon";
import { Calendar, Filter as FilterIcon } from "lucide-react";
import { useAnalytics } from "@/context/AnalyticsContext";
import { DataGranularity, DateRangePreset } from "@/types";
import { spacing } from "@/shared/lib/design-tokens";
import { cn } from "@/shared/lib/utils";

const dateRangeOptions = [
  { label: "Last 7 days", value: "7d" as DateRangePreset },
  { label: "Last 30 days", value: "30d" as DateRangePreset },
  { label: "Last 90 days", value: "90d" as DateRangePreset },
  { label: "Last 1 Year", value: "1y" as DateRangePreset },
];

const granularityOptions = [
  { label: "Daily", value: "day" as DataGranularity },
  { label: "Weekly", value: "week" as DataGranularity },
  { label: "Monthly", value: "month" as DataGranularity },
];

/**
 * Warmup Analytics Filter component.
 * 
 * This component uses existing Filter and DropDownFilter components
 * that already implement Design System patterns (Select, Input).
 * 
 * Minor optimization: Applied Design System spacing and color tokens.
 */
function WarmupAnalyticsFilter() {
  const { dateRange, setDateRange, granularity, setGranularity, allowedGranularities } = useAnalytics();

  const handleDateRangeChange = (value: string) => {
    setDateRange(value as DateRangePreset);
  };

  const handleGranularityChange = (value: string) => {
    setGranularity(value as DataGranularity);
  };

  // Filter granularity options to only show allowed ones
  const availableGranularityOptions = granularityOptions.filter(option =>
    allowedGranularities.includes(option.value)
  );

  return (
    <Filter className="shadow-none border-none ">
      <div className={cn("flex items-center ml-auto", spacing.inlineMd)}>
        <div className={cn("flex items-center", spacing.inlineMd)}>
          <Icon icon={Calendar} className="text-muted-foreground w-5 h-5" />
          <DropDownFilter
            placeholder="Select date range"
            options={dateRangeOptions}
            value={dateRange}
            onChange={handleDateRangeChange}
          />
        </div>
        <div className={cn("flex items-center", spacing.inlineMd)}>
          <Icon icon={FilterIcon} className="text-muted-foreground w-5 h-5" />
          <DropDownFilter
            placeholder="Select granularity"
            options={availableGranularityOptions}
            value={granularity}
            onChange={handleGranularityChange}
          />
        </div>
      </div>
    </Filter>
  );
}
export default WarmupAnalyticsFilter;
