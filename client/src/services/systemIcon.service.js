import api from './api';

class SystemIconService {
  async getAllIcons({ category, featured, limit = 200, offset = 0 } = {}) {
    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (featured !== undefined) params.append('featured', featured.toString());
      if (limit) params.append('limit', limit.toString());
      if (offset) params.append('offset', offset.toString());

      const response = await api.get(`/system-icons?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching system icons:', error);
      throw error;
    }
  }

  async getIconById(id) {
    try {
      const response = await api.get(`/system-icons/id/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching icon by ID:', error);
      throw error;
    }
  }

  async getIconByName(name) {
    try {
      const response = await api.get(`/system-icons/name/${encodeURIComponent(name)}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching icon by name:', error);
      throw error;
    }
  }

  async searchIcons({ query, tags } = {}) {
    try {
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      if (tags && tags.length > 0) params.append('tags', tags.join(','));

      const response = await api.get(`/system-icons/search?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error searching icons:', error);
      throw error;
    }
  }

  async getCategories() {
    try {
      const response = await api.get('/system-icons/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }
}

export default new SystemIconService();