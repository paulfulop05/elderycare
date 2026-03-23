"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { doctors as initialDoctors, getUserRole } from "@/lib/mockData";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Plus,
  Trash2,
  UserPlus,
  LayoutGrid,
  List,
} from "lucide-react";
import { toast } from "sonner";

const ROWS_PER_PAGE = 5;

const DoctorsTab = () => {
  const router = useRouter();
  const role = getUserRole();
  const [doctorList, setDoctorList] = useState(initialDoctors);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [viewMode, setViewMode] = useState<"table" | "visual">("table");
  const [addOpen, setAddOpen] = useState(false);
  const [newDoctor, setNewDoctor] = useState({
    name: "",
    age: "",
    email: "",
    phone: "",
  });

  const filtered = doctorList.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()),
  );
  const totalPages = Math.ceil(filtered.length / ROWS_PER_PAGE);
  const paginated = filtered.slice(
    page * ROWS_PER_PAGE,
    (page + 1) * ROWS_PER_PAGE,
  );

  const handleAddDoctor = () => {
    const name = newDoctor.name.trim();
    if (!name) return;
    const initials = name
      .split(" ")
      .filter((w) => w.length > 0)
      .map((w) => w[0].toUpperCase())
      .slice(0, 2)
      .join("");
    setDoctorList((prev) => [
      ...prev,
      {
        id: String(prev.length + 1),
        name,
        age: parseInt(newDoctor.age) || 0,
        email: newDoctor.email.trim(),
        phone: newDoctor.phone.trim(),
        avatar: initials,
      },
    ]);
    setNewDoctor({ name: "", age: "", email: "", phone: "" });
    setAddOpen(false);
    toast.success("Doctor added successfully (prototype)");
  };

  const handleRemoveDoctor = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDoctorList((prev) => prev.filter((d) => d.id !== id));
    toast.success("Doctor removed (prototype)");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display text-lg font-semibold text-foreground">
          Doctors
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
          {role === "admin" && (
            <Button
              size="sm"
              className="bg-accent text-accent-foreground font-medium hover:bg-accent/80 hover:shadow-md active:scale-[0.97] h-8 rounded-xl transition-all duration-200"
              onClick={() => setAddOpen(true)}
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Doctor
            </Button>
          )}
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
                  Email
                </TableHead>
                <TableHead className="py-2" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((d) => (
                <TableRow
                  key={d.id}
                  className="hover:bg-muted/20 cursor-pointer"
                  onClick={() => router.push(`/dashboard/doctor/${d.id}`)}
                >
                  <TableCell className="py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                        {d.avatar}
                      </div>
                      <span className="text-foreground text-sm font-medium">
                        {d.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground text-sm py-2">
                    {d.age}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm py-2">
                    {d.email}
                  </TableCell>
                  <TableCell className="py-2">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-foreground h-7 w-7 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/dashboard/doctor/${d.id}`);
                        }}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      {role === "admin" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-destructive h-7 w-7 p-0"
                          onClick={(e) => handleRemoveDoctor(d.id, e)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {paginated.map((d) => (
            <div
              key={d.id}
              className="rounded-xl border border-border bg-card p-4 cursor-pointer hover:bg-muted/20 transition-colors"
              onClick={() => router.push(`/dashboard/doctor/${d.id}`)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                    {d.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {d.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {d.age} years old
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground h-7 w-7 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/dashboard/doctor/${d.id}`);
                    }}
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                  {role === "admin" && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-destructive h-7 w-7 p-0"
                      onClick={(e) => handleRemoveDoctor(d.id, e)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="rounded-md bg-muted/40 p-2.5 text-xs">
                <p className="text-muted-foreground">Email</p>
                <p className="text-foreground font-medium mt-0.5 break-all">
                  {d.email}
                </p>
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

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="bg-card border-border text-card-foreground max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-base text-foreground flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-accent" /> Add Doctor
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-1">
            <div className="space-y-1.5">
              <Label className="text-xs text-foreground">Full Name</Label>
              <Input
                placeholder="Dr. Full Name"
                value={newDoctor.name}
                onChange={(e) =>
                  setNewDoctor({ ...newDoctor, name: e.target.value })
                }
                className="h-9 text-sm bg-muted border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-foreground">Age</Label>
              <Input
                type="number"
                placeholder="45"
                value={newDoctor.age}
                onChange={(e) =>
                  setNewDoctor({ ...newDoctor, age: e.target.value })
                }
                className="h-9 text-sm bg-muted border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-foreground">Email</Label>
              <Input
                type="email"
                placeholder="doctor@elderycare.com"
                value={newDoctor.email}
                onChange={(e) =>
                  setNewDoctor({ ...newDoctor, email: e.target.value })
                }
                className="h-9 text-sm bg-muted border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-foreground">Phone</Label>
              <Input
                placeholder="+1 555-0100"
                value={newDoctor.phone}
                onChange={(e) =>
                  setNewDoctor({ ...newDoctor, phone: e.target.value })
                }
                className="h-9 text-sm bg-muted border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <Button
              disabled={!newDoctor.name.trim()}
              size="sm"
              className="w-full bg-accent text-accent-foreground font-medium hover:bg-accent/90"
              onClick={handleAddDoctor}
            >
              Add Doctor
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorsTab;
