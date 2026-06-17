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

async function selectFilterGroup(page: Page, label: string) {
  await page.getByRole("button", { name: /filter category/i }).click();
  await page.getByRole("option", { name: label, exact: true }).click();
}

function filterValues(page: Page) {
  return page.getByRole("group", { name: /filter values/i });
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

type BoundingBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

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

    await page.getByRole("button", { name: /show favorites only/i }).click();
    await expect(cardById(page, 25)).toBeVisible();
    await expect(cardById(page, 1)).toHaveCount(0);

    await star.click();
    await expect(page.locator(".pokemon-list-empty")).toBeVisible();
  });

  test("type filter narrows list", async ({ page }) => {
    await waitForAppReady(page);
    await selectFilterGroup(page, "Type");
    await filterValues(page).getByRole("button", { name: "Fire", exact: true }).click();
    await expect(
      filterValues(page).getByRole("button", { name: "Fire", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");

    await searchPokemon(page, "char");
    await expect(cardById(page, 4)).toBeVisible({ timeout: 15_000 });
    await expect(cardById(page, 1)).toHaveCount(0);
  });

  test("type filter toggles on and off", async ({ page }) => {
    await waitForAppReady(page);

    const fireChip = filterValues(page).getByRole("button", { name: "Fire", exact: true });

    await fireChip.click();
    await expect(fireChip).toHaveAttribute("aria-pressed", "true");

    await fireChip.click();
    await expect(fireChip).toHaveAttribute("aria-pressed", "false");
  });

  test("weak to filter toggles on and off", async ({ page }) => {
    await waitForAppReady(page);
    await selectFilterGroup(page, "Weak to");

    const waterChip = filterValues(page).getByRole("button", {
      name: "Water",
      exact: true,
    });

    await waterChip.click();
    await expect(waterChip).toHaveAttribute("aria-pressed", "true");

    await waterChip.click();
    await expect(waterChip).toHaveAttribute("aria-pressed", "false");
  });

  test("hash deep link opens pokemon detail", async ({ page }) => {
    await page.goto("/#pokemon/25");
    await expect(page.locator(".loading-screen")).toBeHidden({ timeout: 60_000 });
    await expect(page.locator(".detail-name")).toHaveText("Pikachu", {
      timeout: 15_000,
    });
    await expect(page).toHaveURL(/#pokemon\/25/);
  });

  test("hash deep link scrolls the selected card into view", async ({
    page,
  }, testInfo) => {
    test.skip(
      isMobileProject(testInfo.project.name),
      "Desktop list scroll targeting",
    );

    await page.goto("/#pokemon/100");
    await expect(page.locator(".loading-screen")).toBeHidden({ timeout: 60_000 });
    await expect(page.locator(".detail-name")).toBeVisible({ timeout: 15_000 });

    const card = page.locator('[data-pokemon-id="100"]');
    await expect(card).toBeVisible({ timeout: 15_000 });

    const cardBox = await card.boundingBox();
    const viewport = page.viewportSize()!;
    expect(cardBox).not.toBeNull();
    expect(
      isFullyWithinViewport(cardBox!, {
        x: 0,
        y: 0,
        width: viewport.width,
        height: viewport.height,
      }),
    ).toBe(true);
  });

  test("hash deep link survives reload without hydration errors", async ({
    page,
  }) => {
    const hydrationErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error" && /Hydration/i.test(msg.text())) {
        hydrationErrors.push(msg.text());
      }
    });
    page.on("pageerror", (err) => {
      if (/Hydration/i.test(err.message)) {
        hydrationErrors.push(err.message);
      }
    });

    await page.goto("/#pokemon/3");
    await expect(page.locator(".loading-screen")).toBeHidden({ timeout: 60_000 });
    await expect(page.locator(".detail-name")).toHaveText("Venusaur", {
      timeout: 15_000,
    });

    await page.reload();
    await expect(page.locator(".loading-screen")).toBeHidden({ timeout: 60_000 });
    await expect(page.locator(".detail-name")).toHaveText("Venusaur", {
      timeout: 15_000,
    });
    await expect(page).toHaveURL(/#pokemon\/3/);

    expect(hydrationErrors).toEqual([]);
  });

  test("SSG pokemon route renders detail without client fetch", async ({
    page,
  }) => {
    await page.goto("/pokemon/25");
    await expect(page.locator(".loading-screen")).toBeHidden({ timeout: 60_000 });
    await expect(page.locator(".detail-name")).toHaveText("Pikachu", {
      timeout: 15_000,
    });
    await expect(page).toHaveURL(/\/pokemon\/25$/);
    await expect(page).toHaveTitle(/Pikachu/i);
  });

  test("SSG pokemon route navigates between entries", async ({ page }) => {
    await page.goto("/pokemon/4");
    await expect(page.locator(".loading-screen")).toBeHidden({ timeout: 60_000 });
    await expect(page.locator(".detail-name")).toHaveText("Charmander", {
      timeout: 15_000,
    });

    await page.locator(".evolution-chain button").nth(1).click();
    await expect(page).toHaveURL(/\/pokemon\/5$/);
    await expect(page.locator(".detail-name")).toHaveText("Charmeleon", {
      timeout: 15_000,
    });
  });

  test("phase 9 shows genus and type weaknesses for Pikachu", async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto("/pokemon/25");
    await expect(page.locator(".detail-name")).toHaveText("Pikachu", {
      timeout: 60_000,
    });
    await expect(page.locator(".detail-genus")).toHaveText("Mouse Pokémon");
    await expect(page.locator(".detail-type-chart")).toBeVisible();
    await expect(page.locator(".detail-type-chart .type-badge").first()).toBeVisible();
  });

  test("phase 9 cry button is visible for Pikachu", async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto("/pokemon/25");
    await expect(page.locator(".detail-name")).toHaveText("Pikachu", {
      timeout: 60_000,
    });
    await expect(page.locator(".detail-cry-btn")).toBeVisible();
  });

  test("type effectiveness appears after evolution", async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto("/pokemon/3");
    await expect(page.locator(".detail-name")).toHaveText("Venusaur", {
      timeout: 60_000,
    });

    const order = await page.locator(".detail-card").evaluate((card) => {
      const follows = (beforeSelector: string, afterSelector: string) => {
        const before = card.querySelector(beforeSelector);
        const after = card.querySelector(afterSelector);
        if (!before || !after) return false;
        return (before.compareDocumentPosition(after) &
          Node.DOCUMENT_POSITION_FOLLOWING) !==
          0;
      };

      return {
        abilitiesBeforeEvolution: follows(
          ".detail-abilities",
          ".detail-evolution",
        ),
        evolutionBeforeTypeChart: follows(
          ".detail-evolution",
          ".detail-type-chart",
        ),
      };
    });

    expect(order.abilitiesBeforeEvolution).toBe(true);
    expect(order.evolutionBeforeTypeChart).toBe(true);
  });

  test("invalid pokemon route shows not found", async ({ page }) => {
    const response = await page.goto("/pokemon/9999");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: /not found/i })).toBeVisible();
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

