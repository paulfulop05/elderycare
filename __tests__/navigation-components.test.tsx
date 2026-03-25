import { fireEvent, render, screen } from "@testing-library/react";
import HealthProgressQuickButton from "@/components/HealthProgressQuickButton";
import { NavLink } from "@/components/NavLink";

const pushMock = jest.fn();
let mockPathname = "/dashboard";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: () => mockPathname,
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    href,
    className,
    children,
  }: {
    href: string;
    className?: string;
    children: React.ReactNode;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

describe("navigation components", () => {
  beforeEach(() => {
    pushMock.mockReset();
    mockPathname = "/dashboard";
  });

  it("navigates to health progress when quick button is clicked", () => {
    render(<HealthProgressQuickButton />);

    fireEvent.click(
      screen.getByRole("button", { name: "Open Health Progress" }),
    );
    expect(pushMock).toHaveBeenCalledWith("/health-progress");
  });

  it("applies active class when href matches pathname", () => {
    render(
      <NavLink href="/dashboard" className="base" activeClassName="active">
        Dashboard
      </NavLink>,
    );

    expect(screen.getByRole("link", { name: "Dashboard" }).className).toContain(
      "active",
    );
  });

  it("does not apply active class when href does not match pathname", () => {
    mockPathname = "/login";
    render(
      <NavLink href="/dashboard" className="base" activeClassName="active">
        Dashboard
      </NavLink>,
    );

    expect(
      screen.getByRole("link", { name: "Dashboard" }).className,
    ).not.toContain("active");
  });
});
