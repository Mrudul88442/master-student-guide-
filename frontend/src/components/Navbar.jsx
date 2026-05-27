import { Link, useNavigate } from 'react-router-dom';
import { Compass, User, LogIn, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 w-full z-50 glass-panel border-x-0 border-t-0 border-b border-dark-border py-4 px-6 md:px-12">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="p-2 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg shadow-lg group-hover:shadow-primary-500/50 transition-all duration-300">
            <Compass className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Master Student<span className="text-gradient"> Guide</span></span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-slate-300 hover:text-white transition-colors duration-200 font-medium">Home</Link>
          <Link to="/predict" className="text-slate-300 hover:text-white transition-colors duration-200 font-medium">Rank Predictor</Link>
          <Link to="/chat" className="text-slate-300 hover:text-white transition-colors duration-200 font-medium">AI Counselor</Link>
          <Link to="/counseling" className="text-slate-300 hover:text-white transition-colors duration-200 font-medium">Get Counseling</Link>
          <Link to="/dashboard" className="text-slate-300 hover:text-white transition-colors duration-200 font-medium">Dashboard</Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {!token ? (
            <>
              <Link to="/login" className="hidden md:flex items-center gap-2 text-slate-300 hover:text-white transition-colors font-medium">
                <LogIn className="w-5 h-5" />
                Login
              </Link>
              <Link to="/signup" className="bg-white text-primary-900 hover:bg-slate-100 px-5 py-2 rounded-full font-semibold transition-all shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:shadow-[0_0_20px_rgba(255,255,255,0.5)]">
                Sign Up
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <div className="hidden md:flex flex-col items-end mr-2">
                <span className="text-sm font-bold text-white leading-tight">{user?.username}</span>
                <span className="text-[10px] text-primary-400 font-bold uppercase tracking-wider">Student Profile</span>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2.5 bg-slate-800/50 hover:bg-red-500/20 border border-slate-700 hover:border-red-500/50 rounded-xl text-slate-400 hover:text-red-400 transition-all group"
                title="Logout"
              >
                <LogOut className="w-5 h-5 group-active:scale-90 transition-transform" />
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
