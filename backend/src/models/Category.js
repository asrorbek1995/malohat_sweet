/**
 * Category modeli — kategoriyalar CRUD.
 */
const { prisma } = require('../database/connection');

const CategoryModel = {
  async list(includeInactive = false) {
    return prisma.category.findMany({
      where: includeInactive ? undefined : { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
      include: { _count: { select: { products: true } } },
    });
  },

  async findById(id) {
    return prisma.category.findUnique({ where: { id: Number(id) } });
  },

  async create(data) {
    return prisma.category.create({
      data: {
        name: data.name,
        emoji: data.emoji || null,
        sortOrder: Number(data.sortOrder || 0),
        isActive: data.isActive !== false,
      },
    });
  },

  async update(id, data) {
    const patch = {};
    if (data.name !== undefined) patch.name = data.name;
    if (data.emoji !== undefined) patch.emoji = data.emoji;
    if (data.sortOrder !== undefined) patch.sortOrder = Number(data.sortOrder);
    if (data.isActive !== undefined) patch.isActive = !!data.isActive;
    return prisma.category.update({ where: { id: Number(id) }, data: patch });
  },

  async remove(id) {
    await prisma.category.delete({ where: { id: Number(id) } });
    return { id: Number(id) };
  },
};

module.exports = CategoryModel;
