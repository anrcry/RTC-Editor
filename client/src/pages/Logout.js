import { useEffect } from 'react';
import { useNavigate } from 'react-router';


export default function Logout({setToken}) {
  const navigate = useNavigate();
  useEffect(() => {
    setToken(null);
    navigate('/login');
  });
  return (
    <p>Logging out</p>
  );
}