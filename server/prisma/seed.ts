import { PrismaClient } from '@prisma/client';
import { seedSystemIcons } from './seeds/system/systemIcons';
import { seedGeneratedIcons } from './seeds/system/generatedIcons';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting svg.best database seed...');
  
  // Seed system icons
  await seedSystemIcons(prisma);
  
  // Seed generated icons from SVG folder
  await seedGeneratedIcons(prisma);
  
  // Feature some icons
  const featuredIcons = ['Filled Heart', 'Simple Star', 'Shield'];
  for (const name of featuredIcons) {
    try {
      await prisma.systemIcon.update({
        where: { name },
        data: { featured: true }
      });
      console.log(`✓ Featured: ${name}`);
    } catch (error) {
      console.log(`⚠ Could not feature "${name}" - icon might not exist`);
    }
  }
  
  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });