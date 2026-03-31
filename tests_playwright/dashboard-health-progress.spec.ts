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

const loginAsRole = async (page: Page, role: "doctor" | "admin") => {
  await page.goto("/login");
  await expect(
    page.getByRole("heading", { name: "Welcome back" }),
  ).toBeVisible();

  const emailInput = page.getByLabel("Email");
  const passwordInput = page.getByLabel("Password");
  const loginButton = page.getByRole("button", { name: "Log In" });

  await expect(emailInput).toBeEditable();
  await expect(passwordInput).toBeEditable();

  for (let i = 0; i < 5; i++) {
    await fillInputStable(emailInput, "user@mail.com");
    await fillInputStable(passwordInput, "123456");
    await page
      .getByRole("button", {
        name: role === "admin" ? "Admin" : "Doctor",
      })
      .click();
    await page.waitForTimeout(100);
    if (await loginButton.isEnabled()) {
      break;
    }
  }

  await expect(loginButton).toBeEnabled();
  await loginButton.click();
  await expect(page).toHaveURL(/\/dashboard$/);
};

test.describe("Role-based dashboard and health progress", () => {
  test("shows admin tabs and supports health progress navigation", async ({
    page,
  }) => {
    await loginAsRole(page, "admin");

    await expect(page.getByRole("button", { name: "Doctors" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Patients" })).toBeVisible();

    await page.getByRole("button", { name: "Open Health Progress" }).click();
    await expect(page).toHaveURL(/\/health-progress$/);
    await expect(
      page.getByRole("heading", { name: "Health Progress Dashboard" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "60d" }).click();
    await expect(page.getByRole("button", { name: "60d" })).toBeVisible();

    await page.getByRole("button", { name: "Back to Dashboard" }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
  });
});
