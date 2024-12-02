import { Routes, Route } from 'react-router-dom';
import Login from '../pages/Login';
import RegistartionForm from '../pages/Signup';
import { Sidebar } from '../section/Sidebar';
import ResetPasswordForm from '../pages/Forgetpassword';
import UpdatePasswordForm from '../pages/Updatepassword';
import {ProtectedRoute} from "../routes/protectroute/Protectedroute"

export const Userroute = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<RegistartionForm />} />
      <Route path="/reset-password" element={<ResetPasswordForm />} />
      <Route element={<ProtectedRoute />}>
      <Route path="/home" element={<Sidebar />} />
      </Route>
      <Route path="/updatepassword/:token" element={<UpdatePasswordForm />} />
    </Routes>
  );
};
