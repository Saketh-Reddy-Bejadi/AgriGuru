import React, { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sprout,
  Home,
  MapPin,
  Cloud,
  TrendingUp,
  User,
  LogOut,
  Camera,
  BarChart3,
  Users,
  Settings,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { Sheet, SheetContent } from "@/components/ui/sheet";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [openMobile, setOpenMobile] = React.useState(false);

  const navigationItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "My Farms", href: "/farms", icon: MapPin },
    { name: "Weather", href: "/weather", icon: Cloud },
    { name: "Recommendations", href: "/recommendations", icon: TrendingUp },
    { name: "Market Data", href: "/market", icon: BarChart3 },
    { name: "Crop Diagnosis", href: "/diagnosis", icon: Camera },
  ];

  // Admin/Expert specific navigation
  const adminExpertItems = [
    { name: "User Management", href: "/admin/users", icon: Users },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { name: "System Settings", href: "/admin/settings", icon: Settings },
  ];

  const isActive = (path: string) => location.pathname === path;

  // if (isMobile) {
  //   return (
  //     <Sheet open={openMobile} onOpenChange={setOpenMobile}>
  //       <SheetContent>
  //         <div className="flex h-full w-full flex-col">
  //           {/* Sidebar */}
  //           <div className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border">
  //             {/* Logo */}
  //             <div className="flex items-center gap-2 px-6 py-4 border-b border-border">
  //               <div className="p-2 bg-primary rounded-lg">
  //                 <Sprout className="h-6 w-6 text-primary-foreground" />
  //               </div>
  //               <span className="text-xl font-bold text-foreground">
  //                 AgriGuru
  //               </span>
  //             </div>

  //             {/* Navigation */}
  //             <nav className="flex-1 px-4 py-4 space-y-2">
  //               {navigationItems.map((item) => (
  //                 <NavLink
  //                   key={item.name}
  //                   to={item.href}
  //                   className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
  //                     isActive(item.href)
  //                       ? "bg-primary text-primary-foreground"
  //                       : "text-muted-foreground hover:text-foreground hover:bg-accent"
  //                   }`}
  //                 >
  //                   <item.icon className="h-4 w-4" />
  //                   {item.name}
  //                 </NavLink>
  //               ))}

  //               {/* Admin/Expert sections */}
  //               {(user?.role === "admin" || user?.role === "expert") && (
  //                 <>
  //                   <div className="pt-4">
  //                     <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
  //                       {user.role === "admin"
  //                         ? "Administration"
  //                         : "Expert Tools"}
  //                     </h3>
  //                     {adminExpertItems.map((item) => (
  //                       <NavLink
  //                         key={item.name}
  //                         to={item.href}
  //                         className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
  //                           isActive(item.href)
  //                             ? "bg-primary text-primary-foreground"
  //                             : "text-muted-foreground hover:text-foreground hover:bg-accent"
  //                         }`}
  //                       >
  //                         <item.icon className="h-4 w-4" />
  //                         {item.name}
  //                       </NavLink>
  //                     ))}
  //                   </div>
  //                 </>
  //               )}
  //             </nav>

  //             {/* User Profile */}
  //             <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
  //               <div className="flex items-center gap-3 mb-3">
  //                 <Avatar>
  //                   <AvatarFallback className="bg-primary text-primary-foreground">
  //                     {user?.name?.charAt(0).toUpperCase()}
  //                   </AvatarFallback>
  //                 </Avatar>
  //                 <div className="flex-1 min-w-0">
  //                   <p className="text-sm font-medium text-foreground truncate">
  //                     {user?.name}
  //                   </p>
  //                   <p className="text-xs text-muted-foreground capitalize">
  //                     {user?.role}
  //                   </p>
  //                 </div>
  //               </div>
  //               <div className="flex gap-2">
  //                 <Button
  //                   variant="outline"
  //                   size="sm"
  //                   className="flex-1"
  //                   asChild
  //                 >
  //                   <NavLink to="/profile">
  //                     <User className="h-4 w-4 mr-2" />
  //                     Profile
  //                   </NavLink>
  //                 </Button>
  //                 <Button variant="outline" size="sm" onClick={logout}>
  //                   <LogOut className="h-4 w-4" />
  //                 </Button>
  //               </div>
  //             </div>
  //           </div>

  //           {/* Main Content */}
  //           <div className="pl-64">
  //             <main className="min-h-screen p-6">{children}</main>
  //           </div>
  //         </div>
  //       </SheetContent>
  //     </Sheet>
  //   );
  // }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border">
        {/* Logo */}
        <div className="flex items-center gap-2 px-6 py-4 border-b border-border">
          <div className="p-2 bg-primary rounded-lg">
            <Sprout className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">AgriGuru</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-2">
          {navigationItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </NavLink>
          ))}

          {/* Admin/Expert sections */}
          {(user?.role === "admin" || user?.role === "expert") && (
            <>
              <div className="pt-4">
                <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {user.role === "admin" ? "Administration" : "Expert Tools"}
                </h3>
                {adminExpertItems.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </NavLink>
                ))}
              </div>
            </>
          )}
        </nav>

        {/* User Profile */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-3">
            <Avatar>
              <AvatarFallback className="bg-primary text-primary-foreground">
                {user?.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user?.name}
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {user?.role}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1" asChild>
              <NavLink to="/profile">
                <User className="h-4 w-4 mr-2" />
                Profile
              </NavLink>
            </Button>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pl-64">
        <main className="min-h-screen p-6">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
