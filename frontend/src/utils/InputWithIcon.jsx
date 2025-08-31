import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export const InputWithIcon = ({
  id,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  Icon,
  autoComplete,
  required = false,
  withToggle = false, 
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative mb-4">
      {/* Icon */}
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none bg-[#0c0e14]/0">
        <Icon className="h-5 w-5 text-gray-400" />
      </div>

      {/* Input */}
      <input
        id={id}
        name={name}
        type={withToggle ? (showPassword ? "text" : "password") : type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        value={value}
        onChange={onChange}
        className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-700 bg-[#0c0e14]/0 text-white rounded-md placeholder-gray-500 focus:outline-none focus:ring-cyan-500/50 focus:border-cyan-500/50 sm:text-sm"
      />

      {/* Password toggle */}
      {withToggle && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          <button
            type="button"
            className="text-gray-400 hover:text-gray-500 focus:outline-none cursor-pointer"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
      )}
    </div>
  );
};
