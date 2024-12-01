import { Routes, Route } from 'react-router-dom';
import Login from '../pages/Login';
import RegistartionForm from '../pages/Signup';
import { Sidebar } from '../section/Sidebar';
import ResetPasswordForm from '../pages/Forgetpassword';
import UpdatePasswordForm from '../pages/Updatepassword';

export const Userroute = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<RegistartionForm />} />
      <Route path="/reset-password" element={<ResetPasswordForm />} />
      <Route path="/home" element={<Sidebar />} />
      <Route path="/updatepassword/:token" element={<UpdatePasswordForm/>}/> 
    </Routes>
  );
};