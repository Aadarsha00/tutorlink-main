/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import api from "@/services/api";

export default function ContactUsPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setStatus(null);
    setSubmitting(true);

    try {
      const response = await api.public.contact(formData);
      setStatus({ type: "success", message: response.message });
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error: any) {
      setStatus({
        type: "error",
        message:
          error.response?.data?.detail ||
          "We could not send your message. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="px-8 lg:px-20 py-16 lg:py-24 bg-linear-to-br from-teal-50 to-orange-50">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-orange-500 text-sm mb-4 flex items-center justify-center gap-2">
            <span className="w-12 h-0.5 bg-orange-500"></span>
            Get In Touch
          </p>
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">
            We'd Love to <span className="text-orange-500">Hear From You</span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Have questions about our platform? Need help finding the right
            tutor? We're here to help you succeed.
          </p>
        </div>
      </section>

      {/* Contact Form & Info Section */}
      <section className="px-8 lg:px-20 py-16">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-12">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                    placeholder="How can we help?"
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition resize-none"
                    placeholder="Tell us more about your inquiry..."
                  ></textarea>
                </div>

                {status && (
                  <div
                    className={`rounded-lg px-4 py-3 text-sm ${
                      status.type === "success"
                        ? "bg-teal-50 text-teal-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {status.message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full px-8 py-3 bg-teal-500 text-white rounded-lg font-semibold hover:bg-teal-600 transition disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? "Sending..." : "Send Message"}
                </button>
              </form>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            {/* Email */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
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
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2">Email Us</h3>
              <p className="text-gray-600 text-sm mb-3">
                Send us an email anytime
              </p>
              <a
                href="mailto:codebits.ctrlbits@gmail.com"
                className="text-teal-600 font-medium hover:text-teal-700"
              >
                codebits.ctrlbits@gmail.com
              </a>
            </div>

            {/* Phone */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
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
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2">Call Us</h3>
              <p className="text-gray-600 text-sm mb-3">
                Mon-Fri from 9am to 6pm
              </p>
              <a
                href="tel:+9779800000000"
                className="text-teal-600 font-medium hover:text-teal-700"
              >
                +977 9800000000
              </a>
            </div>

            {/* Location */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
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
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2">Visit Us</h3>
              <p className="text-gray-600 text-sm mb-3">Come say hello</p>
              <p className="text-teal-600 font-medium">Kathmandu, Nepal</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-gray-50 px-8 lg:px-20 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-bold text-lg mb-2">How do I find a tutor?</h3>
              <p className="text-gray-600">
                Simply browse our tutor directory, filter by subject and
                availability, and book a session with your preferred tutor.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-bold text-lg mb-2">
                How do I become a tutor?
              </h3>
              <p className="text-gray-600">
                Click on "Become a Tutor" and fill out the application. We'll
                review your credentials and get back to you within 48 hours.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-bold text-lg mb-2">
                What are your pricing plans?
              </h3>
              <p className="text-gray-600">
                Pricing varies by tutor based on their experience and subject
                expertise. You can view each tutor's rates on their profile.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-bold text-lg mb-2">Do you offer refunds?</h3>
              <p className="text-gray-600">
                Yes, we offer a satisfaction guarantee. If you're not happy with
                your first session, contact us within 24 hours for a full
                refund.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