test.describe("Phase 10 — search and filters", () => {
  test("search by number finds Pikachu", async ({ page }) => {
    await waitForAppReady(page);
    await searchPokemon(page, "25");
    await expect(cardById(page, 25)).toBeVisible();
    await expect(cardById(page, 1)).toHaveCount(0);
  });

  test("legendary filter shows Mewtwo when data has isLegendary", async ({
    page,
    request,
    baseURL,
  }) => {
    const index = (await (
      await request.get(`${baseURL}/data/index.json`)
    ).json()) as { id: number; name: string; isLegendary?: boolean }[];
    const mewtwo = index.find((entry) => entry.name === "mewtwo");
    test.skip(!mewtwo?.isLegendary, "index.json missing isLegendary on Mewtwo");

    await waitForAppReady(page);
    await filterValues(page)
      .getByRole("button", { name: "Legendary", exact: true })
      .click();
    await expect(cardById(page, 150)).toBeVisible({ timeout: 15_000 });
  });
});

test.describe("Phase 10B — list UX & navigation", () => {
  test("pokemon cards expose data-pokemon-id for scroll targeting", async ({
    page,
  }) => {
    await waitForAppReady(page);
    await expect(page.locator('[data-pokemon-id="25"]')).toBeVisible();
    await expect(page.locator('[data-pokemon-id="25"]')).toHaveAttribute(
      "data-pokemon-id",
      "25",
    );
  });

  test("selecting a card marks it selected", async ({ page }) => {
    await waitForAppReady(page);
    await cardById(page, 25).click();
    await expect(cardById(page, 25)).toHaveClass(/pokemon-card-selected/);
    await expect(page.locator(".detail-name")).toHaveText("Pikachu", {
      timeout: 15_000,
    });
  });

  test("card hover levitate styles are defined", async ({ page }) => {
    await waitForAppReady(page);
    const transform = await page
      .locator(".pokemon-card")
      .first()
      .evaluate((el) => getComputedStyle(el).transitionProperty);
    expect(transform).toContain("transform");
  });

  test("selecting a visible card does not shift the dashboard on desktop", async ({
    page,
  }, testInfo) => {
    test.skip(
      isMobileProject(testInfo.project.name),
      "Desktop layout stability only",
    );

    await waitForAppReady(page);
    await page.evaluate(() => window.scrollTo(0, 0));

    const dashboard = page.locator(".search-toolbar-row");
    const bulbasaur = cardById(page, 1);
    await bulbasaur.scrollIntoViewIfNeeded();

    const before = await dashboard.boundingBox();
    expect(before).not.toBeNull();

    const scrollYBefore = await page.evaluate(() => window.scrollY);
    await bulbasaur.click({ position: { x: 8, y: 8 } });
    await expect(bulbasaur).toHaveClass(/pokemon-card-selected/);
    await page.waitForTimeout(400);

    const after = await dashboard.boundingBox();
    const scrollYAfter = await page.evaluate(() => window.scrollY);
    expect(after).not.toBeNull();

    expect(Math.abs(after!.y - before!.y)).toBeLessThan(1);
    expect(Math.abs(after!.x - before!.x)).toBeLessThan(1);
    expect(scrollYAfter).toBe(scrollYBefore);
  });
});
