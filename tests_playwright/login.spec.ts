import { expect, test, type Locator, type Page } from "@playwright/test";

const fillInputStable = async (input: Locator, value: string) => {
  for (let i = 0; i < 4; i++) {
    await input.fill(value);
    if ((await input.inputValue()) === value) {
      return;
    }
    await input.page().waitForTimeout(100);
  }
  await expect(input).toHaveValue(value);
};

test.describe("Login feature", () => {
  test("redirects unauthenticated dashboard access to login", async ({
    page,
  }) => {
    await page.goto("/dashboard");

    await expect(page).toHaveURL(/\/login/);
    await expect(
      page.getByRole("heading", { name: "Welcome back" }),
    ).toBeVisible();
  });

  test("validates login form and prevents invalid submit", async ({ page }) => {
    await page.goto("/login");
    await expect(
      page.getByRole("heading", { name: "Welcome back" }),
    ).toBeVisible();

    await fillInputStable(page.getByLabel("Email"), "not-an-email");
    await fillInputStable(page.getByLabel("Password"), "123456");
    await page.getByRole("button", { name: "Doctor" }).click();
    await expect(page.getByRole("button", { name: "Log In" })).toBeDisabled();
  });
});
