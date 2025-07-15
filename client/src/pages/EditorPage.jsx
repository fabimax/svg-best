import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SvgEditor from '../components/SvgEditor';

function EditorPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get SVG data from navigation state
  const svgData = location.state?.svgData;

  // If no SVG data, redirect to home
  useEffect(() => {
    if (!svgData) {
      navigate('/');
    } else {
      // Scroll to top when editor loads
      window.scrollTo(0, 0);
    }
  }, [svgData, navigate]);

  const handleBackToLibrary = () => {
    navigate('/');
  };

  if (!svgData) {
    return null; // Show nothing while redirecting
  }

  return (
    <SvgEditor 
      svgData={svgData} 
      onBack={handleBackToLibrary}
    />
  );
}

export default EditorPage;