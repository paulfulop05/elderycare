"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { patients } from "@/lib/mockData";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  LayoutGrid,
  List,
} from "lucide-react";

const ROWS_PER_PAGE = 5;

const PatientsTab = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [viewMode, setViewMode] = useState<"table" | "visual">("table");

  const filtered = patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );
  const totalPages = Math.ceil(filtered.length / ROWS_PER_PAGE);
  const paginated = filtered.slice(
    page * ROWS_PER_PAGE,
    (page + 1) * ROWS_PER_PAGE,
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display text-lg font-semibold text-foreground">
          Patients
        </h2>
        <div className="flex items-center gap-2">
          <div className="relative w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              className="pl-8 h-8 text-sm bg-card border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex items-center rounded-lg border border-border bg-card p-0.5">
            <Button
              type="button"
              size="sm"
              variant={viewMode === "table" ? "default" : "ghost"}
              onClick={() => setViewMode("table")}
              className="h-7 px-2"
            >
              <List className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant={viewMode === "visual" ? "default" : "ghost"}
              onClick={() => setViewMode("visual")}
              className="h-7 px-2"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {viewMode === "table" ? (
        <div className="rounded-xl border border-border overflow-hidden bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="text-xs text-muted-foreground font-medium py-2">
                  Name
                </TableHead>
                <TableHead className="text-xs text-muted-foreground font-medium py-2">
                  Age
                </TableHead>
                <TableHead className="text-xs text-muted-foreground font-medium py-2">
                  Last Visit
                </TableHead>
                <TableHead className="text-xs text-muted-foreground font-medium py-2">
                  Weight
                </TableHead>
                <TableHead className="text-xs text-muted-foreground font-medium py-2">
                  BMI
                </TableHead>
                <TableHead className="py-2" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((p) => (
                <TableRow
                  key={p.id}
                  className="hover:bg-muted/20 cursor-pointer"
                  onClick={() => router.push(`/dashboard/patient/${p.id}`)}
                >
                  <TableCell className="py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                        {p.avatar}
                      </div>
                      <span className="text-foreground text-sm font-medium">
                        {p.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground text-sm py-2">
                    {p.age}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm py-2">
                    {p.lastVisit}
                  </TableCell>
                  <TableCell className="text-foreground text-sm py-2">
                    {p.metrics.weight} kg
                  </TableCell>
                  <TableCell className="text-foreground text-sm py-2">
                    {p.metrics.bmi}
                  </TableCell>
                  <TableCell className="py-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground h-7 w-7 p-0"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {paginated.map((p) => (
            <div
              key={p.id}
              className="rounded-xl border border-border bg-card p-4 cursor-pointer hover:bg-muted/20 transition-colors"
              onClick={() => router.push(`/dashboard/patient/${p.id}`)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                    {p.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {p.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {p.age} years old
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground h-7 w-7 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/dashboard/patient/${p.id}`);
                  }}
                >
                  <Eye className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="rounded-md bg-muted/40 p-2">
                  <p className="text-muted-foreground">Visit</p>
                  <p className="text-foreground font-medium mt-0.5">
                    {p.lastVisit}
                  </p>
                </div>
                <div className="rounded-md bg-muted/40 p-2">
                  <p className="text-muted-foreground">Weight</p>
                  <p className="text-foreground font-medium mt-0.5">
                    {p.metrics.weight} kg
                  </p>
                </div>
                <div className="rounded-md bg-muted/40 p-2">
                  <p className="text-muted-foreground">BMI</p>
                  <p className="text-foreground font-medium mt-0.5">
                    {p.metrics.bmi}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-3">
        <p className="text-xs text-muted-foreground">
          {filtered.length === 0
            ? "0 results"
            : `${page * ROWS_PER_PAGE + 1}–${Math.min((page + 1) * ROWS_PER_PAGE, filtered.length)} of ${filtered.length}`}
        </p>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            className="text-foreground h-7 w-7 p-0"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
            className="text-foreground h-7 w-7 p-0"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PatientsTab;
