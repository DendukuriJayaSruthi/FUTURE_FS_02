import { Routes, Route, useNavigate, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, LogOut, Code } from 'lucide-react';
import LeadList from './LeadList';

export default function Dashboard({ setAuth }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    setAuth(false);
    navigate('/login');
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-logo">
          <Code className="text-accent" />
          Mini CRM
        </div>
        
        <div className="sidebar-nav">
          <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
            <LayoutDashboard size={20} />
            Dashboard
          </Link>
          <Link to="/leads" className={`nav-item ${location.pathname === '/leads' ? 'active' : ''}`}>
            <Users size={20} />
            Leads
          </Link>
        </div>

        <div style={{ marginTop: 'auto' }}>
          <button onClick={handleLogout} className="btn btn-secondary" style={{ width: '100%' }}>
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <Routes>
          <Route path="/" element={<LeadList />} />
          <Route path="/leads" element={<LeadList />} />
        </Routes>
      </div>
    </div>
  );
}
