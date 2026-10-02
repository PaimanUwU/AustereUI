#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { TAILWIND_COLORS, generateThemeCss, hexToRgb } from '../registry/lib/colors.ts';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const askQuestion = (query: string): Promise<string> => {
  return new Promise((resolve) => rl.question(query, resolve));
};

async function runInit() {
  console.log('\n\x1b[1m\x1b[36m✨ Welcome to AustereUI Setup ✨\x1b[0m');
  console.log('Let\'s configure your design tokens and primary theme color.\n');

  console.log('\x1b[33mAvailable built-in Tailwind colors:\x1b[0m');
  const formattedColors = TAILWIND_COLORS.map((c, i) => `${c}${i % 6 === 5 ? '\n' : ', '}`).join('');
  console.log(formattedColors.trimEnd());
  console.log('');

  const answer = await askQuestion(
    '👉 Select a primary color (enter color name e.g. "blue", "zinc", or a custom HEX like "#2563eb"): '
  );

  const trimmed = answer.trim();
  const isHex = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(trimmed);
  const isBuiltIn = TAILWIND_COLORS.includes(trimmed.toLowerCase() as any);

  let selectedColor = trimmed.toLowerCase();

  if (!isHex && !isBuiltIn) {
    console.log(`\n\x1b[33m⚠️ "${trimmed}" is not a recognized built-in Tailwind color or valid HEX. Defaulting to "zinc".\x1b[0m`);
    selectedColor = 'zinc';
  } else if (isHex && !selectedColor.startsWith('#')) {
    selectedColor = `#${selectedColor}`;
  }

  console.log(`\n\x1b[32m✔ Selected theme primary color: ${selectedColor}\x1b[0m\n`);

  const generatedCss = generateThemeCss(selectedColor);

  // Look for target css file in common paths
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
    console.log(`\x1b[32m✔ Created ${path.relative(process.cwd(), targetCssPath)} with theme variables.\x1b[0m`);
  } else {
    let existingContent = fs.readFileSync(targetCssPath, 'utf-8');
    // Replace existing @layer base with tokens if exists, otherwise append
    if (existingContent.includes('--primary:')) {
      const rgb = hexToRgb(selectedColor.startsWith('#') ? selectedColor : '#000000') || { r: 0, g: 0, b: 0 };
      existingContent = existingContent.replace(
        /--primary:\s*[^;]+;/g,
        `--primary: ${rgb.r} ${rgb.g} ${rgb.b};`
      );
      fs.writeFileSync(targetCssPath, existingContent);
      console.log(`\x1b[32m✔ Updated existing --primary token in ${path.relative(process.cwd(), targetCssPath)}\x1b[0m`);
    } else {
      fs.appendFileSync(targetCssPath, `\n${generatedCss}`);
      console.log(`\x1b[32m✔ Appended theme tokens to ${path.relative(process.cwd(), targetCssPath)}\x1b[0m`);
    }
  }

  // Create or update austereui.config.json
  const config = {
    theme: {
      primary: selectedColor,
    },
  };
  fs.writeFileSync(
    path.resolve(process.cwd(), 'austereui.config.json'),
    JSON.stringify(config, null, 2)
  );
  console.log(`\x1b[32m✔ Created austereui.config.json\x1b[0m`);

  console.log('\n\x1b[1m\x1b[32m🎉 AustereUI initialized successfully!\x1b[0m\n');
  rl.close();
}

runInit().catch((err) => {
  console.error(err);
  rl.close();
  process.exit(1);
});
