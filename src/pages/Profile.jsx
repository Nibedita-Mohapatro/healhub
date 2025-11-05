import React from "react";
import { useAuth } from "../context/AuthContext";
import useForm from "../hooks/useForm";
import { useToast } from "../context/ToastContext";

export default function Profile() {
  const { user, logout } = useAuth();
  const { addToast } = useToast();

  const { values, handleChange, handleSubmit, setValues } = useForm({
    initialValues: user || { name: "", email: "" },
    onSubmit: async () => {
      // For demo, store in local storage via AuthContext ideally
      addToast({ title: "Profile saved", type: "success" });
    }
  });

  React.useEffect(() => { if (user) setValues(user); }, [user, setValues]);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Profile</h2>
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-4 rounded space-y-3 max-w-md">
        <div>
          <label className="text-sm">Name</label>
          <input name="name" value={values.name || ""} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
        </div>
        <div>
          <label className="text-sm">Email</label>
          <input name="email" value={values.email || ""} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
        </div>

        <div className="flex gap-2 justify-end">
          <button type="button" onClick={logout} className="px-3 py-2 border rounded">Logout</button>
          <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded">Save</button>
        </div>
      </form>
    </div>
  );
}
