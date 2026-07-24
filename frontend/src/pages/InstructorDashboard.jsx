import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Plus, BookOpen, Clock, Users, FileText, Trash2, Edit2, Check, Video } from 'lucide-react';

export default function InstructorDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const userName = localStorage.getItem('userName');

  // Course states
  const [courses, setCourses] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [editingCourseId, setEditingCourseId] = useState(null);

  // Mock assignment state
  const [assignments, setAssignments] = useState([
    { title: 'Portfolio Website', desc: 'Create a personal portfolio using HTML, CSS and JS' },
    { title: 'JavaScript Quiz App', desc: 'Build a quiz application using JavaScript DOM methods' }
  ]);
  const [asgTitle, setAsgTitle] = useState('');
  const [asgDesc, setAsgDesc] = useState('');

  // Status states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Authentication Guard
  useEffect(() => {
    if (!token || role !== 'instructor') {
      localStorage.clear();
      navigate('/auth');
    }
  }, [token, role, navigate]);

  // Load courses
  const loadCourses = async () => {
    try {
      const response = await fetch('/api/courses');
      if (!response.ok) throw new Error('Failed to load courses');
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error('Error loading courses:', error);
      setErrorMsg('Failed to load course list from backend.');
    }
  };

  useEffect(() => {
    if (token && role === 'instructor') {
      loadCourses();
    }
  }, [token, role]);

  // Add / Update Course
  const handleSaveCourse = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) {
      setErrorMsg('Course Name and Description are required');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      let response;
      const courseData = { title: newTitle, description: newDesc, videoUrl: newVideoUrl };

      if (editingCourseId) {
        // Edit course
        response = await fetch(`/api/courses/${editingCourseId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(courseData)
        });
      } else {
        // Add course
        response = await fetch('/api/courses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(courseData)
        });
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to save course');
      }

      setSuccessMsg(editingCourseId ? 'Course updated successfully!' : 'Course added successfully!');
      setNewTitle('');
      setNewDesc('');
      setNewVideoUrl('');
      setEditingCourseId(null);
      loadCourses();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete Course
  const handleDeleteCourse = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const response = await fetch(`/api/courses/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete course');
      }
      setSuccessMsg('Course deleted successfully.');
      loadCourses();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  // Edit Click Handler
  const handleStartEdit = (course) => {
    setEditingCourseId(course._id);
    setNewTitle(course.title);
    setNewDesc(course.description || '');
    setNewVideoUrl(course.videoUrl || '');
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingCourseId(null);
    setNewTitle('');
    setNewDesc('');
    setNewVideoUrl('');
  };

  // Add Assignment
  const handleAddAssignment = (e) => {
    e.preventDefault();
    if (!asgTitle.trim()) {
      alert('Please enter an assignment title');
      return;
    }
    setAssignments([...assignments, { title: asgTitle, desc: asgDesc }]);
    setAsgTitle('');
    setAsgDesc('');
  };

  const mockStudents = [
    { name: 'Sravan Juluri', progress: 80 },
    { name: 'Rahul', progress: 65 },
    { name: 'Anjali', progress: 92 },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-8">
        
        {/* Banner Greeting */}
        <header className="relative bg-gradient-to-r from-violet-950 to-slate-900 border border-violet-950 rounded-2xl p-6 md:p-8 overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="relative z-10 space-y-2">
            <span className="bg-violet-500/20 text-violet-300 border border-violet-800/30 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
              Instructor Panel
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Welcome back, {userName || 'Professor'}!
            </h1>
            <p className="text-slate-400 text-sm md:text-base max-w-2xl">
              Create new lectures, formulate test questions and assignments, and track active student completion rates.
            </p>
          </div>
        </header>

        {/* Status Alerts */}
        {errorMsg && (
          <div className="p-4 bg-red-950/40 border border-red-900/50 rounded-xl text-red-400 text-sm font-semibold">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="p-4 bg-emerald-950/40 border border-emerald-900/50 rounded-xl text-emerald-400 text-sm font-semibold">
            {successMsg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Action Panels (Left 2/3) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Create / Edit Course */}
            <section className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 md:p-8 shadow-xl">
              <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-slate-200">
                <BookOpen size={20} className="text-indigo-400" />
                {editingCourseId ? 'Edit Course Details' : 'Add New Course'}
              </h2>
              
              <form onSubmit={handleSaveCourse} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Course Title</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Web Development Bootcamp"
                    className="w-full bg-slate-950/50 border border-slate-800 focus:border-indigo-500 rounded-xl py-3 px-4 text-sm outline-none text-slate-100 placeholder:text-slate-650 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</label>
                  <textarea
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    rows={4}
                    placeholder="Provide a comprehensive course details summary..."
                    className="w-full bg-slate-950/50 border border-slate-800 focus:border-indigo-500 rounded-xl py-3 px-4 text-sm outline-none text-slate-100 placeholder:text-slate-650 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Video Embed URL (YouTube)</label>
                  <div className="relative">
                    <Video className="absolute left-3.5 top-3.5 text-slate-500" size={18} />
                    <input
                      type="text"
                      value={newVideoUrl}
                      onChange={(e) => setNewVideoUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full bg-slate-950/50 border border-slate-800 focus:border-indigo-500 rounded-xl py-3 pl-11 pr-4 text-sm outline-none text-slate-100 placeholder:text-slate-650 transition-all"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-700 py-3 rounded-xl font-bold text-white shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-1.5"
                  >
                    {loading && <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>}
                    {editingCourseId ? 'Update Course' : 'Create Course'}
                  </button>
                  {editingCourseId && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-6 py-3 border border-slate-800 hover:bg-slate-800/40 rounded-xl text-slate-400 font-semibold transition-all"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </section>

            {/* Create Mock Assignment */}
            <section className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 md:p-8 shadow-xl">
              <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-slate-200">
                <FileText size={20} className="text-indigo-400" />
                Create Course Assignment
              </h2>
              
              <form onSubmit={handleAddAssignment} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Assignment Title</label>
                  <input
                    type="text"
                    value={asgTitle}
                    onChange={(e) => setAsgTitle(e.target.value)}
                    placeholder="e.g. Build an Interactive Dashboard"
                    className="w-full bg-slate-950/50 border border-slate-800 focus:border-indigo-500 rounded-xl py-3 px-4 text-sm outline-none text-slate-100 placeholder:text-slate-650 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Instructions / Prompt</label>
                  <textarea
                    value={asgDesc}
                    onChange={(e) => setAsgDesc(e.target.value)}
                    rows={3}
                    placeholder="Provide assignment specifications..."
                    className="w-full bg-slate-950/50 border border-slate-800 focus:border-indigo-500 rounded-xl py-3 px-4 text-sm outline-none text-slate-100 placeholder:text-slate-650 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-slate-800 hover:bg-indigo-650 text-white font-bold py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  <Plus size={16} />
                  Create Assignment
                </button>
              </form>

              {/* Assignment List */}
              {assignments.length > 0 && (
                <div className="mt-6 border-t border-slate-800/60 pt-6 space-y-3">
                  <h4 className="text-sm font-bold text-slate-400">Created Assignments (Preview)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {assignments.map((asg, idx) => (
                      <div key={idx} className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl space-y-1">
                        <strong className="text-slate-200 text-sm block">📝 {asg.title}</strong>
                        <p className="text-xs text-slate-500 leading-relaxed truncate">{asg.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

          </div>

          {/* Listings Sidebar (Right 1/3) */}
          <div className="space-y-8">
            
            {/* Created Courses list */}
            <section className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 space-y-4 shadow-xl">
              <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                <BookOpen size={18} className="text-indigo-400" />
                Active Courses ({courses.length})
              </h3>
              
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {courses.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">No courses created yet.</p>
                ) : (
                  courses.map((course) => (
                    <div
                      key={course._id}
                      className="p-3 bg-slate-950/40 border border-slate-855 rounded-xl flex items-center justify-between gap-3 group"
                    >
                      <div className="truncate">
                        <strong className="text-sm text-slate-200 block truncate group-hover:text-indigo-400 transition-colors">
                          {course.title}
                        </strong>
                        <span className="text-[10px] text-slate-550 block truncate">
                          {course.description || 'No description'}
                        </span>
                      </div>
                      <div className="flex gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => handleStartEdit(course)}
                          className="p-2 hover:bg-indigo-500/10 text-slate-400 hover:text-indigo-400 rounded-lg transition-all"
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(course._id)}
                          className="p-2 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Student Progress */}
            <section className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 space-y-4 shadow-xl">
              <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                <Users size={18} className="text-indigo-400" />
                Student Activity
              </h3>
              
              <div className="space-y-4">
                {mockStudents.map((student, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-350">{student.name}</span>
                      <span className="text-emerald-400 font-bold">{student.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden p-[1px] border border-slate-700/50">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-indigo-500 h-full rounded-full"
                        style={{ width: `${student.progress}%` }}
                      ></div>
                    </div>
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
