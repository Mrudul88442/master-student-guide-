import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import CounselingForm from './pages/CounselingForm';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Chatbot from './components/Chatbot';
import RankPredictor from './pages/RankPredictor';
import ChatGuide from './pages/ChatGuide';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-dark-bg flex flex-col w-full relative overflow-hidden">
          {/* Ambient Background Elements */}
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-900 rounded-full mix-blend-screen filter blur-[120px] opacity-50 z-0 pointer-events-none"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary-500 rounded-full mix-blend-screen filter blur-[120px] opacity-30 z-0 pointer-events-none"></div>

          <Navbar />
          
          <main className="flex-grow z-10 w-full flex flex-col items-center">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              {/* Protected Routes */}
              <Route 
                path="/counseling" 
                element={
                  <ProtectedRoute>
                    <CounselingForm />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route path="/predict" element={<RankPredictor />} />
              <Route path="/chat" element={<ChatGuide />} />
            </Routes>
          </main>
          
          <Chatbot />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
