import { render, screen } from "@testing-library/react";
import Logo from "@/components/Logo";

jest.mock("@/assets/logo.png", () => "logo.png");

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({
    alt,
    width,
    height,
    className,
  }: {
    alt: string;
    width: number;
    height: number;
    className?: string;
  }) => <img alt={alt} width={width} height={height} className={className} />,
}));

describe("Logo", () => {
  it("renders with defaults", () => {
    render(<Logo />);

    const img = screen.getByRole("img", { name: "ElderyCare" });
    expect(img).toHaveAttribute("width", "32");
    expect(img).toHaveAttribute("height", "32");
  });

  it("renders custom size and className", () => {
    render(<Logo size={48} className="custom" />);

    const img = screen.getByRole("img", { name: "ElderyCare" });
    expect(img).toHaveAttribute("width", "48");
    expect(img).toHaveAttribute("height", "48");
    expect(img).toHaveClass("custom");
  });
});
