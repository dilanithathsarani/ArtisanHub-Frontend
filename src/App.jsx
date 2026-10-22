import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import HomePage from './pages/homePage';
import LoginPage from './pages/loginPage';
import SignupPage from './pages/signupPage';
import ForgotPasswordPage from './pages/forgotPasswordPage';
import ResetPasswordPage from './pages/resetPasswordPage';
import AboutPage from './pages/aboutPage';
import ContactPage from './pages/contactPage';
import ProductDetailsPage from './pages/productDetailsPage';
import CartPage from './pages/cartPage';
import ShopPage from './pages/shopPage';
import CategoriesPage from './pages/categoriesPage';
import ArtisansPage from './pages/artisansPage';

function App() {
  return (
    <>
      <BrowserRouter>

        <Routes>

          <Route path='/' element={<HomePage />} />
          <Route path='/login' element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path='/forgotPassword' element={<ForgotPasswordPage />} />
          <Route path='/reset-password/:token' element={<ResetPasswordPage />} />
          <Route path='/about' element={<AboutPage />} />
          <Route path='/contact' element={<ContactPage />} />
          <Route path="/products/:id" element={<ProductDetailsPage />} />
          <Route path='/cart' element={<CartPage />} />
          <Route path='/shop' element={<ShopPage />} />
          <Route path='/categories' element={<CategoriesPage />} />
          <Route path='/artisans' element={<ArtisansPage />} />

        </Routes>

      </BrowserRouter>

    </>
  )
}

export default App
