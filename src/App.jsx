import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import HomePage from './pages/homePage';
import LoginPage from './pages/loginPage';
import SignupPage from './pages/signupPage';
import ForgotPasswordPage from './pages/forgotPasswordPage';
import ResetPasswordPage from './pages/resetPasswordPage';
import AboutPage from './pages/aboutPage';
import ContactPage from './pages/contactPage';

function App() {
  return (
    <>
    <BrowserRouter>
    
    <Routes>

      <Route path='/' element={<HomePage/>}/>
      <Route path='/login' element={<LoginPage/>}/>
      <Route path="/signup" element={<SignupPage />} />
      <Route path='/forgotPassword' element={<ForgotPasswordPage/>}/>
      <Route path='/reset-password/:token' element={<ResetPasswordPage/>}/>
      <Route path='/about' element={<AboutPage/>}/>
      <Route path='/contact' element={<ContactPage/>}/>
      
    </Routes>

    </BrowserRouter>
      
    </>
  )
}

export default App
