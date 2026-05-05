import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Award,
  BadgeCheck,
  BookOpen,
  BriefcaseBusiness,
  GraduationCap,
  MapPin,
  Star,
} from "lucide-react";
import Navbar from "@/components/Home/Navbar";
import Footer from "@/components/Home/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import api, { type PublicTutorDetails, type TeacherProfile } from "@/services/api";

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

function gradeLabel(name: string) {
  const trimmed = name.trim();
  if (/^grade\s+/i.test(trimmed)) return trimmed;
  if (/^\d+$/.test(trimmed)) return `Grade ${trimmed}`;
  return trimmed;
}

function ctaPath(userRole?: string) {
  if (!userRole) return "/register?role=parent";
  if (userRole === "parent") return "/parent/create-gig";
  return "/dashboard";
}

function ctaLabel(userRole?: string) {
  if (!userRole) return "Register to Connect";
  if (userRole === "parent") return "Post a Gig";
  return "Go to Dashboard";
}

export function TutorDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [tutor, setTutor] = useState<PublicTutorDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const tutorId = Number(id);
    if (!Number.isFinite(tutorId)) {
      setError("Tutor not found.");
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setError("");

    api.public
      .tutor(tutorId)
      .then((data) => {
        if (active) setTutor(data);
      })
      .catch((requestError) => {
        console.error("Failed to load tutor", requestError);
        if (active) setError("Tutor not found or not currently verified.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  const rating = Number(tutor?.average_rating || 0);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="bg-linear-to-br from-teal-50 via-white to-orange-50">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <Button variant="ghost" asChild className="mb-5 px-0 text-teal-700">
            <Link to="/tutor">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to tutors
            </Link>
          </Button>

          {loading ? (
            <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
              <div className="h-96 animate-pulse rounded-lg bg-white" />
              <div className="h-96 animate-pulse rounded-lg bg-white" />
            </div>
          ) : error || !tutor ? (
            <Card className="border-dashed bg-white">
              <CardContent className="px-6 py-16 text-center">
                <h1 className="text-2xl font-bold text-gray-900">
                  Tutor unavailable
                </h1>
                <p className="mx-auto mt-2 max-w-md text-gray-600">
                  {error || "This tutor profile is not available."}
                </p>
                <Button asChild className="mt-6">
                  <Link to="/tutor">Browse Tutors</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
              <aside className="space-y-5">
                <Card className="overflow-hidden border-gray-200 bg-white shadow-sm">
                  <CardContent className="p-6 text-center">
                    <img
                      src={tutorImage(tutor)}
                      alt={tutorName(tutor)}
                      className="mx-auto h-40 w-40 rounded-full border-4 border-teal-50 object-cover"
                    />
                    <div className="mt-5 flex justify-center gap-2">
                      {tutor.verification_status === "verified" && (
                        <Badge className="bg-teal-100 text-teal-700">
                          <BadgeCheck className="mr-1 h-3.5 w-3.5" />
                          Verified
                        </Badge>
                      )}
                      {tutor.is_premium && (
                        <Badge className="bg-orange-100 text-orange-700">
                          <Award className="mr-1 h-3.5 w-3.5" />
                          Premium
                        </Badge>
                      )}
                    </div>
                    <h1 className="mt-4 text-2xl font-bold text-gray-900">
                      {tutorName(tutor)}
                    </h1>
                    <p className="mt-2 font-semibold text-teal-700">
                      {formatRate(tutor)}
                    </p>
                    <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4 text-teal-600" />
                      {tutor.location || "Location not listed"}
                    </div>
                    <Button asChild className="mt-6 w-full">
                      <Link to={ctaPath(user?.role)}>{ctaLabel(user?.role)}</Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-gray-200 bg-white shadow-sm">
                  <CardContent className="grid grid-cols-3 gap-3 p-5 text-center">
                    <div>
                      <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-md bg-yellow-50">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      </div>
                      <p className="mt-2 text-sm font-bold text-gray-900">
                        {rating > 0 ? rating.toFixed(1) : "New"}
                      </p>
                      <p className="text-xs text-gray-500">Rating</p>
                    </div>
                    <div>
                      <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-md bg-teal-50">
                        <BriefcaseBusiness className="h-4 w-4 text-teal-700" />
                      </div>
                      <p className="mt-2 text-sm font-bold text-gray-900">
                        {tutor.experience_years}
                      </p>
                      <p className="text-xs text-gray-500">Years</p>
                    </div>
                    <div>
                      <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-md bg-orange-50">
                        <BookOpen className="h-4 w-4 text-orange-700" />
                      </div>
                      <p className="mt-2 text-sm font-bold text-gray-900">
                        {tutor.total_reviews || 0}
                      </p>
                      <p className="text-xs text-gray-500">Reviews</p>
                    </div>
                  </CardContent>
                </Card>
              </aside>

              <section className="space-y-5">
                <Card className="border-gray-200 bg-white shadow-sm">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold text-gray-900">About</h2>
                    <p className="mt-3 whitespace-pre-line leading-7 text-gray-600">
                      {tutor.bio || "This tutor has not added a bio yet."}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-gray-200 bg-white shadow-sm">
                  <CardContent className="p-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                          <GraduationCap className="h-5 w-5 text-teal-700" />
                          Education
                        </h2>
                        <p className="mt-3 leading-7 text-gray-600">
                          {tutor.education || "Education details not listed."}
                        </p>
                      </div>

                      <div>
                        <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                          <BookOpen className="h-5 w-5 text-teal-700" />
                          Subjects
                        </h2>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {tutor.subjects.length > 0 ? (
                            tutor.subjects.map((subject) => (
                              <Badge key={subject.id} variant="secondary">
                                {subject.name}
                              </Badge>
                            ))
                          ) : (
                            <p className="text-gray-600">No subjects listed.</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <Separator className="my-6" />

                    <div>
                      <h2 className="text-lg font-bold text-gray-900">
                        Teaching Levels
                      </h2>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {tutor.grades.length > 0 ? (
                          tutor.grades.map((grade) => (
                            <Badge key={grade.id} variant="outline">
                              {gradeLabel(grade.name)}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-gray-600">No grade levels listed.</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-gray-200 bg-white shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">
                          Parent Reviews
                        </h2>
                        <p className="mt-1 text-sm text-gray-600">
                          Feedback from completed tutoring gigs.
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        {rating > 0 ? rating.toFixed(1) : "New"} / 5
                        <span className="font-normal text-gray-500">
                          ({tutor.total_reviews || 0})
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 space-y-4">
                      {tutor.reviews.length > 0 ? (
                        tutor.reviews.map((review) => (
                          <div
                            key={review.id}
                            className="rounded-lg border border-gray-100 bg-gray-50 p-4"
                          >
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {review.parent_name || "Parent"}
                                </p>
                                {(review.subject || review.grade) && (
                                  <p className="mt-1 text-sm text-gray-500">
                                    {[review.subject, gradeLabel(review.grade)]
                                      .filter(Boolean)
                                      .join(" - ")}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-1 text-sm font-semibold text-gray-900">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                {review.score}/5
                              </div>
                            </div>
                            <p className="mt-3 leading-6 text-gray-700">
                              {review.review}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-5 py-8 text-center text-gray-600">
                          No written reviews yet.
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-teal-200 bg-teal-50 shadow-sm">
                  <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-teal-950">
                        Ready to connect?
                      </h2>
                      <p className="mt-1 text-sm text-teal-800">
                        Create a gig with your subject, budget, and schedule so
                        the tutor can apply through TutorSpot.
                      </p>
                    </div>
                    <Button asChild className="shrink-0">
                      <Link to={ctaPath(user?.role)}>{ctaLabel(user?.role)}</Link>
                    </Button>
                  </CardContent>
                </Card>
              </section>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
