import React, { useState, useEffect } from 'react';
import { ArrowLeft, Download, Palette, RotateCcw } from 'lucide-react';
import SvgDisplay from './SvgDisplay';
// TODO: Import the color customization component from ViaGuild
// import SvgColorCustomization from './SvgColorCustomization';
import './SvgEditor.css';

function SvgEditor({ svgData, onBack }) {
  const [currentSvg, setCurrentSvg] = useState(svgData.svgContent);
  const [colorMappings, setColorMappings] = useState({});
  const [showColorPanel, setShowColorPanel] = useState(true);

  useEffect(() => {
    console.log('[SvgEditor] svgData:', svgData);
    console.log('[SvgEditor] svgData.svgContent:', svgData.svgContent);
    setCurrentSvg(svgData.svgContent);
  }, [svgData]);

  const handleDownload = () => {
    const blob = new Blob([currentSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${svgData.name.replace(/\s+/g, '_')}_edited.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setCurrentSvg(svgData.svgContent);
    setColorMappings({});
  };

  return (
    <div className="svg-editor">
      <div className="editor-header">
        <button onClick={onBack} className="back-button">
          <ArrowLeft size={20} />
          Back
        </button>
        
        <h2>{svgData.name}</h2>
        
        <div className="editor-actions">
          <button onClick={handleReset} className="reset-button">
            <RotateCcw size={20} />
            Reset
          </button>
          <button onClick={handleDownload} className="download-button">
            <Download size={20} />
            Download
          </button>
        </div>
      </div>

      <div className="editor-content">
        <div className="svg-preview-panel">
          <div className="preview-container">
            <h3>Preview</h3>
            <div className="svg-preview">
              <SvgDisplay 
                svgContent={currentSvg}
                alt={svgData.name}
              />
            </div>
            
            <div className="preview-info">
              <p><strong>Source:</strong> {svgData.source === 'upload' ? 'Uploaded file' : 'System icon'}</p>
              {svgData.category && <p><strong>Category:</strong> {svgData.category}</p>}
            </div>
          </div>
        </div>

        <div className="color-panel">
          <div className="panel-header">
            <h3>
              <Palette size={20} />
              Color Customization
            </h3>
            <button 
              onClick={() => setShowColorPanel(!showColorPanel)}
              className="toggle-panel"
            >
              {showColorPanel ? 'Hide' : 'Show'}
            </button>
          </div>

          {showColorPanel && (
            <div className="color-controls">
              {/* TODO: Integrate the advanced color customization from ViaGuild */}
              <div className="coming-soon">
                <h4>Advanced Color Tools Coming Soon!</h4>
                <ul>
                  <li>✨ Professional color picker</li>
                  <li>🎨 Group HSL adjustments</li>
                  <li>🌈 Gradient editing</li>
                  <li>🎯 Element-level precision</li>
                </ul>
                <p>For now, you can download the SVG and edit it manually.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SvgEditor;