import React, { useState } from "react";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { InputWithIcon } from "../utils/InputWithIcon";

const Auth = () => {
  const [isSignIn, setIsSignIn] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0c0e14] via-[#0f1419] to-[#0c0e14] text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-gray-900/50 border border-gray-700/50 hover:border-cyan-500/50 p-6 rounded-xl shadow-lg hover:shadow-[0px_0px_28px_2px] hover:shadow-cyan-500/10 transition-all duration-300">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-white">
            {isSignIn ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="mt-2 text-sm text-white">
            {isSignIn
              ? "Sign in to continue"
              : "Fill in your details to get started"}
          </p>
        </div>

        {isSignIn ? <SignIn /> : <SignUp />}

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-[#0c0e14]/90 text-white">OR</span>
          </div>
        </div>

        <div className="text-center text-sm">
          <span className="text-white">
            {isSignIn ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setIsSignIn(!isSignIn)}
              className="font-medium cursor-pointer text-cyan-600 hover:text-cyan-500 focus:outline-none"
            >
              {isSignIn ? "Sign up" : "Sign in"}
            </button>
          </span>
        </div>
      </div>
    </div>
  );
};

const SignIn = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle sign in logic here
    console.log("Sign in:", formData);
  };

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      <div className="rounded-md shadow-sm -space-y-px">
        <InputWithIcon
          id="email"
          name="email"
          type="email"
          placeholder="Email address"
          autoComplete="email"
          required
          value={formData.email}
          onChange={handleChange}
          Icon={Mail}
        />

        <InputWithIcon
          id="password"
          name="password"
          type="password"
          placeholder="Password"
          autoComplete="current-password"
          required
          value={formData.password}
          onChange={handleChange}
          Icon={Lock}
          withToggle
        />
      </div>

      <div>
        <button
          type="submit"
          className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25 cursor-pointer w-full"
        >
          Sign in
        </button>
      </div>
    </form>
  );
};

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle sign up logic here
    console.log("Sign up:", formData);
  };

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      <div className="rounded-md shadow-sm space-y-4">
        <InputWithIcon
          id="name"
          name="name"
          type="text"
          placeholder="Full name"
          autoComplete="name"
          required
          value={formData.name}
          onChange={handleChange}
          Icon={User}
        />

        <InputWithIcon
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="Email address"
          value={formData.email}
          onChange={handleChange}
          Icon={Mail}
        />

        <InputWithIcon
          id="password"
          name="password"
          type="password"
          placeholder="Password"
          autoComplete="current-password"
          required
          value={formData.password}
          onChange={handleChange}
          Icon={Lock}
          withToggle
        />

        
      </div>

      <div>
        <button
          type="submit"
          className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25 cursor-pointer w-full"
        >
          Sign up
        </button>
      </div>
    </form>
  );
};

export default Auth;
