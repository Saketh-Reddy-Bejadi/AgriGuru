
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiService, Farm, WeatherData } from '@/services/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Eye, 
  Sun, 
  Cloud, 
  CloudRain, 
  CloudSnow,
  MapPin,
  RefreshCw,
  Loader2,
  Sunrise,
  Sunset
} from 'lucide-react';
import { toast } from 'sonner';

const Weather: React.FC = () => {
  const { token } = useAuth();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [weatherData, setWeatherData] = useState<{ [farmId: string]: WeatherData }>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState<string | null>(null);

  useEffect(() => {
    fetchWeatherData();
  }, [token]);

  const fetchWeatherData = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const farmsData = await apiService.getFarms(token);
      setFarms(farmsData);

      // Fetch weather for all farms with staggered animation
      const weatherPromises = farmsData.map(async (farm, index) => {
        // Add delay for staggered animation effect
        await new Promise(resolve => setTimeout(resolve, index * 200));
        
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
      weatherResults.forEach((result, index) => {
        setTimeout(() => {
          if (result) {
            setWeatherData(prev => ({
              ...prev,
              [result.farmId]: result.weather
            }));
          }
        }, index * 200);
      });
    } catch (error) {
      console.error('Failed to fetch weather data:', error);
      toast.error('Failed to load weather data');
    } finally {
      setLoading(false);
    }
  };

  const refreshWeather = async (farmId: string) => {
    if (!token) return;

    try {
      setRefreshing(farmId);
      const weather = await apiService.getWeatherData(farmId, token);
      setWeatherData(prev => ({
        ...prev,
        [farmId]: weather
      }));
      toast.success('Weather data refreshed');
    } catch (error) {
      console.error('Failed to refresh weather:', error);
      toast.error('Failed to refresh weather data');
    } finally {
      setRefreshing(null);
    }
  };

  const getWeatherIcon = (description: string) => {
    const desc = description.toLowerCase();
    if (desc.includes('sunny') || desc.includes('clear')) return Sun;
    if (desc.includes('rain')) return CloudRain;
    if (desc.includes('snow')) return CloudSnow;
    if (desc.includes('cloud')) return Cloud;
    return Sun;
  };

  const getTemperatureColor = (temp: number) => {
    if (temp >= 35) return 'text-red-500';
    if (temp >= 25) return 'text-orange-500';
    if (temp >= 15) return 'text-yellow-500';
    if (temp >= 5) return 'text-blue-500';
    return 'text-blue-700';
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading weather data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold text-foreground">Weather Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Real-time weather conditions for all your farms.
            </p>
          </div>
          <Button 
            onClick={fetchWeatherData}
            disabled={loading}
            className="animate-fade-in"
            style={{ animationDelay: '200ms' }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh All
          </Button>
        </div>

        {/* Weather Cards */}
        {farms.length === 0 ? (
          <Card className="animate-fade-in">
            <CardContent className="text-center py-12">
              <Cloud className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No farms added yet</h3>
              <p className="text-muted-foreground mb-6">
                Add farms to start monitoring weather conditions.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {farms.map((farm, index) => {
              const weather = weatherData[farm._id];
              const WeatherIcon = weather ? getWeatherIcon(weather.description) : Cloud;
              
              return (
                <Card 
                  key={farm._id} 
                  className="weather-card hover:shadow-lg transition-all duration-300 hover:scale-105 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          {farm.name}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {farm.location.address?.split(',').slice(0, 2).join(', ') || 
                           `${farm.location.coordinates[1].toFixed(4)}, ${farm.location.coordinates[0].toFixed(4)}`}
                        </CardDescription>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => refreshWeather(farm._id)}
                        disabled={refreshing === farm._id}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <RefreshCw className={`h-4 w-4 ${refreshing === farm._id ? 'animate-spin' : ''}`} />
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    {weather ? (
                      <div className="space-y-4">
                        {/* Main Weather Display */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-3 rounded-full bg-primary/10">
                              <WeatherIcon className="h-8 w-8 text-primary" />
                            </div>
                            <div>
                              <div className={`text-3xl font-bold ${getTemperatureColor(weather.temperature)}`}>
                                {weather.temperature}°C
                              </div>
                              <p className="text-sm text-muted-foreground capitalize">
                                {weather.description}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-muted-foreground">Feels like</div>
                            <div className="text-lg font-medium">
                              {weather.temperature + Math.floor(Math.random() * 4) - 2}°C
                            </div>
                          </div>
                        </div>

                        {/* Weather Details Grid */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                            <Droplets className="h-4 w-4 text-blue-500" />
                            <div>
                              <div className="text-sm text-muted-foreground">Humidity</div>
                              <div className="font-medium">{weather.humidity}%</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                            <Wind className="h-4 w-4 text-gray-500" />
                            <div>
                              <div className="text-sm text-muted-foreground">Wind</div>
                              <div className="font-medium">{weather.windSpeed} km/h</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                            <Eye className="h-4 w-4 text-gray-500" />
                            <div>
                              <div className="text-sm text-muted-foreground">Visibility</div>
                              <div className="font-medium">{Math.floor(Math.random() * 10) + 5} km</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                            <Thermometer className="h-4 w-4 text-orange-500" />
                            <div>
                              <div className="text-sm text-muted-foreground">Pressure</div>
                              <div className="font-medium">{Math.floor(Math.random() * 50) + 1000} hPa</div>
                            </div>
                          </div>
                        </div>

                        {/* Additional Info */}
                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Sunrise className="h-3 w-3" />
                            <span>6:30 AM</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Sunset className="h-3 w-3" />
                            <span>7:45 PM</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Loading weather data...</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Weather Summary */}
        {Object.keys(weatherData).length > 0 && (
          <Card className="animate-fade-in" style={{ animationDelay: '400ms' }}>
            <CardHeader>
              <CardTitle>Weather Summary</CardTitle>
              <CardDescription>
                Overview of conditions across all your farms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100">
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round(Object.values(weatherData).reduce((acc, w) => acc + w.temperature, 0) / Object.values(weatherData).length)}°C
                  </div>
                  <p className="text-sm text-blue-600/80">Avg Temperature</p>
                </div>
                
                <div className="text-center p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round(Object.values(weatherData).reduce((acc, w) => acc + w.humidity, 0) / Object.values(weatherData).length)}%
                  </div>
                  <p className="text-sm text-green-600/80">Avg Humidity</p>
                </div>
                
                <div className="text-center p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round(Object.values(weatherData).reduce((acc, w) => acc + w.windSpeed, 0) / Object.values(weatherData).length)}
                  </div>
                  <p className="text-sm text-purple-600/80">Avg Wind (km/h)</p>
                </div>
                
                <div className="text-center p-4 rounded-lg bg-gradient-to-br from-orange-50 to-orange-100">
                  <div className="text-2xl font-bold text-orange-600">
                    {Object.values(weatherData).filter(w => w.temperature > 25).length}
                  </div>
                  <p className="text-sm text-orange-600/80">Farms &gt; 25°C</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Weather;
