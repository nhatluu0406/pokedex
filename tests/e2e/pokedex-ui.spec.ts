import { expect, test, type Page } from "@playwright/test";

const SEARCH = /search pokémon by name/i;

async function waitForAppReady(page: Page) {
  await page.goto("/");
  await expect(page.locator(".loading-screen")).toBeHidden({ timeout: 60_000 });
  await expect(page.locator(".pokemon-card").first()).toBeVisible();
}

async function searchPokemon(page: Page, query: string) {
  await page.getByRole("searchbox", { name: SEARCH }).fill(query);
  await page.waitForTimeout(50);
}

function cardById(page: Page, id: number) {
  return page.locator(".pokemon-card").filter({
    has: page.getByText(`N° ${id}`, { exact: true }),
  });
}

async function selectPokemonById(page: Page, id: number) {
  await cardById(page, id).click();
}

async function findAndSelectPokemon(
  page: Page,
  searchQuery: string,
  id: number,
) {
  await searchPokemon(page, searchQuery);
  await expect(cardById(page, id)).toBeVisible();
  await selectPokemonById(page, id);
}

function isMobileProject(projectName: string) {
  return projectName === "mobile";
}

/** Next.js dev tools overlay can block pointer events in dev mode. */
async function dismissNextDevOverlay(page: Page) {
  const closeBtn = page.getByRole("button", { name: /close next\.js dev tools/i });
  if (await closeBtn.isVisible().catch(() => false)) {
    await closeBtn.click();
  }
}

test.describe("Phase 1 — core UI", () => {
  test("initial load shows pokemon grid", async ({ page }) => {
    await waitForAppReady(page);
    const cards = page.locator(".pokemon-card");
    await expect(cards.first()).toBeVisible();
    expect(await cards.count()).toBeGreaterThanOrEqual(30);
    await expect(cards.first().locator("img")).toBeVisible();
  });

  test("empty detail state on desktop", async ({ page }, testInfo) => {
    test.skip(
      isMobileProject(testInfo.project.name),
      "Mobile hides empty detail panel until selection",
    );
    await waitForAppReady(page);
    await expect(page.locator(".pokemon-detail-empty")).toContainText(
      "Select a Pokemon",
    );
    await expect(page.locator(".detail-empty-sprite img")).toHaveAttribute(
      "src",
      /no-pokemon-selected\.png/,
    );
  });

  test("select Pikachu shows detail", async ({ page }) => {
    await waitForAppReady(page);
    await findAndSelectPokemon(page, "pikachu", 25);
    await expect(page.locator(".detail-name")).toHaveText("Pikachu", {
      timeout: 15_000,
    });
    await expect(page.locator(".detail-id")).toHaveText("N° 25");
    await expect(page.locator(".detail-stats .stat-row")).toHaveCount(7);
    await expect(page.locator(".stat-pill-item")).toHaveCount(6);
    await expect(page.locator(".animated-sprite")).toBeVisible();
  });

  test("selected card highlight", async ({ page }) => {
    await waitForAppReady(page);
    await findAndSelectPokemon(page, "pikachu", 25);
    await expect(cardById(page, 25)).toHaveClass(/pokemon-card-selected/);
  });

  test("rapid switching keeps detail in sync", async ({ page }, testInfo) => {
    test.skip(
      isMobileProject(testInfo.project.name),
      "Mobile modal blocks list clicks until closed",
    );
    await waitForAppReady(page);
    await selectPokemonById(page, 1);
    await selectPokemonById(page, 6);
    await expect(page.locator(".detail-name")).toHaveText("Charizard", {
      timeout: 15_000,
    });
  });

  test("no uncaught console errors on happy path", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await waitForAppReady(page);
    await findAndSelectPokemon(page, "pikachu", 25);
    await expect(page.locator(".detail-name")).toHaveText("Pikachu");
    expect(errors).toEqual([]);
  });
});

