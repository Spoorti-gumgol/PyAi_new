import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, LayoutDashboard, BookOpen, User, Home } from 'lucide-react';
import logo from "../assets/8443babb0dd67ee3ebd39b55554989e03b362ce3.png";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/courses', label: 'Courses', icon: BookOpen },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white border-b-2 border-gray-100 px-4 md:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="PyAi Logo" className="w-10 h-10 object-contain" />
          <span className="text-2xl font-black text-[#4B4B4B] tracking-tight">PyAi</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <NavLink
            to="/"
            className={({ isActive }) => 
              `flex items-center gap-2 font-bold text-sm uppercase tracking-wider transition-colors
              ${isActive ? 'text-[#1CB0F6]' : 'text-gray-400 hover:text-gray-600'}`
            }
          >
            <Home size={18} />
            Home
          </NavLink>
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => 
                `flex items-center gap-2 font-bold text-sm uppercase tracking-wider transition-colors
                ${isActive ? 'text-[#1CB0F6]' : 'text-gray-400 hover:text-gray-600'}`
              }
            >
              <link.icon size={18} />
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-gray-500" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b-2 border-gray-100 p-6 flex flex-col gap-6 shadow-xl animate-in fade-in slide-in-from-top-4">
          <NavLink
            to="/"
            onClick={() => setIsOpen(false)}
            className={({ isActive }) => 
              `flex items-center gap-4 font-black text-lg uppercase tracking-wider
              ${isActive ? 'text-[#1CB0F6]' : 'text-gray-400'}`
            }
          >
            <Home size={24} />
            Home
          </NavLink>
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => 
                `flex items-center gap-4 font-black text-lg uppercase tracking-wider
                ${isActive ? 'text-[#1CB0F6]' : 'text-gray-400'}`
              }
            >
              <link.icon size={24} />
              {link.label}
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  );
};
