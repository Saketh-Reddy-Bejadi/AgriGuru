import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiService, Farm, WeatherData } from "@/services/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Thermometer,
  Droplets,
  Wind,
  Plus,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";

const Dashboard: React.FC = () => {
  const { user, token } = useAuth();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [weatherData, setWeatherData] = useState<{
    [farmId: string]: WeatherData;
  }>({});
  const [loading, setLoading] = useState(true);

  // Inject Omnidimension widget script only on dashboard
  useEffect(() => {
    const scriptId = "omnidimension-web-widget";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.async = true;
      script.src = `https://backend.omnidim.io/web_widget.js?secret_key=${
        import.meta.env.VITE_VOICE_AGENT
      }`;
      document.head.appendChild(script);
    }
    return () => {
      const script = document.getElementById(scriptId);
      if (script) script.remove();
    };
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  const fetchDashboardData = async () => {
    if (!token) return;

    try {
      const farmsData = await apiService.getFarms(token);
      setFarms(farmsData);

      // Fetch weather for the first 3 farms
      const weatherPromises = farmsData.slice(0, 3).map(async (farm) => {
        try {
          const weather = await apiService.getWeatherData(farm._id, token);
          return { farmId: farm._id, weather };
        } catch (error) {
          console.error(`Failed to fetch weather for farm ${farm._id}:`, error);
          return null;
        }
      });

      const weatherResults = await Promise.all(weatherPromises);
      const weatherMap: { [farmId: string]: WeatherData } = {};
      weatherResults.forEach((result) => {
        if (result) {
          weatherMap[result.farmId] = result.weather;
        }
      });
      setWeatherData(weatherMap);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalFarmSize = farms.reduce((total, farm) => total + farm.size, 0);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's what's happening with your farms today.
            </p>
          </div>
          <Button asChild>
            <Link to="/farms">
              <Plus className="h-4 w-4 mr-2" />
              Add New Farm
            </Link>
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Farms</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{farms.length}</div>
              <p className="text-xs text-muted-foreground">
                {totalFarmSize.toFixed(1)} acres total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Crops
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {[...new Set(farms.flatMap((farm) => farm.cropHistory))].length}
              </div>
              <p className="text-xs text-muted-foreground">
                Unique crop varieties
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Size
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {farms.length > 0
                  ? (totalFarmSize / farms.length).toFixed(1)
                  : "0"}
              </div>
              <p className="text-xs text-muted-foreground">Acres per farm</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Account Type
              </CardTitle>
              <Badge variant="secondary" className="capitalize">
                {user?.role}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Active</div>
              <p className="text-xs text-muted-foreground">
                All systems operational
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Farms */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Farms</CardTitle>
              <CardDescription>Your latest farm additions</CardDescription>
            </CardHeader>
            <CardContent>
              {farms.length === 0 ? (
                <div className="text-center py-6">
                  <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    No farms added yet
                  </p>
                  <Button asChild>
                    <Link to="/farms">Add Your First Farm</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {farms.slice(0, 3).map((farm) => (
                    <div
                      key={farm._id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div>
                        <h4 className="font-medium">{farm.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {farm.size} acres • {farm.soilType} soil
                        </p>
                        {farm.location.address && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {farm.location.address.length > 50
                              ? `${farm.location.address.substring(0, 50)}...`
                              : farm.location.address}
                          </p>
                        )}
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {farm.irrigationType}
                      </Badge>
                    </div>
                  ))}
                  {farms.length > 3 && (
                    <Button variant="outline" className="w-full" asChild>
                      <Link to="/farms">View All Farms</Link>
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Weather Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Weather Overview</CardTitle>
              <CardDescription>
                Current conditions at your farms
              </CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(weatherData).length === 0 ? (
                <div className="text-center py-6">
                  <Thermometer className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    No weather data available
                  </p>
                  <Button variant="outline" asChild>
                    <Link to="/weather">View Weather</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(weatherData).map(([farmId, weather]) => {
                    const farm = farms.find((f) => f._id === farmId);
                    return (
                      <div
                        key={farmId}
                        className="p-3 rounded-lg border weather-card"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{farm?.name}</h4>
                          <div className="flex items-center gap-1">
                            <Thermometer className="h-4 w-4" />
                            <span className="font-medium">
                              {weather.temperature}°C
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Droplets className="h-3 w-3" />
                            {weather.humidity}%
                          </div>
                          <div className="flex items-center gap-1">
                            <Wind className="h-3 w-3" />
                            {weather.windSpeed} km/h
                          </div>
                        </div>
                        <p className="text-sm mt-1 capitalize">
                          {weather.description}
                        </p>
                      </div>
                    );
                  })}
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/weather">View All Weather</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex-col" asChild>
                <Link to="/farms">
                  <MapPin className="h-6 w-6 mb-2" />
                  Manage Farms
                </Link>
              </Button>
              <Button variant="outline" className="h-20 flex-col" asChild>
                <Link to="/weather">
                  <Thermometer className="h-6 w-6 mb-2" />
                  Check Weather
                </Link>
              </Button>
              <Button variant="outline" className="h-20 flex-col" asChild>
                <Link to="/recommendations">
                  <TrendingUp className="h-6 w-6 mb-2" />
                  Get Recommendations
                </Link>
              </Button>
              <Button variant="outline" className="h-20 flex-col" asChild>
                <Link to="/market">
                  <BarChart3 className="h-6 w-6 mb-2" />
                  Market Data
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
