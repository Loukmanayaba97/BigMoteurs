import { StrictMode, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import AppLayout from './components/Layout';
import Home from './pages/Home';
import Search from './pages/Search';
import Cart from './pages/Cart';
import Profile from './pages/Profile';
import VendorDashboard from './pages/VendorDashboard';
import Contact from './pages/Contact';
import Disputes from './pages/Disputes';
import Categories from './pages/Categories';
import ProductDetails from './pages/ProductDetails';
import NewProducts from './pages/NewProducts';
import Checkout from './pages/Checkout';
import AddProduct from './pages/AddProduct';
import AdminDashboard from './pages/AdminDashboard';
import RequestPart from './pages/RequestPart';
import MyRequests from './pages/MyRequests';
import './index.css';

function RootApp() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
        <img src="/logo.png" alt="BigMoteurs Logo" className="w-48 mb-6 animate-pulse" />
        <div className="mt-8 w-10 h-10 border-4 border-gray-100 border-t-[#B91C1C] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/request-part" element={<RequestPart />} />
        <Route path="/my-requests" element={<MyRequests />} />
        
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/nouveautes" element={<NewProducts />} />
          <Route path="/search" element={<Search />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/vendor-dashboard" element={<VendorDashboard />} />
          <Route path="/add-product" element={<AddProduct />} />
          <Route path="/dispute" element={<Disputes />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootApp />
  </StrictMode>,
);
