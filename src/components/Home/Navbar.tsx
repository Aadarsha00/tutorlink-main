import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const currentPath = window.location.pathname;

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Tutor", href: "/tutor" },
    { name: "Contact", href: "/contact" },
  ];
  const { isAuthenticated } = useAuth();

  return (
    <header className="w-full bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        {/* Logo */}
        <img src="/logo.png" alt="Tutorr Logo" className="h-10 w-auto" />

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-10 text-base font-medium text-gray-700">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className={`hover:text-gray-900 transition ${
                currentPath === link.href ? "text-orange-500" : ""
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Desktop Login */}
        {isAuthenticated ? (
          <Link
            to="/dashboard"
            className="hidden lg:block px-6 py-2 text-base font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition"
          >
            Dashboard
          </Link>
        ) : (
          <Link
            to="/login"
            className="hidden lg:block px-6 py-2 text-base font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition"
          >
            Login
          </Link>
        )}
        {/* Mobile Menu Button */}
        <button
          onClick={() => setOpen(!open)}
          className="lg:hidden text-gray-900 text-2xl"
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="lg:hidden bg-white border-t border-gray-100 px-6 py-4 space-y-4">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className={`block font-medium transition ${
                currentPath === link.href ? "text-orange-500" : "text-gray-700"
              }`}
            >
              {link.name}
            </Link>
          ))}
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="mt-2 block w-full px-6 py-2 font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition text-center"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              to="/login"
              className="mt-2 block w-full px-6 py-2 font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition text-center"
            >
              Login
            </Link>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
