import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ArrowLeft, Play, CheckCircle, Video, BookOpen, ExternalLink } from 'lucide-react';

export default function CourseLearning() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('id');

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const [course, setCourse] = useState(null);
  const [currentVideoId, setCurrentVideoId] = useState('qz0aGYrrlhU'); // default
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const mockLessons = [
    { id: 'qz0aGYrrlhU', title: 'Lesson 1 - HTML Basics' },
    { id: 'UB1O30fR-EE', title: 'Lesson 2 - CSS Basics' },
    { id: 'PkZNo7MFNFg', title: 'Lesson 3 - JavaScript Basics' },
  ];

  // Check auth
  useEffect(() => {
    if (!token) {
      localStorage.clear();
      navigate('/auth');
    }
  }, [token, navigate]);

  // Convert typical youtube links to embed links
  const getYoutubeEmbedUrl = (url) => {
    if (!url) return '';
    if (url.includes('/embed/')) return url;
    let videoId = '';
    if (url.includes('youtube.com/watch')) {
      try {
        const urlObj = new URL(url);
        videoId = urlObj.searchParams.get('v');
      } catch (e) {}
    } else if (url.includes('youtu.be/')) {
      const parts = url.split('/');
      videoId = parts[parts.length - 1].split('?')[0];
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  // Save student progress helper
  const saveProgress = async (percentage, completed) => {
    if (role !== 'student' || !courseId) return;
    try {
      await fetch(`/api/courses/${courseId}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ progressPercentage: percentage, isCompleted: completed })
      });
      setProgressPercentage(percentage);
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  // Load course details & student progress
  useEffect(() => {
    const initPage = async () => {
      if (!courseId) {
        alert('No course ID specified! Redirecting to dashboard.');
        navigate(role === 'instructor' ? '/instructor' : '/student');
        return;
      }

      setLoading(true);
      try {
        // 1. Fetch course details
        const courseRes = await fetch(`/api/courses/${courseId}`);
        if (!courseRes.ok) throw new Error('Course not found');
        const courseData = await courseRes.json();
        setCourse(courseData);

        // Set default video
        if (courseData.videoUrl) {
          const embedUrl = getYoutubeEmbedUrl(courseData.videoUrl);
          if (embedUrl.includes('youtube.com/embed/')) {
            const vidId = embedUrl.substring(embedUrl.lastIndexOf('/') + 1);
            setCurrentVideoId(vidId);
          }
        }

        // 2. Fetch/Init student progress
        if (role === 'student') {
          const progressRes = await fetch('/api/courses/progress/all', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (progressRes.ok) {
            const progressList = await progressRes.json();
            const currentProgress = progressList.find((p) => p.course && p.course._id === courseId);
            if (currentProgress) {
              setProgressPercentage(currentProgress.progressPercentage);
            } else {
              // Initialize with 10% progress
              await saveProgress(10, false);
            }
          }
        }
      } catch (err) {
        console.error(err);
        setErrorMsg('Error loading course details.');
      } finally {
        setLoading(false);
      }
    };

    initPage();
  }, [courseId, role, navigate, token]);

  const handleMarkCompleted = async () => {
    await saveProgress(100, true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin h-10 w-10 border-4 border-indigo-650 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  if (errorMsg || !course) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4">
          <p className="text-red-400 font-bold">{errorMsg || 'Course not found'}</p>
          <button
            onClick={() => navigate(role === 'instructor' ? '/instructor' : '/student')}
            className="bg-indigo-600 hover:bg-indigo-500 px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      {/* Back Header Nav */}
      <div className="bg-slate-900 border-b border-slate-800/80 px-6 py-3">
        <button
          onClick={() => navigate(role === 'instructor' ? '/instructor' : '/student')}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-all font-semibold"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-8">
        
        {/* Course Header */}
        <header className="space-y-2">
          <span className="bg-indigo-500/20 text-indigo-400 border border-indigo-800/30 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
            Lectures & Lessons
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {course.title}
          </h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Video Player Column (Left 2/3) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-850 shadow-2xl relative">
              <iframe
                title="Lesson Player"
                src={`https://www.youtube.com/embed/${currentVideoId}?autoplay=0&rel=0`}
                className="w-full h-full border-none"
                allowFullScreen
              ></iframe>
            </div>

            {/* Course Information */}
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-bold text-slate-200">About this course</h3>
              <p className="text-slate-450 text-sm leading-relaxed whitespace-pre-wrap">
                {course.description || 'No description provided.'}
              </p>
            </div>
          </div>

          {/* Syllabus & Progress Column (Right 1/3) */}
          <div className="space-y-6">
            
            {/* Student Progress (Only for Students) */}
            {role === 'student' && (
              <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 space-y-4 shadow-xl">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">My Progress</h3>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-semibold">Completeness Score</span>
                    <strong className="text-emerald-400 text-sm">{progressPercentage}%</strong>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden p-[1px] border border-slate-700/50">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                </div>

                {progressPercentage < 100 ? (
                  <button
                    onClick={handleMarkCompleted}
                    className="w-full mt-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-650/15"
                  >
                    <CheckCircle size={16} />
                    Mark Course as Completed
                  </button>
                ) : (
                  <div className="text-center p-3 bg-emerald-950/20 border border-emerald-900/40 rounded-xl text-emerald-400 text-xs font-semibold flex items-center justify-center gap-2">
                    <CheckCircle size={16} />
                    You finished this course!
                  </div>
                )}
              </div>
            )}

            {/* Syllabus */}
            <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 space-y-4 shadow-xl">
              <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                <BookOpen size={18} className="text-indigo-400" />
                Course Syllabus
              </h3>
              
              <div className="space-y-3">
                {mockLessons.map((lesson) => {
                  const isActive = currentVideoId === lesson.id;
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => setCurrentVideoId(lesson.id)}
                      className={`w-full p-4 rounded-xl text-left border text-sm font-semibold transition-all flex items-center justify-between gap-3 group ${
                        isActive
                          ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400'
                          : 'bg-slate-950/40 border-slate-850 hover:bg-slate-800/40 text-slate-450 hover:text-slate-200'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <Video size={16} className={isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-350'} />
                        {lesson.title}
                      </span>
                      <Play size={12} className={`opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? 'text-indigo-400 opacity-100' : 'text-slate-450'}`} />
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}
