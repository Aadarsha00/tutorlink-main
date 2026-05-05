import { Link } from "react-router-dom";
import { BadgeCheck, BriefcaseBusiness, FileText, School } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function JobsTeaser() {
  const { user, isAuthenticated } = useAuth();
  const ctaHref =
    isAuthenticated && user?.role === "teacher"
      ? "/jobs"
      : isAuthenticated
      ? "/dashboard"
      : "/register?role=teacher";

  const ctaLabel =
    isAuthenticated && user?.role === "teacher"
      ? "Open Teacher Dashboard"
      : isAuthenticated
      ? "Go to Dashboard"
      : "Register as Teacher";

  return (
    <section className="bg-white px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="mb-4 inline-block">
              <div className="flex items-center gap-2">
                <div className="h-0.5 w-20 bg-orange-500" />
                <p className="text-sm font-medium text-orange-500">
                  More than tutoring
                </p>
              </div>
            </div>

            <h2 className="text-4xl font-bold leading-tight text-gray-900 lg:text-5xl">
              Teachers can discover school opportunities too.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-gray-600">
              TutorSpot also supports school job openings for verified teachers.
              Teachers can browse available roles, attach their verified CV, and
              apply directly from their dashboard.
            </p>

            <Link
              to={ctaHref}
              className="mt-7 inline-flex rounded-full bg-teal-600 px-8 py-3.5 font-medium text-white shadow-lg transition-all hover:bg-teal-700"
            >
              {ctaLabel}
            </Link>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-teal-600 text-white">
                <School className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  School hiring support
                </h3>
                <p className="text-sm text-gray-600">
                  Job access stays inside teacher dashboards.
                </p>
              </div>
            </div>

            <div className="grid gap-3">
              <div className="flex items-start gap-3 rounded-lg bg-white p-4">
                <BriefcaseBusiness className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" />
                <div>
                  <p className="font-semibold text-gray-900">
                    Curated school openings
                  </p>
                  <p className="mt-1 text-sm leading-6 text-gray-600">
                    Admins can publish opportunities without exposing a public
                    jobs list.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg bg-white p-4">
                <FileText className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" />
                <div>
                  <p className="font-semibold text-gray-900">
                    Verified CV applications
                  </p>
                  <p className="mt-1 text-sm leading-6 text-gray-600">
                    Teachers apply using the latest verified CV from their
                    profile.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg bg-white p-4">
                <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" />
                <div>
                  <p className="font-semibold text-gray-900">
                    Available after verification
                  </p>
                  <p className="mt-1 text-sm leading-6 text-gray-600">
                    The workflow is designed for approved teacher accounts, not
                    casual browsing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
