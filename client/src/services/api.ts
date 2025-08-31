// Commented out real API service, using mock data for development

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

interface Farm {
  _id: string;
  name: string;
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
    address?: string;
  };
  size: number;
  soilType: string;
  irrigationType: string;
  cropHistory: string[];
  owner: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateFarmData {
  name: string;
  latitude: number;
  longitude: number;
  size: number;
  soilType: string;
  irrigationType: string;
  cropHistory: string[];
}

interface WeatherData {
  temperature: number;
  humidity: number;
  description: string;
  windSpeed: number;
  pressure: number;
  visibility: number;
  uvIndex: number;
}

// Open-Meteo API response structure
interface OpenMeteoResponse {
  current_weather: {
    temperature: number;
    weathercode: number;
    windspeed: number;
  };
  hourly: {
    time: string[];
    relative_humidity_2m: number[];
    temperature_2m: number[];
    weathercode: number[];
    wind_speed_10m: number[];
  };
}

// Weather code to description mapping
const weatherCodeMap: { [key: number]: string } = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Foggy",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  71: "Slight snow",
  73: "Moderate snow",
  75: "Heavy snow",
  77: "Snow grains",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  85: "Slight snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail",
};

// Transform Open-Meteo response to our WeatherData format
function transformWeatherData(apiResponse: OpenMeteoResponse): WeatherData {
  const current = apiResponse.current_weather;
  const hourly = apiResponse.hourly;

  // Get current hour index
  const now = new Date();
  const currentHour = now.getHours();
  const hourIndex = hourly.time.findIndex((time) => {
    const timeDate = new Date(time);
    return timeDate.getHours() === currentHour;
  });

  const weatherCode = current.weathercode;
  const description = weatherCodeMap[weatherCode] || "Unknown";

  return {
    temperature: current.temperature,
    humidity: hourly.relative_humidity_2m[hourIndex] || 0,
    description: description,
    windSpeed: current.windspeed,
    pressure: 1013, // Default value as Open-Meteo doesn't provide pressure
    visibility: 10, // Default value
    uvIndex: 5, // Default value
  };
}

interface CropRecommendation {
  crop: string;
  suitabilityScore: number;
  explanation: string;
  plantingTime: string;
  expectedYield: string;
  // New properties for the UI
  profitability: "High" | "Medium" | "Low";
  difficulty: "Easy" | "Moderate" | "Hard";
  confidence: number; // 0-1 scale
  reason: string;
  season?: string;
}

class ApiService {
  private getAuthHeader(token: string) {
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }

  async createFarm(farmData: CreateFarmData, token: string): Promise<Farm> {
    const response = await fetch(`${API_BASE_URL}/farms`, {
      method: "POST",
      headers: this.getAuthHeader(token),
      body: JSON.stringify(farmData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create farm");
    }
    return response.json();
  }

  async getFarms(token: string): Promise<Farm[]> {
    const response = await fetch(`${API_BASE_URL}/farms`, {
      headers: this.getAuthHeader(token),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch farms");
    }
    return response.json();
  }

  async getFarm(farmId: string, token: string): Promise<Farm> {
    const response = await fetch(`${API_BASE_URL}/farms/${farmId}`, {
      headers: this.getAuthHeader(token),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch farm");
    }
    return response.json();
  }

  async updateFarm(
    farmId: string,
    farmData: Partial<CreateFarmData>,
    token: string
  ): Promise<Farm> {
    const response = await fetch(`${API_BASE_URL}/farms/${farmId}`, {
      method: "PUT",
      headers: this.getAuthHeader(token),
      body: JSON.stringify(farmData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update farm");
    }
    return response.json();
  }

  async deleteFarm(farmId: string, token: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/farms/${farmId}`, {
      method: "DELETE",
      headers: this.getAuthHeader(token),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete farm");
    }
  }

  async getWeatherData(farmId: string, token: string): Promise<WeatherData> {
    const response = await fetch(`${API_BASE_URL}/weather?farmId=${farmId}`, {
      headers: this.getAuthHeader(token),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch weather data");
    }
    const apiResponse: OpenMeteoResponse = await response.json();
    return transformWeatherData(apiResponse);
  }

  async getCropRecommendations(
    farmId: string,
    token: string
  ): Promise<CropRecommendation[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/recommendations/crop`, {
        method: "POST",
        headers: this.getAuthHeader(token),
        body: JSON.stringify({ farmId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.message || "Failed to fetch crop recommendations"
        );
      }

      const data = await response.json();
      console.log("Raw recommendations response:", data);

      // Handle different response formats
      if (Array.isArray(data)) {
        return data;
      } else if (data && data.recommendation) {
        // Handle old format where response was { recommendation: string, prompt: string }
        console.warn("Received old recommendations format, returning fallback");
        return [
          {
            crop: "General Recommendation",
            suitabilityScore: 75,
            explanation: "Based on your farm conditions",
            plantingTime: "Next Season",
            expectedYield: "Variable",
            profitability: "Medium",
            difficulty: "Moderate",
            confidence: 0.75,
            reason:
              "AI analysis suggests this crop is suitable for your soil and climate.",
            season: "Year-round",
          },
        ];
      } else {
        console.warn("Unexpected recommendations format:", data);
        return [];
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      throw error;
    }
  }

  async updateUserProfile(
    userData: { name?: string; email?: string; location?: string },
    token: string
  ) {
    const response = await fetch(`${API_BASE_URL}/user/me`, {
      method: "PUT",
      headers: this.getAuthHeader(token),
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update profile");
    }
    return response.json();
  }
}

export const apiService = new ApiService();
export type {
  Farm,
  CreateFarmData,
  WeatherData,
  CropRecommendation,
  OpenMeteoResponse,
};
