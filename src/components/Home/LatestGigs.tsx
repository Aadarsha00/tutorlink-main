import { Link } from "react-router-dom";
import { Briefcase, CalendarDays, MapPin, Wallet } from "lucide-react";
import type { Gig } from "@/services/api";

interface LatestGigsProps {
  gigs?: Gig[];
  loading?: boolean;
}

const formatMoney = (value: number) =>
  `Rs. ${Number(value).toLocaleString("en-NP", {
    maximumFractionDigits: 0,
  })}`;

const formatGrade = (grade: string) => {
  const value = String(grade || "").trim();
  if (!value) return "Grade not listed";
  if (/^grade\s+/i.test(value)) return value;
  if (/^\d+$/.test(value)) return `Grade ${value}`;
  return value;
};

export default function LatestGigs({ gigs = [], loading = false }: LatestGigsProps) {
  return (
    <section className="bg-gray-50 px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-block">
            <div className="flex items-center justify-center gap-2">
              <div className="h-0.5 w-20 bg-orange-500" />
              <p className="text-sm font-medium text-orange-500">
                Latest opportunities
              </p>
              <div className="h-0.5 w-20 bg-orange-500" />
            </div>
          </div>
          <h2 className="mb-4 text-4xl font-bold text-gray-900 lg:text-5xl">
            Recently posted
          </h2>
          <h2 className="text-4xl font-bold text-gray-900 lg:text-5xl">
            tutoring gigs
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-gray-600">
            Browse active requests from parents and find teaching work that
            matches your subject, schedule, and location.
          </p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {loading
            ? [1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-72 animate-pulse rounded-lg border border-gray-200 bg-white"
                />
              ))
            : null}

          {!loading && gigs.length === 0 ? (
            <div className="col-span-full rounded-lg border border-dashed border-gray-300 bg-white px-6 py-12 text-center text-gray-600">
              Open gigs will appear here after parents post verified requests.
            </div>
          ) : null}

          {!loading &&
            gigs.map((gig) => (
              <div
                key={gig.id}
                className="flex h-full flex-col rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="line-clamp-1 text-sm font-semibold text-teal-700">
                      {gig.subject || "Subject not listed"} - {formatGrade(gig.grade)}
                    </p>
                    <h3 className="mt-1 line-clamp-2 text-xl font-bold leading-7 text-gray-900">
                      {gig.title}
                    </h3>
                  </div>
                  <span className="shrink-0 rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-800">
                    Open
                  </span>
                </div>

                <p className="mb-4 line-clamp-2 text-sm leading-6 text-gray-600">
                  {gig.description || "Parent is looking for a qualified tutor."}
                </p>

                <div className="mb-4 grid gap-2 text-sm text-gray-600">
                  <div className="flex min-w-0 items-center gap-2">
                    <MapPin className="h-4 w-4 shrink-0 text-teal-600" />
                    <span className="truncate">
                      {gig.location || "Location not listed"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 shrink-0 text-teal-600" />
                    <span className="font-semibold text-gray-900">
                      {formatMoney(gig.budget_min)} - {formatMoney(gig.budget_max)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 shrink-0 text-teal-600" />
                    <span>
                      {gig.duration_weeks} weeks, {gig.sessions_per_week}x per week
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 shrink-0 text-teal-600" />
                    <span>{gig.applications_count || 0} applications</span>
                  </div>
                </div>

                <div className="mt-auto pt-2">
                  <Link
                    to={`/gigs/${gig.id}`}
                    className="inline-flex w-full items-center justify-center rounded-full border border-teal-600 px-5 py-2.5 text-sm font-medium text-teal-700 transition hover:bg-teal-50"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
        </div>

        <div className="flex justify-center">
          <Link
            to="/gigs"
            className="rounded-full bg-teal-600 px-8 py-3.5 font-medium text-white shadow-lg transition-all hover:bg-teal-700"
          >
            Browse All Gigs
          </Link>
        </div>
      </div>
    </section>
  );
}
