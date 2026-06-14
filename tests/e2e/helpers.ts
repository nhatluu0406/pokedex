import { expect, type Page } from "@playwright/test";

const SEARCH = /search pokémon by name/i;

export async function waitForAppReady(page: Page) {
  await page.goto("/");
  await expect(page.locator(".loading-screen")).toBeHidden({ timeout: 60_000 });
  await expect(page.locator(".pokemon-card").first()).toBeVisible();
}

export async function searchPokemon(page: Page, query: string) {
  await page.getByRole("searchbox", { name: SEARCH }).fill(query);
  await page.waitForTimeout(50);
}

export function cardById(page: Page, id: number) {
  return page.locator(".pokemon-card").filter({
    has: page.getByText(`N° ${id}`, { exact: true }),
  });
}

export async function selectPokemonById(page: Page, id: number) {
  await cardById(page, id).click();
}

export async function findAndSelectPokemon(
  page: Page,
  searchQuery: string,
  id: number,
) {
  await searchPokemon(page, searchQuery);
  await expect(cardById(page, id)).toBeVisible();
  await selectPokemonById(page, id);
}

export async function enableDarkTheme(page: Page) {
  const toggle = page.locator(".theme-toggle");
  if ((await page.locator("html").getAttribute("data-theme")) !== "dark") {
    await toggle.click();
  }
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
}

export async function dismissNextDevOverlay(page: Page) {
  const closeBtn = page.getByRole("button", { name: /close next\.js dev tools/i });
  if (await closeBtn.isVisible().catch(() => false)) {
    await closeBtn.click();
  }
}

export function parseRgb(color: string): { r: number; g: number; b: number } | null {
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return null;
  return {
    r: Number(match[1]),
    g: Number(match[2]),
    b: Number(match[3]),
  };
}

export async function getBodyBeforeOpacity(page: Page): Promise<number> {
  const style = await getBodyBeforeStyle(page);
  return style.opacity;
}

export async function getBodyBeforeStyle(page: Page): Promise<{
  opacity: number;
  backgroundImage: string;
}> {
  return page.evaluate(() => {
    const style = getComputedStyle(document.documentElement, "::before");
    return {
      opacity: Number.parseFloat(style.opacity),
      backgroundImage: style.backgroundImage,
    };
  });
}

export async function enableLightTheme(page: Page) {
  const toggle = page.locator(".theme-toggle");
  if ((await page.locator("html").getAttribute("data-theme")) !== "light") {
    await toggle.click();
  }
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
}
