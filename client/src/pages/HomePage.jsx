import React, { useState } from 'react';
import { Upload, Palette, Download, Github, Heart } from 'lucide-react';
import SystemIconLibrary from '../components/SystemIconLibrary';
import SvgUploader from '../components/SvgUploader';
import SvgEditor from '../components/SvgEditor';
import './HomePage.css';

function HomePage() {
  const [currentSvg, setCurrentSvg] = useState(null);

  const handleSvgSelect = (svgData) => {
    setCurrentSvg(svgData);
  };

  const handleSvgUpload = (svgContent, fileName) => {
    setCurrentSvg({
      name: fileName || 'Uploaded SVG',
      svgContent: svgContent,
      source: 'upload'
    });
  };

  const handleBackToLibrary = () => {
    setCurrentSvg(null);
  };

  return (
    <div className="home-page">
      {/* Compact header */}
      <header className="page-header">
        <div className="header-content">
          <div className="logo-section">
            <h1>svg.best</h1>
            <p>The best online SVG editor</p>
          </div>
          
          <div className="header-features">
            <span className="feature-badge">
              <Palette size={16} />
              Advanced Colors
            </span>
            <span className="feature-badge">
              <Download size={16} />
              Instant Export
            </span>
            <span className="feature-badge">
              <Heart size={16} />
              100% Free
            </span>
          </div>
        </div>
      </header>

      {/* Main editor interface */}
      <main className="editor-interface">
        {!currentSvg ? (
          <div className="svg-source-selector">
            <div className="selector-header">
              <h2>Choose an Image or Upload Your Own</h2>
              <p>Start editing SVG colors immediately - no sign up required</p>
            </div>

            <div className="unified-content">
              {/* Upload section at the top */}
              <div className="upload-section">
                <SvgUploader onSvgUpload={handleSvgUpload} />
              </div>

              {/* Icon library section */}
              <div className="library-section">
                <SystemIconLibrary onIconSelect={handleSvgSelect} />
              </div>
            </div>
          </div>
        ) : (
          <SvgEditor 
            svgData={currentSvg} 
            onBack={handleBackToLibrary}
          />
        )}
      </main>

      {/* Minimal footer */}
      <footer className="page-footer">
        <div className="footer-content">
          <p>Built with ❤️ for designers • No accounts • No limits • Always free</p>
          <div className="footer-links">
            <a href="#" className="footer-link">
              <Github size={16} />
              Source
            </a>
            <span className="footer-divider">•</span>
            <a href="#" className="footer-link">Feedback</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;