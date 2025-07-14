import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import SystemIconLibrary from '../components/SystemIconLibrary';
import SvgUploader from '../components/SvgUploader';
import SvgEditor from '../components/SvgEditor';
import { Upload, Library, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import './EditorPage.css';

function EditorPage() {
  const [searchParams] = useSearchParams();
  const [currentSvg, setCurrentSvg] = useState(null);
  const [activeTab, setActiveTab] = useState('upload');

  useEffect(() => {
    // Check if demo mode is enabled
    const isDemo = searchParams.get('demo') === 'true';
    if (isDemo) {
      setActiveTab('library');
    }
  }, [searchParams]);

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

  return (
    <div className="editor-page">
      <div className="editor-header">
        <Link to="/" className="back-link">
          <Home size={20} />
          Back to Home
        </Link>
        <h1>SVG Editor</h1>
      </div>

      <div className="editor-layout">
        {!currentSvg ? (
          <div className="svg-source-selector">
            <div className="tab-nav">
              <button 
                className={`tab ${activeTab === 'upload' ? 'active' : ''}`}
                onClick={() => setActiveTab('upload')}
              >
                <Upload size={20} />
                Upload SVG
              </button>
              <button 
                className={`tab ${activeTab === 'library' ? 'active' : ''}`}
                onClick={() => setActiveTab('library')}
              >
                <Library size={20} />
                Icon Library
              </button>
            </div>

            <div className="tab-content">
              {activeTab === 'upload' && (
                <SvgUploader onSvgUpload={handleSvgUpload} />
              )}
              {activeTab === 'library' && (
                <SystemIconLibrary onIconSelect={handleSvgSelect} />
              )}
            </div>
          </div>
        ) : (
          <SvgEditor 
            svgData={currentSvg} 
            onBack={() => setCurrentSvg(null)}
          />
        )}
      </div>
    </div>
  );
}

export default EditorPage;