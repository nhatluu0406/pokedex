import { expect, test, type TestInfo } from "@playwright/test";
import {
  findAndSelectPokemon,
  waitForAppReady,
} from "./helpers";

function isDesktopProject(testInfo: TestInfo) {
  return testInfo.project.name === "desktop";
}

test.describe("Phase 7 — deploy hardening", () => {
  test("security headers on document response", async ({ page }) => {
    const response = await page.goto("/");
    expect(response).not.toBeNull();
    const headers = response!.headers();
    expect(headers["x-frame-options"]).toBe("SAMEORIGIN");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  });

  test("/data/index.json returns 200 with 1025+ entries when data committed", async ({
    request,
  }) => {
    const response = await request.get("/data/index.json");
    if (response.status() === 404) {
      test.skip(
        true,
        "public/data/ not committed — run npm run fetch-data first",
      );
    }
    expect(response.status()).toBe(200);
    const data: unknown = await response.json();
    expect(Array.isArray(data)).toBe(true);
    expect((data as unknown[]).length).toBeGreaterThanOrEqual(1025);
  });

  test("no pokeapi.co requests during normal browse", async ({
    page,
  }, testInfo) => {
    test.skip(!isDesktopProject(testInfo), "Desktop browse flow");
    await page.setViewportSize({ width: 1400, height: 900 });

    const pokeapiRequests: string[] = [];
    page.on("request", (req) => {
      if (req.url().includes("pokeapi.co")) {
        pokeapiRequests.push(req.url());
      }
    });

    await waitForAppReady(page);
    await findAndSelectPokemon(page, "pikachu", 25);
    await expect(page.locator(".detail-name")).toHaveText("Pikachu", {
      timeout: 15_000,
    });
    await findAndSelectPokemon(page, "bulbasaur", 1);
    await expect(page.locator(".detail-name")).toHaveText("Bulbasaur", {
      timeout: 15_000,
    });

    expect(pokeapiRequests).toEqual([]);
  });

  test("no raw.githubusercontent.com requests during normal browse", async ({
    page,
  }, testInfo) => {
    test.skip(!isDesktopProject(testInfo), "Desktop browse flow");
    await page.setViewportSize({ width: 1400, height: 900 });

    const githubRequests: string[] = [];
    page.on("request", (req) => {
      if (req.url().includes("raw.githubusercontent.com")) {
        githubRequests.push(req.url());
      }
    });

    await waitForAppReady(page);
    await findAndSelectPokemon(page, "pikachu", 25);
    await expect(page.locator(".detail-name")).toHaveText("Pikachu", {
      timeout: 15_000,
    });
    await findAndSelectPokemon(page, "bulbasaur", 1);
    await expect(page.locator(".detail-name")).toHaveText("Bulbasaur", {
      timeout: 15_000,
    });

    expect(githubRequests).toEqual([]);
  });

  test("/sprites/pokemon/25.png returns 200 when sprites committed", async ({
    request,
  }) => {
    const response = await request.get("/sprites/pokemon/25.png");
    if (response.status() === 404) {
      test.skip(
        true,
        "public/sprites/ not committed — run npm run fetch-sprites first",
      );
    }
    expect(response.status()).toBe(200);
  });
});
