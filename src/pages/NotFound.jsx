import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="text-center py-20">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-lg text-gray-600 mb-6">Page not found</p>
      <Link to="/" className="px-4 py-2 bg-blue-600 text-white rounded">Go home</Link>
    </div>
  );
}
