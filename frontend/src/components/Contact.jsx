import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, Users, Award, MessageSquare, Building } from "lucide-react";
import "./contact.css";

// Executive Director
// Import images correctly (adjust paths based on your actual file structure)
import hirenJoshi from "../assets/faculties/hirenJoshi.webp";
import jyotiPareek from "../assets/faculties/jyotiPareek.webp";
import jayPatel from "../assets/faculties/jayPatel.webp";
import hardikJoshi from "../assets/faculties/hardikJoshi.webp";
import jignaSatani from "../assets/faculties/jignaSatani.webp";
import suchitPurohit from "../assets/faculties/suchitPurohit.webp";
import chirag from "../assets/faculties/chiragsir.jpg";
// Executive Director
const executiveDirector = {
  name: "Dr. Hiren Joshi",
  title: "Head of Director",
  photo:
    hirenJoshi,
  phone: "+91-98765-00001",
  email: "hiren.joshi@dcs.ac.in",
};

// DCPD Team - 20 members
const dcpdTeam = [
  
    {
    name: "Dr. Jyoti Pareek",
    title: "Course Coordinator",
    photo: jyotiPareek, // Use the imported image
    phone: "+91-98765-43210",
    email: "jyotipareek@dcs.ac.in",
  },
  {
    name: "Mr. Jay Patel",
    title: "Senior DCS Trainer",
    photo: jayPatel, // Use the imported image
    phone: "+91-98765-12345",
    email: "jay.patel@dcs.ac.in",
  },
  {
    name: "Dr. Hardik Joshi",
    title: "Senior DCS Trainer",
    photo:
     hardikJoshi,
    phone: "+91-98765-67890",
    email: "hardik.joshi@dcs.ac.in",
  },
  {
    name: "Dr. Jigna Satani",
    title: "Senior DCS Trainer",
    photo:
      jignaSatani,
    phone: "+91-98765-24680",
    email: "jigna.satani@dcs.ac.in",
  },
  {
    name: "Dr. Suchit Purohit",
    title: "Senior DCS Coordinator",
    photo:
     suchitPurohit,
    phone: "+91-98765-11111",
    email: "suchit.purohit@dcs.ac.in",
  },
  {
    name: "Mr. Chirag Pujara",
    title: "DCS Trainer",
    photo:
      chirag,
    phone: "+91-98765-22222",
    email: "chirag.pujara@dcs.ac.in",
  },
  // {
  //   name: "Mr. Manish Verma",
  //   title: "DCPD Assistant",
  //   photo:
  //     "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face",
  //   phone: "+91-98765-33333",
  //   email: "manish.verma@cgc.ac.in",
  // },
  // {
  //   name: "Ms. Kavya Reddy",
  //   title: "DCPD Trainer",
  //   photo:
  //     "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop&crop=face",
  //   phone: "+91-98765-44444",
  //   email: "kavya.reddy@cgc.ac.in",
  // },
  // {
  //   name: "Mr. Deepak Yadav",
  //   title: "DCPD Coordinator",
  //   photo:
  //     "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=200&h=200&fit=crop&crop=face",
  //   phone: "+91-98765-55555",
  //   email: "deepak.yadav@cgc.ac.in",
  // },
  // {
  //   name: "Ms. Ritu Sharma",
  //   title: "DCPD Trainer",
  //   photo:
  //     "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face",
  //   phone: "+91-98765-66666",
  //   email: "ritu.sharma@cgc.ac.in",
  // },
  // {
  //   name: "Mr. Vikash Gupta",
  //   title: "DCPD Assistant",
  //   photo:
  //     "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&crop=face",
  //   phone: "+91-98765-77777",
  //   email: "vikash.gupta@cgc.ac.in",
  // },
  // {
  //   name: "Ms. Sneha Singh",
  //   title: "DCPD Trainer",
  //   photo:
  //     "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=face",
  //   phone: "+91-98765-88888",
  //   email: "sneha.singh@cgc.ac.in",
  // },
  // {
  //   name: "Mr. Arjun Malhotra",
  //   title: "DCPD Coordinator",
  //   photo:
  //     "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?w=200&h=200&fit=crop&crop=faces",
  //   phone: "+91-98765-99999",
  //   email: "arjun.malhotra@cgc.ac.in",
  // },

  // {
  //   name: "Ms. Pooja Patel",
  //   title: "DCPD Trainer",
  //   photo:
  //     "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face",
  //   phone: "+91-98765-10101",
  //   email: "pooja.patel@cgc.ac.in",
  // },
  // {
  //   name: "Mr. Karan Joshi",
  //   title: "DCPD Assistant",
  //   photo:
  //     "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=200&h=200&fit=crop&crop=face",
  //   phone: "+91-98765-20202",
  //   email: "karan.joshi@cgc.ac.in",
  // },
  // {
  //   name: "Ms. Nisha Agarwal",
  //   title: "DCPD Trainer",
  //   photo:
  //     "https://images.unsplash.com/photo-1664575602554-2087b04935a5?w=200&h=200&fit=crop&crop=face",
  //   phone: "+91-98765-30303",
  //   email: "nisha.agarwal@cgc.ac.in",
  // },
  // {
  //   name: "Mr. Suresh Bansal",
  //   title: "DCPD Coordinator",
  //   photo:
  //     "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=face",
  //   phone: "+91-98765-40404",
  //   email: "suresh.bansal@cgc.ac.in",
  // },
  // {
  //   name: "Ms. Meera Chopra",
  //   title: "DCPD Trainer",
  //   photo:
  //     "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=200&h=200&fit=crop&crop=face",
  //   phone: "+91-98765-50505",
  //   email: "meera.chopra@cgc.ac.in",
  // },
  // {
  //   name: "Mr. Rahul Mittal",
  //   title: "DCPD Assistant",
  //   photo:
  //     "https://images.unsplash.com/photo-1615813967515-e1838c1c5116?w=200&h=200&fit=crop&crop=face",
  //   phone: "+91-98765-60606",
  //   email: "rahul.mittal@cgc.ac.in",
  // },
  // {
  //   name: "Ms. Sunita Devi",
  //   title: "DCPD Trainer",
  //   photo:
  //     "https://images.unsplash.com/photo-1619895862022-09114b41f16f?w=200&h=200&fit=crop&crop=face",
  //   phone: "+91-98765-70707",
  //   email: "sunita.devi@cgc.ac.in",
  // },
];

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(true);
  const [isFormExpanded, setIsFormExpanded] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const messageRef = useRef(null);

  useEffect(() => {
    if (isFormOpen) {
      // Small delay to allow the form to render before expanding
      setTimeout(() => {
        setIsFormExpanded(true);
      }, 10);
    } else {
      setIsFormExpanded(false);
    }
  }, [isFormOpen]);

  useEffect(() => {
    // Auto-expand textarea based on content
    if (messageRef.current) {
      messageRef.current.style.height = "auto";
      messageRef.current.style.height = messageRef.current.scrollHeight + "px";
    }
  }, [formData.message]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Real-time validation
    if (errors[name]) {
      validateField(name, value);
    }
  };

  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "name":
        if (!value.trim()) error = "Name is required";
        else if (value.trim().length < 2)
          error = "Name must be at least 2 characters";
        break;
      case "email":
        if (!value.trim()) error = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(value)) error = "Email is invalid";
        break;
      case "phone":
        if (!value.trim()) error = "Phone number is required";
        else if (!/^[0-9+\-\s()]{10,}$/.test(value))
          error = "Phone number is invalid";
        break;
      case "subject":
        if (!value.trim()) error = "Subject is required";
        else if (value.trim().length < 5)
          error = "Subject must be at least 5 characters";
        break;
      case "message":
        if (!value.trim()) error = "Message is required";
        else if (value.trim().length < 10)
          error = "Message must be at least 10 characters";
        break;
      default:
        break;
    }

    setErrors({
      ...errors,
      [name]: error,
    });

    return !error;
  };

  const validateForm = () => {
    let formErrors = {};
    let isValid = true;

    if (!validateField("name", formData.name)) isValid = false;
    if (!validateField("email", formData.email)) isValid = false;
    if (!validateField("phone", formData.phone)) isValid = false;
    if (!validateField("subject", formData.subject)) isValid = false;
    if (!validateField("message", formData.message)) isValid = false;

    return { isValid, formErrors: errors };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { isValid } = validateForm();
    if (!isValid) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Show success state
      setIsSuccess(true);

      // Show success notification
      toast.success(
        "Your message has been sent successfully! We will get back to you soon."
      );

      // Reset form after delay
      setTimeout(() => {
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });
        setErrors({});
        setIsFormOpen(false);
        setIsSuccess(false);
        setCurrentStep(1);
      }, 3000);
    } catch (error) {
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleForm = () => {
    if (isSuccess) return; // Don't allow closing during success animation

    setIsFormOpen(!isFormOpen);
    if (isFormOpen) {
      setIsFormExpanded(false);
    }
  };

  const handleFocus = (e) => {
    e.target.parentElement.classList.add("focused");
  };

  const handleBlur = (e) => {
    if (!e.target.value) {
      e.target.parentElement.classList.remove("focused");
    }
    validateField(e.target.name, e.target.value);
  };

  return (
    <div className="contact-page">

      <div className="contact-hero">
        <h1>Contact Us</h1>
        <p>
          Get in touch with the DCS (Department of Computer Science) at GU Ahmedabad.
          <br />
          We are here to help you with all your placement and career queries.
        </p>
      </div>

      <div className="contact-content-wrapper">
        <div className="contact-main-content">
          {/* Contact Info Section */}
          <div className="contact-info">
            <div className="contact-card">
              <h2>General Contact</h2>
              <p>
                <span className="contact-label">Address:</span> Gujarat University, Navranpura ,Ahmedabad, India
              </p>
              <p>
                <span className="contact-label">Phone:</span>{" "}
                <a href="tel:+911234567890">+91-8758129102</a>
              </p>
              <p>
                <span className="contact-label">Email:</span>{" "}
                <a href="mailto:dcs@dcs.ac.in">dcs@dcs.ac.in</a>
              </p>
              <p>
                <span className="contact-label">Website:</span>{" "}
                <a
                  href="https://www.dcs.ac.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  www.dcs.ac.in
                </a>
              </p>
            </div>
          </div>

          {/* Executive Director Section */}
          <div className="executive-section">
            <h2>Leadership</h2>
            <div className="executive-card">
              <div className="photo-container">
                <img
                  src={executiveDirector.photo}
                  alt={executiveDirector.name}
                  className="executive-photo"
                />
                <div className="photo-overlay"></div>
              </div>
              <div className="executive-info">
                <h3>{executiveDirector.name}</h3>
                <p className="executive-title">{executiveDirector.title}</p>
                <div className="executive-contact">
                  <p>
                    <span className="contact-label">Phone:</span>{" "}
                    <a href={`tel:${executiveDirector.phone}`}>
                      {executiveDirector.phone}
                    </a>
                  </p>
                  <p>
                    <span className="contact-label">Email:</span>{" "}
                    <a href={`mailto:${executiveDirector.email}`}>
                      {executiveDirector.email}
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* DCPD Team Section */}
          <div className="team-section">
            <h2>Meet Our DCS Team</h2>
            <div className="team-grid">
              {dcpdTeam.map((member, idx) => (
                <div className="team-card" key={idx}>
                  <div className="photo-container photo-container-team">
                    <img
                      src={member.photo}
                      alt={member.name}
                      className="team-photo"
                    />
                    <div className="photo-overlay"></div>
                  </div>
                  <h3>{member.name}</h3>
                  <p className="team-title">{member.title}</p>
                  <div className="team-contact">
                    <p>
                      <span className="contact-label">Phone:</span>{" "}
                      <a href={`tel:${member.phone}`}>{member.phone}</a>
                    </p>
                    <p>
                      <span className="contact-label">Email:</span>{" "}
                      <a href={`mailto:${member.email}`}>{member.email}</a>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Contact Form */}
      <div
        className={`floating-contact-form ${isFormOpen ? "open" : ""} ${
          isFormExpanded ? "expanded" : ""
        } ${isSuccess ? "success" : ""}`}
        onClick={!isFormOpen ? toggleForm : undefined}
      >
        {!isFormOpen ? (
          <div className="floating-form-button">
            <span className="form-button-text">Contact Us</span>
            <span className="form-button-icon">✉️</span>
          </div>
        ) : (
          <div className="floating-form-header" onClick={toggleForm}>
            <span className="form-title">Contact Us</span>
            <span className="form-toggle-icon">
              {isSuccess ? "🎉" : "✕"}
            </span>
          </div>
        )}

        <div className="floating-form-content">
          {isSuccess ? (
            <div className="success-animation">
              <div className="success-checkmark">
                <div className="check-icon"></div>
              </div>
              <h3>Message Sent Successfully!</h3>
              <p>We'll get back to you shortly.</p>
              <div className="confetti">
                {[...Array(50)].map((_, i) => (
                  <div key={i} className="confetti-piece"></div>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="form-progress">
                <div className="progress-steps">
                  {[1, 2, 3].map((step) => (
                    <div
                      key={step}
                      className={`progress-step ${
                        currentStep >= step ? "active" : ""
                      }`}
                    ></div>
                  ))}
                </div>
              </div>

              <h3>Send Us a Message</h3>
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-group floating">
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    className={errors.name ? "error" : ""}
                    autoComplete="name"
                    placeholder=" "
                  />
                  <label htmlFor="name">Full Name *</label>
                  {errors.name && (
                    <span className="error-message">{errors.name}</span>
                  )}
                </div>

                <div className="form-group floating">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    className={errors.email ? "error" : ""}
                    autoComplete="email"
                    placeholder=" "
                  />
                  <label htmlFor="email">Email Address *</label>
                  {errors.email && (
                    <span className="error-message">{errors.email}</span>
                  )}
                </div>

                <div className="form-group floating">
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    className={errors.phone ? "error" : ""}
                    autoComplete="tel"
                    placeholder=" "
                  />
                  <label htmlFor="phone">Phone Number *</label>
                  {errors.phone && (
                    <span className="error-message">{errors.phone}</span>
                  )}
                </div>

                <div className="form-group floating">
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    className={errors.subject ? "error" : ""}
                    placeholder=" "
                  />
                  <label htmlFor="subject">Subject *</label>
                  {errors.subject && (
                    <span className="error-message">{errors.subject}</span>
                  )}
                </div>

                <div className="form-group floating">
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    className={errors.message ? "error" : ""}
                    ref={messageRef}
                    rows="3"
                    placeholder=" "
                  ></textarea>
                  <label htmlFor="message">Message *</label>
                  <div className="character-count">
                    {formData.message.length}/500
                  </div>
                  {errors.message && (
                    <span className="error-message">{errors.message}</span>
                  )}
                </div>

                <button
                  type="submit"
                  className="submit-bttn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner"></span>
                      Sending...
                    </>
                  ) : (
                    "Send Message"
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Contact;