import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import AppointmentsSection from "@/components/dashboard/AppointmentsSection";
import { appointmentService } from "@/lib/services/client/appointmentService";
import { patientService } from "@/lib/services/client/patientService";
import { validatePatientMetrics } from "@/lib/validation";
import { toast } from "sonner";

const listMock = jest.fn();
const subscribeMock = jest.fn();
const cancelMock = jest.fn();
const finishMock = jest.fn();
const updateMetricsMock = jest.fn();
const unsubscribeMock = jest.fn();

jest.mock("@/components/ui/table", () => ({
  Table: ({ children }: { children: React.ReactNode }) => (
    <table>{children}</table>
  ),
  TableHeader: ({ children }: { children: React.ReactNode }) => (
    <thead>{children}</thead>
  ),
  TableBody: ({ children }: { children: React.ReactNode }) => (
    <tbody>{children}</tbody>
  ),
  TableRow: ({ children, ...props }: { children: React.ReactNode }) => (
    <tr {...props}>{children}</tr>
  ),
  TableHead: ({ children }: { children: React.ReactNode }) => (
    <th>{children}</th>
  ),
  TableCell: ({ children, ...props }: { children: React.ReactNode }) => (
    <td {...props}>{children}</td>
  ),
}));

jest.mock("@/components/ui/badge", () => ({
  Badge: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
}));

jest.mock("@/components/ui/input", () => ({
  Input: ({
    value,
    onChange,
    onBlur,
    placeholder,
  }: {
    value?: string | number;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: () => void;
    placeholder?: string;
  }) => (
    <input
      value={value as string | number | readonly string[] | undefined}
      onChange={onChange}
      onBlur={onBlur}
      placeholder={placeholder}
    />
  ),
}));

jest.mock("@/components/ui/label", () => ({
  Label: ({ children }: { children: React.ReactNode }) => (
    <label>{children}</label>
  ),
}));

jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({ open, children }: { open: boolean; children: React.ReactNode }) =>
    open ? <div>{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <h2>{children}</h2>
  ),
}));

jest.mock("@/lib/services/client/authService", () => ({
  authService: {
    getUserRole: jest.fn(() => "doctor"),
    getCurrentDoctorId: jest.fn(() => "d1"),
    getCurrentUserName: jest.fn(() => "Dr. Maria"),
  },
}));

jest.mock("@/lib/services/client/appointmentService", () => ({
  appointmentService: {
    list: jest.fn(() => listMock()),
    subscribe: jest.fn((listener: () => void) => subscribeMock(listener)),
    cancel: jest.fn((id: string) => cancelMock(id)),
    finish: jest.fn((id: string) => finishMock(id)),
  },
}));

jest.mock("@/lib/services/client/patientService", () => ({
  patientService: {
    list: jest.fn(() => [{ id: "p1", name: "Patient One" }]),
    updateMetrics: jest.fn((id: string, metrics: unknown) =>
      updateMetricsMock(id, metrics),
    ),
  },
}));

jest.mock("@/lib/validation", () => ({
  validatePatientMetrics: jest.fn(),
}));

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe("AppointmentsSection", () => {
  beforeEach(() => {
    listMock.mockReset();
    subscribeMock.mockReset();
    cancelMock.mockReset();
    finishMock.mockReset();
    updateMetricsMock.mockReset();
    unsubscribeMock.mockReset();
    (toast.success as jest.Mock).mockReset();
    (toast.error as jest.Mock).mockReset();

    subscribeMock.mockImplementation(() => unsubscribeMock);
    listMock.mockReturnValue([
      {
        id: "a1",
        doctorId: "d1",
        patientId: "p1",
        doctorName: "Dr. Maria",
        patientName: "Patient One",
        date: "2026-04-01",
        time: "09:00",
        reason: "Checkup",
        status: "upcoming",
      },
      {
        id: "a2",
        doctorId: "d1",
        patientId: "p1",
        doctorName: "Dr. Maria",
        patientName: "Patient One",
        date: "2026-03-01",
        time: "10:00",
        reason: "Follow up",
        status: "completed",
      },
    ]);
  });

  it("renders upcoming and past lists and supports cancel", async () => {
    (validatePatientMetrics as jest.Mock).mockReturnValue({
      isValid: false,
      errors: { weight: "invalid" },
    });
    render(<AppointmentsSection />);

    expect(screen.getByText("Upcoming")).toBeInTheDocument();
    expect(screen.getByText("Past")).toBeInTheDocument();
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[1]);
    await waitFor(() => {
      expect(appointmentService.cancel).toHaveBeenCalledWith("a1");
    });
  });

  it("shows validation error when finishing with invalid metrics", () => {
    (validatePatientMetrics as jest.Mock).mockReturnValue({
      isValid: false,
      errors: { weight: "invalid" },
    });
    render(<AppointmentsSection />);

    fireEvent.click(screen.getByRole("button", { name: "Finish" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Complete & Save Patient Data" }),
    );

    expect(toast.error).toHaveBeenCalledWith(
      "Please enter valid health metrics before finishing.",
    );
    expect(appointmentService.finish).not.toHaveBeenCalled();
  });

  it("finishes appointment and updates patient metrics when valid", async () => {
    (validatePatientMetrics as jest.Mock).mockReturnValue({
      isValid: true,
      errors: {},
    });
    render(<AppointmentsSection />);

    fireEvent.click(screen.getByRole("button", { name: "Finish" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Complete & Save Patient Data" }),
    );

    await waitFor(() => {
      expect(patientService.updateMetrics).toHaveBeenCalledWith(
        "p1",
        expect.objectContaining({ date: "2026-04-01" }),
      );
      expect(appointmentService.finish).toHaveBeenCalledWith("a1");
      expect(toast.success).toHaveBeenCalledWith(
        "Appointment completed and patient data saved.",
      );
    });
  });

  it("unsubscribes on unmount", () => {
    (validatePatientMetrics as jest.Mock).mockReturnValue({
      isValid: true,
      errors: {},
    });
    const { unmount } = render(<AppointmentsSection />);
    unmount();

    expect(unsubscribeMock).toHaveBeenCalled();
  });
});
