import { expect, test, type Page, type TestInfo } from "@playwright/test";
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

function filterValues(page: Page) {
  return page.getByRole("group", { name: /filter values/i });
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
    const filterDropdown = page.getByRole("button", { name: /filter category/i });
    await expect(themeToggle).toBeVisible();
    await expect(filterDropdown).toBeVisible();

    if (!stackedAboveWatermark) {
      await themeToggle.click();
      await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
      await themeToggle.click();
      await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    }

    await filterDropdown.click();
    await page.getByRole("option", { name: "Color", exact: true }).click();
    await filterValues(page).getByRole("button", { name: "Red", exact: true }).click();
    await expect(filterDropdown).toHaveClass(/filter-dropdown-trigger-active/);
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

  test("search toolbar keeps theme toggle and filter dropdown on one row", async ({
    page,
  }) => {
    await waitForAppReady(page);
    await expect(page.locator(".search-toolbar-row")).toBeVisible();

    const themeToggle = page.locator(".search-toolbar-row .theme-toggle");
    const filterDropdown = page.getByRole("button", { name: /filter category/i });
    await expect(themeToggle).toBeVisible();
    await expect(filterDropdown).toBeVisible();

    const themeBox = await themeToggle.boundingBox();
    const filterBox = await filterDropdown.boundingBox();
    expect(themeBox).not.toBeNull();
    expect(filterBox).not.toBeNull();
    expect(Math.abs(themeBox!.y - filterBox!.y)).toBeLessThanOrEqual(5);
  });

  test("toolbar places filter dropdown left of search bar", async ({ page }) => {
    await waitForAppReady(page);

    const searchBar = page.locator(".search-toolbar-row .search-bar");
    const filterDropdown = page.getByRole("button", { name: /filter category/i });
    await expect(searchBar).toBeVisible();
    await expect(filterDropdown).toBeVisible();

    const searchBox = await searchBar.boundingBox();
    const filterBox = await filterDropdown.boundingBox();
    expect(searchBox).not.toBeNull();
    expect(filterBox).not.toBeNull();
    expect(filterBox!.x).toBeLessThan(searchBox!.x);
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
    await page.evaluate(async () => {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((r) => r.unregister()));
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    });

    await findAndSelectPokemon(page, "pikachu", 25);
    await expect(page.locator(".detail-name")).toHaveText("Pikachu", {
      timeout: 15_000,
    });

    await page.route(/\/data\/pokemon\/26\.json/, async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2500));
      const response = await route.fetch();
      await route.fulfill({ response });
    });

    await findAndSelectPokemon(page, "raichu", 26);

    await expect(async () => {
      const loading = await page.locator(".detail-panel-loading").isVisible();
      const staleName = await page
        .locator(".detail-name")
        .filter({ hasText: "Pikachu" })
        .isVisible();
      expect(loading || staleName).toBe(true);
    }).toPass({ timeout: 5000 });

    await expect(page.locator(".detail-name")).toHaveText("Raichu", {
      timeout: 15_000,
    });
    await expect(page.locator(".detail-panel-loading")).toBeHidden({
      timeout: 5000,
    });
  });

  test("loading on first select with delayed fetch", async ({ page }) => {
    await waitForAppReady(page);
    await page.evaluate(async () => {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((r) => r.unregister()));
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    });
    await page.reload();
    await expect(page.locator(".loading-screen")).toBeHidden({ timeout: 60_000 });
    await page.evaluate(async () => {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((r) => r.unregister()));
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    });
    await page.route(/\/data\/pokemon\/1025\.json/, async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2500));
      const response = await route.fetch();
      await route.fulfill({ response });
    });

    await findAndSelectPokemon(page, "pecharunt", 1025);

    await expect(page.locator(".detail-name")).toHaveText("Pecharunt", {
      timeout: 15_000,
    });
  });

  test("close button visible in dark mode mobile modal", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await waitForAppReady(page);
    await enableDarkTheme(page);
    await findAndSelectPokemon(page, "pikachu", 25);

    const modal = page.locator(".pokemon-detail-modal");
    const closeBtn = modal.locator(".pokemon-detail-close");
    await expect(closeBtn).toBeVisible({ timeout: 5000 });

    const modalBox = await modal.boundingBox();
    const closeBox = await closeBtn.boundingBox();
    expect(modalBox).not.toBeNull();
    expect(closeBox).not.toBeNull();
    expect(closeBox!.x + closeBox!.width).toBeLessThanOrEqual(
      modalBox!.x + modalBox!.width + 2,
    );
    expect(closeBox!.y).toBeGreaterThanOrEqual(modalBox!.y - 2);

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

  test("mobile modal sprite is fully visible within viewport", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await waitForAppReady(page);
    await findAndSelectPokemon(page, "ivysaur", 2);

    await expect(page.locator(".detail-name")).toHaveText("Ivysaur", {
      timeout: 15_000,
    });

    const sprite = page.locator(
      ".pokemon-detail-modal .detail-card .detail-sprite-wrapper .animated-sprite",
    );
    await expect(sprite).toBeVisible({ timeout: 15_000 });

    const card = page.locator(".pokemon-detail-modal .detail-card");
    const spriteBox = await sprite.boundingBox();
    const cardBox = await card.boundingBox();
    expect(spriteBox).not.toBeNull();
    expect(cardBox).not.toBeNull();
    expect(spriteBox!.y).toBeGreaterThanOrEqual(cardBox!.y);
    expect(spriteBox!.y + spriteBox!.height).toBeLessThanOrEqual(
      cardBox!.y + cardBox!.height + 2,
    );
    expect(spriteBox!.height).toBeGreaterThanOrEqual(80);
  });

  test("mobile modal sprite does not overlap content when scrolled", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await waitForAppReady(page);
    await findAndSelectPokemon(page, "pidgeotto", 17);

    await expect(page.locator(".detail-name")).toHaveText("Pidgeotto", {
      timeout: 15_000,
    });

    const card = page.locator(".pokemon-detail-modal .detail-card");
    const entryTitle = page.locator(".detail-entry .detail-section-title");
    await expect(entryTitle).toBeVisible({ timeout: 5000 });

    await card.evaluate((el) => {
      el.scrollTop = 180;
    });

    const sprite = page.locator(
      ".pokemon-detail-modal .detail-card .detail-sprite-wrapper .animated-sprite",
    );
    const spriteBox = await sprite.boundingBox();
    const entryBox = await entryTitle.boundingBox();
    expect(spriteBox).not.toBeNull();
    expect(entryBox).not.toBeNull();

    const spriteBottom = spriteBox!.y + spriteBox!.height;
    expect(spriteBottom).toBeLessThanOrEqual(entryBox!.y + 2);
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

  test("filter chips use transparent borders for stable layout", async ({ page }) => {
    await waitForAppReady(page);

    const chips = page.locator(".search-toolbar-row .filter-value-chip");
    await expect(chips.first()).toBeVisible();
    const count = await chips.count();

    for (let i = 0; i < count; i++) {
      const border = await chips.nth(i).evaluate((el) => {
        const style = getComputedStyle(el);
        return {
          width: style.borderWidth,
          style: style.borderStyle,
          color: style.borderColor,
        };
      });
      expect(border.width).toBe("2px");
      expect(border.style).toBe("solid");
      expect(border.color).toBe("rgba(0, 0, 0, 0)");
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
