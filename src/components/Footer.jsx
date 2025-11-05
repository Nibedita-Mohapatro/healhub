import React from "react";

export default function Footer() {
  return (
    <footer className="mt-10 py-4 text-center text-sm text-gray-600 dark:text-gray-400">
      © {new Date().getFullYear()} HealHub — Built with ❤️ using React + Vite
    </footer>
  );
}
