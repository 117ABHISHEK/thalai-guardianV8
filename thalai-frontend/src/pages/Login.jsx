import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Droplets, Mail, Lock, ArrowRight, ShieldCheck, HeartPulse } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData);
      const user = JSON.parse(localStorage.getItem('user'));
      const role = user?.role || 'patient';
      navigate(`/${role}-dashboard`);
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex overflow-hidden font-body animate-slide-up">
      {/* Visual Side (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 items-center justify-center p-12">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />
        
        <div className="relative z-10 max-w-lg text-white space-y-8 animate-reveal">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-sky-500 rounded-2xl shadow-lg shadow-sky-500/50">
              <Droplets className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-display font-bold">ThalAI Guardian</h1>
          </div>
          
          <div className="space-y-6">
            <h2 className="text-5xl font-display font-extrabold leading-tight">
              Advanced <span className="text-sky-400">AI-Powered</span> Care for Thalassemia.
            </h2>
            <p className="text-xl text-slate-300 leading-relaxed">
              Empowering patients and doctors with predictive insights, donor matching, and holistic health management.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-8">
            <div className="flex items-center gap-3 text-slate-200">
              <ShieldCheck className="w-5 h-5 text-sky-400" />
              <span className="font-medium">Secure Records</span>
            </div>
            <div className="flex items-center gap-3 text-slate-200">
              <HeartPulse className="w-5 h-5 text-rose-400" />
              <span className="font-medium">Live Monitoring</span>
            </div>
          </div>
        </div>
        
        {/* Floating Accent */}
        <div className="absolute bottom-12 right-12 flex items-center gap-4 px-6 py-4 glass-dark rounded-2xl">
          <div className="flex -space-x-3">
            {[1,2,3].map(i => (
              <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-800 bg-slate-700 overflow-hidden">
                <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" />
              </div>
            ))}
          </div>
          <div className="text-sm">
            <p className="text-white font-bold">Trusted by 500+</p>
            <p className="text-slate-400">Medical Professionals</p>
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-16 bg-slate-50/50 relative">
        <div className="absolute inset-0 bg-dots opacity-5" />
        <Link to="/" className="lg:hidden flex items-center gap-2 mb-12 animate-reveal">
           <Droplets className="w-8 h-8 text-sky-500" />
           <span className="text-xl font-display font-bold">ThalAI Guardian</span>
        </Link>

        <div className="w-full max-w-md relative z-10 animate-reveal" style={{ animationDelay: '0.1s' }}>
          <div className="mb-10">
            <h3 className="text-4xl font-display font-black text-slate-900 mb-2">Welcome Back</h3>
            <p className="text-slate-500 font-medium">Please enter your details to sign in</p>
          </div>

          <div className="bg-white p-8 rounded-[32px] shadow-2xl shadow-slate-200/50 border border-slate-100">
            {error && (
              <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-2xl mb-6 text-sm flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="input-label" htmlFor="email">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="input-field pl-12"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="input-label" htmlFor="password">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="input-field pl-12"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center select-none cursor-pointer group">
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded-lg border-slate-200 text-sky-500 focus:ring-sky-500/20 transition-all cursor-pointer"
                  />
                  <span className="ml-2.5 text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">Remember me</span>
                </label>
                <Link to="#" className="text-sm font-bold text-sky-600 hover:text-sky-700 hover:underline transition-all">
                  Forgot?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-4 text-base"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-slate-50 text-center">
              <p className="text-slate-500 font-medium">
                New on our platform?{' '}
                <Link to="/register" className="text-sky-600 font-bold hover:text-sky-700 transition-colors">
                  Create an account
                </Link>
              </p>
            </div>
          </div>
          
          <Link to="/" className="mt-8 flex items-center justify-center gap-2 text-slate-400 hover:text-slate-600 transition-colors font-medium">
            <ArrowRight className="w-4 h-4 rotate-180" /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
