import { Link } from "react-router-dom";
import { Briefcase, CalendarDays, MapPin, Wallet } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { Gig } from "@/services/api";

interface LatestGigsProps {
  gigs?: Gig[];
  loading?: boolean;
}

const formatMoney = (value: number) =>
  `Rs. ${Number(value).toLocaleString("en-NP", {
    maximumFractionDigits: 0,
  })}`;

export default function LatestGigs({ gigs = [], loading = false }: LatestGigsProps) {
  const { isAuthenticated } = useAuth();
  const browsePath = isAuthenticated ? "/gigs" : "/login";

  return (
    <section className="bg-slate-50 px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="h-0.5 w-16 bg-orange-500" />
              <p className="text-sm font-medium text-orange-500">
                Latest opportunities
              </p>
            </div>
            <h2 className="text-4xl font-bold text-gray-900">
              Recently posted tutoring gigs
            </h2>
            <p className="mt-3 max-w-2xl text-gray-600">
              Browse active requests from parents and find teaching work that
              matches your subject, schedule, and location.
            </p>
          </div>
          <Link
            to={browsePath}
            className="inline-flex items-center justify-center rounded-full border border-teal-600 px-6 py-3 font-medium text-teal-700 transition hover:bg-teal-50"
          >
            Browse all gigs
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {loading
            ? [1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-64 animate-pulse rounded-lg border border-gray-200 bg-white"
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
              <Link
                key={gig.id}
                to={isAuthenticated ? `/gigs/${gig.id}` : "/login"}
                className="group rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-teal-700">
                      {gig.subject} - Grade {gig.grade}
                    </p>
                    <h3 className="mt-1 line-clamp-2 text-xl font-semibold text-gray-900 group-hover:text-teal-700">
                      {gig.title}
                    </h3>
                  </div>
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                    Open
                  </span>
                </div>

                <div className="grid gap-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>{gig.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-gray-400" />
                    <span>
                      {formatMoney(gig.budget_min)} - {formatMoney(gig.budget_max)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-gray-400" />
                    <span>
                      {gig.duration_weeks} weeks, {gig.sessions_per_week}x per week
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-gray-400" />
                    <span>{gig.applications_count || 0} applications</span>
                  </div>
                </div>
              </Link>
            ))}
        </div>
      </div>
    </section>
  );
}
