import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import useChatStore from '../store/chatStore';
import { UserPlus, Mail, Lock, User, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import OtpInput from '../components/OtpInput';

const Register = () => {
  const navigate = useNavigate();
  const setCurrentUser = useChatStore((state) => state.setCurrentUser);

  // Form states
  const [step, setStep] = useState('form'); // 'form' | 'otp' | 'success'
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  // Step 1: Submit registration form (sends OTP)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authAPI.register({
        username: formData.username,
        email: formData.email,
        password: formData.password
      });

      if (response.success && response.status === 'PENDING_OTP') {
        // Move to OTP verification step
        setStep('otp');
        setError('');
      }
    } catch (error) {
      setError(error.message || 'Registration failed. Please try again.');
      console.error('Register error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP and complete registration
  const handleOtpComplete = async (otp) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await authAPI.verifyRegistration({
        email: formData.email,
        otp: otp,
        username: formData.username,
        password: formData.password
      });

      if (response.success) {
        // Store user in localStorage
        localStorage.setItem('messenger-user', JSON.stringify(response.data));
        
        // Update Zustand store
        setCurrentUser(response.data.user);

        // Show success briefly before redirecting
        setStep('success');
        setTimeout(() => {
          navigate('/');
        }, 1500);
      }
    } catch (error) {
      setError(error.message || 'Invalid verification code. Please try again.');
      console.error('OTP verification error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    try {
      const response = await authAPI.resendOTP({
        email: formData.email,
        purpose: 'registration'
      });

      if (response.success) {
        setError('');
      }
    } catch (error) {
      setError(error.message || 'Failed to resend code. Please try again.');
      console.error('Resend OTP error:', error);
    }
  };

  // Go back to form
  const handleBackToForm = () => {
    setStep('form');
    setError('');
  };

  // Render based on step
  if (step === 'otp') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary via-dark to-secondary p-4">
        <div className="w-full max-w-md">
          {/* Back Button */}
          <button
            onClick={handleBackToForm}
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>

          {/* Header */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Verify Your Email</h1>
            <p className="text-gray-400">
              We sent a 6-digit code to <br />
              <span className="text-white font-semibold">{formData.email}</span>
            </p>
          </div>

          {/* OTP Input Card */}
          <div className="glass p-8 animate-fade-in">
            {error && (
              <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-sm mb-6">
                {error}
              </div>
            )}

            <OtpInput
              onComplete={handleOtpComplete}
              onResend={handleResendOtp}
              expirySeconds={300}
              loading={isLoading}
            />
          </div>
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary via-dark to-secondary p-4">
        <div className="w-full max-w-md text-center animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full mb-6">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to Messenger!</h1>
          <p className="text-gray-400">Your account has been created successfully.</p>
          <div className="mt-6">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
            <p className="text-sm text-gray-500 mt-2">Redirecting to chat...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary via-dark to-secondary p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-gray-400">Join and start chatting now</p>
        </div>

        {/* Register Form */}
        <div className="glass p-8 animate-fade-in">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Username Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="input-field pl-11"
                  placeholder="johndoe"
                  required
                  disabled={isLoading}
                  minLength={3}
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field pl-11"
                  placeholder="your.email@example.com"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pl-11"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                  minLength={6}
                />
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input-field pl-11"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Register
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-primary hover:text-accent font-semibold transition-colors"
              >
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
