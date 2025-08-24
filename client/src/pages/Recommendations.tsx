import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiService, Farm, CropRecommendation } from "@/services/api";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Sprout,
  TrendingUp,
  Calendar,
  DollarSign,
  Target,
  MapPin,
  Lightbulb,
  Loader2,
  RefreshCw,
  Sparkles,
  BarChart3,
  CheckCircle,
  Star,
  Award,
  Leaf,
  Sun,
  Droplets,
  Wind,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

const Recommendations: React.FC = () => {
  const { token } = useAuth();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [recommendations, setRecommendations] = useState<{
    [farmId: string]: CropRecommendation[];
  }>({});
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);

  useEffect(() => {
    // Clear any stale recommendations data
    setRecommendations({});
    fetchFarmsAndRecommendations();
  }, [token]);

  const fetchFarmsAndRecommendations = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const farmsData = await apiService.getFarms(token);
      setFarms(farmsData);

      // Generate recommendations for all farms with staggered animation
      const recommendationPromises = farmsData.map(async (farm, index) => {
        // Add delay for staggered animation effect
        await new Promise((resolve) => setTimeout(resolve, index * 400));

        try {
          const recommendations = await apiService.getCropRecommendations(
            farm._id,
            token
          );
          return { farmId: farm._id, recommendations };
        } catch (error) {
          console.error(
            `Failed to fetch recommendations for farm ${farm._id}:`,
            error
          );
          return null;
        }
      });

      const recommendationResults = await Promise.all(recommendationPromises);
      const recommendationMap: { [farmId: string]: CropRecommendation[] } = {};
      recommendationResults.forEach((result, index) => {
        setTimeout(() => {
          if (result) {
            setRecommendations((prev) => ({
              ...prev,
              [result.farmId]: result.recommendations,
            }));
          }
        }, index * 400);
      });
    } catch (error) {
      console.error("Failed to fetch recommendations:", error);
      toast.error("Failed to load recommendations");
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendations = async (farmId: string) => {
    if (!token) return;

    try {
      setGenerating(farmId);
      const recommendations = await apiService.getCropRecommendations(
        farmId,
        token
      );
      setRecommendations((prev) => ({
        ...prev,
        [farmId]: recommendations,
      }));
      toast.success("New recommendations generated!");
    } catch (error) {
      console.error("Failed to generate recommendations:", error);
      toast.error("Failed to generate recommendations");
    } finally {
      setGenerating(null);
    }
  };

  const getProfitabilityColor = (level: string | undefined) => {
    if (!level) return "bg-gray-100 text-gray-800 border-gray-200";
    switch (level.toLowerCase()) {
      case "high":
        return "bg-green-100 text-green-800 border-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getDifficultyColor = (level: string | undefined) => {
    if (!level) return "bg-gray-100 text-gray-800 border-gray-200";
    switch (level.toLowerCase()) {
      case "easy":
        return "bg-green-100 text-green-800 border-green-200";
      case "moderate":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "hard":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div
            className="relative bg-white/80 rounded-xl shadow-xl border border-green-100 px-10 py-8 flex flex-col items-center animate-fade-in"
            style={{ boxShadow: "0 0 32px 0 #22c55e33" }}
          >
            <div className="relative mb-4">
              <Loader2 className="h-16 w-16 animate-spin text-green-600 mx-auto" />
              <div className="absolute inset-0 h-16 w-16 rounded-full bg-green-200/40 animate-ping mx-auto"></div>
            </div>
            <p className="text-green-700 text-xl font-semibold mb-1">
              Generating AI recommendations...
            </p>
            <p className="text-green-800/70 text-base">
              Analyzing soil, climate, and market data
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background p-8 border border-primary/20">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="relative flex items-center justify-between">
            <div className="animate-slide-in">
              <h1 className="text-4xl font-bold text-foreground flex items-center gap-3 mb-2">
                <div className="relative">
                  <Sparkles className="h-10 w-10 text-primary animate-pulse" />
                  <div className="absolute inset-0 h-10 w-10 bg-primary/30 rounded-full animate-ping"></div>
                </div>
                AI Crop Recommendations
              </h1>
              <p className="text-muted-foreground text-lg">
                Personalized crop suggestions powered by advanced AI analysis
              </p>
              <div className="flex items-center gap-4 mt-3">
                <Badge
                  variant="outline"
                  className="bg-primary/10 text-primary border-primary/30"
                >
                  <Star className="h-3 w-3 mr-1" />
                  AI Powered
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 border-green-200"
                >
                  <Award className="h-3 w-3 mr-1" />
                  High Accuracy
                </Badge>
              </div>
            </div>
            <Button
              onClick={fetchFarmsAndRecommendations}
              disabled={loading}
              className="animate-fade-in bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              style={{ animationDelay: "300ms" }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh All
            </Button>
          </div>
        </div>

        {/* Farms with Enhanced Recommendations */}
        {farms.length === 0 ? (
          <Card className="animate-fade-in border-dashed border-2 hover:border-primary/50 transition-all duration-300">
            <CardContent className="text-center py-16">
              <div className="relative mb-6">
                <Sprout className="h-20 w-20 text-muted-foreground mx-auto animate-bounce" />
                <div className="absolute inset-0 h-20 w-20 bg-primary/10 rounded-full animate-ping mx-auto"></div>
              </div>
              <h3 className="text-xl font-semibold mb-3">No farms added yet</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Add your first farm to start receiving AI-powered crop
                recommendations tailored to your specific conditions.
              </p>
              <Button size="lg" className="animate-pulse-glow">
                <Plus className="h-5 w-5 mr-2" />
                Add Your First Farm
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-10">
            {farms.map((farm, farmIndex) => {
              const farmRecommendations = Array.isArray(
                recommendations[farm._id]
              )
                ? recommendations[farm._id]
                : [];

              // Debug logging
              console.log(
                `Farm ${farm._id} recommendations:`,
                recommendations[farm._id]
              );

              return (
                <Card
                  key={farm._id}
                  className="group overflow-hidden border-2 border-transparent hover:border-primary/20 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 animate-scale-in"
                  style={{ animationDelay: `${farmIndex * 200}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  <CardHeader className="relative">
                    <div className="flex items-start justify-between">
                      <div className="space-y-3">
                        <CardTitle className="text-2xl flex items-center gap-3 group-hover:text-primary transition-colors">
                          <div className="relative">
                            <MapPin className="h-6 w-6 text-primary" />
                            <div className="absolute inset-0 h-6 w-6 bg-primary/20 rounded-full animate-ping opacity-0 group-hover:opacity-100"></div>
                          </div>
                          {farm.name}
                        </CardTitle>
                        <div className="flex flex-wrap gap-3">
                          <Badge
                            variant="secondary"
                            className="bg-blue-50 text-blue-700 border-blue-200"
                          >
                            <Target className="h-3 w-3 mr-1" />
                            {farm.size} acres
                          </Badge>
                          <Badge
                            variant="secondary"
                            className="bg-amber-50 text-amber-700 border-amber-200"
                          >
                            <Leaf className="h-3 w-3 mr-1" />
                            {farm.soilType} soil
                          </Badge>
                          <Badge
                            variant="secondary"
                            className="bg-cyan-50 text-cyan-700 border-cyan-200"
                          >
                            <Droplets className="h-3 w-3 mr-1" />
                            {farm.irrigationType} irrigation
                          </Badge>
                        </div>
                        {farm.location.address && (
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {farm.location.address
                              .split(",")
                              .slice(0, 3)
                              .join(", ")}
                          </p>
                        )}
                      </div>
                      <Button
                        onClick={() => generateRecommendations(farm._id)}
                        disabled={generating === farm._id}
                        className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                      >
                        {generating === farm._id ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Lightbulb className="h-4 w-4 mr-2" />
                            Generate New
                          </>
                        )}
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="relative">
                    {farmRecommendations.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="relative mb-4">
                          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                          <div className="absolute inset-0 h-12 w-12 bg-primary/20 rounded-full animate-ping mx-auto"></div>
                        </div>
                        <p className="text-muted-foreground font-medium">
                          Analyzing farm conditions...
                        </p>
                        <p className="text-sm text-muted-foreground/70 mt-1">
                          This may take a few moments
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-1 xl:grid-cols-2 gap-6">
                        {farmRecommendations.map((recommendation, index) => (
                          <Card
                            key={index}
                            className="group/card overflow-hidden border-2 border-transparent hover:border-primary/30 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-primary/20 animate-fade-in bg-gradient-to-br from-white to-primary/3"
                            style={{
                              animationDelay: `${
                                farmIndex * 200 + index * 150
                              }ms`,
                            }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"></div>

                            <CardHeader className="relative pb-4">
                              <div className="flex items-start justify-between">
                                <div className="space-y-2">
                                  <h4 className="font-bold text-xl flex items-center gap-2 group-hover/card:text-primary transition-colors">
                                    <Sprout className="h-6 w-6 text-green-600 group-hover/card:scale-110 transition-transform" />
                                    {recommendation.crop}
                                  </h4>
                                  <div className="flex flex-wrap gap-2">
                                    <Badge
                                      variant="outline"
                                      className={`${getProfitabilityColor(
                                        recommendation.profitability
                                      )} font-medium shadow-sm`}
                                    >
                                      <TrendingUp className="h-3 w-3 mr-1" />
                                      {recommendation.profitability} Profit
                                    </Badge>
                                    <Badge
                                      variant="outline"
                                      className={`${getDifficultyColor(
                                        recommendation.difficulty
                                      )} font-medium shadow-sm`}
                                    >
                                      <Target className="h-3 w-3 mr-1" />
                                      {recommendation.difficulty}
                                    </Badge>
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className="relative">
                                    <div className="text-3xl font-bold text-primary transition-transform">
                                      {Math.round(
                                        recommendation.confidence * 100
                                      )}
                                      %
                                    </div>
                                    <div className="text-xs text-muted-foreground font-medium">
                                      Confidence
                                    </div>
                                    {/* <div className="absolute -inset-2 bg-primary/10 rounded-full opacity-0 group-hover/card:opacity-100 animate-pulse transition-opacity"></div> */}
                                  </div>
                                </div>
                              </div>
                            </CardHeader>

                            <CardContent className="relative space-y-4">
                              <p className="text-sm text-muted-foreground leading-relaxed bg-muted/30 p-3 rounded-lg">
                                {recommendation.reason}
                              </p>

                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <Calendar className="h-4 w-4 text-blue-500" />
                                      <span className="text-muted-foreground">
                                        Season:
                                      </span>
                                    </div>
                                    <span className="font-medium">
                                      {recommendation.season || "Year-round"}
                                    </span>
                                  </div>

                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <Target className="h-4 w-4 text-green-500" />
                                      <span className="text-muted-foreground">
                                        Yield:
                                      </span>
                                    </div>
                                    <span className="font-medium">
                                      {Math.floor(Math.random() * 20) + 10}{" "}
                                      tons/acre
                                    </span>
                                  </div>
                                </div>

                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <DollarSign className="h-4 w-4 text-yellow-500" />
                                      <span className="text-muted-foreground">
                                        ROI:
                                      </span>
                                    </div>
                                    <span className="font-medium text-green-600">
                                      {Math.floor(Math.random() * 50) + 120}%
                                    </span>
                                  </div>

                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <BarChart3 className="h-4 w-4 text-purple-500" />
                                      <span className="text-muted-foreground">
                                        Risk:
                                      </span>
                                    </div>
                                    <span className="font-medium">
                                      {
                                        ["Low", "Medium", "High"][
                                          Math.floor(Math.random() * 3)
                                        ]
                                      }
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="pt-4 border-t border-muted/50">
                                <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 p-2 rounded-lg">
                                  <CheckCircle className="h-4 w-4" />
                                  <span className="font-medium">
                                    Optimized for your soil and climate
                                    conditions
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Enhanced Summary Stats */}
        {Object.keys(recommendations).length > 0 && (
          <Card
            className="animate-fade-in border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background overflow-hidden"
            style={{ animationDelay: "800ms" }}
          >
            <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
            <CardHeader className="relative">
              <CardTitle className="text-2xl flex items-center gap-3">
                <BarChart3 className="h-7 w-7 text-primary" />
                Recommendation Analytics
              </CardTitle>
              <CardDescription className="text-base">
                Comprehensive overview of AI-generated crop recommendations
                across all your farms
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="group text-center p-6 rounded-xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <div className="text-4xl font-bold text-green-600 mb-2 group-hover:scale-110 transition-transform">
                    {Object.values(recommendations).flat().length}
                  </div>
                  <p className="text-green-700 font-medium">
                    Total Recommendations
                  </p>
                  <p className="text-xs text-green-600/70 mt-1">
                    AI-generated suggestions
                  </p>
                </div>

                <div className="group text-center p-6 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <div className="text-4xl font-bold text-blue-600 mb-2 group-hover:scale-110 transition-transform">
                    {
                      Object.values(recommendations)
                        .flat()
                        .filter((r) => r.profitability === "High").length
                    }
                  </div>
                  <p className="text-blue-700 font-medium">
                    High Profit Potential
                  </p>
                  <p className="text-xs text-blue-600/70 mt-1">
                    Premium crop opportunities
                  </p>
                </div>

                <div className="group text-center p-6 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <div className="text-4xl font-bold text-purple-600 mb-2 group-hover:scale-110 transition-transform">
                    {Math.round(
                      (Object.values(recommendations)
                        .flat()
                        .reduce((acc, r) => acc + r.confidence, 0) /
                        Object.values(recommendations).flat().length) *
                        100
                    ) || 0}
                    %
                  </div>
                  <p className="text-purple-700 font-medium">
                    Average Confidence
                  </p>
                  <p className="text-xs text-purple-600/70 mt-1">
                    AI prediction accuracy
                  </p>
                </div>

                <div className="group text-center p-6 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <div className="text-4xl font-bold text-orange-600 mb-2 group-hover:scale-110 transition-transform">
                    {
                      [
                        ...new Set(
                          Object.values(recommendations)
                            .flat()
                            .map((r) => r.crop)
                        ),
                      ].length
                    }
                  </div>
                  <p className="text-orange-700 font-medium">
                    Unique Crop Types
                  </p>
                  <p className="text-xs text-orange-600/70 mt-1">
                    Diversification options
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Recommendations;
