
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiService, Farm } from '@/services/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import CreateFarmModal from '@/components/farms/CreateFarmModal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, Plus, Edit, Trash2, Eye, Loader2, TrendingUp, BarChart3, Droplets, X } from 'lucide-react';
import { toast } from 'sonner';

const Farms: React.FC = () => { 
  const { token } = useAuth();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deletingFarm, setDeletingFarm] = useState<string | null>(null);

  useEffect(() => {
    fetchFarms();
  }, [token]);

  const fetchFarms = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const farmsData = await apiService.getFarms(token);
      // Add staggered animation by setting farms one by one
      setFarms([]);
      farmsData.forEach((farm, index) => {
        setTimeout(() => {
          setFarms(prev => [...prev, farm]);
        }, index * 150);
      });
    } catch (error) {
      console.error('Failed to fetch farms:', error);
      toast.error('Failed to load farms');
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
  };

  const handleDeleteFarm = async (farmId: string, farmName: string) => {
    if (!token) return;

    if (!confirm(`Are you sure you want to delete "${farmName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingFarm(farmId);
      await apiService.deleteFarm(farmId, token);
      setFarms(prev => prev.filter(farm => farm._id !== farmId));
      toast.success('Farm deleted successfully');
    } catch (error) {
      console.error('Failed to delete farm:', error);
      toast.error('Failed to delete farm');
    } finally {
      setDeletingFarm(null);
    }
  };

  // Soil and irrigation types from CreateFarmModal
  const soilTypeIcons: Record<string, string> = {
    "alluvial": "🌾",
    "black (regur)": "🪨",
    "red": "🟥",
    "laterite": "🧱",
    "arid (desert)": "🏜️",
    "saline/alkaline": "🧂",
    "peaty/marshy": "🌫️",
    "mountain/forest": "🌲",
  };

  const getSoilTypeIcon = (soilType: string) => {
    if (!soilType) return "🌍";
    const key = soilType.trim().toLowerCase();
    return soilTypeIcons[key] || "🌍";
  };

  const irrigationTypeIcons: Record<string, string> = {
    "rain-fed": "🌧️",
    "canal": "🚤",
    "tube well": "🕳️",
    "dug well": "⛲",
    "drip": "💧",
    "sprinkler": "🌿",
    "tank": "🛢️",
    "lift": "🪜",
    "percolation": "💦",
    "check dam": "⛺",
    "pipeline through borewell": "🛁",
  };

  const getIrrigationIcon = (irrigationType: string) => {
    if (!irrigationType) return "💧";
    const key = irrigationType.trim().toLowerCase();
    return irrigationTypeIcons[key] || "💧";
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading farms...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="animate-fade-in">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">My Farms</h1>
            <p className="text-muted-foreground mt-1">
              Manage your agricultural properties and track their performance.
            </p>
          </div>
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            className="animate-fade-in hover:scale-105 transition-all duration-200 w-full sm:w-auto"
            style={{ animationDelay: '200ms' }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Farm
          </Button>
        </div>

        {/* Farms Grid */}
        {farms.length === 0 ? (
          <Card className="animate-fade-in" style={{ animationDelay: '300ms' }}>
            <CardContent className="text-center py-16">
              <div className="animate-pulse">
                <MapPin className="h-20 w-20 text-muted-foreground mx-auto mb-6" />
              </div>
              <h3 className="text-xl font-medium mb-3">No farms added yet</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Start by adding your first farm to begin receiving agricultural insights and recommendations.
              </p>
              <Button 
                onClick={() => setIsCreateModalOpen(true)}
                className="hover:scale-105 transition-all duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Farm
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3  gap-4 sm:gap-6">
            {farms.map((farm, index) => (
              <Card 
                key={farm._id} 
                className="farm-card hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 animate-fade-in group p-2"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <button
                  onClick={() => handleDeleteFarm(farm._id,farm.name)}
                  className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-destructive hover:bg-destructive/80 text-white rounded-full p-1 shadow-lg"
                  title="Delete Farm"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate group-hover:text-primary transition-colors">
                        {farm.name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1 text-xs">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">
                          {farm.location.coordinates[1].toFixed(4)}, {farm.location.coordinates[0].toFixed(4)}
                        </span>
                      </CardDescription>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Badge 
                        variant="secondary" 
                        className="capitalize text-xs hover:scale-110 transition-transform"
                      >
                        {getSoilTypeIcon(farm.soilType)} {farm.soilType}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {farm.location.address && (
                    <div className="transition-transform">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {farm.location.address.length > 60 
                          ? `${farm.location.address.substring(0, 60)}...`
                          : farm.location.address
                        }
                      </p>
                    </div>
                  )}
                  
                  <div className=" gap-3">
                    <div className="flex items-center justify-around text-sm bg-muted/50 rounded-lg p-2 hover:bg-muted transition-colors">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <BarChart3 className="h-3 w-3" />
                        Size:
                      </span>
                      <span className="font-medium">{farm.size} acres</span>
                    </div>
                    
                    <div className="flex items-center justify-around text-sm bg-muted/50 rounded-lg p-2 hover:bg-muted transition-colors">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Droplets className="h-3 w-3" />
                        Water:
                      </span>
                      <Badge variant="outline" className="capitalize text-xs">
                        {getIrrigationIcon(farm.irrigationType)} {farm.irrigationType}
                      </Badge>
                    </div>
                  </div>
                  
                  {farm.cropHistory.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground font-medium">Previous Crops:</p>
                      <div className="flex flex-wrap gap-1">
                        {farm.cropHistory.slice(0, 3).map((crop, cropIndex) => (
                          <Badge 
                            key={cropIndex} 
                            variant="secondary" 
                            className="text-xs hover:scale-110 transition-transform"
                            style={{ animationDelay: `${index * 150 + cropIndex * 50}ms` }}
                          >
                            {crop}
                          </Badge>
                        ))}
                        {farm.cropHistory.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{farm.cropHistory.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1 hover:scale-105 transition-all duration-200 hover:bg-primary hover:text-primary-foreground"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      <span className="hidden sm:inline">View</span>
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1 hover:scale-105 transition-all duration-200 hover:bg-blue-500 hover:text-white"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      <span className="hidden sm:inline">Edit</span>
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="text-destructive hover:text-destructive hover:scale-110 transition-all duration-200 hover:bg-red-50"
                      onClick={() => handleDeleteFarm(farm._id, farm.name)}
                      disabled={deletingFarm === farm._id}
                    >
                      {deletingFarm === farm._id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Trash2 className="h-3 w-3" />
                      )}
                    </Button>
                  </div> */}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {farms.length > 0 && (
          <Card className="animate-fade-in" style={{ animationDelay: `${farms.length * 150 + 300}ms` }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Farm Portfolio Summary
              </CardTitle>
              <CardDescription>
                Overview of your agricultural operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100 hover:scale-105 transition-all duration-300">
                  <div className="text-2xl font-bold text-green-600">
                    {farms.reduce((total, farm) => total + farm.size, 0).toFixed(1)}
                  </div>
                  <p className="text-sm text-green-600/80">Total Acres</p>
                </div>
                
                <div className="text-center p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 hover:scale-105 transition-all duration-300">
                  <div className="text-2xl font-bold text-blue-600">
                    {[...new Set(farms.flatMap(farm => farm.cropHistory))].length}
                  </div>
                  <p className="text-sm text-blue-600/80">Unique Crops</p>
                </div>
                
                <div className="text-center p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 hover:scale-105 transition-all duration-300">
                  <div className="text-2xl font-bold text-purple-600">
                    {farms.length > 0 ? (farms.reduce((total, farm) => total + farm.size, 0) / farms.length).toFixed(1) : '0'}
                  </div>
                  <p className="text-sm text-purple-600/80">Avg. Farm Size</p>
                </div>
                
                <div className="text-center p-4 rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 hover:scale-105 transition-all duration-300">
                  <div className="text-2xl font-bold text-orange-600">
                    {[...new Set(farms.map(farm => farm.soilType))].length}
                  </div>
                  <p className="text-sm text-orange-600/80">Soil Types</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <CreateFarmModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onFarmCreated={fetchFarms}
      />
    </DashboardLayout>
  );
};

export default Farms;
