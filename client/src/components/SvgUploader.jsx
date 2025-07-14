import React, { useState, useRef } from 'react';
import { Upload, File, X } from 'lucide-react';
import DOMPurify from 'dompurify';
import { prepareSvgForStandalone } from '../utils/svgNormalization';
import './SvgUploader.css';

function SvgUploader({ onSvgUpload }) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file) => {
    setError('');

    // Validate file type
    if (!file.type.includes('svg') && !file.name.toLowerCase().endsWith('.svg')) {
      setError('Please upload an SVG file');
      return;
    }

    // Validate file size (max 1MB)
    if (file.size > 1024 * 1024) {
      setError('File size must be less than 1MB');
      return;
    }

    try {
      const text = await file.text();
      
      // Basic SVG validation
      if (!text.includes('<svg')) {
        setError('Invalid SVG file');
        return;
      }

      // Normalize SVG for standalone usage (add namespaces if missing)
      const normalizedSvg = prepareSvgForStandalone(text);

      // Sanitize SVG content
      const sanitizedSvg = DOMPurify.sanitize(normalizedSvg, { 
        USE_PROFILES: { svg: true },
        ADD_TAGS: ['defs', 'linearGradient', 'radialGradient', 'stop'],
        ADD_ATTR: ['offset', 'stop-color', 'stop-opacity', 'gradientUnits', 'x1', 'y1', 'x2', 'y2', 'cx', 'cy', 'r']
      });

      if (!sanitizedSvg) {
        setError('SVG file could not be processed');
        return;
      }

      onSvgUpload(sanitizedSvg, file.name);
    } catch (err) {
      console.error('Error processing file:', err);
      setError('Error reading file');
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="svg-uploader">
      <div className="uploader-header">
        <h3>Upload Your Own SVG</h3>
        <p>Drag and drop an SVG file or click to browse</p>
      </div>

      <div
        className={`upload-area ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".svg,image/svg+xml"
          onChange={handleChange}
          style={{ display: 'none' }}
        />

        <div className="upload-content">
          <Upload size={48} className="upload-icon" />
          <p className="upload-text">
            <span className="upload-main">Click to upload</span> or drag and drop
          </p>
          <p className="upload-hint">SVG files only (max 1MB)</p>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <X size={16} />
          {error}
        </div>
      )}
    </div>
  );
}

export default SvgUploader;