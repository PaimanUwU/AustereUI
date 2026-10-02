#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// All 22 colorful and neutral built-in Tailwind colors
const TAILWIND_COLORS = [
  'slate',
  'gray',
  'zinc',
  'neutral',
  'stone',
  'red',
  'orange',
  'amber',
  'yellow',
  'lime',
  'green',
  'emerald',
  'teal',
  'cyan',
  'sky',
  'blue',
  'indigo',
  'violet',
  'purple',
  'fuchsia',
  'pink',
  'rose',
];

const TAILWIND_COLOR_PALETTES = {
  slate: { primary: '#0f172a', foreground: '#ffffff' },
  gray: { primary: '#111827', foreground: '#ffffff' },
  zinc: { primary: '#18181b', foreground: '#ffffff' },
  neutral: { primary: '#171717', foreground: '#ffffff' },
  stone: { primary: '#1c1917', foreground: '#ffffff' },
  red: { primary: '#ef4444', foreground: '#ffffff' },
  orange: { primary: '#f97316', foreground: '#ffffff' },
  amber: { primary: '#f59e0b', foreground: '#000000' },
  yellow: { primary: '#eab308', foreground: '#000000' },
  lime: { primary: '#84cc16', foreground: '#000000' },
  green: { primary: '#22c55e', foreground: '#ffffff' },
  emerald: { primary: '#10b981', foreground: '#ffffff' },
  teal: { primary: '#14b8a6', foreground: '#ffffff' },
  cyan: { primary: '#06b6d4', foreground: '#ffffff' },
  sky: { primary: '#0ea5e9', foreground: '#ffffff' },
  blue: { primary: '#2563eb', foreground: '#ffffff' },
  indigo: { primary: '#6366f1', foreground: '#ffffff' },
  violet: { primary: '#8b5cf6', foreground: '#ffffff' },
  purple: { primary: '#a855f7', foreground: '#ffffff' },
  fuchsia: { primary: '#d946ef', foreground: '#ffffff' },
  pink: { primary: '#ec4899', foreground: '#ffffff' },
  rose: { primary: '#f43f5e', foreground: '#ffffff' },
};

function hexToRgb(hex) {
  const cleanHex = hex.replace('#', '').trim();
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16);
    const g = parseInt(cleanHex[1] + cleanHex[1], 16);
    const b = parseInt(cleanHex[2] + cleanHex[2], 16);
    return { r, g, b };
  }
  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return { r, g, b };
  }
  return null;
}

function getContrastForeground(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return '#ffffff';
  const yiq = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  return yiq >= 140 ? '#000000' : '#ffffff';
}

function generateThemeCss(primaryInput) {
  const isBuiltIn = TAILWIND_COLORS.includes(primaryInput.toLowerCase());

  let primaryHex;
  let primaryForegroundHex;

  if (isBuiltIn) {
    const palette = TAILWIND_COLOR_PALETTES[primaryInput.toLowerCase()];
    primaryHex = palette.primary;
    primaryForegroundHex = palette.foreground;
  } else {
    primaryHex = primaryInput.startsWith('#') ? primaryInput : `#${primaryInput}`;
    primaryForegroundHex = getContrastForeground(primaryHex);
  }

  const rgb = hexToRgb(primaryHex) || { r: 0, g: 0, b: 0 };
  const fgRgb = hexToRgb(primaryForegroundHex) || { r: 255, g: 255, b: 255 };

  return `@layer base {
  :root {
    --primary: ${rgb.r} ${rgb.g} ${rgb.b};
    --primary-foreground: ${fgRgb.r} ${fgRgb.g} ${fgRgb.b};
    --primary-hex: ${primaryHex};
  }

  .dark {
    --primary: ${rgb.r} ${rgb.g} ${rgb.b};
    --primary-foreground: ${fgRgb.r} ${fgRgb.g} ${fgRgb.b};
    --primary-hex: ${primaryHex};
  }
}
`;
}

function detectPackageManager() {
  const cwd = process.cwd();
  if (fs.existsSync(path.join(cwd, 'pnpm-lock.yaml'))) return 'pnpm';
  if (fs.existsSync(path.join(cwd, 'yarn.lock'))) return 'yarn';
  if (fs.existsSync(path.join(cwd, 'bun.lockb')) || fs.existsSync(path.join(cwd, 'bun.lock'))) return 'bun';
  return 'npm';
}

