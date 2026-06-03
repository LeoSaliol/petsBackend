import * as postService from '../../services/post.services';
import { prisma } from '../../config/prisma';

jest.mock('../../config/prisma', () => ({
    prisma: {
        post: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            delete: jest.fn(),
            update: jest.fn(),
        },
        pet: {
            findUnique: jest.fn(),
            findFirst: jest.fn(),
        },
        like: {
            findUnique: jest.fn(),
            delete: jest.fn(),
            create: jest.fn(),
        },
        notification: {
            create: jest.fn(),
        },
    },
}));

describe('Post Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createPost', () => {
        it('should create post successfully', async () => {
            const mockPet = { id: 1, ownerId: 1 };
            const mockPost = {
                id: 1,
                image: 'image.jpg',
                content: 'Test description',
                petId: 1,
            };

            (prisma.pet.findFirst as jest.Mock).mockResolvedValue(mockPet);
            (prisma.post.create as jest.Mock).mockResolvedValue(mockPost);

            const result = await postService.createPost(1, 1, 'Test description', 'image.jpg');

            expect(result).toEqual(mockPost);
        });

        it('should throw error if pet not found', async () => {
            (prisma.pet.findFirst as jest.Mock).mockResolvedValue(null);

            await expect(
                postService.createPost(999, 1, 'Test', 'image.jpg'),
            ).rejects.toThrow('Pet not found or not yours');
        });
    });

    describe('getPostsByPet', () => {
        it('should return posts for a pet', async () => {
            const mockPosts = [
                { id: 1, image: 'img1.jpg', petId: 1, _count: { likes: 0, comments: 0 } },
                { id: 2, image: 'img2.jpg', petId: 1, _count: { likes: 0, comments: 0 } },
            ];

            (prisma.post.findMany as jest.Mock).mockResolvedValue(mockPosts);

            const result = await postService.getPostsByPet(1);

            expect(result).toEqual([
                { id: 1, image: 'img1.jpg', petId: 1, _count: { likes: 0, comments: 0 }, likedByUser: false, favoritedByUser: false },
                { id: 2, image: 'img2.jpg', petId: 1, _count: { likes: 0, comments: 0 }, likedByUser: false, favoritedByUser: false },
            ]);
        });
    });

    describe('getFeed', () => {
        it('should return posts feed', async () => {
            const mockPosts = [
                { id: 1, image: 'img1.jpg', likes: [], favorites: [], pet: { id: 1, name: 'Pet1' }, _count: { likes: 0, comments: 0 } },
            ];

            (prisma.pet.findUnique as jest.Mock).mockResolvedValue({ id: 1, following: [] });
            (prisma.post.findMany as jest.Mock).mockResolvedValue(mockPosts);

            const result = await postService.getFeed(undefined, 1);

            expect(result).toHaveLength(1);
        });
    });
});