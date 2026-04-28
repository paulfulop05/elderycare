import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import SettingsTab from "@/components/dashboard/SettingsTab";
import { toast } from "sonner";
import { doctorService } from "@/lib/services/client/doctorService";

jest.mock("@/lib/services/client/authService", () => ({
  authService: {
    getCurrentUser: jest.fn(() => ({
      did: 7,
      name: "Dr. Maria",
      email: "doc@mail.com",
      role: "doctor",
    })),
    setCurrentUserProfile: jest.fn(),
  },
}));

jest.mock("@/lib/services/client/doctorService", () => ({
  doctorService: {
    getById: jest.fn(),
    updateMyProfile: jest.fn(),
    updateMyPassword: jest.fn(),
  },
}));

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

    (doctorService.getById as jest.Mock).mockReset();
    (doctorService.updateMyProfile as jest.Mock).mockReset();
    (doctorService.updateMyPassword as jest.Mock).mockReset();

    (doctorService.getById as jest.Mock).mockResolvedValue({
      id: "7",
      name: "Dr. Maria",
      age: 41,
      email: "doc@mail.com",
      phone: "+1 555-0100",
      avatar: "DM",
    });

    (doctorService.updateMyProfile as jest.Mock).mockResolvedValue({
      did: 7,
      name: "Dr. Maria Updated",
      age: 42,
      email: "maria.updated@mail.com",
      phoneNumber: "+1 555-0200",
      role: "doctor",
    });

    (doctorService.updateMyPassword as jest.Mock).mockResolvedValue(undefined);
  });

  it("edits profile and returns to main section", async () => {
    render(<SettingsTab />);

    await waitFor(() => {
      expect(doctorService.getById).toHaveBeenCalledWith("7");
    });

    fireEvent.click(screen.getByRole("button", { name: /Edit Profile/i }));

    await waitFor(() => {
      expect(screen.getByDisplayValue("Dr. Maria")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText("Enter full name"), {
      target: { value: "Dr. Maria Updated" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter age"), {
      target: { value: "42" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter email"), {
      target: { value: "maria.updated@mail.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("+1 555-0000"), {
      target: { value: "+1 555-0200" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(doctorService.updateMyProfile).toHaveBeenCalledWith({
        did: "7",
        name: "Dr. Maria Updated",
        age: 42,
        email: "maria.updated@mail.com",
        phoneNumber: "+1 555-0200",
      });
      expect(toast.success).toHaveBeenCalledWith("Profile updated.");
    });

    expect(
      screen.getByRole("button", { name: /Change Password/i }),
    ).toBeInTheDocument();
  });

  it("changes password when form is valid", async () => {
    render(<SettingsTab />);

    await waitFor(() => {
      expect(doctorService.getById).toHaveBeenCalledWith("7");
    });

    fireEvent.click(screen.getByRole("button", { name: /Change Password/i }));
    fireEvent.change(screen.getAllByPlaceholderText("••••••••")[0], {
      target: { value: "oldpass123" },
    });
    fireEvent.change(screen.getAllByPlaceholderText("••••••••")[1], {
      target: { value: "newpass123" },
    });
    fireEvent.change(screen.getAllByPlaceholderText("••••••••")[2], {
      target: { value: "newpass123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(doctorService.updateMyPassword).toHaveBeenCalledWith(
        "7",
        "oldpass123",
        "newpass123",
      );
      expect(toast.success).toHaveBeenCalledWith("Password changed.");
    });
  });

  it("triggers delete account prototype info", () => {
    render(<SettingsTab />);

    return waitFor(() => {
      expect(doctorService.getById).toHaveBeenCalledWith("7");
    }).then(() => {
      fireEvent.click(screen.getByRole("button", { name: /Delete Account/i }));
      expect(toast.info).toHaveBeenCalledWith(
        "Account deletion is a prototype action.",
      );
    });
  });
});
