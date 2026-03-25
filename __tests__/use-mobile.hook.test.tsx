import { act, render, screen } from "@testing-library/react";
import { useIsMobile } from "@/hooks/use-mobile";

const listeners = new Set<() => void>();

const setViewportWidth = (width: number) => {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    writable: true,
    value: width,
  });
};

const triggerMediaChange = () => {
  listeners.forEach((listener) => listener());
};

beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: () => ({
      matches: false,
      media: "(max-width: 767px)",
      onchange: null,
      addEventListener: (_: string, cb: () => void) => listeners.add(cb),
      removeEventListener: (_: string, cb: () => void) => listeners.delete(cb),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }),
  });
});

const HookProbe = () => {
  const isMobile = useIsMobile();
  return <div>{isMobile ? "mobile" : "desktop"}</div>;
};

describe("useIsMobile", () => {
  it("returns false on desktop and true on mobile after media change", () => {
    setViewportWidth(1024);
    render(<HookProbe />);
    expect(screen.getByText("desktop")).toBeInTheDocument();

    act(() => {
      setViewportWidth(500);
      triggerMediaChange();
    });

    expect(screen.getByText("mobile")).toBeInTheDocument();
  });
});
