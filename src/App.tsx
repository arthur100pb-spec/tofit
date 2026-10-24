import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Header } from './components/header/Header';
import { Home } from './pages/Home/Home';
import Login from './pages/Login/Login';
import ResetPassword from './pages/Login/ResetPassword';
import Trocas from './pages/Trocas/Trocas';
import Sobre from './pages/Sobre/Sobre';
import CartPage from './pages/Shop/CartPage';
import FavoritesPage from './pages/Shop/FavoritesPage';
import CheckoutPage from './pages/Shop/CheckoutPage';
import AccountPage from './pages/Shop/AccountPage';
import AdminPage from './pages/Shop/AdminPage';
import NotFound from './pages/Shop/NotFound';
import { StoreProvider } from './context/StoreContext';

export function App(){return <BrowserRouter><StoreProvider><Header/><Routes>
  <Route path="/" element={<Home/>}/><Route path="/login" element={<Login/>}/><Route path="/redefinir-senha" element={<ResetPassword/>}/>
  <Route path="/trocas" element={<Trocas/>}/><Route path="/sobre" element={<Sobre/>}/><Route path="/favoritos" element={<FavoritesPage/>}/>
  <Route path="/carrinho" element={<CartPage/>}/><Route path="/finalizar" element={<CheckoutPage/>}/><Route path="/conta" element={<AccountPage/>}/>
  <Route path="/admin" element={<AdminPage/>}/><Route path="*" element={<NotFound/>}/>
</Routes></StoreProvider></BrowserRouter>}
