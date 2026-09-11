import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Header } from './components/header/Header';
import { Home } from './pages/Home/Home';
import Login  from './pages/Login/Login';
import Trocas from './pages/Trocas/Trocas';
import Sobre from './pages/Sobre/Sobre';

export function App() {
  return (
    <div>
    <BrowserRouter>
      <Header />

      <Routes>
        <Route path='/' element={<Home />}></Route>
        <Route path='/login' element={<Login />}></Route>
        <Route path='/Trocas' element={<Trocas />}></Route>
        <Route path='/Sobre' element={<Sobre />}></Route>
      </Routes>

    </BrowserRouter>
    </div>
  )
}