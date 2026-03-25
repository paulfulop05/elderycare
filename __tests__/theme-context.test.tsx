import { fireEvent, render, screen } from "@testing-library/react";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";

const Consumer = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <span>{theme}</span>
      <button type="button" onClick={toggleTheme}>
        toggle
      </button>
    </div>
  );
};

describe("ThemeContext", () => {
  beforeEach(() => {
    document.documentElement.className = "";
  });

  it("provides dark theme by default and toggles to light", () => {
    render(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>,
    );

    expect(screen.getByText("dark")).toBeInTheDocument();
    expect(document.documentElement.classList.contains("dark")).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "toggle" }));

    expect(screen.getByText("light")).toBeInTheDocument();
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("uses default context outside provider", () => {
    render(<Consumer />);

    expect(screen.getByText("dark")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "toggle" }));
    expect(screen.getByText("dark")).toBeInTheDocument();
  });
});
