import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the main landing page
    navigate('/', { replace: true });
  }, [navigate]);

  return null;
};

export default HomePage;