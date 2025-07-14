import React, { useState, useEffect } from 'react';
import { ArrowLeft, Download, Palette, RotateCcw } from 'lucide-react';
import SvgDisplay from './SvgDisplay';
import SvgColorCustomization from './SvgColorCustomization';
import { buildElementColorMap } from '../utils/svgColorAnalysis';
import { applyElementMappings, applyGradientChanges } from '../utils/svgColorTransform';
import './SvgEditor.css';

function SvgEditor({ svgData, onBack }) {
  const [currentSvg, setCurrentSvg] = useState(svgData.svgContent);
  const [showColorPanel, setShowColorPanel] = useState(true);
  
  // Color analysis state
  const [elementColorMap, setElementColorMap] = useState(null);
  const [gradientDefinitions, setGradientDefinitions] = useState({});
  const [originalGradientDefinitions, setOriginalGradientDefinitions] = useState({});
  const [colorAnalysisLoading, setColorAnalysisLoading] = useState(true);
  
  // Preview state for highlighting effects
  const [previewState, setPreviewState] = useState(null);

  useEffect(() => {
    console.log('[SvgEditor] svgData:', svgData);
    console.log('[SvgEditor] svgData.svgContent:', svgData.svgContent);
    setCurrentSvg(svgData.svgContent);
    
    // Perform color analysis on the SVG
    analyzeColors(svgData.svgContent);
  }, [svgData]);

  const analyzeColors = async (svgContent) => {
    setColorAnalysisLoading(true);
    try {
      console.log('[SvgEditor] Starting color analysis...');
      const colorMap = buildElementColorMap(svgContent);
      
      if (colorMap) {
        console.log('[SvgEditor] Color analysis successful:', colorMap);
        setElementColorMap(colorMap.elementColorMap || {});
        setGradientDefinitions(colorMap.gradientDefinitions || {});
        setOriginalGradientDefinitions(colorMap.gradientDefinitions || {});
      } else {
        console.log('[SvgEditor] No colors found in SVG');
        setElementColorMap({});
        setGradientDefinitions({});
        setOriginalGradientDefinitions({});
      }
    } catch (error) {
      console.error('[SvgEditor] Color analysis failed:', error);
      setElementColorMap({});
      setGradientDefinitions({});
      setOriginalGradientDefinitions({});
    } finally {
      setColorAnalysisLoading(false);
    }
  };

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

  const handleColorChange = (updatedElementColorMap, updatedGradientDefinitions) => {
    console.log('[SvgEditor] Color change received:', { updatedElementColorMap, updatedGradientDefinitions });
    
    try {
      // Apply the updated colors to the SVG
      let transformedSvg = applyElementMappings(svgData.svgContent, updatedElementColorMap);
      
      // Apply gradient changes if we have updated gradient definitions
      if (updatedGradientDefinitions && Object.keys(updatedGradientDefinitions).length > 0) {
        transformedSvg = applyGradientChanges(transformedSvg, updatedGradientDefinitions);
      }
      
      setCurrentSvg(transformedSvg);
      setElementColorMap(updatedElementColorMap);
      setGradientDefinitions(updatedGradientDefinitions || gradientDefinitions);
      
      console.log('[SvgEditor] SVG updated successfully');
    } catch (error) {
      console.error('[SvgEditor] Failed to apply color changes:', error);
    }
  };

  const handlePreviewStateChange = (previewData) => {
    console.log('[SvgEditor] Preview state change:', previewData);
    setPreviewState(previewData);
    
    // Preview effects are now handled by SvgDisplay component which includes:
    // - Dimming non-affected elements (opacity 0.1 for hover, 0.05 for click)
    // - Highlighting affected elements in pulse mode 
    // - Smooth animations with CSS transitions
    // - Gradient stop isolation for precise gradient editing
  };

  const handleReset = () => {
    setCurrentSvg(svgData.svgContent);
    setElementColorMap(null);
    setGradientDefinitions({});
    setOriginalGradientDefinitions({});
    setPreviewState(null);
    
    // Re-analyze colors for the original SVG
    analyzeColors(svgData.svgContent);
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
                size={500}
                previewState={previewState}
                colorData={{
                  elementColorMap: elementColorMap,
                  gradientDefinitions: gradientDefinitions
                }}
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
              {colorAnalysisLoading ? (
                <div className="loading-colors">
                  <p>Analyzing SVG colors...</p>
                </div>
              ) : elementColorMap && Object.keys(elementColorMap).length > 0 ? (
                <SvgColorCustomization
                  title="SVG Color Customization"
                  elementColorMap={elementColorMap}
                  gradientDefinitions={gradientDefinitions}
                  originalGradientDefinitions={originalGradientDefinitions}
                  onColorChange={handleColorChange}
                  onPreviewStateChange={handlePreviewStateChange}
                />
              ) : (
                <div className="no-colors">
                  <h4>No Editable Colors Found</h4>
                  <p>This SVG doesn't contain any colors that can be customized. Try uploading a different SVG with fill or stroke colors.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SvgEditor;