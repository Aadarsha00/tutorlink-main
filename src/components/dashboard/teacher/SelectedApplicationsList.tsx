import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle01Icon,
  CancelCircleIcon,
  Briefcase01Icon,
  Location01Icon,
  DollarCircleIcon,
  ClockIcon,
} from "@hugeicons/core-free-icons";
import type { Application } from "@/services/api";
import { GigDetailsDialog } from "../shared/GigDetailsDialog";

interface SelectedApplicationsListProps {
  applications: Application[];
  onAccept: (id: number) => void;
  onReject: (id: number) => void;
}

export function SelectedApplicationsList({
  applications,
  onAccept,
  onReject,
}: SelectedApplicationsListProps) {
  if (applications.length === 0) {
    return null;
  }

  return (
    <Card className="mb-8 border-blue-200 bg-blue-50/50">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <HugeiconsIcon
            icon={CheckmarkCircle01Icon}
            className="text-blue-600"
            size={24}
          />
          Selection Requests
        </CardTitle>
        <CardDescription>
          You've been selected! Accept or reject these opportunities.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {applications.map((application) => (
            <Card key={application.id} className="bg-white">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">
                      {typeof application.gig === "object"
                        ? application.gig.title
                        : "Gig"}
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-4">
                      {typeof application.gig === "object" && (
                        <>
                          <div className="flex items-center gap-2">
                            <HugeiconsIcon
                              icon={Briefcase01Icon}
                              size={16}
                            />
                            <span>
                              {application.gig.subject} - Grade{" "}
                              {application.gig.grade}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <HugeiconsIcon
                              icon={Location01Icon}
                              size={16}
                            />
                            <span>{application.gig.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <HugeiconsIcon
                              icon={DollarCircleIcon}
                              size={16}
                            />
                            <span>
                              Budget: Rs. {application.gig.budget_min} -
                              Rs. {application.gig.budget_max}
                            </span>
                          </div>
                        </>
                      )}
                      {application.response_deadline && (
                        <div className="flex items-center gap-2 text-red-600">
                          <HugeiconsIcon icon={ClockIcon} size={16} />
                          <span>
                            Respond by{" "}
                            {new Date(
                              application.response_deadline
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="bg-neutral-50 p-3 rounded-lg mb-3">
                      <p className="text-sm text-muted-foreground">
                        Your proposed rate:{" "}
                        <strong className="text-foreground">
                          Rs. {application.proposed_rate}
                        </strong>
                      </p>
                    </div>
                    <GigDetailsDialog applicationId={application.id} />
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      onClick={() => onAccept(application.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <HugeiconsIcon
                        icon={CheckmarkCircle01Icon}
                        data-icon="inline-start"
                      />
                      Accept
                    </Button>
                    <Button
                      onClick={() => onReject(application.id)}
                      variant="outline"
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <HugeiconsIcon
                        icon={CancelCircleIcon}
                        data-icon="inline-start"
                      />
                      Reject
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
