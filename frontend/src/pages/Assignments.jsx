import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ClipboardList, Calendar, CheckCircle, UploadCloud, AlertCircle, FileText } from 'lucide-react';

export default function Assignments() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const [assignmentData, setAssignmentData] = useState([
    {
      id: 'asg1',
      title: 'Portfolio Website',
      description: 'Create a personal portfolio website showcasing your bios, projects, skills, and contact form using HTML, CSS and JavaScript.',
      deadline: '20 August 2026',
      status: 'pending', // 'pending' | 'submitting' | 'submitted'
      fileName: '',
    },
    {
      id: 'asg2',
      title: 'JavaScript Quiz App',
      description: 'Build a fully interactive web-based quiz application that tracks dynamic scores, manages questions using JS arrays, and offers a retry view.',
      deadline: '25 August 2026',
      status: 'pending',
      fileName: '',
    },
  ]);

  // Auth Guard
  useEffect(() => {
    if (!token) {
      localStorage.clear();
      navigate('/auth');
    }
  }, [token, navigate]);

  const handleFileChange = (id, e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAssignmentData((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, fileName: file.name };
        }
        return item;
      })
    );
  };

  const handleSubmit = (id) => {
    const current = assignmentData.find((item) => item.id === id);
    if (!current.fileName) {
      alert('Please upload a file first!');
      return;
    }

    // Simulate submission progress
    setAssignmentData((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, status: 'submitting' };
        }
        return item;
      })
    );

    setTimeout(() => {
      setAssignmentData((prev) =>
        prev.map((item) => {
          if (item.id === id) {
            return { ...item, status: 'submitted' };
          }
          return item;
        })
      );
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-8 space-y-8">
        
        {/* Banner */}
        <header className="relative bg-gradient-to-r from-teal-950 to-slate-900 border border-teal-955 rounded-2xl p-6 md:p-8 overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="relative z-10 space-y-2">
            <span className="bg-teal-500/20 text-teal-300 border border-teal-800/30 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
              Deliverables
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Assignments Tasks
            </h1>
            <p className="text-slate-400 text-sm max-w-xl">
              Check active tasks and deadlines. Upload your code files and documents below to submit them for evaluation.
            </p>
          </div>
        </header>

        {/* Section List */}
        <section className="space-y-6">
          <h2 className="text-lg font-bold flex items-center gap-2 text-slate-350">
            <ClipboardList size={18} className="text-indigo-400" />
            Assigned Deliverables
          </h2>

          <div className="space-y-6">
            {assignmentData.map((asg) => (
              <div
                key={asg.id}
                className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 md:p-8 space-y-4 hover:border-slate-700/80 transition-all shadow-md"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                      <FileText size={18} className="text-indigo-400" />
                      {asg.title}
                    </h3>
                    <p className="text-slate-400 text-xs leading-relaxed max-w-2xl">
                      {asg.description}
                    </p>
                  </div>
                  
                  {/* Deadline box */}
                  <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-850 px-3 py-1.5 rounded-lg text-xs text-slate-400 self-start">
                    <Calendar size={14} className="text-indigo-400" />
                    <span className="font-semibold whitespace-nowrap">Due: {asg.deadline}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-850 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Input upload */}
                  {asg.status === 'pending' && (
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 px-4 py-2.5 rounded-xl cursor-pointer text-xs font-semibold transition-all">
                        <UploadCloud size={16} className="text-indigo-400" />
                        Choose File
                        <input
                          type="file"
                          onChange={(e) => handleFileChange(asg.id, e)}
                          className="hidden"
                        />
                      </label>
                      <span className="text-xs text-slate-500 truncate max-w-[200px]">
                        {asg.fileName || 'No file chosen'}
                      </span>
                    </div>
                  )}

                  {/* Submission State Buttons / Results */}
                  <div className="flex-1 md:flex-none flex justify-end">
                    {asg.status === 'pending' && (
                      <button
                        onClick={() => handleSubmit(asg.id)}
                        className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-500 font-bold px-6 py-2.5 rounded-xl text-xs transition-all shadow-md"
                      >
                        Submit Assignment
                      </button>
                    )}

                    {asg.status === 'submitting' && (
                      <button
                        disabled
                        className="w-full md:w-auto bg-indigo-700/60 text-slate-400 font-bold px-6 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2"
                      >
                        <span className="animate-spin h-3 w-3 border-2 border-slate-400 border-t-transparent rounded-full"></span>
                        Uploading...
                      </button>
                    )}

                    {asg.status === 'submitted' && (
                      <div className="w-full md:w-auto bg-emerald-950/20 border border-emerald-900/40 text-emerald-400 font-bold px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-2">
                        <CheckCircle size={16} />
                        ✓ Assignment Submitted Successfully
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}
