import React ,{useState, useEffect} from "react";
import { Link, NavLink } from "react-router-dom";
// import { Moon, Sun } from "lucide-react";
import "./header.css";
import collegeLogo from "../assets/gulogo2.png"; // Make sure to add the logo to your assets folder

function Header() {
  const [theme, setTheme] = useState('light');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // On mount, load saved theme or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
      document.body.className = savedTheme;
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const defaultTheme = prefersDark ? 'dark' : 'light';
      setTheme(defaultTheme);
      document.body.className = defaultTheme;
    }

    // Example: Check login status from localStorage or your auth provider
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loggedIn);
  }, []);

  const handleLogout = () => {
    localStorage.setItem('isLoggedIn', 'false');
    setIsLoggedIn(false);
    // Optionally redirect to home or login page
    window.location.href = '/';
  };

  // Theme toggle temporarily disabled

  return (
    <header className="pms-header">
      <div className="logo">
        <img 
          src={collegeLogo} 
          alt="College Logo" 
          className="logo-image"
        />
        <Link to="/" className="logo-link">
          <span className="line1">Campus Recruitment</span>
          <span className="line2">Portal</span>
        </Link>
      </div>
      <nav className="nav-links">
          <NavLink to="/about" className={({isActive}) => `nav-link${isActive ? ' active' : ''}`}>About</NavLink>
          <NavLink to="/contact" className={({isActive}) => `nav-link${isActive ? ' active' : ''}`}>Contact</NavLink>
          <NavLink to="/jobs" className={({isActive}) => `nav-link${isActive ? ' active' : ''}`}>Jobs</NavLink>
          <NavLink to="/interview-experience" className={({isActive}) => `nav-link${isActive ? ' active' : ''}`}>Interview Experience</NavLink>
          
          {/* Authentication Links */}
          <div className="auth-dropdown">
            <span className="dropdown-trigger">Login ▼</span>
            <div className="dropdown-content">
              <Link to="/student-login" className="dropdown-item">Student Login</Link>
              <Link to="/student-register" className="dropdown-item">Student Register</Link>
              <Link to="/admin-login" className="dropdown-item">Admin Login</Link>
            </div>
          </div>
      </nav>
    </header>
  );
}

export default Header;

// In your SignIn component (example)
const handleLogin = async (e) => {
  e.preventDefault();
  // ...login logic...
  // On successful login:
  localStorage.setItem('isLoggedIn', 'true');
  window.location.href = '/'; // or use navigate('/')
};
