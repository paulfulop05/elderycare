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

const loginAsDoctor = async (page: Page) => {
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
    await fillInputStable(emailInput, "doctor@mail.com");
    await fillInputStable(passwordInput, "123456");
    await page.getByRole("button", { name: "Doctor" }).click();
    await page.waitForTimeout(100);
    if (await loginButton.isEnabled()) {
      break;
    }
  }

  await expect(loginButton).toBeEnabled();
  await loginButton.click();
  await expect(page).toHaveURL(/\/dashboard$/);
};

test.describe("Appointment scheduling feature", () => {
  test("opens schedule dialog and shows validation feedback on empty submit", async ({
    page,
  }) => {
    await loginAsDoctor(page);

    await page.getByRole("button", { name: "Schedule" }).click();
    await expect(
      page.getByRole("heading", { name: "Add Appointment" }),
    ).toBeVisible();
    await expect(page.getByText("Select a date first.")).toBeVisible();

    await page.getByRole("button", { name: "Confirm" }).click();

    await expect(
      page.getByText("Please fix the following before scheduling:"),
    ).toBeVisible();
    await expect(page.getByText("- Patient name is required.")).toBeVisible();
    await expect(page.getByText("- Phone number is required.")).toBeVisible();
    await expect(page.getByText("- Reason is required.")).toBeVisible();
  });
});
