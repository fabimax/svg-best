/**
 * SVG Normalization Utilities
 * Ensures SVG content has proper namespaces for standalone usage (blob URLs)
 */

/**
 * Ensures SVG has required namespaces for standalone usage
 * @param {string} svgContent - Raw SVG content
 * @returns {string} - Normalized SVG content with proper namespaces
 */
export const ensureSvgNamespaces = (svgContent) => {
  if (!svgContent || typeof svgContent !== 'string') {
    return svgContent;
  }

  let normalized = svgContent;

  // Always add main SVG namespace if missing
  if (normalized.includes('<svg') && !normalized.includes('xmlns="http://www.w3.org/2000/svg"')) {
    normalized = normalized.replace(
      /<svg([^>]*)>/,
      '<svg$1 xmlns="http://www.w3.org/2000/svg">'
    );
  }

  // Only add xlink namespace if SVG uses xlink: attributes AND it's missing
  if (normalized.includes('xlink:') && !normalized.includes('xmlns:xlink=')) {
    normalized = normalized.replace(
      /<svg([^>]*)>/,
      '<svg$1 xmlns:xlink="http://www.w3.org/1999/xlink">'
    );
  }

  return normalized;
};

/**
 * Validates that SVG has proper structure for standalone usage
 * @param {string} svgContent - SVG content to validate
 * @returns {object} - { isValid: boolean, errors: string[] }
 */
export const validateSvgForStandalone = (svgContent) => {
  const errors = [];

  if (!svgContent || typeof svgContent !== 'string') {
    errors.push('SVG content is empty or not a string');
    return { isValid: false, errors };
  }

  // Check for basic SVG element
  if (!svgContent.includes('<svg')) {
    errors.push('No <svg> element found');
  }

  // Check for required namespace in standalone SVG
  if (!svgContent.includes('xmlns="http://www.w3.org/2000/svg"')) {
    errors.push('Missing required SVG namespace for standalone usage');
  }

  // Check if xlink namespace is needed but missing
  if (svgContent.includes('xlink:') && !svgContent.includes('xmlns:xlink=')) {
    errors.push('Uses xlink: attributes but missing xlink namespace');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Processes SVG content to ensure it works properly as standalone file
 * Used before creating blob URLs for display
 * @param {string} svgContent - Raw SVG content
 * @returns {string} - Processed SVG ready for standalone usage
 */
export const prepareSvgForStandalone = (svgContent) => {
  try {
    // Step 1: Ensure proper namespaces
    const normalized = ensureSvgNamespaces(svgContent);
    
    // Step 2: Validate the result
    const validation = validateSvgForStandalone(normalized);
    if (!validation.isValid) {
      console.warn('SVG validation warnings:', validation.errors);
    }

    return normalized;
  } catch (error) {
    console.error('SVG normalization failed:', error);
    // Return original content if normalization fails
    return svgContent;
  }
};