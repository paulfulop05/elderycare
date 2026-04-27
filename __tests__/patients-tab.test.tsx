import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import PatientsTab from "@/components/dashboard/PatientsTab";
import { patientService } from "@/lib/services/client/patientService";

const pushMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

jest.mock("@/components/ui/input", () => ({
  Input: ({
    value,
    onChange,
    placeholder,
  }: {
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
  }) => <input value={value} onChange={onChange} placeholder={placeholder} />,
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: (e?: React.MouseEvent) => void;
  }) => (
    <button
      type="button"
      onClick={onClick as React.MouseEventHandler<HTMLButtonElement>}
    >
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

jest.mock("@/lib/services/client/patientService", () => ({
  patientService: {
    list: jest.fn(),
    refresh: jest.fn(),
  },
}));

const patients = [
  {
    id: "1",
    name: "Patient One",
    age: 60,
    lastVisit: "2026-01-01",
    avatar: "PO",
    metrics: { weight: 70, bmi: 23 },
  },
  {
    id: "2",
    name: "Patient Two",
    age: 61,
    lastVisit: "2026-01-02",
    avatar: "PT",
    metrics: { weight: 71, bmi: 24 },
  },
  {
    id: "3",
    name: "Patient Three",
    age: 62,
    lastVisit: "2026-01-03",
    avatar: "PT",
    metrics: { weight: 72, bmi: 25 },
  },
  {
    id: "4",
    name: "Patient Four",
    age: 63,
    lastVisit: "2026-01-04",
    avatar: "PF",
    metrics: { weight: 73, bmi: 26 },
  },
  {
    id: "5",
    name: "Patient Five",
    age: 64,
    lastVisit: "2026-01-05",
    avatar: "PF",
    metrics: { weight: 74, bmi: 27 },
  },
  {
    id: "6",
    name: "Patient Six",
    age: 65,
    lastVisit: "2026-01-06",
    avatar: "PS",
    metrics: { weight: 75, bmi: 28 },
  },
];

describe("PatientsTab", () => {
  beforeEach(() => {
    pushMock.mockReset();
    (patientService.list as jest.Mock).mockReset();
    (patientService.refresh as jest.Mock).mockReset();
    (patientService.refresh as jest.Mock).mockResolvedValue(undefined);
    (patientService.list as jest.Mock).mockReturnValue(patients);
  });

  it("navigates to patient details from table row", async () => {
    render(<PatientsTab />);

    await waitFor(() => {
      expect(screen.getByText("Patient One")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Patient One"));
    expect(pushMock).toHaveBeenCalledWith("/dashboard/patient/1");
  });

  it("filters by search and resets page", async () => {
    render(<PatientsTab />);

    await waitFor(() => {
      expect(screen.getByText("Patient One")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText("Search..."), {
      target: { value: "Six" },
    });

    await waitFor(() => {
      expect(screen.getByText("Patient Six")).toBeInTheDocument();
    });

    expect(screen.queryByText("Patient One")).not.toBeInTheDocument();
  });

  it("switches to visual mode and supports eye-button navigation", async () => {
    render(<PatientsTab />);

    await waitFor(() => {
      expect(screen.getByText("Patient One")).toBeInTheDocument();
    });

    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[1]);

    const eyeOrNavButtons = screen.getAllByRole("button");
    fireEvent.click(eyeOrNavButtons[2]);

    expect(pushMock).toHaveBeenCalled();
  });
});
