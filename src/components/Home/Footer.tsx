import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img src="/logo.png" alt="Logo" className="h-12" />
            </div>
            <p className="text-gray-600 text-sm mb-6 max-w-sm">
              Connecting students with experienced tutors for real-world learning. Find your perfect match and start your journey today.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="w-10 h-10 bg-gray-100 hover:bg-teal-600 rounded-full flex items-center justify-center transition-colors group">
                <Facebook className="w-5 h-5 text-gray-600 group-hover:text-white" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-100 hover:bg-teal-600 rounded-full flex items-center justify-center transition-colors group">
                <Twitter className="w-5 h-5 text-gray-600 group-hover:text-white" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-100 hover:bg-teal-600 rounded-full flex items-center justify-center transition-colors group">
                <Instagram className="w-5 h-5 text-gray-600 group-hover:text-white" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-100 hover:bg-teal-600 rounded-full flex items-center justify-center transition-colors group">
                <Linkedin className="w-5 h-5 text-gray-600 group-hover:text-white" />
              </a>
            </div>
          </div>

          {/* Sitemap */}
          <div>
            <h3 className="text-gray-900 font-bold text-lg mb-4">Sitemap</h3>
            <ul className="space-y-3">
              <li><Link to="/" className="text-gray-600 hover:text-teal-600 text-sm transition-colors">Home</Link></li>
              <li><Link to="/about" className="text-gray-600 hover:text-teal-600 text-sm transition-colors">About</Link></li>
              <li><Link to="/tutor" className="text-gray-600 hover:text-teal-600 text-sm transition-colors">Tutors</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-gray-900 font-bold text-lg mb-4">Company</h3>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-gray-600 hover:text-teal-600 text-sm transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-gray-600 hover:text-teal-600 text-sm transition-colors">Contact</Link></li>
              <li><Link to="/tutor" className="text-gray-600 hover:text-teal-600 text-sm transition-colors">Tutor</Link></li>
            </ul>
          </div>

          {/* Keep in Touch */}
          <div className="lg:col-span-1">
            <h3 className="text-gray-900 font-bold text-lg mb-4">Keep in Touch</h3>
            <p className="text-gray-600 text-sm mb-4">
              Subscribe to keep up with fresh news and exciting updates. We promise not to spam you!
            </p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Email Address"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-teal-600"
              />
              <button className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors">
                Send
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <p className="text-gray-600 text-sm text-center">
            © {currentYear} Ctrl Bits Pvt. Ltd. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
