# SvgColorCustomization Component Technical Documentation

## Overview
A comprehensive 4014-line React component that provides advanced SVG color editing capabilities including grouping, previewing, HSL adjustments, and gradient editing.

## Main Component Structure and Props

### Core Props
- **`title`**: String for component title (default: "SVG Color Customization")
- **`elementColorMap`**: Object mapping element paths to color data `{ path: { fill: {original, current, isGradient}, stroke: {...} } }`
- **`colorSlots`**: Optional pre-processed color slots array (alternative to elementColorMap)
- **`gradientDefinitions`**: Current gradient definitions `{ gradientId: { type, stops: [{color, offset, opacity}] } }`
- **`originalGradientDefinitions`**: Original gradient definitions for reset functionality
- **`onColorChange`**: Callback `(updatedElementColorMap, updatedGradientDefinitions) => void`
- **`onPreviewStateChange`**: Callback for preview/hover effects

## Key State Variables

### Core State
- **`expandedGroups`**: Controls color group expand/collapse states
- **`expandedGradientSections`**: Controls gradient section expand/collapse
- **`openGradientPicker`**: Tracks which gradient picker popup is open
- **`openGroupPickers`**: Tracks which group color pickers are open

### Preview System
- **`previewElement`**: Currently previewed element/group identifier
- **`previewMode`**: Preview mode ('hover', 'click', 'affected-pulse')
- **`isPulsing`**: Tracks pulse animation state

### Adjustment System
- **`globalAdjustments`**: Global HSL+alpha adjustments `{ hue: 0, saturation: 0, lightness: 0, alpha: 0 }`
- **`gradientAdjustments`**: Per-gradient HSL+alpha adjustments
- **`gradientTransparency`**: Per-gradient transparency values
- **`groupAdjustments`**: Per-group HSL+alpha adjustments

### Group Management
- **`elementGroups`**: Maps element IDs to group IDs `{ elementId: groupId }`
- **`groups`**: Group definitions `{ groupId: { name: "Group 1", id: "group1" } }`
- **`selectionMode`**: Current group being edited (null when not selecting)
- **`selectedElements`**: Set of elements selected for group assignment

## Core Functionality

### Color Processing
- **Solid Color Grouping**: Groups elements by original color value
- **Gradient Processing**: Extracts gradient stops as individual editable slots
- **HSL Color Adjustments**: Supports hue (-180° to +180°), saturation (-100% to +100%), lightness (-100% to +100%)
- **Alpha/Transparency**: Supports both individual and global transparency adjustments

### Group System
- **Dynamic Group Creation**: Users can create custom groups with names
- **Element Assignment**: Drag-and-drop or selection-based group assignment
- **Inheritance**: Child elements inherit parent group membership
- **Smart Exclusion**: Unchecking child elements splits parent groups intelligently

### Preview System
- **Hover Preview**: Shows affected elements at 10% opacity
- **Click Preview**: Shows affected elements at 5% opacity
- **Pulse Animation**: 2-cycle blink effect over 1000ms
- **Gradient Stop Preview**: Special handling for gradient stop isolation

## Helper Functions

### Color Conversion
- **`hexToHsl(hex)`**: Converts hex to HSL values
- **`hslToHex(h, s, l)`**: Converts HSL back to hex
- **`adjustColorHsl(hex, hueDelta, satDelta, lightDelta)`**: Applies HSL adjustments
- **`parseColorString(colorString)`**: Parses color strings with alpha
- **`formatHexWithAlpha(hex, alpha)`**: Formats hex colors with alpha channel

### Group Management
- **`getAffectedAttributes(elementIdentifier)`**: Gets all attributes affected by an element
- **`getGroupAffectedAttributes(groupId)`**: Gets all attributes in a group
- **`getGroupDisplayItems(groupId)`**: Gets display items for group color picker
- **`applyColorToGroup(groupId, newColor)`**: Applies color to all group elements
- **`resetGroup(groupId)`**: Resets group to original colors

### Preview System
- **`handlePreviewStart(elementIdentifier, mode)`**: Starts preview with affected attributes
- **`handlePreviewEnd()`**: Ends preview
- **`handlePulseAnimation(elementIdentifier)`**: Manages pulse animation cycles

## Integration Requirements

### External Dependencies
- **React**: `useState`, `useEffect`
- **@uiw/react-color**: Chrome color picker component
- **@uiw/color-convert**: `hsvaToHex`, `hexToHsva` utilities

### Required Parent Integration
- **SVG Element Access**: Parent must provide element selection/highlighting capability
- **Color Application**: Parent must handle applying colors to actual SVG elements
- **Preview Rendering**: Parent must implement preview opacity and highlighting effects

## Data Flow Architecture

### Input Processing
1. **`elementColorMap`** → **`solidColorGroups`** and **`gradientGroups`**
2. **`colorSlots`** → Direct slot processing (alternative path)
3. **`gradientDefinitions`** → Gradient stop extraction and processing

### Color Change Flow
1. User interaction (color picker, slider, etc.)
2. State update (local state management)
3. Color calculation (HSL adjustments, alpha blending)
4. `onColorChange(updatedElementColorMap, updatedGradientDefinitions)` callback
5. Parent receives updated data and applies to SVG

### Preview Flow
1. Mouse hover/click on color control
2. `handlePreviewStart()` calls `getAffectedAttributes()`
3. `onPreviewStateChange()` with affected attributes and opacity
4. Parent applies preview effects to SVG elements
5. `handlePreviewEnd()` clears preview state

## Preview System Architecture

### Preview Modes
- **`'hover'`**: 10% opacity dim, triggered by mouseenter/mouseleave
- **`'click'`**: 5% opacity dim, triggered by click events
- **`'affected-pulse'`**: Blink animation for element identification

### Preview Data Structure
```javascript
{
  active: boolean,
  mode: 'hover' | 'click' | 'affected-pulse',
  affectedAttributes: ['path[0].fill', 'circle[1].stroke'],
  opacity: 0.1 | 0.05 | 0 | 1,
  duration?: number, // for pulse mode
  gradientStopPreview?: { gradientId, stopIndex }
}
```

## Integration Pattern for SVG Editor

### Required Parent Implementation
1. **Element Mapping**: Parent must map `affectedAttributes` to actual SVG elements
2. **Preview Rendering**: Implement opacity and highlighting effects
3. **Color Application**: Apply updated colors to SVG elements and gradients
4. **State Management**: Handle `elementColorMap` and `gradientDefinitions` state

### Data Flow Pattern
```
SvgColorCustomization → onColorChange → Parent → SVG DOM Updates
SvgColorCustomization → onPreviewStateChange → Parent → SVG Preview Effects
```

## Key Integration Points

1. **Color Analysis**: Use `buildElementColorMap()` from `svgColorAnalysis.js`
2. **Color Application**: Use `applyElementMappings()` from `svgColorTransform.js`
3. **Preview System**: Implement element highlighting in SVG display component
4. **State Synchronization**: Keep `elementColorMap` and `gradientDefinitions` in sync between color analysis and color application

This component provides a comprehensive color customization system with advanced features like grouping, previewing, and HSL adjustments, designed to integrate seamlessly with an SVG editor through well-defined callback interfaces.