/**
 * Generate Theme CSS File
 * =======================
 * Interactive script: hỏi user chọn base color + theme name,
 * merge bằng buildRegistryTheme(), xuất ra CSS file.
 *
 * Usage:
 *   bun run tooling/tailwind/scripts/generate-themes.ts
 *
 * Flow:
 *   1. Hiện danh sách base colors → user chọn
 *   2. Hiện danh sách accent themes → user chọn
 *   3. Merge base + accent via buildRegistryTheme()
 *   4. Ghi file CSS vào tooling/tailwind/themes/{base}-{theme}.css
 */

import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { stdin, stdout } from "node:process";
import { createInterface } from "node:readline/promises";
import type { BaseColorName } from "../registry/theme";
import { buildThemeCssText, isBaseColorTheme, THEMES } from "../registry/theme";
import { buildRegistryTheme } from "../utils/builder";


// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const TOOLING_DIR = resolve(import.meta.dirname, "..");
const THEMES_OUTPUT_DIR = join(TOOLING_DIR, "themes");
const HEADER = `/* ⚠️  AUTO-GENERATED — Do not edit manually.
 * Source: packages/ui/src/theme/theme-registry.ts
 * Regenerate: bun run tooling/tailwind/scripts/generate-themes.ts
 */\n\n`;

// ---------------------------------------------------------------------------
// Registry helpers
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Interactive prompts
// ---------------------------------------------------------------------------

async function promptSelection(
  rl: ReturnType<typeof createInterface>,
  label: string,
  options: readonly { name: string; title: string }[]
): Promise<string> {
  console.log(`\n${label}:\n`);
  options.forEach((opt, i) => {
    console.log(`  ${i + 1}. ${opt.title} (${opt.name})`);
  });

  while (true) {
    const answer = await rl.question(`\nEnter number (1-${options.length}): `);
    const idx = parseInt(answer, 10) - 1;

    if (idx >= 0 && idx < options.length) {
      return options[idx]?.name ?? "";
    }
    console.log("  ❌ Invalid selection, try again.");
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const rl = createInterface({ input: stdin, output: stdout });

  try {
    console.log("🎨 Generate Theme CSS\n");
    console.log("This will merge a base color palette with an accent theme");
    console.log("and output a ready-to-import CSS file.\n");

    // Step 1: Choose base color
    const baseColors = THEMES.filter(isBaseColorTheme);
    const baseColorName = await promptSelection(
      rl,
      "Choose a base color (full neutral palette)",
      baseColors
    );

    // Step 2: Choose accent theme
    const accentThemes = THEMES.filter((t) => !isBaseColorTheme(t));
    const allThemeOptions = [
      { name: baseColorName, title: `(none — use ${baseColorName} defaults)` },
      ...accentThemes,
    ];
    const themeName = await promptSelection(
      rl,
      "Choose an accent theme (overrides primary + charts)",
      allThemeOptions
    );

    // Step 3: Build merged theme
    const result = buildRegistryTheme({
      baseColor: baseColorName as BaseColorName,
      theme: themeName,
    });

    const isSameAsBase = baseColorName === themeName;
    const outputName = isSameAsBase ? baseColorName : result.name;

    // Step 4: Generate CSS
    const cssText = buildThemeCssText({
      light: result.cssVars.light,
      dark: result.cssVars.dark,
    });

    const comment = isSameAsBase
      ? `/* Theme: ${baseColorName} (base only, no accent) */\n\n`
      : `/* Theme: ${outputName}
 * Base color: ${baseColorName}
 * Accent: ${themeName}
 */\n\n`;

    const fileContent = HEADER + comment + cssText + "\n";

    // Step 5: Write file
    await mkdir(THEMES_OUTPUT_DIR, { recursive: true });
    const filePath = join(THEMES_OUTPUT_DIR, `${outputName}.css`);
    await writeFile(filePath, fileContent, "utf-8");

    console.log(`\n✅ Generated: tooling/tailwind/themes/${outputName}.css`);
    console.log(`\n📦 Add to package.json exports:`);
    console.log(
      `   "./theme/${outputName}": "./themes/${outputName}.css"`
    );
    console.log(`\n📄 Import in your app:`);
    console.log(`   @import "@ldc/tailwind-config/core";`);
    console.log(`   @import "@ldc/tailwind-config/theme/${outputName}";`);
  } finally {
    rl.close();
  }
}

main().catch((err) => {
  console.error("❌ Failed:", err);
  process.exit(1);
});