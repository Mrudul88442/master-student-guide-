import { useLocation, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, GraduationCap, Briefcase, ChevronRight, AlertCircle, Download } from 'lucide-react';

export default function Dashboard() {
  const location = useLocation();
  const profileData = location.state?.profileData;

  // Protect route if no data
  if (!profileData) {
    return <Navigate to="/counseling" replace />;
  }

  // Use data from Django API
  const percentile = profileData.predicted_percentile || 0;
  const rank = profileData.predicted_rank || 0;
  const expectedMarks = profileData.expected_marks || 0;
  const colleges = profileData.recommended_colleges || [];
  const careers = profileData.career_paths || [];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="w-full max-w-7xl mx-auto pt-24 pb-16 px-6 relative z-10">
      
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-4xl font-bold mb-2">Your AI Analysis Report</h1>
          <p className="text-slate-400">Based on your academic profile and preferences</p>
        </div>
        <button className="hidden md:flex items-center gap-2 px-6 py-2 glass-panel rounded-full hover:bg-white/10 transition-colors border-slate-700">
          <Download className="w-4 h-4" /> Download PDF
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Column: Profile Summary */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-6 rounded-3xl">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span className="p-2 bg-primary-50rounded-lg bg-primary-500/20 text-primary-400 rounded-lg"><TrendingUp className="w-5 h-5" /></span>
              Predicted Percentile
            </h2>
            
            <div className="flex items-center justify-center mb-6">
              <div className="relative w-32 h-32 flex items-center justify-center rounded-full border-4 border-slate-700">
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle cx="64" cy="64" r="60" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-slate-700" />
                  <circle cx="64" cy="64" r="60" fill="transparent" stroke="url(#gradient)" strokeWidth="8" strokeDasharray="377" strokeDashoffset={377 - (377 * percentile) / 100} className="transition-all duration-1000 ease-out" />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="text-center">
                  <span className="text-3xl font-bold text-white">{percentile}</span>
                  <span className="text-sm text-slate-400 block p-1">%ile</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between pb-4 border-b border-dark-border">
                <span className="text-slate-400">Student</span>
                <span className="text-white font-medium">{profileData.full_name || 'Anonymous'}</span>
              </div>
              <div className="flex justify-between pb-4 border-b border-dark-border">
                <span className="text-slate-400">Predicted Rank</span>
                <span className="text-white font-medium">{rank.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Category</span>
                <span className="text-white font-medium">{profileData.category}</span>
              </div>
            </div>
          </div>
          
          <div className="glass-panel p-6 rounded-3xl bg-gradient-to-br from-primary-900/40 to-dark-card border-primary-500/20">
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-accent-gold" /> AI Insight
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Based on your expected marks of {expectedMarks}, our Machine Learning model predicts a percentile of {percentile}. You are eligible for colleges considering your {profileData.category} category and an estimated rank around {rank.toLocaleString()}.
            </p>
          </div>
        </div>

        {/* Right Column: Recommendations */}
        <div className="lg:col-span-2 space-y-8">
          
          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-primary-400" /> College Matches
            </h2>
            <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
              {colleges.map((college, idx) => (
                <motion.div key={idx} variants={item} className="glass-panel p-6 rounded-2xl flex flex-col sm:flex-row gap-6 items-center justify-between hover:border-primary-500/50 transition-colors group">
                  <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white">{college.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${college.chance === 'High' ? 'bg-green-500/20 text-green-400' : college.chance === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                        {college.chance} Probability
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm mb-3">{college.course} • Estimated Fee: ₹{college.fee}</p>
                    <div className="w-full bg-slate-800 rounded-full h-1.5">
                      <div className="bg-gradient-to-r from-primary-500 to-secondary-500 h-1.5 rounded-full" style={{ width: `${college.match_score}%` }}></div>
                    </div>
                  </div>
                  <button className="w-full sm:w-auto px-6 py-3 bg-white/5 hover:bg-primary-600 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 group-hover:text-white">
                    Details <ChevronRight className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </motion.div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 mt-12">
              <Briefcase className="w-6 h-6 text-secondary-400" /> Projected Career Paths
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {careers.map((career, idx) => (
                <div key={idx} className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:-translate-y-1 transition-transform">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-secondary-500/20 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                  <h3 className="text-lg font-bold text-white mb-2 relative z-10">{career.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-4 relative z-10">{career.desc}</p>
                  <div className="flex justify-between items-center text-xs font-medium relative z-10">
                    <span className="text-primary-400">Growth: {career.growth}</span>
                    <Link to="#" className="text-slate-300 hover:text-white flex items-center">View Map <ChevronRight className="w-3 h-3 ml-1" /></Link>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

