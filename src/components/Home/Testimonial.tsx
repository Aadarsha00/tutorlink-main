import React, { useEffect, useState } from "react";
import { Star, Quote, GraduationCap } from "lucide-react";
import api, { type PublicTestimonial } from "@/services/api";

const fallbackTestimonials: PublicTestimonial[] = [
    {
      id: 1,
      name: "Arjun Sharma",
      grade: "Class 12",
      subject: "Mathematics",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      rating: 5,
      quote:
        "Meriyan sir made calculus so easy to understand! My grades improved from C to A+ in just 3 months.",
      improvement: "C → A+",
      tutorName: "Meriyan Karki",
    },
    {
      id: 2,
      name: "Priya Thapa",
      grade: "Class 10",
      subject: "English",
      image:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      rating: 5,
      quote:
        "Gaurav sir helped me gain confidence in speaking English. Now I can express myself clearly and my writing has improved dramatically.",
      improvement: "B → A",
      tutorName: "Gaurav Bhatta",
    },
    {
      id: 3,
      name: "Ravi Poudel",
      grade: "Class 12",
      subject: "Biology",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      rating: 5,
      quote:
        "Dr. Aviral's real medical examples made biology fascinating. I'm now confident about pursuing medicine.",
      improvement: "Medical Entrance",
      tutorName: "Aviral Ale",
    },
  ];

const sortTestimonials = (items: PublicTestimonial[]) =>
  [...items].sort((a, b) => b.rating - a.rating || b.id - a.id);

const StudentTestimonialsSection: React.FC = () => {
  const [testimonials, setTestimonials] = useState<PublicTestimonial[]>(
    sortTestimonials(fallbackTestimonials)
  );

  useEffect(() => {
    let active = true;

    api.public
      .testimonials()
      .then((data) => {
        if (active && data.length > 0) setTestimonials(sortTestimonials(data));
      })
      .catch((error) => {
        console.error("Failed to load testimonials", error);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="py-16 bg-linear-to-br from-blue-50 via-white to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-linear-to-r from-green-100 to-green-50 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <GraduationCap className="w-4 h-4 mr-2" />
            Success Stories
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            What Our Students Say
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Real stories from students who transformed their academic journey
            with our tutors
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className={`group bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-200 ${
                index === 1 ? "lg:scale-105" : ""
              }`}
            >
              {/* Quote Icon */}
              <div className="flex justify-between items-start mb-4">
                <Quote className="w-8 h-8 text-blue-600 opacity-50" />
                <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-full">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 text-yellow-500 fill-current"
                    />
                  ))}
                </div>
              </div>

              {/* Quote */}
              <blockquote className="text-gray-700 mb-6 leading-relaxed italic">
                "{testimonial.quote}"
              </blockquote>

              {/* Student Info */}
              <div className="flex items-center mb-4">
                <img
                  src={testimonial.image || "/woman1.jpeg"}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover mr-4 border-2 border-blue-100"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-gray-600">{testimonial.grade}</p>
                </div>
                {/* Improvement Badge */}
                <div className="bg-linear-to-r from-green-500 to-green-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                  {testimonial.improvement}
                </div>
              </div>

              {/* Subject & Tutor */}
              <div className="border-t border-gray-100 pt-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">
                    <span className="font-medium text-blue-600">
                      {testimonial.subject}
                    </span>{" "}
                    with {testimonial.tutorName}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StudentTestimonialsSection;
