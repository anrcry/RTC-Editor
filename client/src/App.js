import './App.css';
import { useState, useEffect } from 'react';
import { decode } from 'jsonwebtoken'
import { Col, Container, Row } from 'react-bootstrap';
import { Navigate, Routes, Route } from 'react-router';
import DocumentList from './pages/DocumentList';
import DocumentEdit from './pages/DocumentEdit';
import LoginRegister from './pages/LoginRegister';
import Logout from './pages/Logout';
import Navigation from './components/Navigation';
import axios from 'axios';

const setGlobalTokenState = (token) => {
  if (token) {
    localStorage.setItem('jwt', token);
    axios.defaults.headers['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('jwt');
    delete axios.defaults.headers['Authorization'];
  }
  return token;
};

const useToken = () => {
  const [token, setTokenState] = useState(() => setGlobalTokenState(localStorage.getItem('jwt')));
  const setToken = (token) => setTokenState(setGlobalTokenState(token));
  useEffect(() => {
    if (token) {
      // calculate when the token will expire and setup a timer to automatically clear it
      const { exp } = decode(token);
      const expiryDelay = Math.max(0, (exp * 1000) - Date.now());
      const expiryTimer = setTimeout(() => setToken(null), expiryDelay);
      // setup a cleanup function to remove the token expiry timer if we logout or login again
      return () => clearTimeout(expiryTimer);
    }
  }, [token]);

  return [token, setToken];
};

function App() {
  const [token, setToken] = useToken();

  return (
    <Container>
      <Row>
        <Col>
          <Navigation token={token} />
        </Col>
      </Row>
      <Row>
        <Col>
          <Routes>
            <Route path="/logout" element={<Logout setToken={setToken} />}/>
            <Route path="/login" element={<LoginRegister setToken={setToken} />}/>
            <Route path="/documents/:documentId" element={token ? <DocumentEdit token={token} /> : <Navigate to="/login" />}/>
            <Route path="/documents" element={token ? <DocumentList token={token} /> : <Navigate to="/login" />}/>
            <Route path="/" element={token ? <Navigate to="/documents" /> : <Navigate to="/login" />}/>
          </Routes>
        </Col>
      </Row>
    </Container>
  );
}

export default App;
