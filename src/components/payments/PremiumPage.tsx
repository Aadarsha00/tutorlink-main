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
  Calendar03Icon,
  ClockIcon,
  Info,
  CancelCircleIcon,
} from "@hugeicons/core-free-icons";

import api, {
  type PremiumPlan,
  type PremiumEligibility,
  type PremiumSubscription,
} from "@/services/api";

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
  const [billingCycle, setBillingCycle] = React.useState<"monthly" | "yearly">(
    "monthly"
  );

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
        plan_option_id: plan.id,
      });

      if (!res.payment_url) {
        throw new Error("Payment URL not returned");
      }

      window.location.assign(res.payment_url);
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
  const visiblePlans = plans.filter((plan) => plan.billing_cycle === billingCycle);

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
            Upgrade for unlimited gig applications and stronger tutor
            visibility after your profile and documents are verified.
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
                ? "Premium is available"
                : "Verification Required"}
            </AlertTitle>
            <AlertDescription>
              {eligibility?.eligible ? (
                <p className="text-green-700">
                  Your profile and required documents are verified. You can
                  subscribe to Premium now.
                </p>
              ) : (
                <div className="space-y-2">
                  <p className="text-orange-700 font-medium">
                    {eligibility?.reason}
                  </p>
                </div>
              )}
            </AlertDescription>
          </Alert>
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
              <div className="mx-auto flex w-fit rounded-lg border border-border bg-muted p-1">
                <Button
                  type="button"
                  variant={billingCycle === "monthly" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setBillingCycle("monthly")}
                >
                  Monthly
                </Button>
                <Button
                  type="button"
                  variant={billingCycle === "yearly" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setBillingCycle("yearly")}
                >
                  Yearly
                  <Badge variant="secondary" className="ml-2">
                    Save 17%
                  </Badge>
                </Button>
              </div>
            </div>

            <div className="mx-auto grid max-w-md grid-cols-1 gap-6 mb-8">
              {visiblePlans.map((plan) => (
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
                    {plan.tagline && (
                      <p className="text-sm text-muted-foreground">{plan.tagline}</p>
                    )}
                    <CardDescription>
                      <div className="mt-2">
                        <span className="text-3xl font-bold text-foreground">
                          Rs. {plan.amount}
                        </span>
                      </div>
                      <div className="text-sm mt-1">
                        {billingCycle === "monthly" ? "per month" : "per year"}
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
