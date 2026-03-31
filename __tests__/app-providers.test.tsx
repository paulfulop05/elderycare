import { render, screen } from "@testing-library/react";
import AppProviders from "@/components/AppProviders";

const queryClientCtor = jest.fn();

jest.mock("@tanstack/react-query", () => ({
  QueryClient: jest.fn(() => {
    queryClientCtor();
    return { mock: true };
  }),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="query-client-provider">{children}</div>
  ),
}));

jest.mock("@/contexts/ThemeContext", () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="theme-provider">{children}</div>
  ),
}));

jest.mock("@/components/ui/tooltip", () => ({
  TooltipProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tooltip-provider">{children}</div>
  ),
}));

jest.mock("@/components/ui/toaster", () => ({
  Toaster: () => <div data-testid="toaster" />,
}));

jest.mock("@/components/ui/sonner", () => ({
  Toaster: () => <div data-testid="sonner" />,
}));

jest.mock("@/components/BrowserActivityMonitor", () => ({
  __esModule: true,
  default: () => <div data-testid="activity-monitor" />,
}));

describe("AppProviders", () => {
  it("wraps children with providers and renders toasters", () => {
    render(
      <AppProviders>
        <div>Child Content</div>
      </AppProviders>,
    );

    expect(screen.getByTestId("query-client-provider")).toBeInTheDocument();
    expect(screen.getByTestId("theme-provider")).toBeInTheDocument();
    expect(screen.getByTestId("tooltip-provider")).toBeInTheDocument();
    expect(screen.getByTestId("activity-monitor")).toBeInTheDocument();
    expect(screen.getByTestId("toaster")).toBeInTheDocument();
    expect(screen.getByTestId("sonner")).toBeInTheDocument();
    expect(screen.getByText("Child Content")).toBeInTheDocument();
  });

  it("creates query client once across rerenders", () => {
    const { rerender } = render(
      <AppProviders>
        <div>First</div>
      </AppProviders>,
    );

    rerender(
      <AppProviders>
        <div>Second</div>
      </AppProviders>,
    );

    expect(queryClientCtor).toHaveBeenCalledTimes(1);
  });
});
