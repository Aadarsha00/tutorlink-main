import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import api, { type LandingStats } from "@/services/api";

const formatCount = (value?: number, fallback = "0") => {
  if (value === undefined) return fallback;
  if (value >= 1000) return `${Math.floor(value / 1000)}k+`;
  return `${value}+`;
};

export default function AboutUsPage() {
  const { isAuthenticated } = useAuth();
  const [stats, setStats] = useState<LandingStats | null>(null);

  useEffect(() => {
    let active = true;

    api.public
      .landing()
      .then((data) => {
        if (active) setStats(data.stats);
      })
      .catch((error) => {
        console.error("Failed to load public stats", error);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="px-8 lg:px-20 py-16 lg:py-24">
        <div className="max-w-6xl mx-auto">
          <p className="text-orange-500 text-sm mb-4 flex items-center gap-2">
            <span className="w-12 h-0.5 bg-orange-500"></span>
            Our Story
          </p>
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">
            Bridging the gap between <br />
            <span className="text-orange-500 relative inline-block">
              practical learning
              <svg
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 300 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
              >
                <path
                  d="M2 8C40 5 70 10 110 7C150 4 190 9 240 6C270 4 290 7 298 8"
                  stroke="#f97316"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </span>{" "}
            and expertise
          </h1>
          <p className="text-gray-600 max-w-2xl text-lg">
            We believe that true learning happens when theory meets practice.
            Our platform connects students with expert tutors who bring
            real-world experience to every lesson, making education more
            relevant and impactful.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="bg-gray-50 px-8 lg:px-20 py-16">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
          <div>
            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-teal-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
            <p className="text-gray-600">
              To democratize quality education by connecting learners with
              practical experts who can share real-world knowledge. We're
              committed to making learning accessible, affordable, and aligned
              with the skills that matter in today's world.
            </p>
          </div>
          <div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
            <p className="text-gray-600">
              To create a world where anyone can find the perfect mentor to
              guide their learning journey, and where passionate experts can
              share their knowledge with those who need it most. Education
              should be personal, practical, and empowering.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-8 lg:px-20 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-teal-600 mb-2">
                {formatCount(stats?.teachers, "50+")}
              </div>
              <div className="text-gray-600">Expert Tutors</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-teal-600 mb-2">
                {formatCount(stats?.parents, "1000+")}
              </div>
              <div className="text-gray-600">Students</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-teal-600 mb-2">
                {formatCount(stats?.subjects, "30+")}
              </div>
              <div className="text-gray-600">Subjects</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-teal-600 mb-2">
                {stats?.average_rating ? stats.average_rating.toFixed(1) : "4.8"}
              </div>
              <div className="text-gray-600">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-gray-50 px-8 lg:px-20 py-16">
        <div className="max-w-6xl mx-auto">
          <p className="text-orange-500 text-sm mb-4 text-center flex items-center justify-center gap-2">
            <span className="w-12 h-0.5 bg-orange-500"></span>
            What We Stand For
          </p>
          <h2 className="text-3xl lg:text-4xl font-bold text-center mb-12">
            Our Core Values
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Quality First</h3>
              <p className="text-gray-600">
                We carefully vet every tutor to ensure they have the expertise
                and teaching ability to deliver exceptional learning
                experiences.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Student-Centered</h3>
              <p className="text-gray-600">
                Every decision we make is guided by what's best for our students
                and their learning journey.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  bg-linear-to-br
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Continuous Growth</h3>
              <p className="text-gray-600">
                We believe in lifelong learning and constantly evolving our
                platform to meet the changing needs of education.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-8 lg:px-20 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-bold text-center mb-12">
            How We Connect Learning
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-bold mb-3">Students Find Experts</h3>
              <p className="text-gray-600">
                Browse through our diverse pool of qualified tutors, filter by
                subject, experience, and ratings to find your perfect match.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-bold mb-3">Connect & Learn</h3>
              <p className="text-gray-600">
                Schedule sessions at your convenience, engage in personalized
                one-on-one or group lessons tailored to your learning style.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-bold mb-3">Achieve Your Goals</h3>
              <p className="text-gray-600">
                Track your progress, get practical insights, and master skills
                that make a real difference in your academic and professional
                journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="bg-white px-8 lg:px-20 py-16">
        <div className="max-w-6xl mx-auto">
          <p className="text-orange-500 text-sm mb-4 text-center flex items-center justify-center gap-2">
            <span className="w-12 h-0.5 bg-orange-500"></span>
            Meet The Team
          </p>
          <h2 className="text-3xl lg:text-4xl font-bold text-center mb-4">
            The People Behind TuLarr
          </h2>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-12">
            Our dedicated team is passionate about revolutionizing education and
            connecting learners with the right mentors.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-40 h-40 mx-auto mb-4 bg-linear-to-br from-teal-400 to-teal-500 rounded-2xl flex items-center justify-center overflow-hidden">
                <div className="w-full h-full flex items-center justify-center text-white text-5xl font-bold">
                  AS
                </div>
              </div>
              <h3 className="text-xl font-bold mb-1">Aadarsha Subedi</h3>
              <p className="text-gray-500 text-sm">Co-Founder</p>
            </div>

            <div className="text-center group">
              <div className="w-40 h-40 mx-auto mb-4 bg-linear-to-br from-orange-400 to-orange-500 rounded-2xl flex items-center justify-center overflow-hidden">
                <div className="w-full h-full flex items-center justify-center text-white text-5xl font-bold">
                  AA
                </div>
              </div>
              <h3 className="text-xl font-bold mb-1">Aviral Ale</h3>
              <p className="text-gray-500 text-sm">Co-Founder</p>
            </div>

            <div className="text-center group">
              <div className="w-40 h-40 mx-auto mb-4 bg-linear-to-br from-purple-400 to-purple-500 rounded-2xl flex items-center justify-center overflow-hidden">
                <div className="w-full h-full flex items-center justify-center text-white text-5xl font-bold">
                  GB
                </div>
              </div>
              <h3 className="text-xl font-bold mb-1">Gaurav Bhatta</h3>
              <p className="text-gray-500 text-sm">Co-Founder</p>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-linear-to-r from-teal-500 to-teal-600 px-8 lg:px-20 py-16 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="text-lg mb-8 text-teal-50">
            Join thousands of students who are already learning from the best
            practical experts in their field.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={isAuthenticated ? "/tutor" : "/register"}
              className="px-8 py-3 bg-white text-teal-600 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Find a Tutor
            </Link>
            <Link
              to={isAuthenticated ? "/dashboard" : "/register"}
              className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-teal-600 transition"
            >
              {isAuthenticated ? "Go to Dashboard" : "Become a Tutor"}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
