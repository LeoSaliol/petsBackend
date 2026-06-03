import { prisma } from '../config/prisma';

export const toggleFavorite = async (petId: number, postId: number) => {
  const existing = await prisma.favorite.findUnique({
    where: { petId_postId: { petId, postId } },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    return { favorited: false };
  }

  await prisma.favorite.create({
    data: { petId, postId },
  });

  return { favorited: true };
};

export const getFavorites = async (petId: number) => {
  const favorites = await prisma.favorite.findMany({
    where: { petId },
    orderBy: { createdAt: 'desc' },
    include: {
      post: {
        include: {
          pet: {
            select: { id: true, name: true, image: true },
          },
          _count: { select: { likes: true, comments: true } },
        },
      },
    },
  });

  return favorites.map((f) => ({
    ...f.post,
    likedByUser: false,
    favoritedByUser: true,
  }));
};
