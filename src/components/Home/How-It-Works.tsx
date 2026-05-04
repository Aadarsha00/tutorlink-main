import React, { useState } from "react";
import {
  Search,
  UserCheck,
  GraduationCap,
  Star,
  CreditCard,
  Users,
} from "lucide-react";

interface Step {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const HowItWorksSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"students" | "tutors">("students");

  const studentSteps: Step[] = [
    {
      icon: <Search className="w-8 h-8" />,
      title: "Browse Tutors",
      description:
        "Search and filter tutors by subject, location, and ratings to find your perfect match.",
    },
    {
      icon: <UserCheck className="w-8 h-8" />,
      title: "Send Contact Request",
      description:
        "Send a contact request to your preferred tutor with your learning requirements.",
    },
    {
      icon: <GraduationCap className="w-8 h-8" />,
      title: "Start Learning",
      description:
        "Begin your personalized learning journey with verified, quality tutors.",
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: "Rate & Review",
      description:
        "Share your experience and help other students by rating your tutor.",
    },
  ];

  const tutorSteps: Step[] = [
    {
      icon: <UserCheck className="w-8 h-8" />,
      title: "Create Profile",
      description:
        "Register and create your detailed tutor profile with qualifications and subjects.",
    },
    {
      icon: <CreditCard className="w-8 h-8" />,
      title: "Go Premium (Optional)",
      description:
        "Subscribe to Premium Plan via Khalti for top listing and verified badge.",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Accept Students",
      description:
        "Receive and accept contact requests from interested students.",
    },
    {
      icon: <GraduationCap className="w-8 h-8" />,
      title: "Teach & Earn",
      description:
        "Start teaching students and build your reputation on the platform.",
    },
  ];

  const currentSteps = activeTab === "students" ? studentSteps : tutorSteps;

  return (
    <section className="py-16 px-4 bg-linear-to-br from-blue-50 via-white to-indigo-100">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Simple steps to connect quality tutors with eager students
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-12">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-1 shadow-lg border border-gray-200">
            <button
              onClick={() => setActiveTab("students")}
              className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === "students"
                  ? "bg-blue-600 text-white shadow-md transform hover:scale-105"
                  : "text-blue-600 hover:text-blue-600 hover:bg-blue-50"
              }`}
            >
              For Students
            </button>
            <button
              onClick={() => setActiveTab("tutors")}
              className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === "tutors"
                  ? "bg-blue-600 text-white shadow-md transform hover:scale-105"
                  : "text-blue-600 hover:text-blue-600 hover:bg-blue-50"
              }`}
            >
              For Tutors
            </button>
          </div>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Progress Line */}
          <div className="hidden md:block absolute top-16 left-0 right-0 h-0.5 bg-gray-300">
            <div className="h-full bg-linear-to-r from-blue-600 to-blue-700 transition-all duration-500 w-3/4"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {currentSteps.map((step, index) => (
              <div
                key={index}
                className="relative bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-200"
              >
                {/* Step Number */}
                <div className="absolute -top-4 left-6 w-8 h-8 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-full flex items-center justify-center font-bold text-sm z-10 shadow-md">
                  {index + 1}
                </div>

                {/* Icon */}
                <div className="flex justify-center mb-4 mt-2">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    {step.icon}
                  </div>
                </div>

                {/* Content */}
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 shadow-lg max-w-4xl mx-auto border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {activeTab === "students"
                ? "Ready to find your perfect tutor?"
                : "Ready to start teaching and earning?"}
            </h3>
            <p className="text-gray-600 mb-6">
              {activeTab === "students"
                ? "Join thousands of students who have found success with our verified tutors."
                : "Join our community of premium tutors and reach more students than ever before."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => (window.location.href = "/tutor")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                {activeTab === "students" ? "Find Tutors" : "Become a Tutor"}
              </button>
              {activeTab === "tutors" && (
                <button className="bg-linear-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105">
                  Go Premium with Khalti
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
