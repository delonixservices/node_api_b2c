import Link from "next/link";
import { 
  FaFacebookF, 
  FaTwitter, 
  FaInstagram, 
  FaLinkedinIn,
  FaPhoneAlt,
  FaEnvelope,
  FaGlobe,
  FaYoutube,
  FaWhatsapp
} from "react-icons/fa";

export default function Footer() {
  const quickLinks = [
    { name: "About Us", href: "/about-us" },
    { name: "Our Services", href: "/services" },
    { name: "Contact Us", href: "/customer-care" },
    { name: "FAQs", href: "/faq" },
    { name: "Travel Blog", href: "/blog" }
  ];

  const supportLinks = [
    { name: "Customer Support", href: "/customer-care" },
    { name: "Terms & Conditions", href: "/terms" },
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Refund Policy", href: "/refund-policy" },
    { name: "User Agreement", href: "/user-agreement" }
  ];

  const socialLinks = [
    { name: "Facebook", href: "https://facebook.com/tripbazaar", icon: FaFacebookF },
    { name: "Twitter", href: "https://twitter.com/tripbazaar", icon: FaTwitter },
    { name: "Instagram", href: "https://instagram.com/tripbazaar", icon: FaInstagram },
    { name: "LinkedIn", href: "https://linkedin.com/company/tripbazaar", icon: FaLinkedinIn },
    { name: "YouTube", href: "https://youtube.com/tripbazaar", icon: FaYoutube },
    { name: "WhatsApp", href: "https://wa.me/919876543210", icon: FaWhatsapp }
  ];

  return (
    <footer className="w-full bg-slate-900 relative overflow-hidden">
      {/* Main Footer Content */}
      <div className="relative max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Company Info Section */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <h3 className="text-2xl font-bold text-white">
                  Tripbazaar
                </h3>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-6">
                Your trusted travel partner for flights, hotels, and holiday packages. 
                Experience seamless booking with the best prices and exceptional service.
              </p>
            </div>
            {/* Contact Info */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-3 text-gray-300 group">
                <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:to-cyan-400 transition-all duration-300">
                  <FaPhoneAlt className="text-cyan-400 group-hover:text-white text-xs" />
                </div>
                <div>
                  <span className="text-sm font-medium">+91 98765 43210</span>
                  <p className="text-xs text-gray-500">24/7 Support</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 text-gray-300 group">
                <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:to-cyan-400 transition-all duration-300">
                  <FaEnvelope className="text-cyan-400 group-hover:text-white text-xs" />
                </div>
                <div>
                  <span className="text-sm font-medium">support@tripbazaar.in</span>
                  <p className="text-xs text-gray-500">Email Support</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 text-gray-300 group">
                <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:to-cyan-400 transition-all duration-300">
                  <FaGlobe className="text-cyan-400 group-hover:text-white text-xs" />
                </div>
                <div>
                  <span className="text-sm font-medium">www.tripbazaar.in</span>
                  <p className="text-xs text-gray-500">Official Website</p>
                </div>
              </div>
            </div>
            {/* Social Media */}
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
                Follow Us
              </h4>
              <div className="flex flex-wrap gap-2">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gradient-to-r hover:from-blue-500 hover:to-cyan-400 flex items-center justify-center text-gray-300 hover:text-white transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:shadow-cyan-400/25"
                    aria-label={social.name}
                  >
                    <social.icon className="text-sm" />
                  </a>
                ))}
              </div>
            </div>
          </div>
          {/* Quick Links */}
          <div className="lg:col-span-1">
            <h4 className="text-white font-semibold mb-6 text-sm uppercase tracking-wider flex items-center">
              <span className="w-1 h-6 bg-cyan-400 rounded-full mr-3"></span>
              Quick Links
            </h4>
            <div className="grid grid-cols-1 gap-3">
              {quickLinks.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className="text-gray-300 hover:text-cyan-400 transition-colors duration-200 text-sm flex items-center group"
                >
                  <span className="w-1 h-1 bg-cyan-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          {/* Support & Legal */}
          <div className="lg:col-span-1">
            <h4 className="text-white font-semibold mb-6 text-sm uppercase tracking-wider flex items-center">
              <span className="w-1 h-6 bg-cyan-400 rounded-full mr-3"></span>
              Support & Legal
            </h4>
            <div className="grid grid-cols-1 gap-3">
              {supportLinks.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className="text-gray-300 hover:text-cyan-400 transition-colors duration-200 text-sm flex items-center group"
                >
                  <span className="w-1 h-1 bg-cyan-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Bottom Bar */}
      <div className="relative bg-slate-900 border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <p className="text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} <span className="text-cyan-400 font-semibold">Tripbazaar</span>. All rights reserved.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <Link href="/terms" className="text-gray-400 hover:text-cyan-400 transition-colors duration-200">
                Terms
              </Link>
              <Link href="/privacy-policy" className="text-gray-400 hover:text-cyan-400 transition-colors duration-200">
                Privacy
              </Link>
              <Link href="/refund-policy" className="text-gray-400 hover:text-cyan-400 transition-colors duration-200">
                Refund Policy
              </Link>
              <div className="text-gray-400">
                Powered by <span className="text-cyan-400 font-semibold">Delonix Travel Services</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}