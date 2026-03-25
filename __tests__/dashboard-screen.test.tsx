import { fireEvent, render, screen } from "@testing-library/react";
import Dashboard from "@/screens/Dashboard";
import { authService } from "@/lib/services/authService";
import { useTheme } from "@/contexts/ThemeContext";

const pushMock = jest.fn();
const logoutMock = jest.fn();
const toggleThemeMock = jest.fn();
let roleMock: "doctor" | "admin" = "admin";

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

jest.mock("@/components/HealthProgressQuickButton", () => ({
  __esModule: true,
  default: () => <button type="button">Health Progress Quick</button>,
}));

jest.mock("@/components/dashboard/AppointmentsSection", () => ({
  __esModule: true,
  default: () => <div>Appointments Section</div>,
}));

jest.mock("@/components/dashboard/DoctorsTab", () => ({
  __esModule: true,
  default: () => <div>Doctors Tab</div>,
}));

jest.mock("@/components/dashboard/PatientsTab", () => ({
  __esModule: true,
  default: () => <div>Patients Tab</div>,
}));

jest.mock("@/components/dashboard/SettingsTab", () => ({
  __esModule: true,
  default: () => <div>Settings Tab</div>,
}));

jest.mock("@/components/dashboard/ScheduleDialog", () => ({
  __esModule: true,
  default: ({ open }: { open: boolean }) => (
    <div>{`Schedule Dialog Open: ${String(open)}`}</div>
  ),
}));

jest.mock("@/lib/services/authService", () => ({
  authService: {
    getUserRole: jest.fn(() => roleMock),
    logout: jest.fn(() => logoutMock()),
  },
}));

jest.mock("@/contexts/ThemeContext", () => ({
  useTheme: jest.fn(() => ({
    theme: "dark",
    toggleTheme: toggleThemeMock,
  })),
}));

describe("Dashboard screen", () => {
  beforeEach(() => {
    roleMock = "admin";
    pushMock.mockReset();
    logoutMock.mockReset();
    toggleThemeMock.mockReset();
  });

  it("renders role-based tabs for admin and switches tab content", () => {
    render(<Dashboard />);

    expect(
      screen.getByRole("button", { name: /Doctors/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Appointments Section")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Patients/i }));
    expect(screen.getByText("Patients Tab")).toBeInTheDocument();
  });

  it("hides doctors tab for doctor role", () => {
    roleMock = "doctor";
    render(<Dashboard />);

    expect(
      screen.queryByRole("button", { name: /Doctors/i }),
    ).not.toBeInTheDocument();
  });

  it("opens schedule dialog and handles header actions", () => {
    render(<Dashboard />);

    expect(screen.getByText("Schedule Dialog Open: false")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Schedule/i }));
    expect(screen.getByText("Schedule Dialog Open: true")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Health Progress Quick" }),
    );

    const iconButtons = screen
      .getAllByRole("button")
      .filter((button) => button.textContent === "");

    fireEvent.click(iconButtons[0]);
    expect((useTheme as jest.Mock).mock.results.length).toBeGreaterThan(0);

    fireEvent.click(iconButtons[1]);
    expect(authService.logout).toHaveBeenCalled();
    expect(pushMock).toHaveBeenCalledWith("/");
  });
});
