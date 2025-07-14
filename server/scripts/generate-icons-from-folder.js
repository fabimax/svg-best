import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SVG_FOLDER = './svg-icons'; // Path to your folder of SVGs
const OUTPUT_FILE = './prisma/seeds/system/generatedIcons.ts'; // Output TypeScript file

// Helper to clean up SVG content
const formatSvg = (svgString) => {
  return svgString.replace(/\n/g, "").replace(/\s+/g, " ").replace(/>\s+</g, "><").trim();
};

// Helper to generate icon name from filename
const generateIconName = (filename) => {
  return filename
    .replace('.svg', '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
};

// Helper to guess category from filename or folder structure
const guessCategory = (filename) => {
  const name = filename.toLowerCase();
  if (name.includes('star') || name.includes('heart') || name.includes('shield')) return 'Symbols';
  if (name.includes('circle') || name.includes('square') || name.includes('triangle')) return 'Basic Shapes';
  if (name.includes('award') || name.includes('trophy') || name.includes('medal')) return 'Awards';
  if (name.includes('check') || name.includes('verify') || name.includes('approve')) return 'Verification';
  return 'Icons'; // Default category
};

// Helper to generate tags from filename
const generateTags = (filename) => {
  const name = filename.toLowerCase().replace('.svg', '');
  const words = name.split(/[-_\s]+/).filter(word => word.length > 2);
  return words.slice(0, 5); // Limit to 5 tags
};

async function generateIconsFromFolder() {
  try {
    console.log(`Reading SVGs from: ${SVG_FOLDER}`);
    
    // Check if folder exists
    if (!fs.existsSync(SVG_FOLDER)) {
      console.error(`Folder ${SVG_FOLDER} does not exist!`);
      console.log('Please create the folder and add your SVG files, or update the SVG_FOLDER path in this script.');
      return;
    }

    // Read all SVG files
    const files = fs.readdirSync(SVG_FOLDER)
      .filter(file => file.toLowerCase().endsWith('.svg'));

    if (files.length === 0) {
      console.log('No SVG files found in the folder.');
      return;
    }

    console.log(`Found ${files.length} SVG files`);

    const iconData = [];

    for (const file of files) {
      try {
        const filePath = path.join(SVG_FOLDER, file);
        const svgContent = fs.readFileSync(filePath, 'utf-8');
        
        // Ensure SVG has proper namespace for standalone usage
        let normalizedSvg = svgContent;
        if (normalizedSvg.includes('<svg') && !normalizedSvg.includes('xmlns="http://www.w3.org/2000/svg"')) {
          normalizedSvg = normalizedSvg.replace(
            /<svg([^>]*)>/,
            '<svg$1 xmlns="http://www.w3.org/2000/svg">'
          );
        }

        const iconName = generateIconName(file);
        const category = guessCategory(file);
        const tags = generateTags(file);
        
        const icon = {
          name: iconName,
          category: category,
          svgContent: formatSvg(normalizedSvg),
          description: `${iconName} icon`,
          tags: tags,
          downloads: 0,
          featured: false,
        };

        iconData.push(icon);
        console.log(`✓ Processed: ${iconName}`);
        
      } catch (error) {
        console.error(`Error processing ${file}:`, error.message);
      }
    }

    // Generate TypeScript file
    const tsContent = `import { PrismaClient, SystemIcon } from '@prisma/client';

// Auto-generated from SVG folder: ${SVG_FOLDER}
// Generated on: ${new Date().toISOString()}

const formatSvg = (svgString: string): string => {
  return svgString.replace(/\\n/g, "").replace(/\\s+/g, " ").replace(/>\\s+</g, "><").trim();
};

export const generatedIconSeedData: Omit<SystemIcon, 'id' | 'createdAt' | 'updatedAt'>[] = [
${iconData.map(icon => `  {
    name: '${icon.name}',
    category: '${icon.category}',
    svgContent: \`${icon.svgContent}\`,
    description: '${icon.description}',
    tags: ${JSON.stringify(icon.tags)},
    downloads: ${icon.downloads},
    featured: ${icon.featured},
  }`).join(',\n')}
];

export async function seedGeneratedIcons(prisma: PrismaClient): Promise<void> {
  console.log('Seeding generated icons...');
  
  for (const iconData of generatedIconSeedData) {
    const { name, ...dataToUpsert } = iconData;
    
    await prisma.systemIcon.upsert({
      where: { name: name },
      update: dataToUpsert,
      create: {
        name: name,
        category: dataToUpsert.category,
        svgContent: dataToUpsert.svgContent,
        description: dataToUpsert.description,
        tags: dataToUpsert.tags,
        downloads: dataToUpsert.downloads,
        featured: dataToUpsert.featured,
      },
    });
  }
  
  console.log(\`Generated icons seeding finished. \${generatedIconSeedData.length} icons processed.\`);
}`;

    fs.writeFileSync(OUTPUT_FILE, tsContent);
    console.log(`\n✅ Generated ${OUTPUT_FILE} with ${iconData.length} icons`);
    console.log(`\nNext steps:`);
    console.log(`1. Review the generated file: ${OUTPUT_FILE}`);
    console.log(`2. Import and call seedGeneratedIcons() in your main seed.ts file`);
    console.log(`3. Run: npx prisma db seed`);

  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIconsFromFolder();