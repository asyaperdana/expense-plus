import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  Tags,
  PiggyBank,
  BarChart3,
  Calendar,
  FileText,
  Users,
  ScanLine,
  Settings,
  X,
  Receipt,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
}

const menuItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/wallets", label: "Wallet", icon: Wallet },
  { path: "/transactions", label: "Transaksi", icon: ArrowLeftRight },
  { path: "/categories", label: "Kategori", icon: Tags },
  { path: "/budgets", label: "Budget", icon: PiggyBank },
  { path: "/analytics", label: "Analitik", icon: BarChart3 },
  { path: "/calendar", label: "Kalender", icon: Calendar },
  { path: "/templates", label: "Template", icon: FileText },
  { path: "/ledgers", label: "Shared Ledger", icon: Users },
  { path: "/scanner", label: "Scan Struk", icon: ScanLine },
  { path: "/settings", label: "Pengaturan", icon: Settings },
];

export function Sidebar({ isOpen, onClose, isMobile }: SidebarProps) {
  const location = useLocation();

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 z-40 h-screen w-64 bg-card border-r border-border transition-transform duration-300 ease-in-out",
        isMobile && !isOpen && "-translate-x-full",
        !isMobile && !isOpen && "-translate-x-full lg:translate-x-0",
      )}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Receipt className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Expense</h1>
              <p className="text-xs text-muted-foreground">Tracker</p>
            </div>
          </div>
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-4 py-4">
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => isMobile && onClose()}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "text-muted-foreground hover:bg-slate-100 hover:text-foreground hover:translate-x-1",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 transition-transform duration-300 group-hover:scale-110",
                      isActive && "text-primary-foreground",
                    )}
                  />
                  {item.label}
                  {isActive && (
                    <div className="ml-auto h-2 w-2 rounded-full bg-primary-foreground" />
                  )}
                </NavLink>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t border-border p-4">
          <div className="rounded-lg bg-muted p-4">
            <p className="text-xs font-medium text-muted-foreground">Versi</p>
            <p className="text-sm font-semibold text-foreground">1.0.0</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
