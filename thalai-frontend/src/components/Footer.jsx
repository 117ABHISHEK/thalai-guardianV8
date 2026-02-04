import { Link } from 'react-router-dom';
import { Droplets, Heart, Mail, Phone, Info, Globe, ShieldCheck } from 'lucide-react';

const Footer = ({ className = '' }) => {
  return (
    <footer className={`bg-slate-950 text-white font-body ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand Column */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="p-2bg-sky-500 rounded-xl group-hover:scale-110 transition-transform">
                <Droplets className="w-6 h-6 text-sky-400" />
              </div>
              <span className="text-xl font-display font-black tracking-tight">
                Thal<span className="text-sky-400">AI</span> Guardian
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed font-medium">
              Revolutionizing Thalassemia care through decentralized AI matching and predictive analytics. Join the mission to ensure no patient goes without care.
            </p>
            <div className="flex gap-4">
               {[1,2,3].map(i => (
                 <div key={i} className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center border border-slate-800 hover:border-sky-500 hover:text-sky-400 transition-all cursor-pointer">
                    <Globe className="w-5 h-5" />
                 </div>
               ))}
            </div>
          </div>

          {/* Quick Nav */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-8">Navigation</h4>
            <ul className="space-y-4 text-sm font-bold text-slate-300">
              {[
                { name: 'Home', path: '/' },
                { name: 'Donors', path: '/donors' },
                { name: 'Requests', path: '/requests' },
                { name: 'Emergency', path: '/requests' }
              ].map(item => (
                <li key={item.name}>
                  <Link to={item.path} className="hover:text-sky-400 transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-800 bg-sky-400 scale-0 group-hover:scale-100 transition-all" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Medical Resources */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-8">Resources</h4>
            <ul className="space-y-4 text-sm font-bold text-slate-300">
              {[
                { name: 'Guidelines', icon: ShieldCheck, path: '/requests' },
                { name: 'Predictive Care', icon: Info, path: '/' },
                { name: 'Medical FAQ', icon: Info, path: '/' },
                { name: 'Crisis Center', icon: Heart, path: '/requests' }
              ].map(item => (
                <li key={item.name}>
                  <Link to={item.path} className="hover:text-sky-400 transition-colors flex items-center gap-2.5">
                    <item.icon className="w-4 h-4 text-slate-600" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-8">Support Hub</h4>
            <div className="space-y-6">
               <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-2 text-sky-400 mb-1">
                     <Mail className="w-4 h-4" />
                     <span className="text-[10px] uppercase font-black tracking-widest">Email Assistance</span>
                  </div>
                  <p className="text-sm font-bold truncate">support@thalai.guardian</p>
               </div>
               <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-2 text-rose-400 mb-1">
                     <Phone className="w-4 h-4" />
                     <span className="text-[10px] uppercase font-black tracking-widest">Emergency Line</span>
                  </div>
                  <p className="text-sm font-bold">+91 247-GUARDIAN</p>
               </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-20 pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-600">
          <p>© 2026 ThalAI Network. All Rights Reserved.</p>
          <div className="flex gap-8">
             <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
             <a href="#" className="hover:text-white transition-colors">Security Standards</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
