import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-bold mb-4">ThalAI Guardian</h3>
            <p className="text-gray-400 text-sm">
              Connecting thalassemia patients with blood donors through intelligent matching and AI-powered predictions.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/donors" className="hover:text-white transition-colors">
                  Donors
                </Link>
              </li>
              <li>
                <Link to="/requests" className="hover:text-white transition-colors">
                  Requests
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors">
                  Become a Donor
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Donor Guidelines
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Transfusion Info
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Emergency Help
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  FAQs
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Email: support@thalai-guardian.com</li>
              <li>Phone: +91-XXXXX-XXXXX</li>
              <li>Emergency: 108</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2024 ThalAI Guardian. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

