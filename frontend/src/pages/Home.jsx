import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ArrowRight, Shield, Award, CheckCircle, AwardIcon, Sparkles, Compass, Star, MoveRight } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const handleCtaClick = () => {
    if (token) {
      navigate(role === 'instructor' ? '/instructor' : '/student');
    } else {
      navigate('/auth');
    }
  };

  const features = [
    {
      icon: Compass,
      title: 'Dynamic Catalog',
      desc: 'Browse, search, and learn custom course modules with fully responsive interfaces.',
      color: 'from-blue-500 to-cyan-400',
    },
    {
      icon: Shield,
      title: 'Secure OTP Portal',
      desc: 'Instant, secure verification codes delivered directly to your inbox via SMTP.',
      color: 'from-purple-500 to-indigo-400',
    },
    {
      icon: CheckCircle,
      title: 'Progress Saver',
      desc: 'Interactive lesson syllabus tracking with automatic progress database updates.',
      color: 'from-emerald-500 to-teal-400',
    },
    {
      icon: Award,
      title: 'PDF Certificates',
      desc: 'Print-ready custom certification documents instantly rendered for students.',
      color: 'from-pink-500 to-rose-400',
    },
  ];

  const stats = [
    { value: '12k+', label: 'Active Scholars' },
    { value: '45+', label: 'Syllabus Paths' },
    { value: '99.8%', label: 'Delivery Success' },
    { value: '100%', label: 'Secure Access' },
  ];

  const testimonials = [
    {
      name: 'Sarah Connor',
      role: 'Full Stack Student',
      rating: 5,
      content: 'The custom course learning interface and instant email codes made logging in and reviewing syllabus material incredibly smooth.',
    },
    {
      name: 'Dr. Evelyn Reed',
      role: 'Senior Instructor',
      rating: 5,
      content: 'Creating syllabus paths, updating description fields, and managing students progress is efficient and beautifully designed.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Landing Navbar */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-900 px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="bg-indigo-600 p-2 rounded-xl text-white">
            <BookOpen size={22} />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            LEARNIFY
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-400">
          <a href="#features" className="hover:text-slate-200 transition-colors">Features</a>
          <a href="#stats" className="hover:text-slate-200 transition-colors">Impact</a>
          <a href="#testimonials" className="hover:text-slate-200 transition-colors">Feedback</a>
        </nav>

        <button
          onClick={handleCtaClick}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          {token ? 'Go to Dashboard' : 'Sign In'}
          <ArrowRight size={16} />
        </button>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden px-6">
        {/* Glow Backdrops */}
        <div className="absolute top-1/4 left-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-pink-500/5 rounded-full blur-3xl -translate-x-1/2 pointer-events-none"></div>

        <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
          
          <div className="inline-flex items-center gap-2 bg-indigo-950/40 border border-indigo-900/40 px-4 py-1.5 rounded-full text-xs font-bold text-indigo-300 uppercase tracking-widest">
            <Sparkles size={12} className="animate-pulse" />
            Next-Gen Learning Portal
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] text-white">
            Transform Your Learning <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Experience Instantly
            </span>
          </h1>

          <p className="text-slate-400 text-sm md:text-lg max-w-2xl mx-auto leading-relaxed">
            A comprehensive, high-fidelity platform offering secure OTP email credentials, live course search engines, dynamic syllabus details, and instantly verifiable completion certificates.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={handleCtaClick}
              className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3.5 px-8 rounded-xl text-sm transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] shadow-xl shadow-indigo-650/20 flex items-center justify-center gap-2"
            >
              Get Started Now
              <MoveRight size={16} />
            </button>
            <button
              onClick={() => navigate('/courses')}
              className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 font-bold py-3.5 px-8 rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-1.5"
            >
              Explore Catalog
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-slate-950 px-6 border-t border-slate-900 relative">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-extrabold text-white">Platform Capabilities</h2>
            <p className="text-slate-450 text-sm max-w-lg mx-auto">
              Engineered with modern components and styling to provide the best usability for learners and instructors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="bg-slate-900/30 hover:bg-slate-900/60 border border-slate-850 hover:border-slate-800 p-6 rounded-2xl shadow-md transition-all duration-300 group hover:-translate-y-1"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feat.color} p-[1px] mb-5`}>
                    <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center text-white">
                      <Icon size={20} />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-100 mb-2 group-hover:text-indigo-400 transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-slate-450 text-xs leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-16 bg-slate-900/30 border-t border-slate-900 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="text-3xl md:text-5xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-6 border-t border-slate-900">
        <div className="max-w-5xl mx-auto space-y-12">
          
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-extrabold text-white">Trusted by Scholars</h2>
            <p className="text-slate-450 text-sm">
              Read how our community is leveraging the platform to succeed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((test, idx) => (
              <div
                key={idx}
                className="bg-slate-900/40 border border-slate-850 p-6 md:p-8 rounded-2xl flex flex-col justify-between hover:border-slate-800 transition-all shadow-md"
              >
                <p className="text-slate-300 text-sm italic leading-relaxed mb-6">
                  "{test.content}"
                </p>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <strong className="text-slate-200 text-sm block">{test.name}</strong>
                    <span className="text-xs text-slate-500">{test.role}</span>
                  </div>
                  <div className="flex gap-1 text-amber-500">
                    {[...Array(test.rating)].map((_, i) => (
                      <Star key={i} size={14} className="fill-amber-500" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-950 border-t border-slate-900 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-slate-500 text-xs">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-indigo-400" />
            <span className="font-bold text-slate-400">LEARNIFY</span>
          </div>
          <div>
            &copy; {new Date().getFullYear()} LEARNIFY. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}
