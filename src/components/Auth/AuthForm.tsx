import React, { useState } from "react";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import LoadingButton from "../LoadingButton";
import AuthInput from "./AuthInput";
import PasswordInput from "./PasswordInput";

// Define the properties accepted by the AuthForm component
interface AuthFormProps {
  title: string; // Title of the form
  submitButtonLabel: string; // Label for the submit button
  onSubmit: (credentials: {
    username: string;
    password: string;
  }) => Promise<void>; // Function to handle form submission with username and password
  logo: string; // URL for the logo image
  banner: string; // URL for the banner image
  altText: string; // Alt text for the logo image
  isOTP?: boolean; // Optional flag to determine if OTP is required
  otpSubmit?: (mobileNumber: string) => Promise<void>; // Function to handle OTP submission
  participantCode?: string; // Optional initial value for participant code
}

// Main AuthForm component definition
const AuthForm: React.FC<AuthFormProps> = ({
  title,
  submitButtonLabel,
  onSubmit,
  logo,
  banner,
  altText,
  isOTP = false,
  otpSubmit,
  participantCode,
}) => {
  // State management for form fields and validation
  const [username, setUsername] = useState<string>(participantCode || "");
  const [password, setPassword] = useState<string>("");
  const [mobileNumber, setMobileNumber] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isValidEmail, setIsValidEmail] = useState<boolean>(true);
  const [isValidMobile, setIsValidMobile] = useState<boolean>(true);
  const [isValidParticipantCode, setIsValidParticipantCode] =
    useState<boolean>(true);
  const navigate = useNavigate();

  // Utility function to validate email format
  const validateEmail = (email: string): boolean =>
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);

  // Utility function to validate mobile number (10 digits)
  const validateMobile = (mobile: string): boolean => /^\d{10}$/.test(mobile);

  // Utility function to validate participant code format
  const validateParticipantCode = (code: string): boolean =>
    /^hosp_demoop_\d{8}@swasth-hcx-dev$/.test(code);

  // Handles form submission based on whether OTP or login is required
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault(); // Prevents page reload on form submission
    setLoading(true); // Shows loading state

    try {
      if (isOTP && otpSubmit) {
        // Handle OTP submission when isOTP is true
        if (validateMobile(mobileNumber)) {
          await otpSubmit(mobileNumber); // Calls the otpSubmit function
        } else {
          toast.error("Invalid mobile number format!"); // Error for invalid mobile number
          setIsValidMobile(false);
        }
      } else {
        // Handle regular username/password submission
        await onSubmit({ username, password }); // Calls the onSubmit function
        toast.success("Operation successful!"); // Success toast message
        navigate("/home"); // Redirect to home page after successful login
      }
    } catch (error) {
      toast.error("Please check the input details!"); // Error toast message
    }
    setLoading(false); // Removes loading state
  };

  // Handles mobile number input changes with validation
  const handleMobileNumberChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const inputValue = e.target.value;
    setIsValidMobile(validateMobile(inputValue)); // Validates mobile number
    setMobileNumber(inputValue); // Sets mobile number state
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full">
      {/* Left side: Branding and banner */}
      <div className="flex flex-col items-center justify-center md:w-1/2 w-full bg-gray-100 p-4 md:p-8">
        <a className="mb-5.5" href="#">
          {/* Company logo */}
          <img className="w-32 md:w-48" src={logo} alt={altText} />
        </a>
        <p className="font-bold text-lg md:text-xl text-black">
          HCX Provider App
        </p>
        {/* Optional banner image */}
        <img className="mt-5 block" src={banner} alt="Banner" />
      </div>

      {/* Right side: Auth form */}
      <div className="flex flex-col items-center justify-center md:w-1/2 w-full p-4 md:p-8">
        <div className="w-full max-w-md">
          {/* Form title */}
          <h2 className="mb-6 md:mb-9 text-xl md:text-2xl font-bold text-black text-center">
            {title}
          </h2>
          <form onSubmit={handleSubmit}>
            {/* Display username/password fields when OTP is not required */}
            {!isOTP ? (
              <>
                {/* Username input (Participant Code) */}
                <AuthInput
                  label="Participant Code"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setIsValidParticipantCode(
                      validateParticipantCode(e.target.value)
                    ); // Validates participant code
                  }}
                  placeholder="Enter your participant code"
                />
                {/* Password input */}
                <PasswordInput
                  label="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </>
            ) : (
              // Display mobile number input when OTP is required
              <div className="mb-4">
                <label className="mb-2.5 block font-medium text-black">
                  Enter Mobile Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter your registered mobile number"
                    className={`w-full rounded-lg border ${
                      isValidMobile ? "border-stroke" : "border-red"
                    } bg-transparent py-4 pl-6 pr-10 outline-none focus:border-primary focus-visible:shadow-none`}
                    onChange={handleMobileNumberChange}
                  />
                  {/* Error message for invalid mobile number */}
                  {!isValidMobile && (
                    <p className="text-red-500">
                      Invalid mobile number format!
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Submit button */}
            <div className="mb-5">
              {!loading ? (
                // Regular submit button
                <button
                  type="submit"
                  className="w-full cursor-pointer rounded-lg bg-blue-700 text-white p-4 transition hover:bg-blue-600"
                  disabled={
                    !isOTP
                      ? !(isValidParticipantCode && password)
                      : !isValidMobile
                  }
                >
                  {submitButtonLabel}
                </button>
              ) : (
                // Loading button during form submission
                <LoadingButton />
              )}
            </div>
          </form>

          {/* Links for Forgot Password and Sign Up */}
          <div className="flex flex-col items-center">
            <Link
              to="/reset-password"
              className="text-blue-700 hover:underline"
            >
              Forgot Password?
            </Link>
            <div className="mt-1">
              Don’t have an account?{" "}
              <Link to="/signup" className="text-blue-700 hover:underline">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
