

import cgcBack from "../assets/OIP.jpg";
import "./home.css";
import { Star, Users, TrendingUp, Calendar, FileText, Award, Target, Shield, Zap, Globe, BookOpen, Briefcase } from 'lucide-react';
import { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '../config/api';

function Home() {
  const [jobCompanies, setJobCompanies] = useState([]);

  const getCompanyLogoUrl = (logoPath) => {
    if (!logoPath) return `${API_ENDPOINTS.UPLOADS}/assets/faculties/bg-logo.png`;
    if (typeof logoPath === 'string' && logoPath.startsWith('http')) return logoPath;
    if (typeof logoPath === 'string' && logoPath.startsWith('/')) return `${API_ENDPOINTS.UPLOADS}${logoPath}`;
    return `${API_ENDPOINTS.UPLOADS}/assets/faculties/${logoPath}`;
  };

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.JOBS);
        if (!res.ok) return;
        const jobs = await res.json();
        const map = new Map();
        (jobs || []).forEach((job) => {
          const name = job?.companyName?.trim();
          if (!name) return;
          if (!map.has(name)) {
            map.set(name, getCompanyLogoUrl(job?.companyLogo));
          }
        });
        const list = Array.from(map.entries()).map(([name, logo]) => ({ name, logo }));
        setJobCompanies(list);
      } catch (e) {
        // swallow errors for home banner
      }
    };
    fetchJobs();
  }, []);
  const features = [
    {
      icon: <Users className="feature-icon" />,
      title: "Student Profile Management",
      description: "Comprehensive student database with academic records, skills, and placement status tracking."
    },
    {
      icon: <Briefcase className="feature-icon" />,
      title: "Company Registration",
      description: "Streamlined process for companies to register and post job opportunities."
    },
    {
      icon: <Calendar className="feature-icon" />,
      title: "Interview Scheduling",
      description: "Automated scheduling system for interviews, tests, and placement drives."
    },
    {
      icon: <FileText className="feature-icon" />,
      title: "Resume Builder",
      description: "Built-in resume builder with templates and optimization suggestions."
    },

    {
      icon: <Target className="feature-icon" />,
      title: "Job Matching",
      description: "AI-powered job matching based on student profiles and company requirements."
    },
    {
      icon: <Shield className="feature-icon" />,
      title: "Secure Data Management",
      description: "Enterprise-grade security for all student and company information."
    },
    {
      icon: <Zap className="feature-icon" />,
      title: "Instant Notifications",
      description: "Real-time notifications for new opportunities, updates, and announcements."
    },
    {
      icon: <BookOpen className="feature-icon" />,
      title: "Training Resources",
      description: "Placement prep materials, mock interviews, skill assessments, and actual questions asked to seniors in previous interviews."
    }

  ];
 

  return (
    <main className="home-main">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background" style={{ backgroundImage: `url(${cgcBack})` }}>
          <div className="hero-overlay"></div>
        </div>

        <div className="hero-content">
          <h1 className="hero-title">
            Department of Computer Science 
            <span className="hero-subtitle">
              Campus Recruitment Portal
            </span>
          </h1>
          <p className="hero-description">
            Empowering Dreams, Creating Futures - Your Gateway to Success
          </p>
          <div class="hero-buttons">
                <a href="http://192.168.91.1:5000/jobs" class="btn btn-primary">
                    <i class="fas fa-search"></i>Explore Opportunities
                </a>
                <a href="http://192.168.91.1:5000/about" class="btn btn-secondary">
                    <i class="fas fa-info-circle"></i>Learn More
                </a>
            </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              Comprehensive Features
            </h2>
            <p className="section-description">
              Our advanced Campus Recruitment Portal offers everything you need for successful campus placements
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon-wrapper">
                  {feature.icon}
                </div>
                <h3 className="feature-title">
                  {feature.title}
                </h3>
                <p className="feature-description">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Alumni Success Stories */}
      <section className="alumni-section">
        <div className="container">
          {/* <div className="section-header">
            <h2 className="section-title">
              Alumni Success Stories
            </h2>
            <p className="section-description">
              Our graduates are making their mark at the world's leading companies
            </p>
          </div> */}

          {/* <div className="alumni-grid">
            {alumni.map((alum, index) => (
              <div key={index} className="alumni-card">
                <img
                  src={alum.image}
                  alt={alum.name}
                  className="alumni-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/150/121212/FFFFFF?text=Alumni";
                  }}
                />
                <h3 className="alumni-name">
                  {alum.name}
                </h3>
                <p className="alumni-company">
                  {alum.company}
                </p>
                <p className="alumni-package">
                  {alum.package}
                </p>
              </div>
            ))}
          </div> */}
        </div>
      </section>

      {/* Partnership Section */}
      <section className="partners-section">
        <div className="container">
          {/* <div className="section-header">
            <h2 className="section-title">  
              Our Industry Partners
            </h2>
            <p className="section-description">
              Collaborating with industry leaders to provide the best opportunities for our students
            </p>
          </div> */}

          {/* <div className="partners-grid">
            {companies.map((company, index) => (
              <div key={index} className="partner-card">
                <img
                  src={company.name==='Deloitte'?"/deloitte-seeklogo.svg":
                    company.logo}
                  alt={company.name}
                  className="partner-logo"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://placehold.co/150x60/121212/FFFFFF?text=${company.name}`;
                  }}

                />
              </div>
            ))} */}
          {/* </div> */}
        </div>
           {jobCompanies.length > 0 && (
        <section className="logo-slider">
          <div className="container">
            <div className="slider">
              <div className="slide-track">
                {jobCompanies.map((company, index) => (
                  <div key={`slide-1-${index}`} className="slide">
                    <img
                      src={company.name==='Deloitte'?"/deloitte-seeklogo.svg": company.logo}
                      alt={company.name}
                      className="logo-img"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://placehold.co/150x60/121212/FFFFFF?text=${company.name}`;
                      }}
                    />
                  </div>
                ))}
                {jobCompanies.map((company, index) => (
                  <div key={`slide-2-${index}`} className="slide">
                    <img
                      src={company.name==='Deloitte'?"/deloitte-seeklogo.svg": company.logo}
                      alt={company.name}
                      className="logo-img"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://placehold.co/150x60/121212/FFFFFF?text=${company.name}`;
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
      </section>

   

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">95%</div>
              <div className="stat-label">Placement Rate</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">20+</div>
              <div className="stat-label">Companies</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">₹12L</div>
              <div className="stat-label">Highest Package</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">5000+</div>
              <div className="stat-label">Students Placed</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {/* <section className="cta-section">
        <div className="cta-container">
          <h2 className="cta-title">
            Ready to Launch Your Career?
          </h2>
          <p className="cta-description">
            Join thousands of successful alumni who started their journey at Rollwala
          </p>
          <div className="cta-buttons">
            <a href="http://192.168.91.1:5000/student-login" className="btn btn-primary">
              Register Now
            </a>
            <a href="/Contact" className="btn btn-outline">
              Contact Us
            </a>
          </div>
        </div>
      </section> */}
    </main>
  );
}

export default Home;
