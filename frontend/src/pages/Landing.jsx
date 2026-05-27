import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Target, Award, BrainCircuit, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Landing() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="w-full relative">
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col justify-center items-center pt-24 pb-16 px-6 relative max-w-7xl mx-auto z-10">
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border-primary-500/30 text-primary-100 text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4 text-accent-gold" />
            <span>AI-Powered Career & College Prediction</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
            Discover Your True 
            <br className="hidden md:block" />
            <span className="text-gradient"> Academic Potential</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
            Machine learning algorithms tailored to your profile. Get personalized college recommendations, predict cutoffs, and pinpoint your perfect career path based on your unique academic footprint.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/counseling" className="group relative px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-full font-semibold text-lg transition-all duration-300 shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] flex items-center gap-2 overflow-hidden">
              <span className="relative z-10">Start Free Assessment</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-secondary-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
            
            <button className="px-8 py-4 glass-panel hover:bg-white/10 text-white rounded-full font-semibold text-lg transition-all duration-300 flex items-center gap-2 border-slate-700 hover:border-slate-500">
              <BookOpen className="w-5 h-5 text-slate-400" />
              Explore Colleges
            </button>
          </div>
        </motion.div>

        {/* Floating UI Elements for aesthetics */}
        <motion.div 
          animate={{ y: [0, -15, 0] }} 
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
          className="hidden lg:flex absolute top-1/4 left-10 p-4 glass-panel rounded-2xl items-center gap-4 shadow-primary-900/20"
        >
          <div className="bg-green-500/20 p-3 rounded-xl"><Target className="text-green-400 w-6 h-6" /></div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Prediction Accuracy</p>
            <p className="text-lg font-bold text-white">94.2%</p>
          </div>
        </motion.div>

        <motion.div 
          animate={{ y: [0, 20, 0] }} 
          transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 1 }}
          className="hidden lg:flex absolute bottom-1/3 right-10 p-4 glass-panel rounded-2xl items-center gap-4 shadow-secondary-900/20"
        >
          <div className="bg-primary-500/20 p-3 rounded-xl"><Award className="text-primary-400 w-6 h-6" /></div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Top Engineering Match</p>
            <p className="text-lg font-bold text-white">IIT Bombay</p>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">How <span className="text-gradient">Master Student Guide</span> Works</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">Our advanced ML engine processes thousands of historical data points to give you the most accurate academic guidance available.</p>
        </div>

        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={item} className="glass-panel p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300 group">
              <div className={`p-4 rounded-2xl inline-block mb-6 bg-gradient-to-br ${feature.color} opacity-80 group-hover:opacity-100 transition-opacity`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-slate-400 leading-relaxed font-light">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </div>
  );
}

const features = [
  {
    icon: <BrainCircuit className="w-8 h-8 text-white" />,
    title: "AI Profile Analysis",
    desc: "We analyze your academic marks, interests, and budget to create a comprehensive digital student profile.",
    color: "from-blue-500 to-cyan-400"
  },
  {
    icon: <Target className="w-8 h-8 text-white" />,
    title: "Cutoff Prediction",
    desc: "Our ML algorithm predicts admission chances based on 5+ years of historical college cutoff data.",
    color: "from-primary-500 to-indigo-500"
  },
  {
    icon: <Award className="w-8 h-8 text-white" />,
    title: "Career Mapping",
    desc: "Receive customized career path suggestions that align perfectly with your projected courses and colleges.",
    color: "from-secondary-500 to-pink-500"
  }
];
