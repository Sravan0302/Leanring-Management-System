import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Search, Compass, BookOpen, ChevronRight, Play } from 'lucide-react';

export default function CourseCatalog() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const [courses, setCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Authentication Guard
  useEffect(() => {
    if (!token) {
      localStorage.clear();
      navigate('/auth');
    }
  }, [token, navigate]);

  // Load courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/courses');
        if (!response.ok) throw new Error('Failed to fetch courses');
        const data = await response.json();
        setCourses(data);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setErrorMsg('Failed to load courses from database.');
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // Filter courses based on query
  const filteredCourses = courses.filter((course) => {
    const query = searchQuery.toLowerCase().trim();
    return (
      course.title.toLowerCase().includes(query) ||
      (course.description && course.description.toLowerCase().includes(query))
    );
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-8">
        
        {/* Banner */}
        <header className="relative bg-gradient-to-r from-blue-950 to-slate-900 border border-blue-950 rounded-2xl p-6 md:p-8 overflow-hidden shadow-xl text-center md:text-left">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="relative z-10 space-y-2">
            <span className="bg-blue-500/20 text-blue-300 border border-blue-800/30 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
              Knowledge Hub
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Course Catalog
            </h1>
            <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto md:mx-0">
              Browse through our selection of professionally designed courses. Expand your skillset and advance your career today!
            </p>
          </div>
        </header>

        {/* Search Bar Section */}
        <div className="relative max-w-2xl mx-auto w-full">
          <Search className="absolute left-4 top-4 text-slate-500" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search courses by title, keywords or details..."
            className="w-full bg-slate-900/60 border border-slate-800 focus:border-indigo-500 rounded-2xl py-4 pl-12 pr-4 text-sm outline-none text-slate-100 placeholder:text-slate-550 transition-all shadow-md focus:ring-4 focus:ring-indigo-500/10"
          />
        </div>

        {errorMsg && (
          <div className="p-4 bg-red-950/40 border border-red-900/50 rounded-xl text-red-400 text-sm font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Grid Area */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2 text-slate-350">
            <Compass size={18} className="text-indigo-400 animate-spin-slow" />
            Explore Courses
          </h2>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-slate-900/50 border border-slate-800/60 rounded-xl h-52"></div>
              ))}
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center bg-slate-900/40 border border-slate-850/60 py-16 rounded-xl text-slate-500">
              <BookOpen size={48} className="mx-auto text-slate-700 mb-3" />
              <p className="text-base font-medium">No matching courses found</p>
              <p className="text-xs text-slate-650 mt-1">Try checking your spelling or search terms.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <div
                  key={course._id}
                  className="bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800/80 hover:border-slate-700/80 rounded-xl p-6 shadow-md transition-all duration-200 flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider bg-indigo-500/10 px-2 py-0.5 rounded-md">
                      Interactive Class
                    </span>
                    <h3 className="text-lg font-bold group-hover:text-indigo-400 transition-colors line-clamp-1">
                      {course.title}
                    </h3>
                    <p className="text-slate-400 text-xs leading-relaxed line-clamp-4">
                      {course.description || 'No description provided.'}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(`/course?id=${course._id}`)}
                    className="mt-6 w-full bg-slate-800 group-hover:bg-indigo-650 hover:bg-indigo-600 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-1.5"
                  >
                    <Play size={12} className="fill-white" />
                    Start Learning
                    <ChevronRight size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
