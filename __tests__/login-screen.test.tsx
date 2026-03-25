import { fireEvent, render, screen } from "@testing-library/react";
import Login from "@/screens/Login";
import { authService } from "@/lib/services/authService";
import { toast } from "sonner";

const pushMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
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

jest.mock("@/lib/services/authService", () => ({
  authService: {
    loginAs: jest.fn(),
  },
}));

jest.mock("sonner", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
    info: jest.fn(),
  },
}));

describe("Login screen", () => {
  beforeEach(() => {
    pushMock.mockReset();
    (authService.loginAs as jest.Mock).mockReset();
    (toast.error as jest.Mock).mockReset();
  });

  it("toggles password visibility", () => {
    const { container } = render(<Login />);
    const passwordInput = screen.getByLabelText("Password") as HTMLInputElement;
    expect(passwordInput.type).toBe("password");

    const toggleButton = container.querySelector(
      "button.absolute",
    ) as HTMLButtonElement;
    fireEvent.click(toggleButton);
    expect((screen.getByLabelText("Password") as HTMLInputElement).type).toBe(
      "text",
    );
  });

  it("shows validation feedback when email is invalid and touched", () => {
    render(<Login />);

    const emailInput = screen.getByLabelText("Email");
    fireEvent.change(emailInput, { target: { value: "not-an-email" } });
    fireEvent.blur(emailInput);

    expect(
      screen.getByText("Enter a valid email address."),
    ).toBeInTheDocument();
  });

  it("logs in as selected role and routes to dashboard", () => {
    render(<Login />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "  USER@MAIL.COM  " },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Admin" }));
    fireEvent.click(screen.getByRole("button", { name: "Log In" }));

    expect(authService.loginAs).toHaveBeenCalledWith("admin");
    expect(pushMock).toHaveBeenCalledWith("/dashboard");
    expect(toast.error).not.toHaveBeenCalled();
  });
});
