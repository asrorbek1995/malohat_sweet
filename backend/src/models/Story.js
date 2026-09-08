/**
 * Story / Banner modeli — bosh sahifadagi storislar va bannerlar.
 */
const { prisma } = require('../database/connection');

const StoryModel = {
  /** type: 'STORY' | 'BANNER' | undefined (barchasi) */
  async list(type, includeInactive = false) {
    return prisma.story.findMany({
      where: {
        ...(type ? { type } : {}),
        ...(includeInactive ? {} : { isActive: true }),
      },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    });
  },

  async findById(id) {
    return prisma.story.findUnique({ where: { id: Number(id) } });
  },

  async create(data) {
    return prisma.story.create({
      data: {
        title: data.title || '',
        subtitle: data.subtitle || '',
        imageUrl: data.imageUrl,
        linkUrl: data.linkUrl || null,
        type: data.type === 'BANNER' ? 'BANNER' : 'STORY',
        sortOrder: Number(data.sortOrder || 0),
        isActive: data.isActive !== false,
      },
    });
  },

  async update(id, data) {
    const patch = {};
    for (const f of ['title', 'subtitle', 'imageUrl', 'linkUrl']) {
      if (data[f] !== undefined) patch[f] = data[f];
    }
    if (data.type !== undefined) patch.type = data.type === 'BANNER' ? 'BANNER' : 'STORY';
    if (data.sortOrder !== undefined) patch.sortOrder = Number(data.sortOrder);
    if (data.isActive !== undefined) patch.isActive = !!data.isActive;
    return prisma.story.update({ where: { id: Number(id) }, data: patch });
  },

  async remove(id) {
    await prisma.story.delete({ where: { id: Number(id) } });
    return { id: Number(id) };
  },
};

module.exports = StoryModel;
