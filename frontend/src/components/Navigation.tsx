import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { ArrowRight, Menu, ChevronDown } from "lucide-react";

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { label: "How It Works", href: "#how-it-works" },
    { label: "Categories", href: "#categories" },
    { label: "Success Stories", href: "#stories" },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
          ? "bg-black/95 backdrop-blur-md border-b border-gray-800/50"
          : "bg-transparent"
        }`}
    >
      <div className="w-full max-w-[1440px] mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.a
            href="/"
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3 transition-all duration-300"
          >
            <img
              src="https://jobreferral.club/assets/dark_bg_logo.png"
              alt="JobReferral.Club Logo"
              className="w-12 h-12 object-contain"
            />
            <div className="font-bold text-xl text-white whitespace-nowrap">
              JobReferral<span className="text-primary-green">.Club</span>
            </div>
          </motion.a>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center space-x-8">
            {navItems.map((item, index) => (
              <motion.a
                key={index}
                href={item.href}
                className="text-gray-300 hover:text-primary-green transition-all duration-300 font-medium relative group whitespace-nowrap"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-green transition-all duration-300 group-hover:w-full"></span>
              </motion.a>
            ))}

            {/* Services with Dropdown */}
            <div
              className="relative group cursor-pointer"
              onMouseEnter={() => setServicesOpen(true)}
              onMouseLeave={() => setServicesOpen(false)}
            >
              <div className="flex items-center text-gray-300 hover:text-primary-green transition-all duration-300 font-medium">
                Services
                <ChevronDown className="w-4 h-4 ml-1" />
              </div>
              {/* Dropdown Menu - absolutely positioned, no gap */}
              {servicesOpen && (
                <div className="absolute left-0 top-full bg-black rounded-lg border border-gray-800 w-52 shadow-lg z-50">
                  <a
                    href="./ai-resume-builder"
                    className="block px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-primary-green transition-colors duration-300"
                  >
                    Resume Builder
                  </a>
                  <a
                    href="./resume-ranker"
                    className="block px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-primary-green transition-colors duration-300"
                  >
                    Resume Ranker
                  </a>
                  <a
                    href="./resume-analyzer"
                    className="block px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-primary-green transition-colors duration-300"
                  >
                    Resume Analyzer
                  </a>
                  <a
                    href="#practice"
                    className="block px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-primary-green transition-colors duration-300"
                  >
                    Simulations
                  </a>
                </div>
              )}
            </div>

          </div>

          {/* CTA + Hamburger */}
          <div className="flex items-center gap-4">
            <div className="hidden lg:block">
              <Button
                onClick={() =>
                  window.open("https://community.jobreferral.club", "_blank")
                }
                className="btn-primary group transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary-green/20 whitespace-nowrap"
              >
                Join Now
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </div>

            {/* Mobile Menu Icon */}
            <div className="lg:hidden">
              <Menu
                className="w-6 h-6 text-white cursor-pointer"
                onClick={() => setMenuOpen(!menuOpen)}
              />
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="lg:hidden mt-2 bg-black px-4 py-4 rounded-b-lg border-t border-gray-800">
            <div className="flex flex-col gap-4">
              {navItems.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="text-gray-300 hover:text-primary-green transition-colors duration-300 font-medium"
                >
                  {item.label}
                </a>
              ))}
              {/* Mobile Dropdown Items Inline */}
              <a
                href="/ai-resume-builder"
                onClick={() => setMenuOpen(false)}
                className="text-gray-300 hover:text-primary-green transition-colors duration-300 font-medium"
              >
                Resume Builder
              </a>
              <a
                href="#practice"
                onClick={() => setMenuOpen(false)}
                className="text-gray-300 hover:text-primary-green transition-colors duration-300 font-medium"
              >
                Simulations
              </a>
              <Button
                onClick={() => {
                  window.open("https://community.jobreferral.club", "_blank");
                  setMenuOpen(false);
                }}
                className="btn-primary group transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary-green/20"
              >
                Join Now
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navigation;