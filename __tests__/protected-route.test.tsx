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
  },
}));

describe("ProtectedRoute", () => {
  beforeEach(() => {
    replaceMock.mockReset();
  });

  it("renders children when authorized", () => {
    (authService.isLoggedIn as jest.Mock).mockReturnValue(true);

    render(
      <ProtectedRoute>
        <div>Secret Content</div>
      </ProtectedRoute>,
    );

    expect(screen.getByText("Secret Content")).toBeInTheDocument();
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
});
