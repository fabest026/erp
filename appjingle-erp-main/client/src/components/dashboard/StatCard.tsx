import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: {
    value: string | number;
    type: "increase" | "decrease";
  };
  color: "primary" | "secondary" | "accent" | "danger";
  compareText?: string;
}

const colorVariants = {
  primary: {
    bg: "bg-primary-light/10",
    text: "text-primary",
  },
  secondary: {
    bg: "bg-secondary-light/10",
    text: "text-secondary", 
  },
  accent: {
    bg: "bg-accent-light/10",
    text: "text-accent",
  },
  danger: {
    bg: "bg-red-100",
    text: "text-red-600",
  },
};

const StatCard = ({ title, value, icon: Icon, change, color, compareText = "vs yesterday" }: StatCardProps) => {
  const colorClasses = colorVariants[color];
  const isPositive = change?.type === "increase";
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
      <div className="flex items-center">
        <div className={cn("p-3 rounded-full", colorClasses.bg, colorClasses.text)}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="ml-5">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h2 className="text-xl font-semibold text-gray-800 mt-1">{value}</h2>
        </div>
      </div>
      
      {change && (
        <div className="mt-4">
          <div className="flex items-center">
            <span className={cn(
              "text-sm font-medium flex items-center",
              isPositive ? "text-green-600" : "text-red-600"
            )}>
              {isPositive ? "↑" : "↓"} {change.value}
            </span>
            <span className="text-gray-500 text-sm ml-2">{compareText}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatCard;