async function fetchRegistryItem(name, baseUrl) {
  // If baseUrl is local or starts with http
  if (baseUrl.startsWith('http://') || baseUrl.startsWith('https://')) {
    const url = `${baseUrl.replace(/\/$/, '')}/${name}.json`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download ${name} from ${url} (HTTP ${response.status})`);
    }
    return await response.json();
  }

  // Local fallback (e.g. within this repository or specified path)
  const localFile = path.resolve(baseUrl, `${name}.json`);
  if (fs.existsSync(localFile)) {
    return JSON.parse(fs.readFileSync(localFile, 'utf-8'));
  }

  throw new Error(`Registry item "${name}" not found.`);
}

async function handleInit() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const askQuestion = (query) => new Promise((resolve) => rl.question(query, resolve));

  console.log('\n\x1b[1m\x1b[36m❖ AustereUI CLI\x1b[0m');
  console.log('Initializing theme tokens and configuration.\n');

  console.log('\x1b[33mAvailable built-in Tailwind colors:\x1b[0m');
  const formattedColors = TAILWIND_COLORS.map(
    (c, i) => `${c}${i % 6 === 5 ? '\n' : ', '}`
  ).join('');
  console.log(formattedColors.trimEnd());
  console.log('\x1b[90m(Or enter any custom HEX like #2563eb, #ff4500, etc.)\x1b[0m\n');

  const answer = await askQuestion('👉 Select your primary theme color: ');
  const trimmed = answer.trim();
  const isHex = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(trimmed);
  const isBuiltIn = TAILWIND_COLORS.includes(trimmed.toLowerCase());

  let selectedColor = trimmed.toLowerCase();

  if (!isHex && !isBuiltIn) {
    console.log(`\n\x1b[33m⚠️ "${trimmed}" is not recognized. Defaulting to "zinc".\x1b[0m`);
    selectedColor = 'zinc';
  } else if (isHex && !selectedColor.startsWith('#')) {
    selectedColor = `#${selectedColor}`;
  }

  console.log(`\n\x1b[32m✔ Selected primary color: ${selectedColor}\x1b[0m`);

  const generatedCss = generateThemeCss(selectedColor);

  const possibleCssPaths = [
    path.resolve(process.cwd(), 'src/index.css'),
    path.resolve(process.cwd(), 'src/globals.css'),
    path.resolve(process.cwd(), 'src/styles.css'),
    path.resolve(process.cwd(), 'styles/globals.css'),
    path.resolve(process.cwd(), 'app/globals.css'),
  ];

  let targetCssPath = possibleCssPaths.find((p) => fs.existsSync(p));

  if (!targetCssPath) {
    targetCssPath = path.resolve(process.cwd(), 'src/index.css');
    fs.mkdirSync(path.dirname(targetCssPath), { recursive: true });
    fs.writeFileSync(
      targetCssPath,
      `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\n${generatedCss}`
    );
    console.log(`\x1b[32m✔ Created ${path.relative(process.cwd(), targetCssPath)} with theme tokens\x1b[0m`);
  } else {
    let existingContent = fs.readFileSync(targetCssPath, 'utf-8');
    if (existingContent.includes('--primary:')) {
      const rgb =
        hexToRgb(
          isBuiltIn ? TAILWIND_COLOR_PALETTES[selectedColor].primary : selectedColor
        ) || { r: 0, g: 0, b: 0 };
      const fgHex = isBuiltIn
        ? TAILWIND_COLOR_PALETTES[selectedColor].foreground
        : getContrastForeground(selectedColor);
      const fgRgb = hexToRgb(fgHex) || { r: 255, g: 255, b: 255 };

      existingContent = existingContent.replace(
        /--primary:\s*[^;]+;/g,
        `--primary: ${rgb.r} ${rgb.g} ${rgb.b};`
      );
      existingContent = existingContent.replace(
        /--primary-foreground:\s*[^;]+;/g,
        `--primary-foreground: ${fgRgb.r} ${fgRgb.g} ${fgRgb.b};`
      );
      fs.writeFileSync(targetCssPath, existingContent);
      console.log(`\x1b[32m✔ Updated CSS variable tokens in ${path.relative(process.cwd(), targetCssPath)}\x1b[0m`);
    } else {
      fs.appendFileSync(targetCssPath, `\n${generatedCss}`);
      console.log(`\x1b[32m✔ Injected theme tokens into ${path.relative(process.cwd(), targetCssPath)}\x1b[0m`);
    }
  }

  // Update tailwind.config.js
  const tailwindPath = path.resolve(process.cwd(), 'tailwind.config.js');
  if (fs.existsSync(tailwindPath)) {
    const twContent = fs.readFileSync(tailwindPath, 'utf-8');
    if (!twContent.includes('primary')) {
      const updatedTw = twContent.replace(
        /extend:\s*\{/,
        `extend: {\n      colors: {\n        primary: {\n          DEFAULT: "rgb(var(--primary) / <alpha-value>)",\n          foreground: "rgb(var(--primary-foreground) / <alpha-value>)",\n        },\n      },`
      );
      fs.writeFileSync(tailwindPath, updatedTw);
      console.log(`\x1b[32m✔ Configured Tailwind colors in tailwind.config.js\x1b[0m`);
    }
  }

  // Write austereui.json
  const config = {
    $schema: 'https://austereui.com/schema.json',
    style: 'default',
    tailwind: {
      config: 'tailwind.config.js',
      css: path.relative(process.cwd(), targetCssPath),
    },
    aliases: {
      components: '@/components',
      utils: '@/lib/utils',
    },
    theme: {
      primary: selectedColor,
    },
  };

  fs.writeFileSync(
    path.resolve(process.cwd(), 'austereui.json'),
    JSON.stringify(config, null, 2)
  );
  console.log(`\x1b[32m✔ Generated austereui.json configuration\x1b[0m`);

  console.log('\n\x1b[1m\x1b[32m✨ Setup complete! You can now add components with your theme tokens.\x1b[0m\n');
  rl.close();
}

async function handleAdd(components) {
  if (!components || components.length === 0) {
    console.error('\x1b[31mError: Please specify one or more components to add (e.g. austereui add button)\x1b[0m');
    process.exit(1);
  }

  // Check austereui.json or use sensible defaults
  const _configPath = path.resolve(process.cwd(), 'austereui.json');
  let registryBase = process.env.AUSTEREUI_REGISTRY || 'https://austereui.com/r';

  // If running in development inside the library repo, automatically use local public/r
  const localRepoRegistry = path.join(__dirname, '../public/r');
  if (fs.existsSync(localRepoRegistry)) {
    registryBase = localRepoRegistry;
  }

  const installedDeps = new Set();
  const addedFiles = [];

  for (const componentName of components) {
    console.log(`\n\x1b[36m⏳ Fetching "${componentName}" from registry...\x1b[0m`);

    try {
      const item = await fetchRegistryItem(componentName, registryBase);

      // Handle registry dependencies (e.g., utils)
      if (item.registryDependencies && item.registryDependencies.length > 0) {
        for (const regDep of item.registryDependencies) {
          try {
            const regDepItem = await fetchRegistryItem(regDep, registryBase);
            if (regDepItem.files) {
              for (const file of regDepItem.files) {
                const targetPath = path.resolve(process.cwd(), 'src', file.path);
                if (!fs.existsSync(targetPath)) {
                  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
                  fs.writeFileSync(targetPath, file.content);
                  addedFiles.push(path.relative(process.cwd(), targetPath));
                }
              }
            }
            if (regDepItem.dependencies) {
              regDepItem.dependencies.forEach((d) => installedDeps.add(d));
            }
          } catch {
            // Ignore if optional or already present
          }
        }
      }

      // Write component files into project (under src/components/ui/ or components/ui/)
      const hasSrc = fs.existsSync(path.resolve(process.cwd(), 'src'));
      const baseDir = hasSrc ? path.resolve(process.cwd(), 'src') : process.cwd();

      if (item.files && item.files.length > 0) {
        for (const file of item.files) {
          const targetPath = path.resolve(baseDir, file.path);
          fs.mkdirSync(path.dirname(targetPath), { recursive: true });
          fs.writeFileSync(targetPath, file.content);
          addedFiles.push(path.relative(process.cwd(), targetPath));
        }
      }

      if (item.dependencies) {
        item.dependencies.forEach((d) => installedDeps.add(d));
      }

      console.log(`\x1b[32m✔ Component "${componentName}" ready.\x1b[0m`);
    } catch (err) {
      console.error(`\x1b[31m✖ Failed to add "${componentName}": ${err.message}\x1b[0m`);
    }
  }

  // Display added files
  if (addedFiles.length > 0) {
    console.log('\n\x1b[1mCreated / Updated Files:\x1b[0m');
    addedFiles.forEach((f) => console.log(`  - \x1b[34m${f}\x1b[0m`));
  }

  // Install required package dependencies if needed
  if (installedDeps.size > 0) {
    const pkgJsonPath = path.resolve(process.cwd(), 'package.json');
    let needed = Array.from(installedDeps);

    if (fs.existsSync(pkgJsonPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));
      const currentDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
      needed = needed.filter((d) => !currentDeps[d]);
    }

    if (needed.length > 0) {
      const pm = detectPackageManager();
      const installCmd =
        pm === 'yarn'
          ? `yarn add ${needed.join(' ')}`
          : pm === 'pnpm'
          ? `pnpm add ${needed.join(' ')}`
          : pm === 'bun'
          ? `bun add ${needed.join(' ')}`
          : `npm install ${needed.join(' ')}`;

      console.log(`\n\x1b[33m📦 Installing dependencies using ${pm}: ${needed.join(' ')}\x1b[0m`);
      try {
        execSync(installCmd, { stdio: 'inherit', cwd: process.cwd() });
        console.log(`\x1b[32m✔ Dependencies installed.\x1b[0m`);
      } catch {
        console.warn(`\x1b[33m⚠️ Could not auto-install dependencies. Please run:\x1b[0m\n  ${installCmd}`);
      }
    } else {
      console.log(`\n\x1b[32m✔ All dependencies already installed.\x1b[0m`);
    }
  }

  console.log('\n\x1b[1m\x1b[32m✨ Done! You can now import your component:\x1b[0m');
  components.forEach((c) => {
    console.log(`  \x1b[36mimport { ${capitalize(c)} } from "@/components/ui/${c}";\x1b[0m`);
  });
  console.log('');
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'init';

  if (command === 'init') {
    await handleInit();
  } else if (command === 'add') {
    await handleAdd(args.slice(1));
  } else {
    console.log(`\nAustereUI CLI`);
    console.log(`Usage:`);
    console.log(`  npx austereui init`);
    console.log(`  npx austereui add <component-name...>\n`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
