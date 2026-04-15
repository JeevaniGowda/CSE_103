import { useNavigate } from "react-router-dom";
import { LucideIcon, ChevronRight } from "lucide-react";

interface DashboardCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  to: string;
  primary?: boolean;
}

const DashboardCard = ({ title, description, icon: Icon, to, primary }: DashboardCardProps) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(to)}
      className={`nav-card w-full text-left flex items-center gap-4 ${primary ? "nav-card-primary" : ""}`}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
        primary ? "bg-primary-foreground/20" : "bg-primary/10"
      }`}>
        <Icon className={`w-6 h-6 ${primary ? "text-primary-foreground" : "text-primary"}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className={`font-semibold text-sm ${primary ? "text-primary-foreground" : "text-foreground"}`}>{title}</div>
        <div className={`text-xs mt-0.5 ${primary ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{description}</div>
      </div>
      <ChevronRight className={`w-5 h-5 flex-shrink-0 ${primary ? "text-primary-foreground/60" : "text-muted-foreground/50"}`} />
    </button>
  );
};

export default DashboardCard;
