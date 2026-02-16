import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPublicStats } from '../api/public';
import StatCard from '../components/StatCard';
import PublicStats from './PublicStats';
import DonorPreview from './DonorPreview';
import RequestPreview from './RequestPreview';
import { Search, Zap, Shield, Droplets, ArrowRight, Heart, Sparkles, Activity, ShieldCheck } from 'lucide-react';

const HomeDashboard = () => {
  const { isAuthenticated, user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await getPublicStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent font-body overflow-x-hidden selection:bg-sky-100">
      {/* Hero Section */}
      <section className="relative pt-12 pb-24 lg:pt-32 lg:pb-48 overflow-hidden">
        <div className="container-custom">
           <div className="text-center space-y-8 animate-reveal">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-50 border border-sky-100 text-sky-600 text-xs font-black uppercase tracking-widest shadow-sm">
                 <Sparkles className="w-4 h-4" /> AI-Powered Life Saving Network
              </div>
              
              <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-display font-black text-slate-900 tracking-tighter leading-[0.85]">
                Thal<span className="text-sky-500">AI</span> <br className="hidden sm:block" />
                <span className="text-gradient">Guardian</span>
              </h1>
              
              <p className="text-lg md:text-2xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium px-4 md:px-0">
                The next generation of blood donor matching. Intelligent, fast, and secure care for Thalassemia patients.
              </p>

              <div className="flex flex-col sm:flex-row gap-5 justify-center pt-8">
                {isAuthenticated ? (
                  <Link
                    to={`/${user?.role || 'patient'}-dashboard`}
                    className="btn-primary text-lg px-12 py-4 shadow-2xl shadow-sky-500/20"
                  >
                    Enter Workspace <ArrowRight className="w-5 h-5" />
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/register"
                      className="btn-primary text-lg px-12 py-4 shadow-2xl shadow-sky-500/20 group"
                    >
                      Join as Hero <Heart className="w-5 h-5 group-hover:fill-white transition-all" />
                    </Link>
                    <Link
                      to="/login"
                      className="btn-secondary text-lg px-12 py-4"
                    >
                      Patient Portal
                    </Link>
                  </>
                )}
              </div>
           </div>
        </div>
      </section>

      {/* Stats Section with Glass Effect */}
      <section className="container-custom -mt-16 md:-mt-20 relative z-10 animate-reveal" style={{ animationDelay: '0.2s' }}>
        <div className="glass rounded-[32px] md:rounded-[48px] p-6 lg:p-12 shadow-2xl shadow-slate-200/50">
           {!loading && stats && <PublicStats stats={stats} />}
           {loading && (
             <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                {[1,2,3,4].map(i => (
                  <div key={i} className="animate-pulse space-y-4">
                     <div className="w-12 h-12 bg-slate-100 rounded-2xl" />
                     <div className="h-4 bg-slate-50 rounded w-1/2" />
                     <div className="h-8 bg-slate-100 rounded w-3/4" />
                  </div>
                ))}
             </div>
           )}
        </div>
      </section>

      {/* Features Grid */}
      <section className="container-custom py-24 md:py-32">
        <div className="text-center mb-20 animate-reveal">
           <h2 className="text-4xl md:text-5xl font-display font-black text-slate-900 mb-4">How We Protect</h2>
           <p className="text-slate-500 font-medium text-lg">Advanced technology meets compassionate care</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-10">
          {[
            { 
              title: 'Precision Matching', 
              desc: 'Our AI-powered engine maps compatibility, location, and health history in milliseconds.',
              icon: <Search className="w-8 h-8" />,
              color: 'text-sky-500',
              bg: 'bg-sky-50'
            },
            { 
              title: 'Instant Alerts', 
              desc: 'Critical requests bypass the noise, reaching nearby verified donors via real-time notifications.',
              icon: <Zap className="w-8 h-8" />,
              color: 'text-amber-500',
              bg: 'bg-amber-50'
            },
            { 
              title: 'Verified Network', 
              desc: 'Every donor undergoes a tier-based verification process ensuring maximum safety and trust.',
              icon: <ShieldCheck className="w-8 h-8" />,
              color: 'text-emerald-500',
              bg: 'bg-emerald-50'
            }
          ].map((feature, i) => (
            <div key={i} className="group p-10 rounded-[40px] bg-slate-50/50 border border-slate-100 hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 animate-reveal" style={{ animationDelay: `${i * 0.15}s` }}>
              <div className={`inline-flex p-5 rounded-3xl ${feature.bg} ${feature.color} mb-8 group-hover:scale-110 transition-transform duration-500`}>
                {feature.icon}
              </div>
              <h3 className="text-2xl font-display font-black text-slate-900 mb-4 tracking-tight">{feature.title}</h3>
              <p className="text-slate-500 leading-relaxed font-medium">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Previews with modern separation */}
      <section className="bg-slate-50/50 py-24 md:py-32 border-y border-slate-100">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-16">
            <div className="animate-reveal">
               <div className="mb-10">
                  <h2 className="text-3xl font-display font-black text-slate-900">Active Heroes</h2>
                  <p className="text-slate-500 font-medium">Verified donors currently available</p>
               </div>
               <div className="bg-white p-6 rounded-[40px] shadow-xl shadow-slate-200/30">
                  <DonorPreview />
               </div>
            </div>
            <div className="animate-reveal" style={{ animationDelay: '0.2s' }}>
               <div className="mb-10 text-right md:text-left">
                  <h2 className="text-3xl font-display font-black text-slate-900">Recent Requests</h2>
                  <p className="text-slate-500 font-medium">Cases awaiting critical support</p>
               </div>
               <div className="bg-white p-6 rounded-[40px] shadow-xl shadow-slate-200/30">
                  <RequestPreview />
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bold CTA */}
      <section className="container-custom py-24 md:py-32 mb-10">
        <div className="relative rounded-[40px] md:rounded-[60px] overflow-hidden bg-slate-900 p-8 md:p-24 text-center">
           {/* Abstract mesh in CTA */}
           <div className="absolute inset-0 opacity-20 pointer-events-none">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-sky-500 rounded-full blur-[100px]" />
              <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-rose-500 rounded-full blur-[100px]" />
           </div>
           
           <div className="relative z-10 max-w-3xl mx-auto space-y-10 animate-reveal">
              <h2 className="text-4xl md:text-6xl font-display font-black text-white leading-[1.1] tracking-tight">
                Ready to Save a <span className="text-sky-400">Life</span> with Intelligence?
              </h2>
              <p className="text-slate-400 text-lg md:text-xl font-medium max-w-xl mx-auto">
                Join our mission to eliminate blood shortage for Thalassemia patients through modern technology.
              </p>
              {!isAuthenticated ? (
                <div className="flex flex-col sm:flex-row gap-5 justify-center">
                   <Link to="/register" className="btn-primary py-5 px-14 text-xl">Sign Up as Donor</Link>
                   <Link to="/register" className="glass py-5 px-14 text-white text-xl font-bold rounded-xl hover:bg-white/10 transition-all">Support Now</Link>
                </div>
              ) : (
                <Link to="/dashboard" className="btn-primary py-5 px-14 text-xl">Go to App Central</Link>
              )}
           </div>
        </div>
      </section>
    </div>
  );
};

export default HomeDashboard;
