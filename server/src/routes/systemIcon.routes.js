import express from 'express';
import { 
  getSystemIcons, 
  getSystemIconById,
  getSystemIconByName,
  searchSystemIcons,
  getCategories 
} from '../controllers/systemIcon.controller.js';

const router = express.Router();

// Get all system icons with optional filtering
router.get('/', getSystemIcons);

// Search icons by tags or description
router.get('/search', searchSystemIcons);

// Get all categories
router.get('/categories', getCategories);

// Get icon by ID
router.get('/id/:id', getSystemIconById);

// Get icon by name (URL-friendly)
router.get('/name/:name', getSystemIconByName);

export default router;