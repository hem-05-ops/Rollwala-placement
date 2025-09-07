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
          <NavLink to="/profile" className={({isActive}) => `nav-link${isActive ? ' active' : ''}`}>Student Profile</NavLink>
          <NavLink to="/admin-job-posting" className={({isActive}) => `nav-link${isActive ? ' active' : ''}`}>Admin Panel</NavLink>
          <NavLink to="/interview-experience" className={({isActive}) => `nav-link${isActive ? ' active' : ''}`}>Interview Experience</NavLink>
          {isLoggedIn && (
            <button 
              onClick={handleLogout} 
              className="logout-btn"
              style={{ marginLeft: "10px" }}
            >
              Logout
            </button>
          )}

          {/* Theme toggle temporarily removed */}
          {!isLoggedIn && (
            <Link to="/signin" className="login-btn">Login</Link>
          )}
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
