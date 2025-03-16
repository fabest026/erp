import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getStatusBadgeColor, getStatusLabel } from "@/lib/data";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const colorClass = getStatusBadgeColor(status);
  const label = getStatusLabel(status);
  
  return (
    <Badge className={cn(colorClass, "hover:bg-opacity-90", className)}>
      {label}
    </Badge>
  );
}
