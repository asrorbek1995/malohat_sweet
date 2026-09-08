/**
 * Product modeli — mahsulotlar CRUD.
 */
const { prisma, toNumber } = require('../database/connection');

function serialize(p) {
  if (!p) return null;
  return {
    ...p,
    oldPrice: toNumber(p.oldPrice),
    newPrice: toNumber(p.newPrice),
    ingredients: Array.isArray(p.ingredients) ? p.ingredients : [],
    categoryName: p.category ? p.category.name : null,
  };
}

const ProductModel = {
  /**
   * Ro'yxat. filter: { categoryId, bestSeller, includeInactive, search }
   */
  async list(filter = {}) {
    const where = {};
    if (!filter.includeInactive) where.isActive = true;
    if (filter.categoryId) where.categoryId = Number(filter.categoryId);
    if (filter.bestSeller) where.isBestSeller = true;
    if (filter.search) where.title = { contains: filter.search, mode: 'insensitive' };
    // Katalogda order bump mahsuloti ko'rsatilmaydi
    if (filter.excludeBump) where.isOrderBump = false;

    const rows = await prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    });
    return rows.map(serialize);
  },

  async findById(id) {
    return serialize(
      await prisma.product.findUnique({ where: { id: Number(id) }, include: { category: true } })
    );
  },

  /** Savatchadagi qo'shimcha savdo (Order Bump) mahsuloti */
  async findOrderBump() {
    const row = await prisma.product.findFirst({
      where: { isOrderBump: true, isActive: true },
      include: { category: true },
      orderBy: { id: 'asc' },
    });
    return serialize(row);
  },

  async create(data) {
    const row = await prisma.product.create({
      data: {
        title: data.title,
        description: data.description || '',
        ingredients: data.ingredients || [],
        oldPrice: data.oldPrice ? Number(data.oldPrice) : null,
        newPrice: Number(data.newPrice),
        imageUrl: data.imageUrl || '',
        categoryId: data.categoryId ? Number(data.categoryId) : null,
        isOrderBump: !!data.isOrderBump,
        isBestSeller: !!data.isBestSeller,
        isActive: data.isActive !== false,
        sortOrder: Number(data.sortOrder || 0),
      },
      include: { category: true },
    });
    return serialize(row);
  },

  async update(id, data) {
    const patch = {};
    const fields = ['title', 'description', 'imageUrl'];
    for (const f of fields) if (data[f] !== undefined) patch[f] = data[f];
    if (data.ingredients !== undefined) patch.ingredients = data.ingredients;
    if (data.oldPrice !== undefined) patch.oldPrice = data.oldPrice === null || data.oldPrice === '' ? null : Number(data.oldPrice);
    if (data.newPrice !== undefined) patch.newPrice = Number(data.newPrice);
    if (data.categoryId !== undefined) patch.categoryId = data.categoryId ? Number(data.categoryId) : null;
    if (data.isOrderBump !== undefined) patch.isOrderBump = !!data.isOrderBump;
    if (data.isBestSeller !== undefined) patch.isBestSeller = !!data.isBestSeller;
    if (data.isActive !== undefined) patch.isActive = !!data.isActive;
    if (data.sortOrder !== undefined) patch.sortOrder = Number(data.sortOrder);

    const row = await prisma.product.update({
      where: { id: Number(id) },
      data: patch,
      include: { category: true },
    });
    return serialize(row);
  },

  async remove(id) {
    await prisma.product.delete({ where: { id: Number(id) } });
    return { id: Number(id) };
  },

  async count() {
    return prisma.product.count({ where: { isActive: true } });
  },
};

module.exports = ProductModel;
