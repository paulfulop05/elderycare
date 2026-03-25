import { fireEvent, render, screen } from "@testing-library/react";
import SettingsTab from "@/components/dashboard/SettingsTab";
import { toast } from "sonner";

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

describe("SettingsTab", () => {
  beforeEach(() => {
    (toast.success as jest.Mock).mockReset();
    (toast.error as jest.Mock).mockReset();
    (toast.info as jest.Mock).mockReset();
  });

  it("changes username and returns to main section", () => {
    render(<SettingsTab />);

    fireEvent.click(screen.getByRole("button", { name: /Change Username/i }));
    fireEvent.change(screen.getByPlaceholderText("Enter new username"), {
      target: { value: "new_user" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(toast.success).toHaveBeenCalledWith("Username updated (prototype)");
    expect(
      screen.getByRole("button", { name: /Change Password/i }),
    ).toBeInTheDocument();
  });

  it("changes password when form is valid", () => {
    render(<SettingsTab />);

    fireEvent.click(screen.getByRole("button", { name: /Change Password/i }));
    fireEvent.change(screen.getAllByPlaceholderText("••••••••")[0], {
      target: { value: "oldpass123" },
    });
    fireEvent.change(screen.getAllByPlaceholderText("••••••••")[1], {
      target: { value: "newpass123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(toast.success).toHaveBeenCalledWith("Password changed (prototype)");
  });

  it("triggers delete account prototype info", () => {
    render(<SettingsTab />);

    fireEvent.click(screen.getByRole("button", { name: /Delete Account/i }));
    expect(toast.info).toHaveBeenCalledWith(
      "Account deletion is a prototype action.",
    );
  });
});
