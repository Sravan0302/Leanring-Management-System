import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { BookOpen, GraduationCap, Clock, Award, FileText, ChevronRight, Activity } from 'lucide-react';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const userName = localStorage.getItem('userName');

  const [courses, setCourses] = useState([]);
  const [progressList, setProgressList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Authentication Guard
  useEffect(() => {
    if (!token || role !== 'student') {
      localStorage.clear();
      navigate('/auth');
    }
  }, [token, role, navigate]);

  // Load backend data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch courses
        const coursesRes = await fetch('/api/courses');
        if (!coursesRes.ok) throw new Error('Failed to load courses');
        const coursesData = await coursesRes.json();
        setCourses(coursesData);

        // Fetch progress
        const progressRes = await fetch('/api/courses/progress/all', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (progressRes.ok) {
          const progressData = await progressRes.json();
          setProgressList(progressData);
        }
      } catch (err) {
        console.error(err);
        setErrorMsg('Could not fetch server data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    if (token && role === 'student') {
      fetchData();
    }
  }, [token, role]);

  const upcomingAssignments = [
    { title: 'Portfolio Website', due: 'Aug 20, 2026', desc: 'Create a personal portfolio using HTML, CSS and JS' },
    { title: 'JavaScript Quiz App', due: 'Aug 25, 2026', desc: 'Build a quiz application using JavaScript DOM methods' },
    { title: 'Machine Learning Mini Project', due: 'Aug 30, 2026', desc: 'Implement linear regression from scratch or using scikit-learn' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-8">
        
        {/* Banner Greeting */}
        <header className="relative bg-gradient-to-r from-indigo-900 to-slate-900 border border-indigo-950 rounded-2xl p-6 md:p-8 overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="relative z-10 space-y-2">
            <span className="bg-indigo-500/20 text-indigo-400 border border-indigo-800/30 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
              Student Dashboard
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Welcome back, {userName || 'Scholar'}!
            </h1>
            <p className="text-slate-400 text-sm md:text-base max-w-2xl">
              Track your course achievements, submit pending assignments, and check your completion certificates. Keep up the great work!
            </p>
          </div>
        </header>

        {errorMsg && (
          <div className="p-4 bg-red-950/40 border border-red-900/50 rounded-xl text-red-400 text-sm font-semibold">
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area (left 2/3) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Courses section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <BookOpen className="text-indigo-400" size={20} />
                  My Available Courses
                </h2>
                <button
                  onClick={() => navigate('/courses')}
                  className="text-indigo-400 hover:text-indigo-300 text-sm font-bold flex items-center gap-1 transition-all"
                >
                  Browse Catalog
                  <ChevronRight size={16} />
                </button>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2].map((i) => (
                    <div key={i} className="animate-pulse bg-slate-900/50 border border-slate-800/65 rounded-xl h-48"></div>
                  ))}
                </div>
              ) : courses.length === 0 ? (
                <div className="text-center bg-slate-900/40 border border-slate-850/60 p-8 rounded-xl text-slate-500">
                  No courses are available at the moment.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {courses.map((course) => (
                    <div
                      key={course._id}
                      className="bg-slate-900/40 hover:bg-slate-900/70 border border-slate-800/80 hover:border-slate-700/80 rounded-xl p-6 shadow-md transition-all duration-200 flex flex-col justify-between group"
                    >
                      <div className="space-y-3">
                        <span className="text-xs text-indigo-400 font-bold uppercase tracking-widest bg-indigo-500/10 px-2.5 py-1 rounded-md">
                          Course
                        </span>
                        <h3 className="text-lg font-bold group-hover:text-indigo-400 transition-colors">
                          {course.title}
                        </h3>
                        <p className="text-slate-400 text-xs line-clamp-3 leading-relaxed">
                          {course.description || 'No description provided.'}
                        </p>
                      </div>
                      <button
                        onClick={() => navigate(`/course?id=${course._id}`)}
                        className="mt-5 w-full bg-slate-800 group-hover:bg-indigo-600 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-1"
                      >
                        Start Learning
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Course Progress Section */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Activity className="text-indigo-400" size={20} />
                Course Progress
              </h2>
              {loading ? (
                <div className="space-y-4 animate-pulse">
                  <div className="bg-slate-900/50 h-12 rounded-xl"></div>
                  <div className="bg-slate-900/50 h-12 rounded-xl"></div>
                </div>
              ) : progressList.length === 0 ? (
                <div className="bg-slate-900/40 border border-slate-850/60 p-6 rounded-xl text-slate-500 text-sm">
                  You haven't initialized progress in any courses. Click 'Start Learning' on a course card to begin.
                </div>
              ) : (
                <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-xl space-y-6">
                  {progressList.map((item) => {
                    if (!item.course) return null;
                    return (
                      <div key={item._id} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <strong className="text-slate-200 font-semibold">{item.course.title}</strong>
                          <span className="text-indigo-400 font-bold">{item.progressPercentage}%</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-3.5 overflow-hidden p-[2px] border border-slate-700/50">
                          <div
                            className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${item.progressPercentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

          </div>

          {/* Sidebar Section (right 1/3) */}
          <div className="space-y-8">
            
            {/* Quick Actions Card */}
            <section className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 space-y-4 shadow-xl">
              <h3 className="text-lg font-bold text-slate-200">Quick Access</h3>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => navigate('/assignments')}
                  className="w-full flex items-center justify-between p-3.5 bg-slate-950/40 hover:bg-indigo-950/20 border border-slate-850 hover:border-indigo-900/40 rounded-xl text-left text-sm font-semibold transition-all group"
                >
                  <span className="flex items-center gap-3">
                    <FileText className="text-indigo-400" size={18} />
                    Submit Assignments
                  </span>
                  <ChevronRight className="text-slate-600 group-hover:text-indigo-400 transition-colors" size={16} />
                </button>
                <button
                  onClick={() => navigate('/certificate')}
                  className="w-full flex items-center justify-between p-3.5 bg-slate-950/40 hover:bg-indigo-950/20 border border-slate-850 hover:border-indigo-900/40 rounded-xl text-left text-sm font-semibold transition-all group"
                >
                  <span className="flex items-center gap-3">
                    <Award className="text-indigo-400" size={18} />
                    View Certificates
                  </span>
                  <ChevronRight className="text-slate-600 group-hover:text-indigo-400 transition-colors" size={16} />
                </button>
              </div>
            </section>

            {/* Assignments card */}
            <section className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 space-y-6 shadow-xl">
              <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                <Clock className="text-indigo-400" size={18} />
                Upcoming Deadlines
              </h3>
              <div className="space-y-4">
                {upcomingAssignments.map((asg, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-slate-950/40 border border-slate-850/60 rounded-xl space-y-2 hover:border-slate-850 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-bold text-slate-200">{asg.title}</h4>
                      <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md whitespace-nowrap">
                        {asg.due}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {asg.desc}
                    </p>
                  </div>
                ))}
              </div>
            </section>

          </div>
        </div>

      </main>
    </div>
  );
}
