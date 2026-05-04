// hooks/useProfileCheck.ts
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import api, { type ProfileCompletion } from "@/services/api";

interface ProfileStatus {
  hasProfile: boolean;
  isComplete: boolean;
  completionData: ProfileCompletion | null;
  loading: boolean;
  error: string | null;
}

export function useProfileCheck(): ProfileStatus {
  const { user } = useAuth();
  const [status, setStatus] = useState<ProfileStatus>({
    hasProfile: false,
    isComplete: false,
    completionData: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const checkProfile = async () => {
      if (!user) {
        setStatus({
          hasProfile: false,
          isComplete: false,
          completionData: null,
          loading: false,
          error: null,
        });
        return;
      }

      // Admin doesn't need profiles
      if (user.role === "admin") {
        setStatus({
          hasProfile: true,
          isComplete: true,
          completionData: null,
          loading: false,
          error: null,
        });
        return;
      }

      try {
        // Check profile completion
        const completionData = await api.profileCompletion.check();

        setStatus({
          hasProfile: completionData.profile_exists,
          isComplete: completionData.is_complete,
          completionData,
          loading: false,
          error: null,
        });
      } catch (err: any) {
        console.error("Profile check error:", err);

        // If 404, profile doesn't exist
        if (err.response?.status === 404) {
          setStatus({
            hasProfile: false,
            isComplete: false,
            completionData: null,
            loading: false,
            error: null,
          });
        } else {
          setStatus({
            hasProfile: false,
            isComplete: false,
            completionData: null,
            loading: false,
            error: "Failed to check profile status",
          });
        }
      }
    };

    checkProfile();
  }, [user]);

  return status;
}
