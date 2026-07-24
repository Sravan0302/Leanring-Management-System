import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ArrowLeft, Printer, Award, ShieldCheck } from 'lucide-react';

export default function Certificate() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const userName = localStorage.getItem('userName');

  // Auth Guard
  useEffect(() => {
    if (!token) {
      localStorage.clear();
      navigate('/auth');
    }
  }, [token, navigate]);

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Hide navbar on print using a custom print utility wrapper class */}
      <div className="print:hidden">
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
      </div>

      <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-8 flex flex-col items-center justify-center space-y-8">
        
        {/* Certificate Card container */}
        <div className="print-certificate bg-white text-slate-900 w-full max-w-3xl border-[16px] border-indigo-600 rounded-3xl p-10 md:p-14 text-center shadow-2xl relative flex flex-col items-center justify-between gap-6 overflow-hidden">
          
          {/* Subtle watermark or pattern inside */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-50/50 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>

          {/* Logo Branding */}
          <div className="relative z-10 flex items-center gap-2 text-indigo-600 font-extrabold tracking-widest text-xs uppercase mb-2">
            <Award size={18} />
            LEARNIFY
          </div>

          <div className="relative z-10 space-y-2">
            <h1 className="text-3xl md:text-5xl font-serif text-slate-900 font-extrabold tracking-tight">
              Certificate of Completion
            </h1>
            <p className="text-slate-500 font-serif italic text-sm md:text-base">
              This certificate is proudly presented to
            </p>
          </div>

          {/* Student Name */}
          <div className="relative z-10 my-4">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-indigo-650 border-b-2 border-indigo-200 pb-3 px-6 inline-block">
              {userName || 'Sravan Juluri'}
            </h2>
          </div>

          <div className="relative z-10 space-y-3 max-w-md">
            <p className="text-slate-500 text-xs md:text-sm">
              for successfully completing the coursework and demonstrating dedication and proficiency in:
            </p>
            <h3 className="text-lg md:text-xl font-bold text-slate-850 font-sans tracking-wide">
              Web Development Course
            </h3>
          </div>

          {/* Date */}
          <div className="relative z-10 text-xs md:text-sm font-semibold text-slate-500">
            Date: {currentDate}
          </div>

          {/* Signatures */}
          <div className="relative z-10 w-full flex items-center justify-between gap-12 mt-6 max-w-xl text-slate-700 text-xs md:text-sm font-serif">
            <div className="flex flex-col items-center w-36">
              <div className="border-t border-slate-400 w-full mb-2"></div>
              <span>Instructor Signature</span>
            </div>
            <div className="flex-shrink-0 text-indigo-600 opacity-60">
              <ShieldCheck size={48} className="stroke-[1.5]" />
            </div>
            <div className="flex flex-col items-center w-36">
              <div className="border-t border-slate-400 w-full mb-2"></div>
              <span>Director Signature</span>
            </div>
          </div>

        </div>

        {/* Print Button */}
        <button
          onClick={handlePrint}
          className="print-btn bg-indigo-650 hover:bg-indigo-600 text-white font-bold py-3.5 px-8 rounded-xl text-sm transition-all duration-200 flex items-center gap-2 shadow-lg shadow-indigo-650/15"
        >
          <Printer size={16} />
          Download / Print Certificate
        </button>

      </main>
    </div>
  );
}
