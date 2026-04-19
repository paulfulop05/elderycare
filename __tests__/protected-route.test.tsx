import { render, screen, waitFor } from "@testing-library/react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { authService } from "@/lib/services/client/authService";

const replaceMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
  usePathname: () => "/dashboard",
}));

jest.mock("@/lib/services/client/authService", () => ({
  authService: {
    isLoggedIn: jest.fn(),
    getCurrentUser: jest.fn(),
    logout: jest.fn(),
  },
}));

describe("ProtectedRoute", () => {
  beforeEach(() => {
    replaceMock.mockReset();
    (global.fetch as jest.Mock | undefined)?.mockReset?.();
  });

  it("renders children when authorized", async () => {
    (authService.isLoggedIn as jest.Mock).mockReturnValue(true);
    (authService.getCurrentUser as jest.Mock).mockReturnValue({
      did: 1,
      name: "Doctor",
      email: "doctor@elderycare.com",
      role: "doctor",
    });

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
    }) as unknown as typeof fetch;

    render(
      <ProtectedRoute>
        <div>Secret Content</div>
      </ProtectedRoute>,
    );

    await waitFor(() => {
      expect(screen.getByText("Secret Content")).toBeInTheDocument();
    });
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("redirects to login with return path when unauthorized", async () => {
    (authService.isLoggedIn as jest.Mock).mockReturnValue(false);

    const { container } = render(
      <ProtectedRoute>
        <div>Secret Content</div>
      </ProtectedRoute>,
    );

    expect(container).toBeEmptyDOMElement();

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/login?from=%2Fdashboard");
    });
  });

  it("logs out and redirects when account no longer exists", async () => {
    (authService.isLoggedIn as jest.Mock).mockReturnValue(true);
    (authService.getCurrentUser as jest.Mock).mockReturnValue({
      did: 42,
      name: "Deleted User",
      email: "deleted@elderycare.com",
      role: "doctor",
    });

    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
    }) as unknown as typeof fetch;

    render(
      <ProtectedRoute>
        <div>Secret Content</div>
      </ProtectedRoute>,
    );

    await waitFor(() => {
      expect(authService.logout).toHaveBeenCalled();
      expect(replaceMock).toHaveBeenCalledWith("/login?from=%2Fdashboard");
    });
  });
});
