import React, { useState, useEffect } from 'react';
import systemIconService from '../services/systemIcon.service';
import { Search, Download } from 'lucide-react';
import DOMPurify from 'dompurify';
import { prepareSvgForStandalone } from '../utils/svgNormalization';
import SvgDisplay from './SvgDisplay';
import './SystemIconLibrary.css';

function SystemIconLibrary({ onIconSelect }) {
  const [icons, setIcons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadIcons();
    loadCategories();
  }, []);

  const loadIcons = async () => {
    try {
      setLoading(true);
      const response = await systemIconService.getAllIcons();
      setIcons(response.icons || []);
    } catch (error) {
      console.error('Failed to load icons:', error);
      // Fallback to mock data - test normalization with a simple SVG
      const rawSvg = `<svg viewBox="0 0 36 36">
        <path fill="currentColor" d="M35.885 11.833c0-5.45-4.418-9.868-9.867-9.868c-3.308 0-6.227 1.633-8.018 4.129c-1.791-2.496-4.71-4.129-8.017-4.129c-5.45 0-9.868 4.417-9.868 9.868c0 .772.098 1.52.266 2.241C1.751 22.587 11.216 31.568 18 34.034c6.783-2.466 16.249-11.447 17.617-19.959c.17-.721.268-1.469.268-2.242z"></path>
      </svg>`;
      
      // Normalize to add missing namespaces
      const normalizedSvg = prepareSvgForStandalone(rawSvg);
      
      const sanitizedSvg = DOMPurify.sanitize(normalizedSvg, { 
        USE_PROFILES: { svg: true },
        ADD_TAGS: ['defs', 'linearGradient', 'radialGradient', 'stop'],
        ADD_ATTR: ['offset', 'stop-color', 'stop-opacity', 'gradientUnits', 'x1', 'y1', 'x2', 'y2', 'cx', 'cy', 'r']
      });
      
      console.log('[SystemIconLibrary] Raw SVG:', rawSvg);
      console.log('[SystemIconLibrary] Normalized SVG:', normalizedSvg);
      console.log('[SystemIconLibrary] Sanitized SVG:', sanitizedSvg);
      
      setIcons([
        {
          id: '1',
          name: 'Sample Heart',
          category: 'Symbols',
          svgContent: sanitizedSvg,
          description: 'A heart symbol',
          tags: ['love', 'heart', 'symbol']
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const cats = await systemIconService.getCategories();
      setCategories(cats || ['Symbols', 'Basic Shapes', 'Awards']);
    } catch (error) {
      setCategories(['Symbols', 'Basic Shapes', 'Awards']);
    }
  };

  const filteredIcons = icons.filter(icon => {
    const matchesSearch = icon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         icon.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || icon.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="system-icon-library">
      <div className="library-header">
        <h3>Choose from our Library</h3>
        <p>Select from our collection of customizable icons</p>
      </div>

      <div className="library-filters">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search icons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="category-filter"
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="loading">Loading icons...</div>
      ) : (
        <div className="icons-grid">
          {filteredIcons.length > 0 ? (
            filteredIcons.map(icon => (
              <div
                key={icon.id}
                className="icon-card"
                onClick={() => onIconSelect(icon)}
              >
                <SvgDisplay 
                  svgContent={icon.svgContent}
                  alt={icon.name}
                  size={64}
                  className="icon-preview"
                />
                <div className="icon-info">
                  <h4>{icon.name}</h4>
                  <p>{icon.category}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="no-results">
              <p>No icons found matching your criteria</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SystemIconLibrary;