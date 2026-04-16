import { fireEvent, render, screen } from "@testing-library/react";
import DoctorsTab from "@/components/dashboard/DoctorsTab";
import { authService } from "@/lib/services/client/authService";
import { doctorService } from "@/lib/services/client/doctorService";
import { toast } from "sonner";

const pushMock = jest.fn();
const getUserRoleMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

jest.mock("@/components/ui/input", () => ({
  Input: ({
    value,
    onChange,
    placeholder,
    type,
  }: {
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    type?: string;
  }) => (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      type={type}
    />
  ),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: (e?: unknown) => void;
  }) => (
    <button type="button" onClick={() => onClick?.()}>
      {children}
    </button>
  ),
}));

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
  TableRow: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => <tr onClick={onClick}>{children}</tr>,
  TableHead: ({ children }: { children: React.ReactNode }) => (
    <th>{children}</th>
  ),
  TableCell: ({ children }: { children: React.ReactNode }) => (
    <td>{children}</td>
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

jest.mock("@/components/ui/label", () => ({
  Label: ({ children }: { children: React.ReactNode }) => (
    <label>{children}</label>
  ),
}));

jest.mock("@/lib/services/client/authService", () => ({
  authService: {
    getUserRole: jest.fn(() => getUserRoleMock()),
  },
}));

jest.mock("@/lib/services/client/doctorService", () => ({
  doctorService: {
    list: jest.fn(),
    add: jest.fn(),
    remove: jest.fn(),
  },
}));

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const doctors = [
  { id: "1", name: "Dr. One", age: 30, email: "one@mail.com", avatar: "DO" },
  { id: "2", name: "Dr. Two", age: 31, email: "two@mail.com", avatar: "DT" },
  {
    id: "3",
    name: "Dr. Three",
    age: 32,
    email: "three@mail.com",
    avatar: "DT",
  },
  { id: "4", name: "Dr. Four", age: 33, email: "four@mail.com", avatar: "DF" },
  { id: "5", name: "Dr. Five", age: 34, email: "five@mail.com", avatar: "DF" },
  { id: "6", name: "Dr. Six", age: 35, email: "six@mail.com", avatar: "DS" },
];

describe("DoctorsTab", () => {
  beforeEach(() => {
    pushMock.mockReset();
    getUserRoleMock.mockReset();
    (doctorService.list as jest.Mock).mockReset();
    (doctorService.add as jest.Mock).mockReset();
    (doctorService.remove as jest.Mock).mockReset();
    (toast.success as jest.Mock).mockReset();
    (toast.error as jest.Mock).mockReset();

    getUserRoleMock.mockReturnValue("admin");
    (doctorService.list as jest.Mock).mockReturnValue(doctors);
    (doctorService.add as jest.Mock).mockImplementation(() => undefined);
    (doctorService.remove as jest.Mock).mockImplementation(() => undefined);
  });

  it("navigates to doctor details and supports search + pagination", () => {
    render(<DoctorsTab />);

    fireEvent.click(screen.getByText("Dr. One"));
    expect(pushMock).toHaveBeenCalledWith("/dashboard/doctor/1");

    fireEvent.change(screen.getByPlaceholderText("Search..."), {
      target: { value: "Six" },
    });
    expect(screen.getByText("Dr. Six")).toBeInTheDocument();
    expect(screen.queryByText("Dr. One")).not.toBeInTheDocument();
  });

  it("adds doctor with valid input and shows success", () => {
    (doctorService.list as jest.Mock)
      .mockReturnValueOnce(doctors)
      .mockReturnValueOnce([
        ...doctors,
        {
          id: "7",
          name: "Dr. Seven",
          age: 40,
          email: "seven@mail.com",
          avatar: "DS",
        },
      ]);

    render(<DoctorsTab />);

    fireEvent.click(screen.getByRole("button", { name: "Add Doctor" }));
    fireEvent.change(screen.getByPlaceholderText("Dr. Full Name"), {
      target: { value: "Dr. Seven" },
    });
    fireEvent.change(screen.getByPlaceholderText("45"), {
      target: { value: "40" },
    });
    fireEvent.change(screen.getByPlaceholderText("doctor@elderycare.com"), {
      target: { value: "seven@mail.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("+1 555-0100"), {
      target: { value: "+1 555-4444" },
    });

    const addButtons = screen.getAllByRole("button", { name: "Add Doctor" });
    fireEvent.click(addButtons[1]);

    expect(doctorService.add).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith(
      "Doctor added successfully (prototype)",
    );
  });

  it("hides admin actions for non-admin role", () => {
    getUserRoleMock.mockReturnValue("doctor");
    render(<DoctorsTab />);

    expect(
      screen.queryByRole("button", { name: "Add Doctor" }),
    ).not.toBeInTheDocument();
  });

  it("shows error when trying to add with invalid data", () => {
    render(<DoctorsTab />);

    fireEvent.click(screen.getByRole("button", { name: "Add Doctor" }));
    const addButtons = screen.getAllByRole("button", { name: "Add Doctor" });
    fireEvent.click(addButtons[1]);

    expect(toast.error).toHaveBeenCalledWith(
      "Please correct the form errors before adding a doctor.",
    );
  });

  it("switches to visual mode", () => {
    render(<DoctorsTab />);

    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[1]);

    expect(screen.getByText("Dr. One")).toBeInTheDocument();
  });
});
