import { ArrowRight, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import type { LandingStats, TeacherProfile } from "@/services/api";

interface HeroSectionProps {
  stats?: LandingStats;
  tutors?: TeacherProfile[];
}

const formatCount = (value?: number, fallback = "50+") => {
  if (value === undefined) return fallback;
  if (value >= 1000) return `${Math.floor(value / 1000)}k+`;
  return `${value}+`;
};

const formatAverageRating = (value?: number) => {
  if (!value) return "New";
  return `${Number(value).toFixed(1)}+`;
};

const getTutorName = (tutor: TeacherProfile) =>
  tutor.full_name || tutor.user.full_name || "Tutor";

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "T";

const HeroSection = ({ stats, tutors = [] }: HeroSectionProps) => {
  const { isAuthenticated } = useAuth();
  const heroTutors = tutors
    .filter((tutor) => Boolean(tutor.user.profile_picture))
    .slice(0, 3);

  return (
    <section className="bg-white pt-16 pb-20 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            {/* Top Label */}
            <div className="inline-block">
              <div className="flex items-center gap-2">
                <div className="w-20 h-0.5 bg-orange-500"></div>
                <p className="text-orange-500 text-sm font-medium">
                  Help you be the best version
                </p>
              </div>
            </div>

            {/* Main Heading */}
            <div className="space-y-1">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Find the experts
              </h1>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                from the practical,
              </h1>
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                not the{" "}
                <span className="text-orange-500 relative inline-block">
                  academic
                  <svg
                    className="absolute -bottom-2 left-0 w-full"
                    viewBox="0 0 200 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M2 8C30 4 50 10 80 6C110 2 140 8 170 5C185 3.5 195 6 198 7"
                      stroke="#f97316"
                      strokeWidth="3"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                </span>
              </h1>
            </div>

            {/* Description */}
            <p className="text-gray-600 text-base leading-relaxed max-w-lg">
              Connect with experienced tutors who've walked the path. Whether
              you're a student seeking guidance or a tutor looking for
              opportunities, find your perfect match in minutes.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to={isAuthenticated ? "/dashboard" : "/register"}
                className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3.5 rounded-full font-medium flex items-center gap-2 shadow-lg transition-all"
              >
                {isAuthenticated ? "Go to Dashboard" : "Get Started"}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {/* User Testimonial Badge */}
            <div className="flex flex-wrap items-center gap-6 pt-4">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {heroTutors.length > 0
                    ? heroTutors.map((tutor) => {
                        const name = getTutorName(tutor);

                        return (
                          <img
                            key={tutor.id}
                            src={tutor.user.profile_picture}
                            alt={name}
                            className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm"
                          />
                        );
                      })
                    : tutors.slice(0, 2).map((tutor) => {
                        const name = getTutorName(tutor);

                        return (
                          <div
                            key={tutor.id}
                            className="w-10 h-10 rounded-full border-2 border-white bg-teal-600 text-xs font-bold text-white flex items-center justify-center shadow-sm"
                          >
                            {getInitials(name)}
                          </div>
                        );
                      })}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-2xl font-bold text-gray-900">
                      {formatCount(stats?.teachers)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Tutors Available</p>
                </div>
              </div>

              <div className="h-10 w-px bg-gray-200 hidden sm:block" />

              <div>
                <div className="flex items-center gap-1">
                  <span className="text-2xl font-bold text-gray-900">
                    {formatAverageRating(stats?.average_rating)}
                  </span>
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                </div>
                <p className="text-sm text-gray-600">Average Rating</p>
              </div>
            </div>
          </div>

          {/* Right Images */}
          <div className="relative h-137.5 overflow-hidden">
            {/* Decorative dots */}
            <div className="absolute top-8 left-8 w-2.5 h-2.5 bg-orange-400 rounded-full"></div>
            <div className="absolute top-16 right-16 w-2 h-2 bg-teal-400 rounded-full"></div>
            <div className="absolute bottom-24 left-4 w-2 h-2 bg-purple-400 rounded-full"></div>
            <div className="absolute bottom-8 right-4 w-2.5 h-2.5 bg-yellow-400 rounded-full"></div>
            <div className="absolute top-1/3 left-0 w-1.5 h-1.5 bg-pink-400 rounded-full"></div>
            <div className="absolute bottom-1/3 right-0 w-1.5 h-1.5 bg-green-400 rounded-full"></div>

            {/* Main Images Container */}
            <div className="relative flex flex-row gap-8 lg:gap-20 h-full items-start pt-8 justify-center">
              {/* Left Card - Woman in blue shirt with books */}
              <div className="relative w-40 lg:w-64 mt-12">
                {/* Pink background card */}
                <div className="absolute inset-0 bg-pink-400 rounded-[40px] transform -rotate-6"></div>

                {/* Main image container */}
                <div className="relative bg-white rounded-[40px] overflow-hidden h-105 shadow-2xl">
                  <img
                    src="/woman2.jpg"
                    alt="Woman with books"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Yellow book icon - top right */}
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-yellow-400 rounded-2xl flex items-center justify-center shadow-xl transform rotate-12 z-20">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
              </div>

              {/* Right Card - Man in orange hoodie with book */}
              <div className="relative w-40 lg:w-64">
                {/* Teal background card */}
                <div className="absolute inset-0 bg-teal-400 rounded-[40px] transform rotate-6"></div>

                {/* Main image container */}
                <div className="relative bg-white rounded-[40px] overflow-hidden h-105 shadow-2xl">
                  <img
                    src="/man.jpg"
                    alt="Man with book"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Purple chat icon - bottom left */}
                <div className="absolute bottom-16 -left-4 w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center shadow-xl transform -rotate-12 z-20">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trusted By Section */}
        <div className="mt-16 pt-8">
          <p className="text-center text-gray-500 text-sm font-semibold mb-6">
            TRUSTED BY STUDENTS FROM
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-16">
            <div className="text-gray-700 font-medium text-lg">Kathmandu</div>
            <div className="text-gray-700 font-medium text-lg">Pokhara</div>
            <div className="text-gray-700 font-medium text-lg">Lalitpur</div>
            <div className="text-gray-700 font-medium text-lg">Bhaktapur</div>
            <div className="text-gray-700 font-medium text-lg">Biratnagar</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
