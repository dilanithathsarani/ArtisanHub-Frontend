import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import HomePage from './pages/homePage';
import LoginPage from './pages/loginPage';
import SignupPage from './pages/signupPage';

function App() {
  return (
    <>
    <BrowserRouter>
    
    <Routes>

      <Route path='/' element={<HomePage/>}/>
      <Route path='/login' element={<LoginPage/>}/>
      <Route path="/signup" element={<SignupPage />} />
      
    </Routes>

    </BrowserRouter>
      
    </>
  )
}

export default App
