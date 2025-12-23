import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import useChatStore from '../store/chatStore';
import { LogIn, Mail, Lock, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';
import OtpInput from '../components/OtpInput';

const Login = () => {
  const navigate = useNavigate();
  const setCurrentUser = useChatStore((state) => state.setCurrentUser);

  const [step, setStep] = useState('form'); // 'form' | 'otp' | 'success'
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authAPI.login(formData);

      // Check if response requires 2FA OTP verification
      if (response.status === 'PENDING_2FA') {
        setStep('otp');
      } else if (response.success) {
        // Old flow - direct login without 2FA
        localStorage.setItem('messenger-user', JSON.stringify(response.data));
        setCurrentUser(response.data.user);
        navigate('/');
      }
    } catch (error) {
      setError(error.message || 'Login failed. Please try again.');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpComplete = async (otp) => {
    setError('');
    setIsLoading(true);

    try {
      const response = await authAPI.verifyLogin({
        email: formData.email,
        otp
      });

      if (response.success) {
        // Store user in localStorage
        localStorage.setItem('messenger-user', JSON.stringify(response.data));
        
        // Update Zustand store
        setCurrentUser(response.data.user);

        // Show success step
        setStep('success');

        // Navigate to chat after 1.5s
        setTimeout(() => {
          navigate('/');
        }, 1500);
      }
    } catch (error) {
      setError(error.message || 'OTP verification failed. Please try again.');
      console.error('OTP verification error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setIsLoading(true);

    try {
      await authAPI.resendOTP({
        email: formData.email,
        purpose: 'login_2fa'
      });
      // OtpInput component will automatically reset timer
    } catch (error) {
      setError(error.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToForm = () => {
    setStep('form');
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary via-dark to-secondary p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {step === 'form' && 'Welcome Back'}
            {step === 'otp' && 'Verify Your Identity'}
            {step === 'success' && 'Login Successful'}
          </h1>
          <p className="text-gray-400">
            {step === 'form' && 'Login to continue chatting'}
            {step === 'otp' && `We sent a 6-digit code to ${formData.email}`}
            {step === 'success' && 'Redirecting to chat...'}
          </p>
        </div>

        {/* Login Form */}
        {step === 'form' && (
          <div className="glass p-8 animate-fade-in">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

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
                    Logging in...
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Login
                  </>
                )}
              </button>
            </form>

            {/* Register Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-400">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="text-primary hover:text-accent font-semibold transition-colors"
                >
                  Register here
                </Link>
              </p>
            </div>
          </div>
        )}

        {/* OTP Verification Step */}
        {step === 'otp' && (
          <div className="glass p-8 animate-fade-in">
            {/* Back Button */}
            <button
              onClick={handleBackToForm}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to login
            </button>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-sm mb-6">
                {error}
              </div>
            )}

            {/* OTP Input */}
            <OtpInput
              onComplete={handleOtpComplete}
              onResend={handleResendOtp}
              expirySeconds={300}
              loading={isLoading}
            />

            {/* Security Notice */}
            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-sm text-blue-200">
                🔒 This is a security verification step to protect your account.
              </p>
            </div>
          </div>
        )}

        {/* Success Step */}
        {step === 'success' && (
          <div className="glass p-8 text-center animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-6 animate-bounce">
              <CheckCircle2 className="w-10 h-10 text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Login Successful!
            </h3>
            <p className="text-gray-400">
              Taking you to chat...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
