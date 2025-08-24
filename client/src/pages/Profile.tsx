import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, User as UserIcon, Mail, MapPin, Shield } from "lucide-react";

const getInitials = (name?: string) => {
  if (!name) return "";
  const parts = name.split(" ");
  if (parts.length === 1) return parts[0][0];
  return parts[0][0] + parts[1][0];
};

const Profile: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center text-muted-foreground">
            User profile not found.
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex justify-center items-center min-h-[70vh]">
        <Card className="w-full max-w-md shadow-xl border border-green-100 animate-fade-in">
          <CardHeader className="flex flex-col items-center gap-2 pb-2">
            <Avatar className="h-20 w-20 mb-2">
              <AvatarFallback className="text-2xl bg-green-100 text-green-700">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="text-2xl text-center">{user.name}</CardTitle>
            <CardDescription className="text-center">
              Farmer Profile
            </CardDescription>
            <Badge
              variant="outline"
              className="capitalize mt-2 flex items-center gap-1"
            >
              <Shield className="h-4 w-4 mr-1" />
              {user.role}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4 mt-2">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Mail className="h-5 w-5" />
              <span>{user.email}</span>
            </div>
            {user.location && (
              <div className="flex items-center gap-3 text-muted-foreground">
                <MapPin className="h-5 w-5" />
                <span>{user.location}</span>
              </div>
            )}
            {/* If join date is available, show it */}
            {user.createdAt && (
              <div className="flex items-center gap-3 text-muted-foreground">
                <Calendar className="h-5 w-5" />
                <span>
                  Joined {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            )}
            <div className="flex justify-center mt-6">
              <Button variant="outline" disabled>
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