test.describe("Phase 2 — search and scroll", () => {
  test("search filters list", async ({ page }) => {
    await waitForAppReady(page);
    await searchPokemon(page, "pika");
    await expect(cardById(page, 25)).toBeVisible();
    await expect(cardById(page, 1)).toHaveCount(0);
  });

  test("scroll loads more pokemon", async ({ page }) => {
    await waitForAppReady(page);
    const before = await page.locator(".pokemon-card").count();
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect.poll(async () => page.locator(".pokemon-card").count()).toBeGreaterThan(
      before,
    );
  });
});

test.describe("Phase 3 — layout polish", () => {
  test("grid row sprites do not overlap card above", async ({ page }, testInfo) => {
    test.skip(
      isMobileProject(testInfo.project.name),
      "Desktop grid column layout required",
    );
    await page.setViewportSize({ width: 1400, height: 900 });
    await waitForAppReady(page);

    const cards = page.locator(".pokemon-card");
    await expect(cards.nth(4)).toBeVisible();

    const firstRowCard = cards.nth(0);
    const secondRowCard = cards.nth(4);
    const sprite = secondRowCard.locator(".pokemon-card-sprite");

    const firstRowBox = await firstRowCard.boundingBox();
    const spriteBox = await sprite.boundingBox();
    expect(firstRowBox).not.toBeNull();
    expect(spriteBox).not.toBeNull();

    const firstRowBottom = firstRowBox!.y + firstRowBox!.height;
    expect(spriteBox!.y).toBeGreaterThanOrEqual(firstRowBottom - 1);
  });

  test("desktop list uses full width beside detail panel", async ({ page }, testInfo) => {
    test.skip(
      isMobileProject(testInfo.project.name),
      "Desktop grid column layout required",
    );
    await page.setViewportSize({ width: 1400, height: 900 });
    await waitForAppReady(page);

    const listBox = await page.locator(".pokemon-list").boundingBox();
    const cardBox = await page.locator(".pokemon-card").first().boundingBox();
    expect(listBox).not.toBeNull();
    expect(cardBox).not.toBeNull();
    expect(listBox!.width).toBeGreaterThanOrEqual(620);
    expect(cardBox!.width).toBeGreaterThanOrEqual(140);
  });

  test("desktop detail sidebar is visible when empty", async ({ page }, testInfo) => {
    test.skip(
      isMobileProject(testInfo.project.name),
      "Desktop-only sidebar",
    );
    await page.setViewportSize({ width: 1400, height: 900 });
    await waitForAppReady(page);

    const sidebar = page.locator(".pokemon-detail-empty");
    await expect(sidebar).toBeVisible();
    await expect(sidebar).toContainText("Select a Pokemon");

    const box = await sidebar.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(400);
    expect(box!.x).toBeGreaterThanOrEqual(800);
  });

  test("desktop detail sidebar is visible when pokemon selected", async ({ page }, testInfo) => {
    test.skip(
      isMobileProject(testInfo.project.name),
      "Desktop-only sidebar",
    );
    await page.setViewportSize({ width: 1400, height: 900 });
    await waitForAppReady(page);
    await findAndSelectPokemon(page, "charmander", 4);

    const sidebar = page.locator(".pokemon-detail-panel");
    await expect(sidebar).toBeVisible();
    await expect(page.locator(".detail-name")).toHaveText("Charmander", {
      timeout: 15_000,
    });

    const box = await sidebar.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(400);
    expect(box!.x).toBeGreaterThanOrEqual(800);
  });

  test("desktop detail shows large animated sprite", async ({ page }, testInfo) => {
    test.skip(
      isMobileProject(testInfo.project.name),
      "Desktop-only sidebar",
    );
    await page.setViewportSize({ width: 1400, height: 900 });
    await waitForAppReady(page);
    await findAndSelectPokemon(page, "pikachu", 25);

    const detailSprite = page.locator(
      ".pokemon-detail-panel .detail-sprite-wrapper .animated-sprite",
    );
    await expect(detailSprite).toBeVisible({ timeout: 15_000 });
    await page.waitForFunction(() => {
      const img = document.querySelector<HTMLImageElement>(
        ".pokemon-detail-panel .detail-sprite-wrapper .animated-sprite",
      );
      return Boolean(img?.complete && img.naturalHeight > 0 && img.style.height);
    });

    const detailBox = await detailSprite.boundingBox();
    const gridSprite = page
      .locator(".pokemon-card")
      .filter({ has: page.getByText("N° 25", { exact: true }) })
      .locator("img")
      .first();
    const gridBox = await gridSprite.boundingBox();
    expect(detailBox).not.toBeNull();
    expect(gridBox).not.toBeNull();
    expect(detailBox!.height).toBeGreaterThan(gridBox!.height);
    expect(detailBox!.height).toBeLessThan(280);
  });

  test("desktop detail sprite stays visible when card scrolls", async ({ page }, testInfo) => {
    test.skip(
      isMobileProject(testInfo.project.name),
      "Desktop-only sidebar scroll",
    );
    await page.setViewportSize({ width: 1400, height: 900 });
    await waitForAppReady(page);
    await page.evaluate(() => window.scrollTo(0, 0));
    await findAndSelectPokemon(page, "wigglytuff", 40);

    await expect(page.locator(".detail-name")).toHaveText("Wigglytuff", {
      timeout: 15_000,
    });

    const detailCard = page.locator(".pokemon-detail-panel .detail-card");
    const sprite = page.locator(
      ".pokemon-detail-panel .detail-sprite-wrapper .animated-sprite",
    );
    await expect(sprite).toBeVisible({ timeout: 15_000 });
    await page.waitForFunction(() => {
      const img = document.querySelector<HTMLImageElement>(
        ".pokemon-detail-panel .detail-sprite-wrapper .animated-sprite",
      );
      return Boolean(img?.complete && img.naturalHeight > 0 && img.style.height);
    });

    // Shorter viewport height forces .detail-card scroll at 88vh panel (Part D compact layout).
    await page.setViewportSize({ width: 1400, height: 620 });

    const boxBefore = await sprite.boundingBox();
    expect(boxBefore).not.toBeNull();

    const panelRelativeBefore = await sprite.evaluate((el) => {
      const panel = el.closest(".pokemon-detail-panel");
      if (!panel) return null;
      const spriteRect = el.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      return {
        top: spriteRect.top - panelRect.top,
        left: spriteRect.left - panelRect.left,
      };
    });
    expect(panelRelativeBefore).not.toBeNull();

    const scrollBefore = await detailCard.evaluate((el) => el.scrollTop);
    await detailCard.evaluate((el) => {
      el.scrollTop = el.scrollHeight;
    });
    expect(await detailCard.evaluate((el) => el.scrollTop)).toBeGreaterThan(
      scrollBefore,
    );

    const boxAfter = await sprite.boundingBox();
    expect(boxAfter).not.toBeNull();

    const panelRelativeAfter = await sprite.evaluate((el) => {
      const panel = el.closest(".pokemon-detail-panel");
      if (!panel) return null;
      const spriteRect = el.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      return {
        top: spriteRect.top - panelRect.top,
        left: spriteRect.left - panelRect.left,
      };
    });
    expect(panelRelativeAfter).not.toBeNull();
    expect(panelRelativeAfter!.top).toBeCloseTo(panelRelativeBefore!.top, 0);
    expect(panelRelativeAfter!.left).toBeCloseTo(panelRelativeBefore!.left, 0);
    await expect(sprite).toBeVisible();

    const viewport = page.viewportSize()!;
    const viewportBox = {
      x: 0,
      y: 0,
      width: viewport.width,
      height: viewport.height,
    };
    expect(boxesIntersect(boxAfter!, viewportBox)).toBe(true);
  });

  test("search scrolls away and back-to-top shortcut appears", async ({ page }, testInfo) => {
    test.skip(
      isMobileProject(testInfo.project.name),
      "Desktop scroll shortcut",
    );
    await page.setViewportSize({ width: 1400, height: 900 });
    await waitForAppReady(page);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect.poll(async () => page.locator(".pokemon-card").count()).toBeGreaterThan(30);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect.poll(async () => page.evaluate(() => window.scrollY)).toBeGreaterThan(900);

    const searchBox = await page.locator(".search-bar").boundingBox();
    expect(searchBox).not.toBeNull();
    expect(searchBox!.y).toBeLessThan(0);

    const backToTop = page.getByRole("button", { name: /back to top/i });
    await expect(backToTop).toBeVisible({ timeout: 5000 });
    await dismissNextDevOverlay(page);
    // Native click via evaluate fires React onClick; avoids dev-overlay interception.
    await page.evaluate(() => {
      document.querySelector<HTMLButtonElement>(".back-to-top")?.click();
    });
    await expect
      .poll(async () => page.evaluate(() => window.scrollY), { timeout: 10_000 })
      .toBe(0);
  });
});

