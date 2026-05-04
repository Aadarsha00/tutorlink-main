import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function CTASection() {
  const { isAuthenticated } = useAuth();

  return (
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
            to={isAuthenticated ? "/tutor" : "/register?role=parent"}
            className="px-8 py-3 bg-white text-teal-600 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Find a Tutor
          </Link>
          <Link
            to={isAuthenticated ? "/dashboard" : "/register?role=teacher"}
            className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-teal-600 transition"
          >
            {isAuthenticated ? "Go to Dashboard" : "Become a Tutor"}
          </Link>
        </div>
      </div>
    </section>
  );
}
