import prisma from '../config/database.js';

class SystemIconService {
  async findAll({ category, featured, limit, offset }) {
    const where = {};
    
    if (category) {
      where.category = category;
    }
    
    if (featured !== undefined) {
      where.featured = featured;
    }
    
    const [icons, total] = await Promise.all([
      prisma.systemIcon.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: [
          { featured: 'desc' },
          { downloads: 'desc' },
          { name: 'asc' }
        ]
      }),
      prisma.systemIcon.count({ where })
    ]);
    
    return {
      icons,
      total,
      limit,
      offset
    };
  }
  
  async findById(id) {
    return prisma.systemIcon.findUnique({
      where: { id }
    });
  }
  
  async findByName(name) {
    return prisma.systemIcon.findUnique({
      where: { name }
    });
  }
  
  async search({ query, tags }) {
    const where = {
      OR: []
    };
    
    if (query) {
      where.OR.push(
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } }
      );
    }
    
    if (tags && tags.length > 0) {
      where.OR.push({
        tags: { hasSome: tags }
      });
    }
    
    return prisma.systemIcon.findMany({
      where,
      orderBy: { downloads: 'desc' },
      take: 50
    });
  }
  
  async getCategories() {
    const categories = await prisma.systemIcon.findMany({
      where: { category: { not: null } },
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' }
    });
    
    return categories
      .map(c => c.category)
      .filter(Boolean);
  }
  
  // Phase 2 - ready when needed
  async incrementDownloads(id) {
    return prisma.systemIcon.update({
      where: { id },
      data: { downloads: { increment: 1 } }
    });
  }
}

export default new SystemIconService();