import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import Navbar from "@/components/Home/Navbar";
import Footer from "@/components/Home/Footer";
import { PublicTutorCard } from "@/components/tutor/PublicTutorCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api, {
  type PublicTutorFilters,
  type PublicTutorsResponse,
  type Subject,
} from "@/services/api";

const emptyTutorsResponse: PublicTutorsResponse = {
  count: 0,
  results: [],
  subjects: [],
  locations: [],
};

export function TutorsPage() {
  const [data, setData] = useState<PublicTutorsResponse>(emptyTutorsResponse);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [subjectId, setSubjectId] = useState("all");
  const [location, setLocation] = useState("all");
  const [rating, setRating] = useState("all");
  const [premium, setPremium] = useState("all");

  const filters = useMemo<PublicTutorFilters>(() => {
    const params: PublicTutorFilters = {};
    if (search.trim()) params.search = search.trim();
    if (subjectId !== "all") params.subject_id = subjectId;
    if (location !== "all") params.location = location;
    if (rating !== "all") params.min_rating = rating;
    if (premium !== "all") params.is_premium = premium === "premium";
    return params;
  }, [search, subjectId, location, rating, premium]);

  useEffect(() => {
    let active = true;

    setLoading(true);
    api.public
      .tutors(filters)
      .then((response) => {
        if (active) setData(response);
      })
      .catch((error) => {
        console.error("Failed to load public tutors", error);
        if (active) setData(emptyTutorsResponse);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [filters]);

  const clearFilters = () => {
    setSearch("");
    setSubjectId("all");
    setLocation("all");
    setRating("all");
    setPremium("all");
  };

  const hasFilters =
    search.trim() ||
    subjectId !== "all" ||
    location !== "all" ||
    rating !== "all" ||
    premium !== "all";

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="bg-linear-to-br from-teal-50 via-white to-orange-50 px-6 py-14 lg:py-18">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="mb-4 flex items-center gap-2 text-sm font-medium text-orange-500">
              <span className="h-0.5 w-12 bg-orange-500" />
              Tutor Directory
            </p>
            <h1 className="text-4xl font-bold leading-tight text-gray-900 lg:text-5xl">
              Find a tutor matched to your subject, budget, and location.
            </h1>
            <p className="mt-5 text-lg leading-8 text-gray-600">
              Browse verified teacher profiles from TutorLink. Contact details stay
              protected until you connect through the platform.
            </p>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <section className="mb-8 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700">
            <SlidersHorizontal className="h-4 w-4 text-teal-600" />
            Search and filters
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, subject, education..."
                className="pl-10"
              />
            </div>

            <Select value={subjectId} onValueChange={setSubjectId}>
              <SelectTrigger>
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All subjects</SelectItem>
                {data.subjects.map((subject: Subject) => (
                  <SelectItem key={subject.id} value={String(subject.id)}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger>
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All locations</SelectItem>
                {data.locations.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={rating} onValueChange={setRating}>
              <SelectTrigger>
                <SelectValue placeholder="Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any rating</SelectItem>
                <SelectItem value="4">4+ stars</SelectItem>
                <SelectItem value="4.5">4.5+ stars</SelectItem>
              </SelectContent>
            </Select>

            <Select value={premium} onValueChange={setPremium}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All tutors</SelectItem>
                <SelectItem value="premium">Premium only</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={clearFilters}
              disabled={!hasFilters}
              className="w-full lg:w-auto"
            >
              Clear
            </Button>
          </div>
        </section>

        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Available tutors</h2>
            <p className="text-sm text-gray-500">
              {loading ? "Loading verified tutors..." : `${data.count} verified tutor profiles found`}
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <BookOpen className="h-4 w-4 text-teal-600" />
            Data synced from verified teacher profiles
          </div>
        </div>

        {loading ? (
          <div className="grid gap-5">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-72 animate-pulse rounded-lg border border-gray-200 bg-gray-50"
              />
            ))}
          </div>
        ) : data.results.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {data.results.map((tutor) => (
              <PublicTutorCard key={tutor.id} tutor={tutor} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-16 text-center">
            <h3 className="text-xl font-semibold text-gray-900">
              No verified tutors match these filters
            </h3>
            <p className="mx-auto mt-2 max-w-md text-gray-600">
              Try clearing filters or searching for another subject, location,
              or rating.
            </p>
            <Button className="mt-5" onClick={clearFilters}>
              Clear filters
            </Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
