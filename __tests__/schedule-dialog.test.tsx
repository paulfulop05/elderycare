import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import ScheduleDialog from "@/components/dashboard/ScheduleDialog";
import { appointmentService } from "@/lib/services/client/appointmentService";
import { authService } from "@/lib/services/client/authService";
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
      onClick={() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        onSelect(tomorrow);
      }}
    >
      Pick Date
    </button>
  ),
}));

jest.mock("@/lib/services/client/appointmentService", () => ({
  appointmentService: {
    getAvailableSlots: jest.fn(() => ["09:00", "09:30"]),
    schedule: jest.fn(),
  },
}));

jest.mock("@/lib/services/client/authService", () => ({
  authService: {
    getCurrentUser: jest.fn(() => ({
      did: 7,
      name: "Dr. Maria",
      email: "doc@mail.com",
      role: "doctor",
    })),
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

  it("does not force phone error just by focusing reason", () => {
    render(<ScheduleDialog open={true} onOpenChange={jest.fn()} />);

    fireEvent.focus(
      screen.getByPlaceholderText("e.g. Routine checkup, Follow-up"),
    );

    expect(
      screen.queryByText("Phone number is required."),
    ).not.toBeInTheDocument();
  });

  it("schedules appointment on valid input", async () => {
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

    await waitFor(() => {
      expect(appointmentService.schedule).toHaveBeenCalledWith(
        expect.objectContaining({
          doctorId: "7",
          doctorName: "Dr. Maria",
          patientName: "John Doe",
          patientPhone: "+1 555-0101",
          time: "09:00",
        }),
      );
      expect(toast.success).toHaveBeenCalledWith(
        "Appointment scheduled successfully.",
      );
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });
});
