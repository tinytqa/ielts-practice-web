import React from 'react';
import { 
  Compass
} from 'lucide-react';

interface Task1MapDiagramProps {
  customImageUrl?: string;
}

export const Task1MapDiagram: React.FC<Task1MapDiagramProps> = ({
  customImageUrl
}) => {
  return (
    <div 
      className="bg-white border-2 border-slate-300 rounded-3xl p-4 sm:p-5 shadow-sm space-y-4 text-slate-900"
    >
      {/* Header with Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-slate-900 tracking-tight flex items-center gap-2">
              <span>IELTS Writing Task 1: Archaeological Site Maps (2004 vs 2014)</span>
            </h4>
            <p className="text-[11px] text-slate-500">
              Đề thi bản đồ khảo cổ học chính thức từ IELTS Academic.
            </p>
          </div>
        </div>
      </div>

      {/* Main Diagram View (If Custom Image is Provided or Vector Map) */}
      {customImageUrl ? (
        <div className="relative rounded-2xl overflow-hidden border-2 border-slate-300 bg-slate-50 flex flex-col items-center justify-center p-3">
          <div className="relative max-h-[520px] w-full flex items-center justify-center overflow-auto rounded-xl bg-white p-2">
            <img
              src={customImageUrl}
              alt="The maps below show recent archaeological findings at a historic site in 2004 and 2014"
              className="max-h-[480px] w-auto object-contain rounded-lg border border-slate-200 shadow-sm hover:scale-105 transition-transform duration-200"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      ) : (
        /* High-Precision Authentic IELTS Vector Map (Exact match of the exam diagram) */
        <div className="space-y-4 bg-white p-3 sm:p-5 rounded-2xl border border-slate-200">
          <div className="text-center font-bold text-sm text-slate-900 pb-1">
            The maps below show recent archaeological findings at a historic site in 2004 and 2014.
          </div>

          <div className="grid grid-cols-1 gap-6">
            {/* MAP 1: 2004 */}
            <div className="space-y-2">
              <h5 className="text-center font-extrabold text-xs sm:text-sm text-slate-900 tracking-tight">
                Historic site in 2004
              </h5>

              {/* Exact 2004 Map Box */}
              <div className="relative w-full h-64 sm:h-72 border-2 border-black rounded-lg bg-white overflow-hidden select-none">
                {/* Central circular zone / light path */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 sm:w-80 h-44 sm:h-52 rounded-[50%] border-4 border-slate-100 bg-slate-50/70 pointer-events-none" />

                {/* West (Left): Trees Cluster */}
                <div className="absolute top-6 left-6 sm:left-10 flex flex-col items-center">
                  <div className="relative w-24 h-28">
                    {/* Tree 1 */}
                    <div className="absolute top-0 left-2">
                      <svg className="w-12 h-16 text-slate-800" viewBox="0 0 40 50">
                        <circle cx="20" cy="18" r="14" fill="#334155" />
                        <circle cx="14" cy="14" r="9" fill="#1e293b" />
                        <circle cx="26" cy="16" r="10" fill="#475569" />
                        <rect x="18" y="28" width="4" height="18" fill="#1e293b" />
                      </svg>
                    </div>
                    {/* Tree 2 */}
                    <div className="absolute top-4 right-0">
                      <svg className="w-10 h-14 text-slate-800" viewBox="0 0 40 50">
                        <circle cx="20" cy="18" r="13" fill="#475569" />
                        <rect x="18" y="28" width="4" height="16" fill="#1e293b" />
                      </svg>
                    </div>
                    {/* Tree 3 (bottom) */}
                    <div className="absolute bottom-0 left-6">
                      <svg className="w-14 h-18 text-slate-800" viewBox="0 0 40 50">
                        <circle cx="20" cy="18" r="16" fill="#1e293b" />
                        <circle cx="28" cy="16" r="9" fill="#475569" />
                        <rect x="18" y="30" width="5" height="18" fill="#0f172a" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* North: Mountains */}
                <div className="absolute top-3 left-1/2 -translate-x-12 flex flex-col items-center">
                  <svg className="w-28 sm:w-36 h-14" viewBox="0 0 140 60">
                    {/* Mountain 1 */}
                    <polygon points="15,55 45,10 75,55" fill="#334155" stroke="#0f172a" strokeWidth="1.5" />
                    <polygon points="38,20 45,10 52,22 47,25 42,22" fill="#ffffff" />
                    {/* Mountain 2 */}
                    <polygon points="55,55 90,14 125,55" fill="#475569" stroke="#0f172a" strokeWidth="1.5" />
                    <polygon points="83,23 90,14 98,24 93,27 87,25" fill="#ffffff" />
                  </svg>
                </div>

                {/* Northeast: 2 Ancient Houses */}
                <div className="absolute top-10 right-24 sm:right-32 flex flex-col items-center">
                  <span className="text-[11px] font-bold text-slate-800 mb-0.5">Ancient House</span>
                  <div className="flex items-end gap-3">
                    <svg className="w-8 h-8 text-slate-700" viewBox="0 0 24 24" fill="#64748b" stroke="#0f172a" strokeWidth="1.5">
                      <path d="M3 10L12 3L21 10V20C21 20.5 20.5 21 20 21H4C3.5 21 3 20.5 3 20V10Z" />
                      <rect x="9" y="13" width="6" height="8" fill="#1e293b" />
                    </svg>
                    <svg className="w-8 h-8 text-slate-700" viewBox="0 0 24 24" fill="#64748b" stroke="#0f172a" strokeWidth="1.5">
                      <path d="M3 10L12 3L21 10V20C21 20.5 20.5 21 20 21H4C3.5 21 3 20.5 3 20V10Z" />
                      <rect x="9" y="13" width="6" height="8" fill="#1e293b" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-bold text-slate-800 mt-1">Ancient House</span>
                </div>

                {/* Center-East: Ancient Temple */}
                <div className="absolute top-24 sm:top-28 right-24 sm:right-32 flex flex-col items-center">
                  <svg className="w-18 sm:w-20 h-14" viewBox="0 0 80 50">
                    <path d="M10 14L40 4L70 14L62 18H18L10 14Z" fill="#1e293b" stroke="#0f172a" strokeWidth="1.5" />
                    <rect x="20" y="18" width="40" height="4" fill="#334155" stroke="#0f172a" strokeWidth="1.2" />
                    <rect x="24" y="22" width="6" height="16" fill="#475569" stroke="#0f172a" strokeWidth="1.2" />
                    <rect x="37" y="22" width="6" height="16" fill="#475569" stroke="#0f172a" strokeWidth="1.2" />
                    <rect x="50" y="22" width="6" height="16" fill="#475569" stroke="#0f172a" strokeWidth="1.2" />
                    <rect x="15" y="38" width="50" height="5" fill="#0f172a" stroke="#0f172a" strokeWidth="1.5" />
                  </svg>
                  <span className="text-[11px] font-bold text-slate-800 mt-0.5">Ancient Temple</span>
                </div>

                {/* East Coast: Sea */}
                <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-20 bg-slate-300 border-l-2 border-black flex items-center justify-center">
                  {/* Layered shoreline contour */}
                  <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 200">
                    <path d="M0 0 C 40 40, 20 100, 0 200 L 100 200 L 100 0 Z" fill="#64748b" opacity="0.5" />
                    <path d="M20 0 C 60 40, 40 100, 20 200 L 100 200 L 100 0 Z" fill="#475569" opacity="0.6" />
                  </svg>
                  <span className="relative z-10 font-bold text-xs sm:text-sm text-slate-900 tracking-wider">
                    Sea
                  </span>
                </div>

                {/* Compass Rose (Bottom Left) */}
                <div className="absolute bottom-2 left-4 sm:left-6 flex flex-col items-center">
                  <svg className="w-12 h-12" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#64748b" strokeWidth="1.5" strokeDasharray="3 3" />
                    <polygon points="50,14 56,50 50,44 44,50" fill="#0f172a" />
                    <polygon points="50,86 56,50 50,56 44,50" fill="#64748b" />
                    <polygon points="86,50 50,56 56,50 50,44" fill="#334155" />
                    <polygon points="14,50 50,56 44,50 50,44" fill="#94a3b8" />
                    <text x="50" y="11" fontSize="12" fontWeight="bold" textAnchor="middle" fill="#0f172a">N</text>
                    <text x="50" y="99" fontSize="12" fontWeight="bold" textAnchor="middle" fill="#0f172a">S</text>
                    <text x="5" y="54" fontSize="12" fontWeight="bold" textAnchor="middle" fill="#0f172a">W</text>
                    <text x="95" y="54" fontSize="12" fontWeight="bold" textAnchor="middle" fill="#0f172a">E</text>
                  </svg>
                </div>
              </div>
            </div>

            {/* MAP 2: 2014 */}
            <div className="space-y-2">
              <h5 className="text-center font-extrabold text-xs sm:text-sm text-slate-900 tracking-tight">
                Historic site in 2014
              </h5>

              {/* Exact 2014 Map Box */}
              <div className="relative w-full h-64 sm:h-72 border-2 border-black rounded-lg bg-white overflow-hidden select-none">
                {/* Central circular zone / light path */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 sm:w-80 h-44 sm:h-52 rounded-[50%] border-4 border-slate-100 bg-slate-50/70 pointer-events-none" />

                {/* Northwest: Ancient Stadium */}
                <div className="absolute top-3 left-6 sm:left-10 flex flex-col items-center">
                  <span className="text-[11px] font-bold text-slate-800 mb-0.5">Ancient Stadium</span>
                  <svg className="w-18 sm:w-22 h-14" viewBox="0 0 90 50">
                    <ellipse cx="45" cy="16" rx="40" ry="14" fill="#64748b" stroke="#0f172a" strokeWidth="1.5" />
                    <ellipse cx="45" cy="14" rx="32" ry="10" fill="#94a3b8" stroke="#0f172a" strokeWidth="1.2" />
                    <ellipse cx="45" cy="12" rx="22" ry="6" fill="#334155" />
                    <path d="M5 16V32C5 38 23 42 45 42C67 42 85 38 85 32V16" fill="#cbd5e1" stroke="#0f172a" strokeWidth="1.5" />
                    <line x1="16" y1="22" x2="16" y2="38" stroke="#0f172a" strokeWidth="1.5" />
                    <line x1="30" y1="25" x2="30" y2="41" stroke="#0f172a" strokeWidth="1.5" />
                    <line x1="45" y1="26" x2="45" y2="42" stroke="#0f172a" strokeWidth="1.5" />
                    <line x1="60" y1="25" x2="60" y2="41" stroke="#0f172a" strokeWidth="1.5" />
                    <line x1="74" y1="22" x2="74" y2="38" stroke="#0f172a" strokeWidth="1.5" />
                  </svg>
                </div>

                {/* North: Ancient Toilet */}
                <div className="absolute top-3 left-1/2 -translate-x-12 flex flex-col items-center">
                  <span className="text-[11px] font-bold text-slate-800 mb-0.5">Ancient Toilet</span>
                  <div className="flex items-center gap-1.5 p-1">
                    {/* Female & Male Silhouette */}
                    <svg className="w-5 h-8 text-slate-800" viewBox="0 0 24 36" fill="currentColor">
                      <circle cx="12" cy="6" r="4" />
                      <path d="M6 14L8 26H11V34H13V26H16L18 14H6Z" />
                    </svg>
                    <div className="w-0.5 h-7 bg-slate-400" />
                    <svg className="w-5 h-8 text-slate-800" viewBox="0 0 24 36" fill="currentColor">
                      <circle cx="12" cy="6" r="4" />
                      <path d="M7 14H17V22H15V34H13V24H11V34H9V22H7V14Z" />
                    </svg>
                  </div>
                </div>

                {/* Northeast: Expanded Cluster of Ancient Houses */}
                <div className="absolute top-2 right-20 sm:right-28 flex flex-col items-center">
                  <span className="text-[11px] font-bold text-slate-800 mb-0.5">Ancient House</span>
                  <div className="flex items-center gap-1">
                    <div className="grid grid-cols-4 gap-1">
                      {[...Array(8)].map((_, i) => (
                        <svg key={i} className="w-6 h-6 text-slate-700" viewBox="0 0 24 24" fill="#64748b" stroke="#0f172a" strokeWidth="1.5">
                          <path d="M3 10L12 3L21 10V20C21 20.5 20.5 21 20 21H4C3.5 21 3 20.5 3 20V10Z" />
                        </svg>
                      ))}
                    </div>
                    <svg className="w-7 h-7 text-slate-700 ml-1" viewBox="0 0 24 24" fill="#64748b" stroke="#0f172a" strokeWidth="1.5">
                      <path d="M3 10L12 3L21 10V20C21 20.5 20.5 21 20 21H4C3.5 21 3 20.5 3 20V10Z" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-bold text-slate-800 mt-0.5">Ancient House</span>
                </div>

                {/* Southwest: Relocated Trees & Compass */}
                <div className="absolute bottom-2 left-4 sm:left-6 flex items-end gap-1.5">
                  <svg className="w-12 h-12" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#64748b" strokeWidth="1.5" strokeDasharray="3 3" />
                    <polygon points="50,14 56,50 50,44 44,50" fill="#0f172a" />
                    <polygon points="50,86 56,50 50,56 44,50" fill="#64748b" />
                    <polygon points="86,50 50,56 56,50 50,44" fill="#334155" />
                    <polygon points="14,50 50,56 44,50 50,44" fill="#94a3b8" />
                    <text x="50" y="11" fontSize="12" fontWeight="bold" textAnchor="middle" fill="#0f172a">N</text>
                    <text x="50" y="99" fontSize="12" fontWeight="bold" textAnchor="middle" fill="#0f172a">S</text>
                    <text x="5" y="54" fontSize="12" fontWeight="bold" textAnchor="middle" fill="#0f172a">W</text>
                    <text x="95" y="54" fontSize="12" fontWeight="bold" textAnchor="middle" fill="#0f172a">E</text>
                  </svg>
                  <div className="flex items-end mb-1">
                    <svg className="w-9 h-12 text-slate-800" viewBox="0 0 40 50">
                      <circle cx="20" cy="18" r="14" fill="#334155" />
                      <rect x="18" y="28" width="4" height="18" fill="#1e293b" />
                    </svg>
                    <svg className="w-7 h-10 text-slate-800 -ml-2" viewBox="0 0 40 50">
                      <circle cx="20" cy="18" r="12" fill="#475569" />
                      <rect x="18" y="28" width="4" height="16" fill="#1e293b" />
                    </svg>
                  </div>
                </div>

                {/* South-Center: Ancient Palace */}
                <div className="absolute bottom-2 left-1/2 -translate-x-12 flex flex-col items-center">
                  <svg className="w-18 sm:w-20 h-14" viewBox="0 0 80 50">
                    <line x1="40" y1="2" x2="40" y2="12" stroke="#0f172a" strokeWidth="2" />
                    <path d="M30 18C30 10 50 10 50 18V20H30V18Z" fill="#334155" stroke="#0f172a" strokeWidth="1.5" />
                    <rect x="20" y="20" width="40" height="4" fill="#475569" stroke="#0f172a" strokeWidth="1.2" />
                    <rect x="22" y="24" width="36" height="16" fill="#cbd5e1" stroke="#0f172a" strokeWidth="1.2" />
                    <line x1="27" y1="24" x2="27" y2="40" stroke="#0f172a" strokeWidth="1.5" />
                    <line x1="33" y1="24" x2="33" y2="40" stroke="#0f172a" strokeWidth="1.5" />
                    <line x1="40" y1="24" x2="40" y2="40" stroke="#0f172a" strokeWidth="1.5" />
                    <line x1="47" y1="24" x2="47" y2="40" stroke="#0f172a" strokeWidth="1.5" />
                    <line x1="53" y1="24" x2="53" y2="40" stroke="#0f172a" strokeWidth="1.5" />
                    <rect x="15" y="40" width="50" height="5" fill="#0f172a" stroke="#0f172a" strokeWidth="1.5" />
                  </svg>
                  <span className="text-[11px] font-bold text-slate-800 mt-0.5">Ancient Palace</span>
                </div>

                {/* Center-East: Ancient Temple (UNCHANGED) */}
                <div className="absolute bottom-2 right-24 sm:right-32 flex flex-col items-center">
                  <svg className="w-18 sm:w-20 h-14" viewBox="0 0 80 50">
                    <path d="M10 14L40 4L70 14L62 18H18L10 14Z" fill="#1e293b" stroke="#0f172a" strokeWidth="1.5" />
                    <rect x="20" y="18" width="40" height="4" fill="#334155" stroke="#0f172a" strokeWidth="1.2" />
                    <rect x="24" y="22" width="6" height="16" fill="#475569" stroke="#0f172a" strokeWidth="1.2" />
                    <rect x="37" y="22" width="6" height="16" fill="#475569" stroke="#0f172a" strokeWidth="1.2" />
                    <rect x="50" y="22" width="6" height="16" fill="#475569" stroke="#0f172a" strokeWidth="1.2" />
                    <rect x="15" y="38" width="50" height="5" fill="#0f172a" stroke="#0f172a" strokeWidth="1.5" />
                  </svg>
                  <span className="text-[11px] font-bold text-slate-800 mt-0.5">Ancient Temple</span>
                </div>

                {/* East Coast: Sea */}
                <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-20 bg-slate-300 border-l-2 border-black flex items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 200">
                    <path d="M0 0 C 40 40, 20 100, 0 200 L 100 200 L 100 0 Z" fill="#64748b" opacity="0.5" />
                    <path d="M20 0 C 60 40, 40 100, 20 200 L 100 200 L 100 0 Z" fill="#475569" opacity="0.6" />
                  </svg>
                  <span className="relative z-10 font-bold text-xs sm:text-sm text-slate-900 tracking-wider">
                    Sea
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
