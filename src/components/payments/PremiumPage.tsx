import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle01Icon,
  Crown02Icon,
  Loading03Icon,
  AlertCircleIcon,
  Briefcase01Icon,
  FileCheck,
  Calendar03Icon,
  ClockIcon,
  Info,
  CancelCircleIcon,
  Shield,
} from "@hugeicons/core-free-icons";

import api, {
  type PremiumPlan,
  type PremiumEligibility,
  type PremiumSubscription,
} from "@/services/api";
import { useNavigate } from "react-router-dom";

export default function PremiumPage() {
  /* ================= STATE ================= */

  const [plans, setPlans] = React.useState<PremiumPlan[]>([]);
  const [eligibility, setEligibility] =
    React.useState<PremiumEligibility | null>(null);
  const [subscriptions, setSubscriptions] = React.useState<
    PremiumSubscription[]
  >([]);
  const [loading, setLoading] = React.useState(true);
  const [subscribing, setSubscribing] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const navigate = useNavigate();

  /* ================= LOAD DATA ================= */

  React.useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      setLoading(true);
      setError(null);

      const [plansRes, eligibilityRes, subsRes] = await Promise.all([
        api.premium.plans(),
        api.premium.checkEligibility(),
        api.premium.mySubscriptions(),
      ]);

      setPlans(plansRes.plans);
      setEligibility(eligibilityRes);
      setSubscriptions(subsRes);
    } catch (err: any) {
      setError(
        err?.response?.data?.error ||
          err.message ||
          "Failed to load premium data"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================= SUBSCRIBE ================= */

  const handleSubscribe = async (plan: PremiumPlan) => {
    if (!eligibility?.eligible) {
      setError(eligibility?.reason || "You are not eligible for Premium");
      return;
    }

    try {
      setSubscribing(plan.id);
      setError(null);

      const res = await api.premium.subscribe({
        amount: plan.amount,
        duration_days: plan.duration_days,
      });

      if (!res.payment_url) {
        throw new Error("Payment URL not returned");
      }

      navigate(res.payment_url);
    } catch (err: any) {
      setError(
        err?.response?.data?.error || err.message || "Subscription failed"
      );
      setSubscribing(null);
    }
  };

  /* ================= DERIVED ================= */

  const activeSubscription = subscriptions.find(
    (s) =>
      s.status === "active" &&
      (!s.expires_at || new Date(s.expires_at) > new Date())
  );

  const getDaysRemaining = (expiryDate: string) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diff = expiry.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <HugeiconsIcon
            icon={Loading03Icon}
            className="animate-spin mx-auto mb-4"
            size={48}
          />
          <p className="text-muted-foreground">Loading premium plans...</p>
        </div>
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <HugeiconsIcon
            icon={Crown02Icon}
            size={48}
            className="text-emerald-600 mx-auto mb-4"
          />
          <h1 className="text-4xl font-bold mb-2">
            Upgrade to <span className="text-emerald-600">Premium</span>
          </h1>
          <p className="text-muted-foreground">
            Get priority visibility and unlimited applications
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <HugeiconsIcon icon={AlertCircleIcon} className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Active Subscription Banner */}
        {activeSubscription && (
          <Card className="mb-6 border-emerald-200 bg-emerald-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <HugeiconsIcon
                    icon={Crown02Icon}
                    className="text-emerald-600"
                    size={24}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-lg font-semibold">
                      Premium Subscription Active
                    </h3>
                    <Badge className="bg-green-100 text-green-700 border-green-300">
                      Active
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <HugeiconsIcon
                        icon={Calendar03Icon}
                        size={16}
                        className="text-muted-foreground"
                      />
                      <span className="text-muted-foreground">Started:</span>
                      <span className="font-medium">
                        {new Date(
                          activeSubscription.starts_at || ""
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <HugeiconsIcon
                        icon={Calendar03Icon}
                        size={16}
                        className="text-muted-foreground"
                      />
                      <span className="text-muted-foreground">Expires:</span>
                      <span className="font-medium">
                        {new Date(
                          activeSubscription.expires_at || ""
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <HugeiconsIcon
                        icon={ClockIcon}
                        size={16}
                        className="text-muted-foreground"
                      />
                      <span className="text-muted-foreground">Days Left:</span>
                      <span className="font-semibold text-emerald-600">
                        {getDaysRemaining(activeSubscription.expires_at || "")}{" "}
                        days
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Eligibility Status */}
        {!activeSubscription && (
          <Alert
            className={`mb-6 ${
              eligibility?.eligible
                ? "border-green-200 bg-green-50"
                : "border-orange-200 bg-orange-50"
            }`}
          >
            <HugeiconsIcon
              icon={eligibility?.eligible ? CheckmarkCircle01Icon : Info}
              className="h-4 w-4"
            />
            <AlertTitle
              className={
                eligibility?.eligible ? "text-green-700" : "text-orange-700"
              }
            >
              {eligibility?.eligible
                ? "You're Eligible for Premium!"
                : "Premium Eligibility Requirements"}
            </AlertTitle>
            <AlertDescription>
              {eligibility?.eligible ? (
                <p className="text-green-700">
                  You meet all requirements to upgrade to Premium. Choose a plan
                  below to get started.
                </p>
              ) : (
                <div className="space-y-2">
                  <p className="text-orange-700 font-medium">
                    {eligibility?.reason}
                  </p>
                  <div className="mt-3">
                    <p className="text-sm font-semibold mb-2 text-orange-900">
                      To become eligible, you need to:
                    </p>
                    <ul className="space-y-1 text-sm text-orange-800">
                      <li className="flex items-start gap-2">
                        <span>•</span>
                        <span>Complete at least one gig successfully, OR</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>•</span>
                        <span>
                          Be selected by a parent for at least one gig
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Grid */}
        {eligibility?.stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Completed Gigs
                    </p>
                    <p className="text-2xl font-bold">
                      {eligibility.stats.completed_gigs}
                    </p>
                    {eligibility.stats.completed_gigs > 0 && (
                      <Badge
                        variant="outline"
                        className="mt-2 border-green-300 text-green-700"
                      >
                        <HugeiconsIcon
                          icon={CheckmarkCircle01Icon}
                          size={12}
                          className="mr-1"
                        />
                        Eligible
                      </Badge>
                    )}
                  </div>
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                    <HugeiconsIcon
                      icon={FileCheck}
                      className="text-green-600"
                      size={24}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Selected Applications
                    </p>
                    <p className="text-2xl font-bold">
                      {eligibility.stats.selected_applications}
                    </p>
                    {eligibility.stats.selected_applications > 0 && (
                      <Badge
                        variant="outline"
                        className="mt-2 border-blue-300 text-blue-700"
                      >
                        <HugeiconsIcon
                          icon={CheckmarkCircle01Icon}
                          size={12}
                          className="mr-1"
                        />
                        Eligible
                      </Badge>
                    )}
                  </div>
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <HugeiconsIcon
                      icon={Shield}
                      className="text-blue-600"
                      size={24}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Active Gigs
                    </p>
                    <p className="text-2xl font-bold">
                      {eligibility.stats.active_gigs}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Currently teaching
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <HugeiconsIcon
                      icon={Briefcase01Icon}
                      className="text-purple-600"
                      size={24}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Premium Plans */}
        {!activeSubscription && (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-center mb-2">
                Choose Your Plan
              </h2>
              <p className="text-center text-muted-foreground mb-6">
                Select the plan that works best for you
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {plans.map((plan) => (
                <Card
                  key={plan.id}
                  className={`relative ${
                    plan.popular ? "border-emerald-300 shadow-md" : ""
                  }`}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500">
                      Most Popular
                    </Badge>
                  )}

                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>
                      <div className="mt-2">
                        <span className="text-3xl font-bold text-foreground">
                          Rs. {plan.amount}
                        </span>
                      </div>
                      <div className="text-sm mt-1">
                        for {plan.duration_days} days
                      </div>
                      {plan.savings && (
                        <Badge
                          variant="outline"
                          className="mt-2 border-green-300 text-green-700"
                        >
                          Save Rs. {plan.savings}
                        </Badge>
                      )}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <Separator className="mb-4" />

                    <ul className="space-y-2 mb-6">
                      {plan.features.map((feature, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-sm"
                        >
                          <HugeiconsIcon
                            icon={CheckmarkCircle01Icon}
                            className="text-green-600 shrink-0 mt-0.5"
                            size={16}
                          />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className="w-full"
                      disabled={
                        !eligibility?.eligible ||
                        !!activeSubscription ||
                        subscribing !== null
                      }
                      onClick={() => handleSubscribe(plan)}
                    >
                      {subscribing === plan.id ? (
                        <>
                          <HugeiconsIcon
                            icon={Loading03Icon}
                            className="animate-spin mr-2"
                            size={16}
                          />
                          Processing...
                        </>
                      ) : activeSubscription ? (
                        <>
                          <HugeiconsIcon
                            icon={CheckmarkCircle01Icon}
                            className="mr-2"
                            size={16}
                          />
                          Already Subscribed
                        </>
                      ) : !eligibility?.eligible ? (
                        <>
                          <HugeiconsIcon
                            icon={CancelCircleIcon}
                            className="mr-2"
                            size={16}
                          />
                          Not Eligible
                        </>
                      ) : (
                        <>
                          <HugeiconsIcon
                            icon={Crown02Icon}
                            className="mr-2"
                            size={16}
                          />
                          Subscribe Now
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Subscription History */}
        {subscriptions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HugeiconsIcon icon={ClockIcon} size={20} />
                Subscription History
              </CardTitle>
              <CardDescription>
                Your past and current subscriptions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {subscriptions.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          sub.status === "active"
                            ? "bg-green-100"
                            : sub.status === "pending"
                            ? "bg-yellow-100"
                            : "bg-neutral-100"
                        }`}
                      >
                        <HugeiconsIcon
                          icon={
                            sub.status === "active"
                              ? CheckmarkCircle01Icon
                              : sub.status === "pending"
                              ? ClockIcon
                              : CancelCircleIcon
                          }
                          className={
                            sub.status === "active"
                              ? "text-green-600"
                              : sub.status === "pending"
                              ? "text-yellow-600"
                              : "text-neutral-600"
                          }
                          size={20}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">
                            {sub.duration_days} Days Plan
                          </p>
                          <Badge
                            variant={
                              sub.status === "active"
                                ? "default"
                                : sub.status === "pending"
                                ? "secondary"
                                : "outline"
                            }
                            className={
                              sub.status === "active"
                                ? "bg-green-100 text-green-700 border-green-300"
                                : sub.status === "pending"
                                ? "bg-yellow-100 text-yellow-700 border-yellow-300"
                                : ""
                            }
                          >
                            {sub.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {sub.starts_at && sub.expires_at ? (
                            <>
                              {new Date(sub.starts_at).toLocaleDateString()} -{" "}
                              {new Date(sub.expires_at).toLocaleDateString()}
                              {sub.status === "active" && (
                                <span className="ml-2 font-medium text-emerald-600">
                                  ({getDaysRemaining(sub.expires_at)} days left)
                                </span>
                              )}
                            </>
                          ) : (
                            `Created ${new Date(
                              sub.created_at
                            ).toLocaleDateString()}`
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">Rs. {sub.amount}</p>
                      <p className="text-xs text-muted-foreground">NPR</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
