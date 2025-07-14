import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SVG_FOLDER = './svg-icons'; // Path to your folder of SVGs
const DEFAULT_CATEGORY = 'Imported Icons';

const prisma = new PrismaClient();

// Helper functions (same as above)
const formatSvg = (svgString) => {
  return svgString.replace(/\n/g, "").replace(/\s+/g, " ").replace(/>\s+</g, "><").trim();
};

const generateIconName = (filename) => {
  return filename
    .replace('.svg', '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
};

const guessCategory = (filename) => {
  const name = filename.toLowerCase();
  if (name.includes('star') || name.includes('heart') || name.includes('shield')) return 'Symbols';
  if (name.includes('circle') || name.includes('square') || name.includes('triangle')) return 'Basic Shapes';
  if (name.includes('award') || name.includes('trophy') || name.includes('medal')) return 'Awards';
  if (name.includes('check') || name.includes('verify') || name.includes('approve')) return 'Verification';
  return DEFAULT_CATEGORY;
};

const generateTags = (filename) => {
  const name = filename.toLowerCase().replace('.svg', '');
  const words = name.split(/[-_\s]+/).filter(word => word.length > 2);
  return words.slice(0, 5);
};

const ensureSvgNamespaces = (svgContent) => {
  let normalized = svgContent;

  // Always add main SVG namespace if missing
  if (normalized.includes('<svg') && !normalized.includes('xmlns="http://www.w3.org/2000/svg"')) {
    normalized = normalized.replace(
      /<svg([^>]*)>/,
      '<svg$1 xmlns="http://www.w3.org/2000/svg">'
    );
  }

  // Only add xlink namespace if SVG uses xlink: attributes AND it's missing
  if (normalized.includes('xlink:') && !normalized.includes('xmlns:xlink=')) {
    normalized = normalized.replace(
      /<svg([^>]*)>/,
      '<svg$1 xmlns:xlink="http://www.w3.org/1999/xlink">'
    );
  }

  return normalized;
};

async function importSvgsToDatabase() {
  try {
    console.log(`Importing SVGs from: ${SVG_FOLDER}`);
    
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
    
    let imported = 0;
    let skipped = 0;
    let errors = 0;

    for (const file of files) {
      try {
        const filePath = path.join(SVG_FOLDER, file);
        const svgContent = fs.readFileSync(filePath, 'utf-8');
        
        // Normalize SVG for standalone usage
        const normalizedSvg = ensureSvgNamespaces(svgContent);
        const formattedSvg = formatSvg(normalizedSvg);
        
        const iconName = generateIconName(file);
        const category = guessCategory(file);
        const tags = generateTags(file);
        
        // Check if icon already exists
        const existing = await prisma.systemIcon.findUnique({
          where: { name: iconName }
        });

        if (existing) {
          console.log(`⚠ Skipped (already exists): ${iconName}`);
          skipped++;
          continue;
        }

        // Create new icon
        await prisma.systemIcon.create({
          data: {
            name: iconName,
            category: category,
            svgContent: formattedSvg,
            assetId: null,
            isAvailable: true,
            description: `${iconName} icon`,
            tags: tags,
          }
        });

        console.log(`✓ Imported: ${iconName}`);
        imported++;
        
      } catch (error) {
        console.error(`✗ Error processing ${file}:`, error.message);
        errors++;
      }
    }

    console.log(`\n📊 Import Summary:`);
    console.log(`   Imported: ${imported}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Errors: ${errors}`);
    console.log(`   Total files: ${files.length}`);

  } catch (error) {
    console.error('Error importing SVGs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importSvgsToDatabase();