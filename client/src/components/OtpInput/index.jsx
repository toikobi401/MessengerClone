import { useState, useRef, useEffect } from 'react';
import { ArrowRight, RotateCcw } from 'lucide-react';

/**
 * OTP Input Component
 * 6-digit code entry with auto-focus, backspace handling, and paste support
 * 
 * @param {function} onComplete - Callback when all 6 digits are entered
 * @param {function} onResend - Callback for resend OTP button
 * @param {number} expirySeconds - Initial countdown timer (default 300 = 5 mins)
 * @param {boolean} loading - Show loading state on submit button
 */
const OtpInput = ({ onComplete, onResend, expirySeconds = 300, loading = false }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(expirySeconds);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  // Countdown timer
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  // Format timer display (MM:SS)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle input change
  const handleChange = (index, value) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Call onComplete when all 6 digits are entered
    if (newOtp.every((digit) => digit !== '') && onComplete) {
      onComplete(newOtp.join(''));
    }
  };

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // If current input is empty, focus previous and clear it
        inputRefs.current[index - 1]?.focus();
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
      } else {
        // Clear current input
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
  };

  // Handle paste (e.g., "123456" fills all boxes)
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = pastedData.split('').concat(Array(6 - pastedData.length).fill(''));
    setOtp(newOtp);

    // Focus on the last filled input or next empty
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();

    // Auto-submit if 6 digits pasted
    if (pastedData.length === 6 && onComplete) {
      onComplete(pastedData);
    }
  };

  // Handle resend
  const handleResend = () => {
    if (!canResend) return;
    
    setOtp(['', '', '', '', '', '']);
    setTimer(expirySeconds);
    setCanResend(false);
    inputRefs.current[0]?.focus();
    
    if (onResend) {
      onResend();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* OTP Input Boxes */}
      <div className="flex gap-3 justify-center mb-6">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className={`
              w-12 h-14 text-center text-2xl font-bold rounded-lg
              bg-white/5 border-2 
              ${digit ? 'border-primary bg-primary/5' : 'border-white/10'}
              focus:border-primary focus:bg-primary/10 focus:ring-2 focus:ring-primary/20
              text-white outline-none transition-all duration-200
              placeholder:text-gray-600
            `}
            placeholder="-"
            autoFocus={index === 0}
          />
        ))}
      </div>

      {/* Timer & Resend */}
      <div className="text-center mb-4">
        {!canResend ? (
          <p className="text-sm text-gray-400">
            Code expires in <span className="font-semibold text-primary">{formatTime(timer)}</span>
          </p>
        ) : (
          <button
            onClick={handleResend}
            className="inline-flex items-center gap-2 text-sm text-primary hover:text-accent transition-colors"
          >
            <RotateCcw size={16} />
            <span>Resend Code</span>
          </button>
        )}
      </div>

      {/* Submit Button */}
      <button
        onClick={() => onComplete && onComplete(otp.join(''))}
        disabled={otp.some((digit) => !digit) || loading}
        className={`
          w-full flex items-center justify-center gap-2 py-3 px-6 rounded-lg
          font-semibold text-white transition-all duration-200
          ${otp.every((digit) => digit) && !loading
            ? 'bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/50 hover:scale-[1.02]'
            : 'bg-gray-700 cursor-not-allowed opacity-50'
          }
        `}
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span>Verifying...</span>
          </>
        ) : (
          <>
            <span>Verify Code</span>
            <ArrowRight size={18} />
          </>
        )}
      </button>

      {/* Help Text */}
      <p className="text-center text-xs text-gray-500 mt-4">
        Didn't receive the code? Check your spam folder or click resend.
      </p>
    </div>
  );
};

export default OtpInput;
