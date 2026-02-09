import systemIconService from '../services/systemIcon.service.js';

export const getSystemIcons = async (req, res, next) => {
  try {
    const { category, featured, limit, offset } = req.query;
    
    const icons = await systemIconService.findAll({
      category,
      featured: featured !== undefined ? featured === 'true' : undefined,
      limit: limit ? parseInt(limit) : 50,
      offset: offset ? parseInt(offset) : 0
    });
    
    res.json(icons);
  } catch (error) {
    next(error);
  }
};

export const getSystemIconById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const icon = await systemIconService.findById(id);
    
    if (!icon) {
      return res.status(404).json({ error: 'Icon not found' });
    }
    
    res.json(icon);
  } catch (error) {
    next(error);
  }
};

export const getSystemIconByName = async (req, res, next) => {
  try {
    const { name } = req.params;
    const icon = await systemIconService.findByName(name);
    
    if (!icon) {
      return res.status(404).json({ error: 'Icon not found' });
    }
    
    // Track download/view (Phase 2 - commented out for now)
    // await systemIconService.incrementDownloads(icon.id);
    
    res.json(icon);
  } catch (error) {
    next(error);
  }
};

export const searchSystemIcons = async (req, res, next) => {
  try {
    const { q, tags } = req.query;
    
    if (!q && !tags) {
      return res.status(400).json({ error: 'Query parameter "q" or "tags" is required' });
    }
    
    const icons = await systemIconService.search({
      query: q,
      tags: tags ? tags.split(',') : undefined
    });
    
    res.json(icons);
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (req, res, next) => {
  try {
    const categories = await systemIconService.getCategories();
    res.json(categories);
  } catch (error) {
    next(error);
  }
};