import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/services/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, MapPin, X } from "lucide-react";
import { toast } from "sonner";

interface CreateFarmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFarmCreated: () => void;
}

const CreateFarmModal: React.FC<CreateFarmModalProps> = ({
  isOpen,
  onClose,
  onFarmCreated,
}) => {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    latitude: 0,
    longitude: 0,
    address: "",
    size: "",
    soilType: "",
    irrigationType: "",
    cropHistory: [] as string[],
    newCrop: "",
  });
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [error, setError] = useState("");

  const soilTypes = [
    "Alluvial",
    "Black (Regur)",
    "Red",
    "Laterite",
    "Arid (Desert)",
    "Saline/Alkaline",
    "Peaty/Marshy",
    "Mountain/Forest"
  ];

  const irrigationTypes = [
    "Rain-fed",
    "Canal",
    "Tube Well",
    "Dug Well",
    "Drip",
    "Sprinkler",
    "Tank",
    "Lift",
    "Percolation",
    "Check Dam",
    "Pipeline through Borewell",
  ];

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser");
      return;
    }

    setGettingLocation(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setFormData((prev) => ({
          ...prev,
          latitude,
          longitude,
        }));

        // Address will be automatically set by the backend using reverse geocoding

        setGettingLocation(false);
        toast.success("Location detected successfully");
      },
      (error) => {
        setGettingLocation(false);
        setError(
          "Could not get your location. Please enter coordinates manually."
        );
        console.error("Geolocation error:", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleAddCrop = () => {
    if (
      formData.newCrop.trim() &&
      !formData.cropHistory.includes(formData.newCrop.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        cropHistory: [...prev.cropHistory, prev.newCrop.trim()],
        newCrop: "",
      }));
    }
  };

  const handleRemoveCrop = (cropToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      cropHistory: prev.cropHistory.filter((crop) => crop !== cropToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    setError("");

    try {
      await apiService.createFarm(
        {
          name: formData.name,
          latitude: formData.latitude,
          longitude: formData.longitude,
          size: parseFloat(formData.size),
          soilType: formData.soilType,
          irrigationType: formData.irrigationType,
          cropHistory: formData.cropHistory,
        },
        token
      );

      toast.success("Farm created successfully");
      onFarmCreated();
      onClose();

      // Reset form
      setFormData({
        name: "",
        latitude: 0,
        longitude: 0,
        address: "",
        size: "",
        soilType: "",
        irrigationType: "",
        cropHistory: [],
        newCrop: "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create farm");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Farm</DialogTitle>
          <DialogDescription>
            Add a new farm to your agricultural portfolio. Use geolocation for
            automatic coordinates.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Farm Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="e.g., Green Valley Farm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="size">Farm Size (acres) *</Label>
              <Input
                id="size"
                name="size"
                type="number"
                value={formData.size}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="e.g., 50"
                min="0.1"
                step="0.1"
              />
            </div>
          </div>

          {/* Location Section */}
          <div className="space-y-4 p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Location</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGetLocation}
                disabled={gettingLocation || loading}
              >
                {gettingLocation ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Getting Location...
                  </>
                ) : (
                  <>
                    <MapPin className="mr-2 h-4 w-4" />
                    Get Current Location
                  </>
                )}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude *</Label>
                <Input
                  id="latitude"
                  name="latitude"
                  type="number"
                  value={formData.latitude}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  placeholder="e.g., 37.7749"
                  step="any"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude *</Label>
                <Input
                  id="longitude"
                  name="longitude"
                  type="number"
                  value={formData.longitude}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  placeholder="e.g., -122.4194"
                  step="any"
                />
              </div>
            </div>

            {formData.address && (
              <div className="space-y-2">
                <Label htmlFor="address">Detected Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="Address will be detected automatically"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="soilType">Soil Type *</Label>
              <Select
                value={formData.soilType}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, soilType: value }))
                }
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select soil type" />
                </SelectTrigger>
                <SelectContent>
                  {soilTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="irrigationType">Irrigation Type *</Label>
              <Select
                value={formData.irrigationType}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, irrigationType: value }))
                }
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select irrigation type" />
                </SelectTrigger>
                <SelectContent>
                  {irrigationTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Crop History */}
          <div className="space-y-2">
            <Label>Crop History (Optional)</Label>
            <div className="flex gap-2">
              <Input
                value={formData.newCrop}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, newCrop: e.target.value }))
                }
                placeholder="Enter a crop name"
                disabled={loading}
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), handleAddCrop())
                }
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddCrop}
                disabled={loading || !formData.newCrop.trim()}
              >
                Add
              </Button>
            </div>

            {formData.cropHistory.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.cropHistory.map((crop, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {crop}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-destructive"
                      onClick={() => handleRemoveCrop(crop)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Farm...
              </>
            ) : (
              "Create Farm"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateFarmModal;