type BoundingBox = NonNullable<Awaited<ReturnType<Page["locator"]>["boundingBox"]>>;

function boxesIntersect(a: BoundingBox, b: BoundingBox): boolean {
  return !(
    a.x + a.width <= b.x ||
    b.x + b.width <= a.x ||
    a.y + a.height <= b.y ||
    b.y + b.height <= a.y
  );
}

function isFullyWithinViewport(
  element: BoundingBox,
  container: BoundingBox,
  tolerance = 0,
): boolean {
  const elementBottom = element.y + element.height;
  const containerBottom = container.y + container.height;
  return (
    element.y >= container.y - tolerance &&
    elementBottom <= containerBottom + tolerance
  );
}

async function scrollDetailCardToBottom(page: Page) {
  const detailCard = page.locator(".pokemon-detail-panel .detail-card");
  await detailCard.evaluate((el) => {
    el.scrollTop = el.scrollHeight;
  });
  await page.waitForTimeout(50);
}

test.describe("Phase 4 — layout overlap", () => {
  test("first-row sprites clear search bar at scroll top", async ({ page }, testInfo) => {
    test.skip(
      isMobileProject(testInfo.project.name),
      "Desktop layout overlap check",
    );
    await page.setViewportSize({ width: 1400, height: 900 });
    await waitForAppReady(page);
    await expect.poll(async () => page.evaluate(() => window.scrollY)).toBe(0);

    const searchBar = page.locator(".search-bar");
    const firstSprite = page.locator(".pokemon-card-sprite").first();
    await expect(firstSprite).toBeVisible();

    const searchBox = await searchBar.boundingBox();
    const spriteBox = await firstSprite.boundingBox();
    expect(searchBox).not.toBeNull();
    expect(spriteBox).not.toBeNull();

    const searchBottom = searchBox!.y + searchBox!.height;
    const spriteBottom = spriteBox!.y + spriteBox!.height;
    expect(spriteBottom).toBeGreaterThanOrEqual(searchBottom);
  });

  test("back-to-top does not overlap pokemon cards", async ({ page }, testInfo) => {
    test.skip(
      isMobileProject(testInfo.project.name),
      "Desktop layout overlap check",
    );
    await page.setViewportSize({ width: 1400, height: 900 });
    await waitForAppReady(page);
    await page.evaluate(() => window.scrollTo(0, window.innerHeight + 1));
    await expect.poll(async () => page.evaluate(() => window.scrollY)).toBeGreaterThan(900);

    const backToTop = page.locator(".back-to-top");
    await expect(backToTop).toBeVisible({ timeout: 5000 });

    const buttonBox = await backToTop.boundingBox();
    expect(buttonBox).not.toBeNull();

    const position = await backToTop.evaluate((el) => {
      const style = getComputedStyle(el);
      return {
        right: parseFloat(style.right),
        left: parseFloat(style.left),
      };
    });
    expect(position.right).toBeLessThan(100);
    expect(position.right).toBeGreaterThan(0);
    expect(position.left).toBeGreaterThan(page.viewportSize()!.width - 200);

    const sidebar = page.locator(".pokemon-detail-empty, .pokemon-detail-panel").first();
    const sidebarBox = await sidebar.boundingBox();

    const cards = page.locator(".pokemon-card");
    const count = await cards.count();
    for (let i = 0; i < count; i++) {
      const cardBox = await cards.nth(i).boundingBox();
      if (cardBox) {
        expect(boxesIntersect(buttonBox!, cardBox)).toBe(false);
      }
    }

    if (sidebarBox) {
      expect(boxesIntersect(buttonBox!, sidebarBox)).toBe(false);
    }
  });

  test("desktop detail panel flush with viewport bottom", async ({ page }, testInfo) => {
    test.skip(
      isMobileProject(testInfo.project.name),
      "Desktop panel flush check",
    );
    await page.setViewportSize({ width: 1400, height: 900 });
    await waitForAppReady(page);
    await findAndSelectPokemon(page, "pikachu", 25);
    await expect(page.locator(".detail-name")).toHaveText("Pikachu", {
      timeout: 15_000,
    });

    const panel = page.locator(".pokemon-detail-panel");
    await expect(panel).toBeVisible();
    const panelBox = await panel.boundingBox();
    const viewport = page.viewportSize()!;
    expect(panelBox).not.toBeNull();
    expect(panelBox!.y + panelBox!.height).toBeGreaterThanOrEqual(
      viewport.height - 2,
    );
  });

  test("detail stats and evolution fully visible at scroll bottom", async ({ page }, testInfo) => {
    test.skip(
      isMobileProject(testInfo.project.name),
      "Desktop detail scroll check",
    );
    await page.setViewportSize({ width: 1400, height: 900 });
    await waitForAppReady(page);
    await selectPokemonById(page, 1);

    await expect(page.locator(".detail-name")).toHaveText("Bulbasaur", {
      timeout: 15_000,
    });
    await expect(page.locator(".detail-evolution")).toBeVisible({ timeout: 15_000 });
    await expect(page.locator(".stat-pill-tot-wrap")).toBeVisible();

    const detailCard = page.locator(".pokemon-detail-panel .detail-card");
    await scrollDetailCardToBottom(page);

    const cardBox = await detailCard.boundingBox();
    const evolutionBox = await page.locator(".detail-evolution").boundingBox();
    const totBox = await page.locator(".stat-pill-tot-wrap").boundingBox();
    expect(cardBox).not.toBeNull();
    expect(evolutionBox).not.toBeNull();
    expect(totBox).not.toBeNull();

    expect(isFullyWithinViewport(evolutionBox!, cardBox!)).toBe(true);
    expect(isFullyWithinViewport(totBox!, cardBox!)).toBe(true);
  });

  test("detail sprite does not overlap detail id at scroll top", async ({ page }, testInfo) => {
    test.skip(
      isMobileProject(testInfo.project.name),
      "Desktop detail sprite overlap check",
    );
    await page.setViewportSize({ width: 1400, height: 900 });
    await waitForAppReady(page);
    await selectPokemonById(page, 3);

    await expect(page.locator(".detail-name")).toHaveText("Venusaur", {
      timeout: 15_000,
    });

    const detailCard = page.locator(".pokemon-detail-panel .detail-card");
    await detailCard.evaluate((el) => {
      el.scrollTop = 0;
    });

    const sprite = page.locator(
      ".pokemon-detail-panel .detail-sprite-wrapper .animated-sprite",
    );
    await expect(sprite).toBeVisible({ timeout: 15_000 });

    const spriteBox = await sprite.boundingBox();
    const detailIdBox = await page.locator(".detail-id").boundingBox();
    expect(spriteBox).not.toBeNull();
    expect(detailIdBox).not.toBeNull();

    const spriteBottom = spriteBox!.y + spriteBox!.height;
    const detailIdTop = detailIdBox!.y;
    expect(spriteBottom).toBeLessThanOrEqual(detailIdTop - 4);
  });

  test("kadabra sprite clears detail id at scroll top", async ({ page }, testInfo) => {
    test.skip(
      isMobileProject(testInfo.project.name),
      "Desktop detail sprite overlap check",
    );
    await page.setViewportSize({ width: 1400, height: 900 });
    await waitForAppReady(page);
    await findAndSelectPokemon(page, "kadabra", 64);

    await expect(page.locator(".detail-name")).toHaveText("Kadabra", {
      timeout: 15_000,
    });

    const detailCard = page.locator(".pokemon-detail-panel .detail-card");
    await detailCard.evaluate((el) => {
      el.scrollTop = 0;
    });

    const sprite = page.locator(
      ".pokemon-detail-panel .detail-sprite-wrapper .animated-sprite",
    );
    await expect(sprite).toBeVisible({ timeout: 15_000 });

    const spriteBox = await sprite.boundingBox();
    const detailIdBox = await page.locator(".detail-id").boundingBox();
    expect(spriteBox).not.toBeNull();
    expect(detailIdBox).not.toBeNull();

    const spriteBottom = spriteBox!.y + spriteBox!.height;
    const detailIdTop = detailIdBox!.y;
    expect(spriteBottom).toBeLessThanOrEqual(detailIdTop - 4);
  });
});

