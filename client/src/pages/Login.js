import { motion } from 'framer-motion';
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, Workflow } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import api from '../api/http';
import { getStoredUser, setSession } from '../utils/api/auth';


function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (localStorage.getItem('token') && getStoredUser()) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/api/api/api/auth/login', { email, password });
      setSession({ token: response.data.token, user: response.data.user });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || 'Invalid email or password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="flex min-h-screen">

        {/* LEFT PANEL */}
        <div className="relative hidden w-[46%] flex-col justify-between overflow-hidden bg-[#0F172A] p-12 lg:flex xl:p-16">

          <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-600/12 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

          {/* LOGO */}
          <div className="relative flex items-center gap-3">

            <img
              src={logo}
              alt="FlowLite"
              className="h-16 w-16 object-contain"
            />

            <span className="text-lg font-bold text-white tracking-tight">
              FlowLite OS
            </span>

          </div>


          {/* HERO */}
          <div className="relative">

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >

              <h2 className="text-4xl font-bold leading-[1.15] tracking-tight text-white xl:text-5xl">
                Workforce operations
                <br />
                <span className="text-slate-400">
                  built for teams.
                </span>
              </h2>

            </motion.div>

          </div>

        </div>


        {/* RIGHT PANEL */}
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 sm:px-10">

          {/* MOBILE LOGO */}
          <div className="mb-10 flex items-center gap-2.5 lg:hidden">

            <img
              src={logo}
              alt="FlowLite"
              className="h-12 w-12 object-contain"
            />

            <span className="text-lg font-bold tracking-tight text-slate-900">
              FlowLite OS
            </span>

          </div>


          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="w-full max-w-sm"
          >

            {/* HEADING */}
            <div className="mb-8">

              <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
                Secure sign in
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                Welcome back
              </h1>

              <p className="mt-1.5 text-sm text-slate-500">
                Sign in to your workspace account.
              </p>

            </div>


            {/* FORM */}
            <form onSubmit={handleLogin} className="space-y-4">

              {/* EMAIL */}
              <div>

                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Email
                </label>

                <div className="relative">

                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    autoComplete="email"
                    className="field pl-10"
                    id="email"
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    type="email"
                    value={email}
                  />

                </div>

              </div>


              {/* PASSWORD */}
              <div>

                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Password
                </label>

                <div className="relative">

                  <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    autoComplete="current-password"
                    className="field pl-10 pr-10"
                    id="password"
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                  >

                    {showPassword
                      ? <EyeOff className="h-4 w-4" />
                      : <Eye className="h-4 w-4" />
                    }

                  </button>

                </div>

              </div>


              {/* ERROR */}
              {error && (

                <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                  {error}
                </div>

              )}


              {/* SUBMIT */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={loading ? undefined : { y: -1 }}
                whileTap={loading ? undefined : { scale: 0.99 }}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >

                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}

              </motion.button>

            </form>

          </motion.div>

        </div>

      </div>
    </div>
  );
}

export default Login;
