import { Link } from "react-router-dom";
import { CheckCircle2, GraduationCap, MapPin, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import type { TeacherProfile } from "@/services/api";

function formatRate(tutor: TeacherProfile) {
  const min = Number(tutor.hourly_rate_min);
  const max = Number(tutor.hourly_rate_max);

  if (!min && !max) return "Rate not listed";
  if (min === max) return `Rs. ${min}/hr`;
  return `Rs. ${min} - ${max}/hr`;
}

function tutorImage(tutor: TeacherProfile) {
  return tutor.user.profile_picture || "/woman1.jpeg";
}

function tutorName(tutor: TeacherProfile) {
  return tutor.full_name || tutor.user.full_name || "Tutor";
}

function connectPath(userRole?: string) {
  if (!userRole) return "/register";
  if (userRole === "parent") return "/parent/create-gig";
  return "/dashboard";
}

export function PublicTutorCard({ tutor }: { tutor: TeacherProfile }) {
  const { user } = useAuth();
  const subjects = tutor.subjects.slice(0, 3);
  const rating = Number(tutor.average_rating || 0);

  return (
    <Card className="flex h-full overflow-hidden border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <CardContent className="flex h-full w-full flex-col p-4">
        <div className="mb-4 flex items-start gap-4">
          <img
            src={tutorImage(tutor)}
            alt={tutorName(tutor)}
            className="h-20 w-20 shrink-0 rounded-full border-4 border-teal-50 object-cover"
          />
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-1.5">
              {tutor.verification_status === "verified" && (
                <Badge className="bg-teal-100 px-2 py-0 text-[11px] text-teal-700">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Verified
                </Badge>
              )}
            </div>
            <h2 className="line-clamp-1 text-lg font-bold text-gray-900">
              {tutorName(tutor)}
            </h2>
            <p className="mt-1 text-sm font-semibold text-teal-700">
              {formatRate(tutor)}
            </p>
          </div>
        </div>

        <div className="flex flex-1 flex-col">
          <div className="mb-3 grid gap-2 text-sm text-gray-600">
            <span className="flex min-w-0 items-center gap-1.5">
              <MapPin className="h-4 w-4 shrink-0 text-teal-600" />
              <span className="truncate">
                {tutor.location || "Location not listed"}
              </span>
            </span>
          </div>

          <div className="mb-3 grid grid-cols-3 gap-2">
            <div className="rounded-md bg-gray-50 px-2.5 py-2">
              <div className="flex items-center gap-1 text-[11px] font-medium text-gray-500">
                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                Rating
              </div>
              <p className="mt-1 text-sm font-bold text-gray-900">
                {rating > 0 ? rating.toFixed(1) : "New"}
              </p>
            </div>
            <div className="rounded-md bg-gray-50 px-2.5 py-2">
              <div className="flex items-center gap-1 text-[11px] font-medium text-gray-500">
                <GraduationCap className="h-3.5 w-3.5 text-teal-600" />
                Exp.
              </div>
              <p className="mt-1 text-sm font-bold text-gray-900">
                {tutor.experience_years} yrs
              </p>
            </div>
            <div className="rounded-md bg-gray-50 px-2.5 py-2">
              <p className="text-[11px] font-medium text-gray-500">Reviews</p>
              <p className="mt-1 text-sm font-bold text-gray-900">
                {tutor.total_reviews || 0}
              </p>
            </div>
          </div>

          <div className="mb-3 flex flex-wrap gap-1.5">
            {subjects.map((subject) => (
              <Badge key={subject.id} variant="secondary" className="text-xs">
                {subject.name}
              </Badge>
            ))}
            {tutor.subjects.length > subjects.length && (
              <Badge variant="outline" className="text-xs">
                +{tutor.subjects.length - subjects.length} more
              </Badge>
            )}
          </div>

          <p className="mb-4 line-clamp-2 text-sm leading-5 text-gray-600">
            {tutor.bio || tutor.education || "Profile details coming soon."}
          </p>

          <div className="mt-auto grid gap-2 sm:grid-cols-2">
            <Button asChild size="sm">
              <Link to={connectPath(user?.role)}>
                {user?.role === "parent" ? "Post a Gig" : "Connect"}
              </Link>
            </Button>
            <Button variant="outline" asChild size="sm">
              <Link to={user ? "/dashboard" : "/register"}>View Details</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
