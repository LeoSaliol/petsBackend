import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

const SEED_FILE = path.resolve(__dirname, 'seedData.json');

const SPANISH_COMMENTS = [
    'Qué lindo 😍',
    'Hermosa foto!',
    'Me encanta 🥰',
    'Precioso/a',
    'Qué belleza!',
    'Me derrito 😭',
    'Es demasiado cute',
    'Amo esta foto',
    'Qué ternura',
    'La mirada que tiene 🥺',
    'Es el/la más lindo/a',
    'Precioso momento',
    'Increíble',
    'Qué buen día',
    'Se ve muy feliz',
    'Esos ojitos 🥹',
    'Siempre tan fotogénico/a',
    'Me hace feliz ver esto',
    'Qué ganas de darle cariño',
    'Demasiado tierno',
];

interface SeedUser {
    name: string;
    email: string;
    password: string;
    pets: SeedPet[];
}

interface SeedPet {
    name: string;
    bio?: string;
    image?: string;
    posts: SeedPost[];
}

interface SeedPost {
    image: string;
    description?: string;
    location?: string;
}

function pick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

async function main() {
    console.log('🌱 Limpiando base de datos...');
    await prisma.message.deleteMany();
    await prisma.conversationParticipant.deleteMany();
    await prisma.conversation.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.favorite.deleteMany();
    await prisma.postTag.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.like.deleteMany();
    await prisma.follow.deleteMany();
    await prisma.post.deleteMany();
    await prisma.pet.deleteMany();
    await prisma.user.deleteMany();

    console.log('📖 Leyendo seed data...');
    const raw = fs.readFileSync(SEED_FILE, 'utf-8');
    const usersData: SeedUser[] = JSON.parse(raw);

    console.log('👤 Creando usuarios...');
    const allPets: { id: number; name: string; ownerId: number }[] = [];
    const allPosts: { id: number; petId: number }[] = [];

    for (const userData of usersData) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const user = await prisma.user.create({
            data: {
                name: userData.name,
                email: userData.email,
                password: hashedPassword,
            },
        });
        console.log(`  ✓ ${user.name} (${user.email})`);

        for (const petData of userData.pets) {
            const pet = await prisma.pet.create({
                data: {
                    name: petData.name,
                    bio: petData.bio ?? null,
                    image: petData.image ?? null,
                    ownerId: user.id,
                },
            });
            allPets.push({ id: pet.id, name: pet.name, ownerId: user.id });

            for (const postData of petData.posts) {
                const post = await prisma.post.create({
                    data: {
                        image: postData.image,
                        content: postData.description ?? null,
                        location: postData.location ?? null,
                        petId: pet.id,
                    },
                });
                allPosts.push({ id: post.id, petId: pet.id });
            }
            console.log(`    🐾 ${pet.name} (${petData.posts.length} posts)`);
        }
    }

    console.log('\n❤️  Generando likes aleatorios...');
    let likeCount = 0;
    for (const pet of allPets) {
        const targetPosts = shuffle(
            allPosts.filter((p) => p.petId !== pet.id)
        ).slice(0, randomInt(2, 4));

        for (const post of targetPosts) {
            try {
                await prisma.like.create({
                    data: { petId: pet.id, postId: post.id },
                });
                likeCount++;
            } catch {
                // unique constraint, skip
            }
        }
    }
    console.log(`  ✓ ${likeCount} likes creados`);

    console.log('\n💬 Generando comentarios aleatorios...');
    let commentCount = 0;
    const commentPool = shuffle(SPANISH_COMMENTS);
    for (const post of allPosts) {
        const commenters = shuffle(
            allPets.filter((p) => p.id !== post.petId)
        ).slice(0, randomInt(1, 3));

        for (const commenter of commenters) {
            await prisma.comment.create({
                data: {
                    content: pick(commentPool),
                    petId: commenter.id,
                    postId: post.id,
                },
            });
            commentCount++;
        }
    }
    console.log(`  ✓ ${commentCount} comentarios creados`);

    console.log('\n🔗 Generando follows aleatorios...');
    let followCount = 0;
    for (const pet of allPets) {
        const toFollow = shuffle(
            allPets.filter((p) => p.id !== pet.id)
        ).slice(0, randomInt(2, 3));

        for (const target of toFollow) {
            try {
                await prisma.follow.create({
                    data: { followerId: pet.id, followingId: target.id },
                });
                followCount++;
            } catch {
                // unique constraint, skip
            }
        }
    }
    console.log(`  ✓ ${followCount} follows creados`);

    console.log('\n✅ Seed completado exitosamente!');
    console.log(`   ${usersData.length} usuarios`);
    console.log(`   ${allPets.length} mascotas`);
    console.log(`   ${allPosts.length} posts`);
    console.log(`   ${likeCount} likes`);
    console.log(`   ${commentCount} comentarios`);
    console.log(`   ${followCount} follows`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
