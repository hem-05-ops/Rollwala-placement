import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { User, Mail, Lock, Phone, GraduationCap, BookOpen, Users, Eye, EyeOff } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';

const StudentRegister = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    rollNo: '',
    course: '',
    branch: '',
    year: '',
    track: '',
    cgpa: '',
    contact: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const courses = ['BSc.CS', 'MSc.CS', 'MSc.AIML', 'MCA'];
  const branches = ['WD', 'AIML'];
  const years = ['1st', '2nd', '3rd', '4th', '5th'];
  const tracks = ['.NET', 'Java', 'Data Science', 'Python', 'Web Development', 'Other'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updatedValue = name === 'cgpa' ? parseFloat(value) || '' : value;
      const updated = {
        ...prev,
        [name]: updatedValue
      };

      // If course changes away from MSc.CS, clear branch
      if (name === 'course' && value !== 'MSc.CS') {
        updated.branch = '';
      }

      return updated;
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // CGPA validation temporarily disabled
    // if (formData.cgpa < 0 || formData.cgpa > 10) {
    //   setError('CGPA must be between 0 and 10');
    //   return;
    // }

    // Basic contact number validation: must be exactly 10 digits
    const contactDigits = String(formData.contact || '').replace(/\D/g, '');
    if (contactDigits.length !== 10) {
      setError('Contact number must be exactly 10 digits. Please correct the number.');
      return;
    }

    setLoading(true);

    try {
      console.log('Attempting registration with:', formData);

      // Use dedicated student registration endpoint
      const response = await fetch(`${API_BASE_URL}/api/students/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          rollNo: formData.rollNo,
          course: formData.course,
          branch: formData.branch,
          year: formData.year,
          track: formData.track || undefined,
          // cgpa: parseFloat(formData.cgpa), // CGPA temporarily disabled
          contact: formData.contact
        }),
      });

      console.log('Response status:', response.status);

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        console.error('Registration failed response:', data);
        let message = data?.error || 'Registration failed. Please try again.';
        if (data?.error === 'Validation failed' && data?.details?.fieldErrors) {
          const fieldErrors = data.details.fieldErrors;
          const firstField = Object.keys(fieldErrors)[0];
          const firstError = fieldErrors[firstField]?.[0];
          if (firstError) message = firstError;
        }
        setError(message);
        return;
      }

      console.log('Registration response:', data);

      if (data.user) {
        toast.success(data.message || 'Registration successful. Your account is pending admin approval.');
        navigate('/student-login');
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <Header />
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-green-600 rounded-full flex items-center justify-center">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Student Registration</h2>
            <p className="mt-2 text-sm text-gray-600">
              Join the placement portal and start your career journey
            </p>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 border border-red-300 px-4 py-3 text-sm text-red-800 shadow-sm">
              {error}
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        required
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                        placeholder="Enter your first name"
                        value={formData.firstName}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                      placeholder="Enter your last name"
                      value={formData.lastName}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="contact"
                      name="contact"
                      type="tel"
                      required
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                      placeholder="Enter your contact number"
                      value={formData.contact}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Academic Information</h3>

                <div>
                  <label htmlFor="rollNo" className="block text-sm font-medium text-gray-700 mb-1">
                    Roll Number
                  </label>
                  <input
                    id="rollNo"
                    name="rollNo"
                    type="text"
                    required
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter your roll number"
                    value={formData.rollNo}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-1">
                    Course
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <BookOpen className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      id="course"
                      name="course"
                      required
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                      value={formData.course}
                      onChange={handleChange}
                    >
                      <option value="">Select your course</option>
                      {courses.map(course => (
                        <option key={course} value={course}>{course}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {formData.course === 'MSc.CS' && (
                  <div>
                    <label htmlFor="branch" className="block text-sm font-medium text-gray-700 mb-1">
                      Branch
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Users className="h-5 w-5 text-gray-400" />
                      </div>
                      <select
                        id="branch"
                        name="branch"
                        required
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                        value={formData.branch}
                        onChange={handleChange}
                      >
                        <option value="">Select your branch</option>
                        {branches.map(branch => (
                          <option key={branch} value={branch}>{branch}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                    Year
                  </label>
                  <select
                    id="year"
                    name="year"
                    required
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                    value={formData.year}
                    onChange={handleChange}
                  >
                    <option value="">Select your year</option>
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                {/* CGPA input temporarily disabled */}
                {/* ... */}

                <div>
                  <label htmlFor="track" className="block text-sm font-medium text-gray-700 mb-1">
                    Technology Track
                  </label>
                  <select
                    id="track"
                    name="track"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                    value={formData.track}
                    onChange={handleChange}
                  >
                    <option value="">Select your track (optional)</option>
                    {tracks.map(track => (
                      <option key={track} value={track}>{track}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/student-login" className="font-medium text-green-600 hover:text-green-500">
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default StudentRegister;