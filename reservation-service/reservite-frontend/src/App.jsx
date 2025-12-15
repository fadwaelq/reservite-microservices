import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';

import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Hotels } from './pages/Hotels';
import { HotelDetail } from './pages/HotelDetail';
import { PaymentPage } from './pages/PaymentPage';
import { PaymentSuccess } from './pages/PaymentSuccess';
import { MyReservations } from './pages/MyReservations';
import { ReservationConfirmation } from './pages/ReservationConfirmation';

const theme = createTheme({
  palette: { primary: { main: '#1976d2' } }
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/hotels" element={<Hotels />} />
            <Route path="/hotels/:id" element={<HotelDetail />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/reservation/:id/confirmation" element={<ReservationConfirmation />} />
            <Route path="/my-reservations" element={<ProtectedRoute><MyReservations /></ProtectedRoute>} />
            <Route path="*" element={<div style={{ padding: '50px', textAlign: 'center' }}><h2>404</h2></div>} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;