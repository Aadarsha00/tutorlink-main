import { CheckCircle, Award, BookOpen, Headphones } from 'lucide-react';

const PerfectTutorSection = () => {
  return (
    <section className="bg-gray-50 py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Content */}
          <div className="space-y-6">
            <div className="inline-block">
              <div className="flex items-center gap-2">
                <div className="w-20 h-0.5 bg-orange-500"></div>
                <p className="text-orange-500 text-sm font-medium">
                  What makes us special
                </p>
              </div>
            </div>

            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              If the perfect tutor doesn't exist, we help you find one.
            </h2>

            <p className="text-gray-600 text-base leading-relaxed">
              We are a trusted platform where students and tutors connect with ease. 
              Students can find the right tutor based on their learning goals, while tutors 
              can discover teaching opportunities and grow their careers.
            </p>

            <a href="/about" className="inline-block bg-teal-600 hover:bg-teal-700 text-white px-8 py-3.5 rounded-full font-medium shadow-lg transition-all">
              Learn More
            </a>
          </div>

          {/* Right Content - Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Certified Mentor Card */}
            <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Verified Tutors
              </h3>
              <p className="text-gray-600 text-sm">
                Learn from experienced and verified tutors who are committed to delivering 
                quality education.
              </p>
            </div>

            {/* Learning Method Card */}
            <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Flexible Learning
              </h3>
              <p className="text-gray-600 text-sm">
                Personalized learning methods designed to match each student's goals and 
                preferred learning style.
              </p>
            </div>

            {/* Industrial Material Card */}
            <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Practical Resources
              </h3>
              <p className="text-gray-600 text-sm">
                Access modern, practical learning materials that help students build real-world 
                knowledge and skills.
              </p>
            </div>

            {/* 24/7 Support Card */}
            <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Headphones className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                24/7 Support
              </h3>
              <p className="text-gray-600 text-sm">
                Dedicated support available anytime to assist both students and tutors 
                throughout their learning journey.
              </p>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default PerfectTutorSection;