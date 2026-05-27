import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function CounselingForm() {
  const { token } = useAuth();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    stream: '',
    fullName: '',
    email: '',
    expectedMarks: '',
    category: 'General',
    interests: [],
    budget: 500000,
  });

  const handleNext = () => setStep(prev => Math.min(prev + 1, 4));
  const handleBack = () => setStep(prev => Math.max(prev - 1, 0));
  const submitForm = async () => {
    setIsSubmitting(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const response = await fetch(`${baseUrl}/api/counseling/analyze/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        const data = await response.json();
        navigate('/dashboard', { state: { profileData: data } });
      } else {
        console.error("Server error", await response.text());
      }
    } catch (err) {
      console.error("Network error", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto pt-32 pb-16 px-6 relative z-10">
      <div className="glass-panel p-8 md:p-12 rounded-3xl relative overflow-hidden">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-dark-border">
          <motion.div 
            className="h-full bg-gradient-to-r from-primary-500 to-secondary-500"
            initial={{ width: '0%' }}
            animate={{ width: `${(step / 4) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Student Assessment</h2>
          <p className="text-slate-400">Step {step + 1} of 5: {stepTitles[step]}</p>
        </div>

        <div className="min-h-[300px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
               {step === 0 && <FieldSelection data={formData} update={setFormData} />}
               {step === 1 && <BasicInfo data={formData} update={setFormData} />}
               {step === 2 && <AcademicDetails data={formData} update={setFormData} />}
               {step === 3 && <Preferences data={formData} update={setFormData} />}
               {step === 4 && <Review data={formData} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="mt-12 flex justify-between items-center pt-6 border-t border-dark-border">
          <button 
            onClick={handleBack}
            disabled={step === 0}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-colors ${step === 0 ? 'opacity-0 pointer-events-none' : 'text-slate-300 hover:text-white hover:bg-white/5'}`}
          >
            <ChevronLeft className="w-5 h-5" /> Back
          </button>
          
          {step < 4 ? (
            <button 
              onClick={handleNext}
              className="flex items-center gap-2 px-8 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-full font-semibold transition-all shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_20px_rgba(99,102,241,0.5)]"
            >
              Continue <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button 
              onClick={submitForm}
              disabled={isSubmitting}
              className={`flex items-center gap-2 px-8 py-3 bg-secondary-500 hover:bg-secondary-400 text-white rounded-full font-semibold transition-all shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] ${isSubmitting ? 'opacity-70 cursor-wait' : ''}`}
            >
              {isSubmitting ? 'Analyzing Data...' : <>Submit & Analyze <Sparkles className="w-5 h-5 ml-1" /></>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const stepTitles = ["Select Field", "Personal Details", "Academic Record", "Preferences & Interests", "Review Profile"];

function FieldSelection({ data, update }) {
  return (
    <div className="space-y-4">
      {["Engineering", "Medical", "Management"].map((field) => (
        <button
          key={field}
          onClick={() => update({ ...data, stream: field })}
          className={`w-full p-4 rounded-xl border text-left transition-all ${data.stream === field ? 'bg-primary-500/20 border-primary-500 text-white' : 'bg-dark-bg/50 border-slate-700 text-slate-400 hover:border-slate-500'}`}
        >
          {field}
        </button>
      ))}
    </div>
  );
}

function BasicInfo({ data, update }) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
        <input type="text" value={data.fullName} onChange={e => update({...data, fullName: e.target.value})} className="w-full bg-dark-bg/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors placeholder:text-slate-600" placeholder="John Doe" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
        <input type="email" value={data.email} onChange={e => update({...data, email: e.target.value})} className="w-full bg-dark-bg/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors placeholder:text-slate-600" placeholder="john@example.com" />
      </div>
    </div>
  );
}

function AcademicDetails({ data, update }) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Expected JEE Marks (Out of 300)</label>
        <input type="number" max="300" min="0" value={data.expectedMarks} onChange={e => update({...data, expectedMarks: e.target.value})} className="w-full bg-dark-bg/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors" placeholder="150" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Reservation Category</label>
        <select value={data.category} onChange={e => update({...data, category: e.target.value})} className="w-full bg-dark-bg/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors appearance-none">
          <option value="General">General / Open</option>
          <option value="OBC-NCL">OBC-NCL</option>
          <option value="SC">SC</option>
          <option value="ST">ST</option>
          <option value="EWS">EWS</option>
        </select>
      </div>
    </div>
  );
}

function Preferences({ data, update }) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Max Budget (INR/Year)</label>
        <div className="flex items-center gap-4">
          <input type="range" min="50000" max="2500000" step="50000" value={data.budget} onChange={e => update({...data, budget: Number(e.target.value)})} className="w-full accent-primary-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer" />
          <span className="text-white font-medium min-w-[120px] text-right">₹{data.budget.toLocaleString()}</span>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2 mt-6">Primary Interests (Select up to 3)</label>
        <div className="flex flex-wrap gap-3">
          {["Computer Science", "Mechanical", "Business/MBA", "Design", "Medical", "Psychology", "Data Science"].map(interest => (
            <button 
              key={interest}
              onClick={() => {
                const current = data.interests;
                if(current.includes(interest)) update({...data, interests: current.filter(i => i !== interest)});
                else if(current.length < 3) update({...data, interests: [...current, interest]});
              }}
              className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${data.interests.includes(interest) ? 'bg-primary-500/20 border-primary-500 text-primary-300' : 'border-slate-700 text-slate-400 hover:border-slate-500'}`}
            >
              {interest}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Review({ data }) {
  return (
    <div className="space-y-6">
      <div className="bg-primary-500/10 border border-primary-500/20 rounded-2xl p-6 flex flex-col gap-4">
        <div className="flex items-start gap-4">
          <div className="bg-primary-500/20 p-2 rounded-full mt-1">
            <Check className="w-4 h-4 text-primary-400" />
          </div>
          <div>
            <h4 className="text-white font-medium">Profile Ready for Analysis</h4>
            <p className="text-sm text-slate-400 mt-1">Our ML models will predict your percentile based on {data.expectedMarks} marks and match eligible colleges in {data.category} category.</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="p-4 bg-dark-bg/50 rounded-xl border border-slate-700/50">
          <p className="text-slate-500 mb-1">Name</p>
          <p className="text-white font-medium">{data.fullName || 'Not provided'}</p>
        </div>
        <div className="p-4 bg-dark-bg/50 rounded-xl border border-slate-700/50">
          <p className="text-slate-500 mb-1">Budget</p>
          <p className="text-white font-medium">₹{data.budget.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}

function Sparkles(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a4.42 4.42 0 0 1 0-8.962L8.5 1.936A2 2 0 0 0 9.937.5l1.582-6.135a4.42 4.42 0 0 1 8.962 0L22.063.5A2 2 0 0 0 23.5 1.937l6.135 1.581a4.42 4.42 0 0 1 0 8.964L23.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a4.42 4.42 0 0 1-8.964 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/></svg>
  )
}
