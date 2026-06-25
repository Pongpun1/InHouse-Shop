import { Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header';
import LoginPage from "./views/LoginPage";
import HomePage from "./views/HomePage";
import RegisterPage from "./views/RegisterPage"
import ProductsPage from "./views/ProductsPage"
import ProductDetailPage from './views/ProductDetailPage'
import ManagePage from "./views/ManagePage"
import HistoryPage from "./views/HistoryPage"
import CartPage from "./views/CartPage"
import CheckOutPage from "./views/CheckOutPage"
import './App.css'

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/manage" element={<ManagePage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckOutPage />} />
      </Routes>
    </>
  );
}

export default App