import { Routes, Route } from 'react-router-dom';
import Login from '../pages/Login';
import RegistartionForm from '../pages/Signup';
import { Sidebar } from '../section/Sidebar';

export const Userroute = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<RegistartionForm />} />
      <Route path="/home" element={<Sidebar />} />
    </Routes>
  );
};
