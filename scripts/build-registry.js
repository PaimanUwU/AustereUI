import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { TAILWIND_COLORS, TAILWIND_COLOR_PALETTES, generateThemeCss } from '../registry/lib/colors.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REGISTRY_DIR = path.join(__dirname, '../registry/components');
const LIB_DIR = path.join(__dirname, '../registry/lib');
const OUTPUT_DIR = path.join(__dirname, '../public/r');
const THEMES_OUTPUT_DIR = path.join(OUTPUT_DIR, 'themes');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}
if (!fs.existsSync(THEMES_OUTPUT_DIR)) {
  fs.mkdirSync(THEMES_OUTPUT_DIR, { recursive: true });
}

const buildRegistry = () => {
  // 1. Build utils.json (needed by components)
  const utilsFile = path.join(LIB_DIR, 'utils.ts');
  if (fs.existsSync(utilsFile)) {
    const utilsContent = fs.readFileSync(utilsFile, 'utf-8');
    const utilsRegistryItem = {
      name: 'utils',
      type: 'registry:lib',
      dependencies: ['clsx', 'tailwind-merge'],
      files: [
        {
          path: 'lib/utils.ts',
          content: utilsContent,
          type: 'registry:lib',
        },
      ],
    };
    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'utils.json'),
      JSON.stringify(utilsRegistryItem, null, 2)
    );
    console.log(`✅ Built registry file for utils`);
  }

  // 2. Build component JSON files
  if (fs.existsSync(REGISTRY_DIR)) {
    const entries = fs.readdirSync(REGISTRY_DIR, { withFileTypes: true });
    const componentDirs = entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);

    componentDirs.forEach((component) => {
      const componentFile = path.join(REGISTRY_DIR, component, `${component}.tsx`);

      if (fs.existsSync(componentFile)) {
        let content = fs.readFileSync(componentFile, 'utf-8');

        // Transform internal authoring import paths "../../lib/utils" -> "@/lib/utils"
        const transformedContent = content.replace(
          /["']\.\.\/\.\.\/lib\/utils["']/g,
          `"@/lib/utils"`
        );

        const registryItem = {
          name: component,
          type: 'registry:ui',
          dependencies: ['@base-ui/react', 'class-variance-authority', 'clsx', 'tailwind-merge'],
          registryDependencies: ['utils'],
          files: [
            {
              path: `components/ui/${component}.tsx`,
              content: transformedContent,
              type: 'registry:ui',
            },
          ],
        };

        fs.writeFileSync(
          path.join(OUTPUT_DIR, `${component}.json`),
          JSON.stringify(registryItem, null, 2)
        );

        console.log(`✅ Built registry file for ${component}`);
      } else {
        console.warn(`⚠️ Main component file not found: ${componentFile}`);
      }
    });
  }

  // 3. Build theme token registry files for all built-in Tailwind colors
  const themesIndex = [];

  TAILWIND_COLORS.forEach((color) => {
    const cssContent = generateThemeCss(color);
    const palette = TAILWIND_COLOR_PALETTES[color];

    const themeItem = {
      name: color,
      type: 'registry:theme',
      cssVars: {
        primary: palette.primary,
        foreground: palette.foreground,
      },
      css: cssContent,
    };

    fs.writeFileSync(
      path.join(THEMES_OUTPUT_DIR, `${color}.json`),
      JSON.stringify(themeItem, null, 2)
    );

    // Also write a static CSS file for direct imports if preferred
    fs.writeFileSync(path.join(THEMES_OUTPUT_DIR, `${color}.css`), cssContent);

    themesIndex.push({
      name: color,
      primary: palette.primary,
    });
  });

  // Write colors index
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'colors.json'),
    JSON.stringify(
      {
        colors: TAILWIND_COLORS,
        themes: themesIndex,
      },
      null,
      2
    )
  );

  console.log(`🎨 Built theme tokens for ${TAILWIND_COLORS.length} Tailwind colors`);
};

buildRegistry();
