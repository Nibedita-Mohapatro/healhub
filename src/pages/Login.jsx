import React from "react";
import { useNavigate } from "react-router-dom";
import useForm from "../hooks/useForm";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Login() {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const { values, handleChange, handleSubmit } = useForm({
    initialValues: { email: "", password: "" },
    onSubmit: async (vals) => {
      try {
        // 🔥 FIX – pass object, not two params
        await login({ email: vals.email, password: vals.password });

        addToast({
          title: "Logged in",
          type: "success",
        });

        navigate("/");
      } catch (e) {
        addToast({
          title: "Login failed",
          description: e.message || "Invalid credentials",
          type: "error",
        });
      }
    },
  });

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Login</h2>

      <form
        onSubmit={handleSubmit}
        className="space-y-3 bg-white dark:bg-gray-800 p-4 rounded"
      >
        <div>
          <label className="text-sm">Email</label>
          <input
            type="email"
            name="email"
            value={values.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div>
          <label className="text-sm">Password</label>
          <input
            type="password"
            name="password"
            value={values.password}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Login
          </button>
        </div>

        <div className="text-center mt-4 text-sm">
          Don’t have an account?{" "}
          <span
            onClick={() => navigate("/register")}
            className="text-blue-500 hover:underline cursor-pointer"
          >
            Register
          </span>
        </div>
      </form>
    </div>
  );
}
