import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import { Award01Icon } from "@hugeicons/core-free-icons";
import { Link } from "react-router-dom";

interface PremiumBannerProps {
  premium: {
    is_active: boolean;
    expires_at?: string;
  } | null;
}

export function PremiumBanner({ premium }: PremiumBannerProps) {
  if (!premium?.is_active) {
    return null;
  }

  return (
    <Card className="mb-8 border-purple-200 bg-purple-50/50">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-purple-600 flex items-center justify-center">
              <HugeiconsIcon
                icon={Award01Icon}
                className="text-white"
                size={24}
              />
            </div>
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2">
                Premium Member
                <Badge className="bg-purple-600">Active</Badge>
              </h3>
              <p className="text-sm text-muted-foreground">
                Expires on{" "}
                {premium.expires_at
                  ? new Date(premium.expires_at).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
          </div>
          <Button variant="outline" asChild>
            <Link to="/premium">Manage Subscription</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
