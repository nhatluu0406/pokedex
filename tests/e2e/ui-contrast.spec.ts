import { expect, test, type TestInfo } from "@playwright/test";
import {
  enableDarkTheme,
  enableLightTheme,
  findAndSelectPokemon,
  getBodyBeforeOpacity,
  getBodyBeforeStyle,
  parseRgb,
  selectPokemonById,
  waitForAppReady,
} from "./helpers";

function isDesktopProject(testInfo: TestInfo) {
  return testInfo.project.name === "desktop";
}

test.describe("Phase 6 — UI contrast and layout", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(!isDesktopProject(testInfo), "Desktop-only Phase 6 regression tests");
    await page.setViewportSize({ width: 1400, height: 900 });
  });
  test("dark theme section titles are not hardcoded navy", async ({ page }) => {
    await waitForAppReady(page);
    await enableDarkTheme(page);
    await selectPokemonById(page, 1);
    await expect(page.locator(".detail-name")).toHaveText("Bulbasaur", {
      timeout: 15_000,
    });

    const titleColor = await page
      .locator(".detail-section-title")
      .first()
      .evaluate((el) => getComputedStyle(el).color);
    const rgb = parseRgb(titleColor);
    expect(rgb).not.toBeNull();
    expect(rgb).not.toEqual({ r: 1, g: 16, b: 48 });
  });

  test("info pills use dark background in dark mode", async ({ page }) => {
    await waitForAppReady(page);
    await enableDarkTheme(page);
    await findAndSelectPokemon(page, "ivysaur", 2);
    await expect(page.locator(".detail-name")).toHaveText("Ivysaur", {
      timeout: 15_000,
    });

    const pillBg = await page
      .locator(".detail-info-pill")
      .first()
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    const rgb = parseRgb(pillBg);
    expect(rgb).not.toBeNull();
    expect(rgb!.b).toBeLessThan(100);
  });

  test("back-to-top is visible bottom-right in dark mode after scroll", async ({
    page,
  }) => {
    await waitForAppReady(page);
    await enableDarkTheme(page);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect
      .poll(async () => page.evaluate(() => window.scrollY))
      .toBeGreaterThan(900);

    const backToTop = page.locator(".back-to-top");
    await expect(backToTop).toBeVisible({ timeout: 5000 });

    const position = await backToTop.evaluate((el) => {
      const style = getComputedStyle(el);
      return {
        right: parseFloat(style.right),
        visibility: style.visibility,
        opacity: style.opacity,
      };
    });
    expect(position.right).toBeLessThan(100);
    expect(position.visibility).not.toBe("hidden");
    expect(Number.parseFloat(position.opacity)).toBeGreaterThan(0);
  });

  test("empty state message does not overlap sprite", async ({ page }) => {
    await waitForAppReady(page);
    await expect(page.locator(".pokemon-detail-empty")).toBeVisible();

    const spriteBox = await page.locator(".detail-empty-sprite img").boundingBox();
    const messageBox = await page.locator(".detail-empty-message").boundingBox();
    expect(spriteBox).not.toBeNull();
    expect(messageBox).not.toBeNull();
    expect(spriteBox!.y).toBeGreaterThanOrEqual(0);

    const spriteBottom = spriteBox!.y + spriteBox!.height;
    const gap = messageBox!.y - spriteBottom;
    expect(gap).toBeGreaterThanOrEqual(8);
  });

  test("light watermark uses SVG at scroll top", async ({ page }) => {
    await waitForAppReady(page);
    await enableLightTheme(page);
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect.poll(async () => page.evaluate(() => window.scrollY)).toBe(0);

    const { backgroundImage, opacity } = await getBodyBeforeStyle(page);
    expect(backgroundImage).toContain("pokeball-watermark.svg");
    expect(opacity).toBeGreaterThanOrEqual(0.15);
  });

  test("light mode keeps watermark visible when scrolled", async ({ page }) => {
    await waitForAppReady(page);
    await enableLightTheme(page);
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect.poll(async () => page.evaluate(() => window.scrollY)).toBe(0);

    const beforeScroll = await getBodyBeforeStyle(page);
    expect(beforeScroll.opacity).toBeGreaterThan(0);

    await page.evaluate(() => window.scrollTo(0, 300));
    await expect.poll(async () => page.evaluate(() => window.scrollY)).toBeGreaterThan(
      200,
    );

    const afterScroll = await getBodyBeforeStyle(page);
    expect(afterScroll.opacity).toBeGreaterThan(0);
  });

  test("toolbar buttons render above watermark", async ({ page }) => {
    await waitForAppReady(page);
    await enableLightTheme(page);

    const toolbar = page.locator(".search-toolbar-row");
    await expect(toolbar).toBeVisible();

    const stackedAboveWatermark = await toolbar.evaluate((el) => {
      let node: Element | null = el;
      while (node) {
        const z = Number.parseFloat(getComputedStyle(node).zIndex);
        if (!Number.isNaN(z) && z > 0) return true;
        node = node.parentElement;
      }
      return false;
    });

    const themeToggle = toolbar.locator(".theme-toggle");
    const allChip = page.getByRole("button", { name: "All", exact: true });
    await expect(themeToggle).toBeVisible();
    await expect(allChip).toBeVisible();

    if (!stackedAboveWatermark) {
      await themeToggle.click();
      await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
      await themeToggle.click();
      await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    }

    await allChip.click();
    await expect(allChip).toHaveClass(/list-filter-chip-active/);
  });

  test("dark mode keeps background decoration visible when scrolled", async ({
    page,
  }) => {
    await waitForAppReady(page);
    await enableDarkTheme(page);
    await page.evaluate(() => window.scrollTo(0, 300));
    await expect.poll(async () => page.evaluate(() => window.scrollY)).toBeGreaterThan(
      200,
    );

    const opacity = await getBodyBeforeOpacity(page);
    expect(opacity).toBeGreaterThan(0);
  });

  test("search toolbar keeps theme toggle and All chip on one row", async ({
    page,
  }) => {
    await waitForAppReady(page);
    await expect(page.locator(".search-toolbar-row")).toBeVisible();

    const themeToggle = page.locator(".search-toolbar-row .theme-toggle");
    const allChip = page.getByRole("button", { name: "All", exact: true });
    await expect(themeToggle).toBeVisible();
    await expect(allChip).toBeVisible();

    const themeBox = await themeToggle.boundingBox();
    const allBox = await allChip.boundingBox();
    expect(themeBox).not.toBeNull();
    expect(allBox).not.toBeNull();
    expect(Math.abs(themeBox!.y - allBox!.y)).toBeLessThanOrEqual(5);
  });

  test("toolbar places All chip left of search bar", async ({ page }) => {
    await waitForAppReady(page);

    const searchBar = page.locator(".search-toolbar-row .search-bar");
    const allChip = page.getByRole("button", { name: "All", exact: true });
    await expect(searchBar).toBeVisible();
    await expect(allChip).toBeVisible();

    const searchBox = await searchBar.boundingBox();
    const allBox = await allChip.boundingBox();
    expect(searchBox).not.toBeNull();
    expect(allBox).not.toBeNull();
    expect(allBox!.x).toBeLessThan(searchBox!.x);
  });

  test("theme preference persists after reload", async ({ page }) => {
    await waitForAppReady(page);
    await enableDarkTheme(page);
    await page.reload();
    await expect(page.locator(".loading-screen")).toBeHidden({ timeout: 60_000 });
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  });

  test("evolution chain is centered for Charmander", async ({ page }) => {
    await waitForAppReady(page);
    await findAndSelectPokemon(page, "charmander", 4);
    await expect(page.locator(".detail-name")).toHaveText("Charmander", {
      timeout: 15_000,
    });
    await expect(page.locator(".evolution-chain")).toBeVisible({ timeout: 15_000 });

    const justifyContent = await page
      .locator(".evolution-chain")
      .evaluate((el) => getComputedStyle(el).justifyContent);
    expect(justifyContent).toBe("center");
  });

  test("loading on every select shows panel loader before detail name", async ({
    page,
  }) => {
    await waitForAppReady(page);

    await findAndSelectPokemon(page, "pikachu", 25);
    await expect(page.locator(".detail-name")).toHaveText("Pikachu", {
      timeout: 15_000,
    });

    await page.route("**/pokeapi.co/api/v2/pokemon/26**", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await route.continue();
    });

    await findAndSelectPokemon(page, "raichu", 26);

    const panelLoading = page.locator(".detail-panel-loading");
    await expect(panelLoading).toBeVisible({ timeout: 5000 });
    await expect(
      page.locator(".detail-name").filter({ hasText: "Raichu" }),
    ).not.toBeVisible({ timeout: 1000 });

    await expect(page.locator(".detail-name")).toHaveText("Raichu", {
      timeout: 15_000,
    });
    await expect(panelLoading).toBeHidden({ timeout: 5000 });
  });

  test("loading on first select with delayed fetch", async ({ page }) => {
    await waitForAppReady(page);

    await page.route("**/pokeapi.co/api/v2/pokemon/150**", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await route.continue();
    });

    await findAndSelectPokemon(page, "mewtwo", 150);

    const panelLoading = page.locator(".detail-panel-loading");
    await expect(panelLoading).toBeVisible({ timeout: 5000 });
    await expect(page.locator(".detail-name")).not.toBeVisible({ timeout: 500 });

    await expect(page.locator(".detail-name")).toHaveText("Mewtwo", {
      timeout: 15_000,
    });
  });

  test("close button visible in dark mode mobile modal", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await waitForAppReady(page);
    await enableDarkTheme(page);
    await findAndSelectPokemon(page, "pikachu", 25);

    const closeBtn = page.locator(".pokemon-detail-close");
    await expect(closeBtn).toBeVisible({ timeout: 5000 });

    const styles = await closeBtn.evaluate((el) => {
      const style = getComputedStyle(el);
      const box = el.getBoundingClientRect();
      return {
        color: style.color,
        backgroundColor: style.backgroundColor,
        opacity: Number.parseFloat(style.opacity),
        width: box.width,
        height: box.height,
      };
    });

    expect(styles.opacity).toBe(1);
    expect(styles.width).toBeGreaterThan(0);
    expect(styles.height).toBeGreaterThan(0);

    const textRgb = parseRgb(styles.color);
    const bgRgb = parseRgb(styles.backgroundColor);
    expect(textRgb).not.toBeNull();
    expect(bgRgb).not.toBeNull();
    expect(textRgb).not.toEqual(bgRgb);
  });

  test("page has favicon and icon links pointing to favicon.svg or icons", async ({
    page,
  }) => {
    await waitForAppReady(page);

    const iconLinks = page.locator(
      'link[rel="icon"], link[rel="apple-touch-icon"], link[rel="shortcut icon"]',
    );
    await expect(iconLinks.first()).toBeAttached();

    const hrefs = await iconLinks.evaluateAll((links) =>
      links.map((link) => link.getAttribute("href") ?? ""),
    );
    expect(
      hrefs.some(
        (href) => href.includes("favicon.svg") || href.includes("/icons/"),
      ),
    ).toBe(true);
  });

  test("no console errors about script tags on load", async ({ page }) => {
    const scriptErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error" && /script tag/i.test(msg.text())) {
        scriptErrors.push(msg.text());
      }
    });
    page.on("pageerror", (err) => {
      if (/script tag/i.test(err.message)) {
        scriptErrors.push(err.message);
      }
    });

    await waitForAppReady(page);
    expect(scriptErrors).toEqual([]);
  });

  test("page load has no hydration-related console errors", async ({ page }) => {
    const hydrationErrors: string[] = [];
    page.on("console", (msg) => {
      if (
        msg.type() === "error" &&
        /Hydration|script tag/i.test(msg.text())
      ) {
        hydrationErrors.push(msg.text());
      }
    });
    page.on("pageerror", (err) => {
      if (/Hydration|script tag/i.test(err.message)) {
        hydrationErrors.push(err.message);
      }
    });

    await waitForAppReady(page);
    expect(hydrationErrors).toEqual([]);
  });

  test("filter chips have no border ring", async ({ page }) => {
    await waitForAppReady(page);

    const chips = page.locator(".search-toolbar-row .list-filter-chip");
    await expect(chips.first()).toBeVisible();
    const count = await chips.count();

    for (let i = 0; i < count; i++) {
      const border = await chips.nth(i).evaluate((el) => {
        const style = getComputedStyle(el);
        return {
          width: style.borderWidth,
          style: style.borderStyle,
        };
      });
      expect(border.width === "0px" || border.style === "none").toBe(true);
    }
  });

  test("html uses stable scrollbar gutter", async ({ page }) => {
    await waitForAppReady(page);

    const gutter = await page.evaluate(() =>
      getComputedStyle(document.documentElement).scrollbarGutter,
    );
    expect(gutter).toBe("stable");
  });

  test("detail favorite and share buttons do not overlap", async ({ page }) => {
    await waitForAppReady(page);
    await findAndSelectPokemon(page, "pikachu", 25);
    await expect(page.locator(".detail-name")).toHaveText("Pikachu", {
      timeout: 15_000,
    });

    const favorite = page.locator(".pokemon-detail-panel .detail-favorite-btn");
    const share = page.locator(".pokemon-detail-panel .detail-share-btn");
    await expect(favorite).toBeVisible();
    await expect(share).toBeVisible();

    const favoriteBox = await favorite.boundingBox();
    const shareBox = await share.boundingBox();
    expect(favoriteBox).not.toBeNull();
    expect(shareBox).not.toBeNull();

    const favoriteRight = favoriteBox!.x + favoriteBox!.width;
    const shareLeft = shareBox!.x;
    expect(favoriteRight).toBeLessThan(shareLeft - 4);
  });

  test("favorites filter does not shift toolbar horizontally", async ({ page }) => {
    await waitForAppReady(page);

    const toolbar = page.locator(".search-toolbar-row");
    await expect(toolbar).toBeVisible();

    const xBefore = (await toolbar.boundingBox())!.x;
    await page.getByRole("button", { name: /★ favorites/i }).click();
    await page.waitForTimeout(100);

    const xAfter = (await toolbar.boundingBox())!.x;
    expect(Math.abs(xAfter - xBefore)).toBeLessThan(2);
  });

  test("share button is icon-only", async ({ page }) => {
    await waitForAppReady(page);
    await findAndSelectPokemon(page, "pikachu", 25);
    await expect(page.locator(".detail-name")).toHaveText("Pikachu", {
      timeout: 15_000,
    });

    const shareBtn = page.locator(".detail-share-btn");
    await expect(shareBtn).toBeVisible();
    await expect(shareBtn).not.toContainText("Share");
    await expect(shareBtn.locator("img")).toBeVisible();
  });
});
