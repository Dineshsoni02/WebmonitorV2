import { useState } from "react";

import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-400">
      <h1 className="text-4xl font-bold">
        Hello <span className="text-blue-500">World</span>
      </h1>
    </div>
  );
}

export default App;
