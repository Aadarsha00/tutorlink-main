import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Users,
  CreditCard,
  Shield,
  Star,
  BookOpen,
  MapPin,
  Award,
} from "lucide-react";

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: "general" | "students" | "tutors" | "payment" | "safety";
  icon: React.ReactNode;
}

const FAQSection: React.FC = () => {
  const [openItem, setOpenItem] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("general");

  const faqData: FAQItem[] = [
    // General Questions
    {
      id: 1,
      question: "How does TutorSpot work?",
      answer:
        "TutorSpot connects students with verified tutors in their area. Students can browse tutor profiles, send contact requests, and book sessions. All tutors are verified and many offer premium services for enhanced learning experiences.",
      category: "general",
      icon: <HelpCircle className="w-5 h-5" />,
    },
    {
      id: 2,
      question: "Is TutorSpot available across Nepal?",
      answer:
        "Yes! We have tutors available in major cities including Kathmandu, Lalitpur, Bhaktapur, Pokhara, Chitwan, and other areas. You can filter tutors by location to find someone near you.",
      category: "general",
      icon: <MapPin className="w-5 h-5" />,
    },
    {
      id: 3,
      question: "What subjects are available?",
      answer:
        "We offer tutoring in 25+ subjects including Mathematics, English, Science (Physics, Chemistry, Biology), Computer Science, Social Studies, Nepali, and specialized test preparation for medical entrance exams.",
      category: "general",
      icon: <BookOpen className="w-5 h-5" />,
    },

    // For Students
    {
      id: 4,
      question: "How do I find the right tutor?",
      answer:
        "Use our search filters to find tutors by subject, location, rating, and price range. You can also view detailed profiles with qualifications, teaching style, and student reviews to make an informed choice.",
      category: "students",
      icon: <Users className="w-5 h-5" />,
    },
    {
      id: 5,
      question: "How much do tutoring sessions cost?",
      answer:
        "Session rates vary by tutor, subject, and experience level. Rates typically range from Rs. 1,000-2,500 per hour. Each tutor's rates are clearly displayed on their profile.",
      category: "students",
      icon: <CreditCard className="w-5 h-5" />,
    },
    {
      id: 6,
      question: "What if I'm not satisfied with a tutor?",
      answer:
        "You can end the tutoring arrangement at any time. We also have a rating and review system to help other students, and our support team is available to help resolve any issues.",
      category: "students",
      icon: <Star className="w-5 h-5" />,
    },

    // For Tutors
    {
      id: 7,
      question: "How do I become a tutor on TutorSpot?",
      answer:
        "Register as a tutor, complete your profile with qualifications and subjects, submit verification documents, and await approval. Once verified, you can start receiving student contact requests.",
      category: "tutors",
      icon: <Users className="w-5 h-5" />,
    },
    {
      id: 8,
      question: "What are the benefits of the Premium Plan?",
      answer:
        "Premium tutors get top listing in search results, a verified badge, profile analytics, enhanced visibility, and priority customer support. Premium plans are available through Khalti payment.",
      category: "tutors",
      icon: <Award className="w-5 h-5" />,
    },
    {
      id: 9,
      question: "How much does the Premium Plan cost?",
      answer:
        "Premium plan pricing details are provided during the subscription process. You can pay securely through Khalti wallet, and the plan includes enhanced visibility and verified status.",
      category: "tutors",
      icon: <CreditCard className="w-5 h-5" />,
    },

    // Payment & Safety
    {
      id: 10,
      question: "Is Khalti payment secure?",
      answer:
        "Yes! Khalti is Nepal's most trusted digital wallet with bank-level security. All transactions are encrypted and secure. We maintain complete transaction history for your records.",
      category: "payment",
      icon: <Shield className="w-5 h-5" />,
    },
    {
      id: 11,
      question: "How are tutors verified?",
      answer:
        "All tutors undergo rigorous verification including educational qualification checks, identity verification, background checks, and document review by our admin team before being approved on the platform.",
      category: "safety",
      icon: <Shield className="w-5 h-5" />,
    },
    {
      id: 12,
      question: "What safety measures are in place?",
      answer:
        "We verify all tutors, maintain secure communication channels, provide transparent ratings and reviews, and have a support team to handle any concerns. Student safety is our top priority.",
      category: "safety",
      icon: <Shield className="w-5 h-5" />,
    },
  ];

  const categories = [
    {
      id: "general",
      label: "General",
      icon: <HelpCircle className="w-4 h-4" />,
    },
    {
      id: "students",
      label: "For Students",
      icon: <Users className="w-4 h-4" />,
    },
    { id: "tutors", label: "For Tutors", icon: <Star className="w-4 h-4" /> },
    {
      id: "payment",
      label: "Payments",
      icon: <CreditCard className="w-4 h-4" />,
    },
    { id: "safety", label: "Safety", icon: <Shield className="w-4 h-4" /> },
  ];

  const filteredFAQs = faqData.filter((faq) => faq.category === activeCategory);

  const toggleItem = (id: number) => {
    setOpenItem(openItem === id ? null : id);
  };

  return (
    <section className="py-16 bg-linear-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center bg-linear-to-r from-purple-100 to-purple-50 text-purple-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <HelpCircle className="w-4 h-4 mr-2" />
            Frequently Asked Questions
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Got Questions?
            <span className="block text-blue-600">We've Got Answers</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to know about using TutorSpot
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                activeCategory === category.id
                  ? "bg-blue-600 text-white shadow-md transform hover:scale-105"
                  : "bg-white text-gray-700 hover:text-blue-600 hover:bg-blue-50 border border-gray-200"
              }`}
            >
              {category.icon}
              <span>{category.label}</span>
            </button>
          ))}
        </div>

        {/* FAQ Items */}
        <div className="space-y-4 mb-12">
          {filteredFAQs.map((faq) => (
            <div
              key={faq.id}
              className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-xl"
            >
              <button
                onClick={() => toggleItem(faq.id)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex items-center space-x-3 flex-1">
                  <div className="text-blue-600">{faq.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {faq.question}
                  </h3>
                </div>
                <div className="text-blue-600 ml-4">
                  {openItem === faq.id ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </div>
              </button>

              <div
                className={`transition-all duration-300 ease-in-out ${
                  openItem === faq.id
                    ? "max-h-96 opacity-100"
                    : "max-h-0 opacity-0"
                } overflow-hidden`}
              >
                <div className="px-6 pb-6">
                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Support CTA */}
        <div className="text-center">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 shadow-lg border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Still have questions?
            </h3>
            <p className="text-gray-600 mb-6">
              Our support team is here to help you get started
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => (window.location.href = "/contact")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105"
              >
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
