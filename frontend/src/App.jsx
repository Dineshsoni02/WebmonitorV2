import "./App.css";

import { BodyComponent } from "./components/BodyComponent";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import Auth from "./components/Auth";
import { NavigationBar, FooterSection } from "./components/BodyComponent";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";

function Layout() {
  return (
    <div className="bg-light-gray">
      <NavigationBar />
      <Outlet />
      <FooterSection />
    </div>
  );
}

function App() {
  const router = createBrowserRouter([
    {
      element: <Layout />,
      children: [
        {
          path: "/",
          element: <BodyComponent />,
        },
        {
          path: "/auth",
          element: <Auth />,
        },
      ],
    },
  ]);

  return (
    <AuthProvider>
      <ToastProvider>
        <div className="bg-light-gray">
          <RouterProvider router={router} />
        </div>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
