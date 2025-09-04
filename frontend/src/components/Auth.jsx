import React, { useState } from "react";
import { Mail, Lock, User } from "lucide-react";
import { InputWithIcon } from "../utils/InputWithIcon";
import Button from "../utils/Button";
import { validateEmail } from "../utils/Validation";

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
            <Button
              onClick={() => setIsSignIn(!isSignIn)}
              variant="none"
              className="!px-1 !py-0 font-medium cursor-pointer text-cyan-600 hover:text-cyan-500 focus:outline-none"
            >
              {isSignIn ? "Sign up" : "Sign in"}
            </Button>
            here.
          </span>
        </div>
      </div>
    </div>
  );
};

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    if (!formData.name || !formData.email || !formData.password) {
      setErrorMessage("All fields are necessary");
      return;
    }

    if (!validateEmail(formData.email)) {
      setErrorMessage("Please enter a valid email address");
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long");
      return;
    }

    setErrorMessage("");
    try {
      setIsLoading(true);
      const response = await fetch("http://localhost:5000/user/signup", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }

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
          value={formData.name}
          onChange={handleChange}
          Icon={User}
        />

        <InputWithIcon
          id="email"
          name="email"
          type="email"
          autoComplete="email"
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
          value={formData.password}
          onChange={handleChange}
          Icon={Lock}
          withToggle
        />
        {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
      </div>

      <div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Signing up..." : "Sign up"}
        </Button>
      </div>
    </form>
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/user/login", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.log(error);
    }

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
        <Button type="submit" className="w-full">
          Sign in
        </Button>
      </div>
    </form>
  );
};

export default Auth;
