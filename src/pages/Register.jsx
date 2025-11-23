import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Register(){
  const { registerUser } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const nav = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const res = registerUser({ name, email, password });
    if(res.success){
      alert('Registered successfully');
      nav('/');
    } else {
      alert(res.message || 'Registration failed');
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4">Register</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Name" className="w-full p-2 border rounded" required />
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" type="email" className="w-full p-2 border rounded" required />
        <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" type="password" className="w-full p-2 border rounded" required />
        <button className="px-4 py-2 bg-blue-600 text-white rounded">Register</button>
      </form>
    </div>
  );
}
