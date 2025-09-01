import React from "react";
import clsx from "clsx";

const baseStyles =
  "px-6 py-2 rounded-lg font-medium transition-all duration-300 transform cursor-pointer focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";

const variants = {
  primary:
    "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25",
  secondary: "bg-gray-700 text-white hover:bg-gray-600 hover:scale-105",
  danger: "bg-red-600 text-white hover:bg-red-700 hover:scale-105",
  outline:
    "border border-gray-400 text-gray-800 hover:bg-gray-100 hover:scale-105",
  none: "",
};

const Button = ({ children, variant = "primary", className, ...props }) => {
  return (
    <button
      {...props}
      className={clsx(baseStyles, variants[variant], className)}
    >
      {children}
    </button>
  );
};

export default Button;
