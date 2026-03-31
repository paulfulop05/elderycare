import { fireEvent, render, screen } from "@testing-library/react";
import ScheduleDialog from "@/components/dashboard/ScheduleDialog";
import { appointmentService } from "@/lib/services/appointmentService";
import { authService } from "@/lib/services/authService";
import { toast } from "sonner";

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

jest.mock("@/components/ui/calendar", () => ({
  Calendar: ({ onSelect }: { onSelect: (value: Date) => void }) => (
    <button
      type="button"
      onClick={() => onSelect(new Date("2026-04-10T00:00:00.000Z"))}
    >
      Pick Date
    </button>
  ),
}));

jest.mock("@/lib/services/appointmentService", () => ({
  appointmentService: {
    getAvailableSlots: jest.fn(() => ["09:00", "09:30"]),
    schedule: jest.fn(),
  },
}));

jest.mock("@/lib/services/authService", () => ({
  authService: {
    getCurrentUserName: jest.fn(() => "Dr. Maria"),
  },
}));

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe("ScheduleDialog", () => {
  beforeEach(() => {
    (appointmentService.schedule as jest.Mock).mockReset();
    (toast.success as jest.Mock).mockReset();
    (toast.error as jest.Mock).mockReset();
  });

  it("renders date-first guidance and shows validation feedback on submit", () => {
    render(<ScheduleDialog open={true} onOpenChange={jest.fn()} />);

    expect(screen.getByText("Select a date first.")).toBeInTheDocument();

    const confirm = screen.getByRole("button", { name: "Confirm" });
    expect(confirm).toBeEnabled();

    fireEvent.click(confirm);

    expect(
      screen.getByText("Please fix the following before scheduling:"),
    ).toBeInTheDocument();
    expect(screen.getByText("- Phone number is required.")).toBeInTheDocument();
    expect(toast.error).toHaveBeenCalledWith(
      "Please correct the form errors before scheduling.",
    );
  });

  it("shows phone validation when user jumps to reason first", () => {
    render(<ScheduleDialog open={true} onOpenChange={jest.fn()} />);

    fireEvent.focus(
      screen.getByPlaceholderText("e.g. Routine checkup, Follow-up"),
    );

    expect(screen.getByText("Phone number is required.")).toBeInTheDocument();
  });

  it("schedules appointment on valid input", () => {
    const onOpenChange = jest.fn();
    render(<ScheduleDialog open={true} onOpenChange={onOpenChange} />);

    fireEvent.change(screen.getByPlaceholderText("Enter patient name"), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByPlaceholderText("+1 555-0000"), {
      target: { value: "+1 555-0101" },
    });
    fireEvent.change(
      screen.getByPlaceholderText("e.g. Routine checkup, Follow-up"),
      {
        target: { value: "Routine check" },
      },
    );

    fireEvent.click(screen.getByRole("button", { name: "Pick Date" }));
    fireEvent.click(screen.getByRole("button", { name: "09:00" }));

    const confirm = screen.getByRole("button", { name: "Confirm" });
    expect(confirm).toBeEnabled();
    fireEvent.click(confirm);

    expect(authService.getCurrentUserName).toHaveBeenCalled();
    expect(appointmentService.schedule).toHaveBeenCalledWith(
      expect.objectContaining({
        doctorName: "Dr. Maria",
        patientName: "John Doe",
        time: "09:00",
      }),
    );
    expect(toast.success).toHaveBeenCalledWith(
      "Appointment scheduled successfully! (prototype)",
    );
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
