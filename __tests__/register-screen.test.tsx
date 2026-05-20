import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Register from "@/screens/Register";
import { authService } from "@/lib/services/client/authService";
import { toast } from "sonner";

const pushMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, replace: jest.fn() }),
}));

jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  },
}));

jest.mock("@/components/Logo", () => ({
  __esModule: true,
  default: () => <div>Logo</div>,
}));

jest.mock("@/lib/services/client/authService", () => ({
  authService: {
    isLoggedIn: jest.fn(() => false),
    loginAs: jest.fn(),
    register: jest.fn(),
  },
}));

jest.mock("sonner", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
    info: jest.fn(),
  },
}));

describe("Register screen", () => {
  beforeEach(() => {
    pushMock.mockReset();
    (authService.loginAs as jest.Mock).mockReset();
    (authService.register as jest.Mock).mockReset();
    (authService.register as jest.Mock).mockResolvedValue({
      did: 21,
      name: "Dr. New",
      email: "new@care.com",
      role: "doctor",
    });
    (toast.error as jest.Mock).mockReset();
  });

  it("shows validation feedback when fields are invalid", () => {
    render(<Register />);

    fireEvent.blur(screen.getByLabelText("Full name"));

    expect(screen.getByText("Doctor name is required.")).toBeInTheDocument();
  });

  it("registers a new user and routes to dashboard", async () => {
    render(<Register />);

    fireEvent.change(screen.getByLabelText("Full name"), {
      target: { value: "Dr. New" },
    });
    fireEvent.change(screen.getByLabelText("Age"), {
      target: { value: "35" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "new@care.com" },
    });
    fireEvent.change(screen.getByLabelText("Phone number"), {
      target: { value: "+1 555 0101" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText("Confirm password"), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Doctor" }));
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() => {
      expect(authService.register).toHaveBeenCalledWith({
        name: "Dr. New",
        age: 35,
        email: "new@care.com",
        phone: "+1 555 0101",
        password: "password123",
        role: "doctor",
      });
    });

    expect(authService.loginAs).toHaveBeenCalledWith({
      did: 21,
      name: "Dr. New",
      email: "new@care.com",
      role: "doctor",
    });
    expect(pushMock).toHaveBeenCalledWith("/dashboard");
    expect(toast.error).not.toHaveBeenCalled();
  });
});