test.describe("Mobile layout", () => {
  test("detail opens as modal with close", async ({ page }, testInfo) => {
    test.skip(
      !isMobileProject(testInfo.project.name),
      "Mobile-only modal behavior",
    );
    await waitForAppReady(page);
    await findAndSelectPokemon(page, "pikachu", 25);
    await expect(page.locator(".pokemon-detail-panel")).toBeVisible();
    await page.getByRole("button", { name: /close pokémon details/i }).click();
    await expect(page.locator(".pokemon-detail-panel")).toBeHidden();
  });
});

test.describe("Phase 5 — PWA features", () => {
  test("favorites toggle and filter", async ({ page }) => {
    await waitForAppReady(page);
    await searchPokemon(page, "pikachu");
    const card = cardById(page, 25);
    await expect(card).toBeVisible();

    const star = card.locator(".favorite-btn");
    await star.click();
    await expect(star).toHaveClass(/favorite-btn-active/);

    await page.getByRole("button", { name: /★ favorites/i }).click();
    await expect(cardById(page, 25)).toBeVisible();
    await expect(cardById(page, 1)).toHaveCount(0);

    await star.click();
    await expect(page.locator(".pokemon-list-empty")).toBeVisible();
  });

  test("type filter narrows list", async ({ page }) => {
    await waitForAppReady(page);
    await page.getByRole("button", { name: "fire", exact: true }).click();
    await expect(
      page.getByRole("button", { name: "fire", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");

    await searchPokemon(page, "char");
    await expect(cardById(page, 4)).toBeVisible({ timeout: 15_000 });
    await expect(cardById(page, 1)).toHaveCount(0);
  });

  test("All and type filters are mutually exclusive", async ({ page }) => {
    await waitForAppReady(page);

    const allChip = page.getByRole("button", { name: "All", exact: true });
    const fireChip = page.getByRole("button", { name: "fire", exact: true });

    await expect(allChip).toHaveClass(/list-filter-chip-active/);
    await fireChip.click();

    await expect(fireChip).toHaveAttribute("aria-pressed", "true");
    await expect(allChip).not.toHaveClass(/list-filter-chip-active/);
    await expect(allChip).toHaveAttribute("aria-pressed", "false");

    await allChip.click();

    await expect(allChip).toHaveClass(/list-filter-chip-active/);
    await expect(allChip).toHaveAttribute("aria-pressed", "true");
    await expect(fireChip).toHaveAttribute("aria-pressed", "false");
  });

  test("hash deep link opens pokemon detail", async ({ page }) => {
    await page.goto("/#pokemon/25");
    await expect(page.locator(".loading-screen")).toBeHidden({ timeout: 60_000 });
    await expect(page.locator(".detail-name")).toHaveText("Pikachu", {
      timeout: 15_000,
    });
    await expect(page).toHaveURL(/#pokemon\/25/);
  });

  test("dark mode toggle switches theme", async ({ page }) => {
    await waitForAppReady(page);
    const toggle = page.locator(".theme-toggle");
    await expect(toggle).toBeVisible();

    await toggle.click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

    await toggle.click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  });
});
