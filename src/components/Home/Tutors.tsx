import { Link } from "react-router-dom";
import { PublicTutorCard } from "@/components/tutor/PublicTutorCard";
import { useAuth } from "@/hooks/useAuth";
import type { TeacherProfile } from "@/services/api";

interface TutorSectionProps {
  tutors?: TeacherProfile[];
  loading?: boolean;
}

const TutorSection = ({ tutors = [], loading = false }: TutorSectionProps) => {
  const { isAuthenticated } = useAuth();

  return (
    <section className="bg-white py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <div className="flex items-center justify-center gap-2">
              <div className="w-20 h-0.5 bg-orange-500"></div>
              <p className="text-orange-500 text-sm font-medium">
                Our verified tutors
              </p>
              <div className="w-20 h-0.5 bg-orange-500"></div>
            </div>
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            More than thousand of
          </h2>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            experts in their own field
          </h2>
          
          <p className="text-gray-600 text-base max-w-2xl mx-auto">
            Find active tutors from the platform, compare subjects and ratings,
            and choose the mentor who fits your learning goals.
          </p>
        </div>

        {/* Tutor Grid */}
        <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {loading ? (
            [1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-72 animate-pulse rounded-lg border border-gray-200 bg-gray-50"
              />
            ))
          ) : null}
          {!loading && tutors.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center text-gray-600">
              Verified tutors will appear here after admin approval.
            </div>
          ) : null}
          {!loading && tutors.map((tutor) => (
            <PublicTutorCard key={tutor.id} tutor={tutor} />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex justify-center gap-4">
          <Link
            to="/tutor"
            className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3.5 rounded-full font-medium shadow-lg transition-all"
          >
            Browse More
          </Link>
          <Link
            to={isAuthenticated ? "/dashboard" : "/register?role=teacher"}
            className="bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 px-8 py-3.5 rounded-full font-medium transition-all"
          >
            {isAuthenticated ? "Dashboard" : "Be Tutor"}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TutorSection;
