import React from "react";
import { useNavigate } from "react-router-dom";
import useForm from "../hooks/useForm";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Register() {
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const { values, handleChange, handleSubmit } = useForm({
    initialValues: { name: "", email: "", password: "" },
    validate: (v) => {
      const e = {};
      if (!v.name) e.name = "Name required";
      if (!v.email) e.email = "Email required";
      if (!v.password) e.password = "Password required";
      return e;
    },
    onSubmit: async (vals) => {
      try {
        await register(vals);
        addToast({ title: "Registered", type: "success" });
        navigate("/");
      } catch (err) {
        addToast({ title: "Registration failed", description: err.message || "", type: "error" });
        throw err;
      }
    }
  });

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Register</h2>
      <form onSubmit={handleSubmit} className="space-y-3 bg-white dark:bg-gray-800 p-4 rounded">
        <div>
          <label className="text-sm">Name</label>
          <input name="name" value={values.name} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
        </div>
        <div>
          <label className="text-sm">Email</label>
          <input name="email" value={values.email} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
        </div>
        <div>
          <label className="text-sm">Password</label>
          <input name="password" type="password" value={values.password} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
        </div>
        <div className="flex justify-end">
          <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">Create account</button>
        </div>
      </form>
    </div>
  );
}
