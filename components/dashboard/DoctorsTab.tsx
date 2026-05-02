"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/services/client/authService";
import { doctorService } from "@/lib/services/client/doctorService";
import { validateDoctorForm } from "@/lib/validation";
import type { Doctor } from "@/lib/domain";
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
} from "lucide-react";
import { toast } from "sonner";

const ROWS_PER_PAGE = 5;

const DoctorsTab = () => {
  const router = useRouter();
  const role = authService.getUserRole();
  const [doctorList, setDoctorList] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [addOpen, setAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newDoctor, setNewDoctor] = useState({
    name: "",
    age: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [addAttempted, setAddAttempted] = useState(false);

  const loadDoctors = async () => {
    try {
      setIsLoading(true);
      const doctors = await doctorService.list();
      setDoctorList(doctors);
    } catch {
      toast.error("Failed to load doctors.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadDoctors();
  }, []);

  const filtered = doctorList.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()),
  );
  const addDoctorValidation = validateDoctorForm(newDoctor);

  const totalPages = Math.ceil(filtered.length / ROWS_PER_PAGE);
  const paginated = filtered.slice(
    page * ROWS_PER_PAGE,
    (page + 1) * ROWS_PER_PAGE,
  );

  const handleAddDoctor = async () => {
    if (isSubmitting) {
      return;
    }

    setAddAttempted(true);

    if (!addDoctorValidation.isValid) {
      toast.error("Please correct the form errors before adding a doctor.");
      return;
    }

    try {
      setIsSubmitting(true);
      const password = addDoctorValidation.sanitized.password;
      await doctorService.add({
        name: addDoctorValidation.sanitized.name,
        age: addDoctorValidation.sanitized.age,
        email: addDoctorValidation.sanitized.email,
        phone: addDoctorValidation.sanitized.phone,
        password: password,
      });

      await loadDoctors();
      setNewDoctor({
        name: "",
        age: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
      });
      setAddAttempted(false);
      setAddOpen(false);
      toast.success("Doctor account created successfully.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create doctor.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveDoctor = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await doctorService.remove(id);
      await loadDoctors();
      toast.success("Doctor removed.");
    } catch {
      toast.error("Failed to remove doctor.");
    }
  };

  const handleAddDialogChange = (nextOpen: boolean) => {
    setAddOpen(nextOpen);
    if (!nextOpen) {
      setAddAttempted(false);
    }
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
            {isLoading && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center text-muted-foreground text-sm py-6"
                >
                  Loading doctors...
                </TableCell>
              </TableRow>
            )}
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

      <Dialog open={addOpen} onOpenChange={handleAddDialogChange}>
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
              {addAttempted && addDoctorValidation.errors.name && (
                <p className="text-xs text-destructive">
                  {addDoctorValidation.errors.name}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-foreground">Age</Label>
              <Input
                type="number"
                min={24}
                max={90}
                placeholder="45"
                value={newDoctor.age}
                onChange={(e) =>
                  setNewDoctor({ ...newDoctor, age: e.target.value })
                }
                className="h-9 text-sm bg-muted border-border text-foreground placeholder:text-muted-foreground"
              />
              {addAttempted && addDoctorValidation.errors.age && (
                <p className="text-xs text-destructive">
                  {addDoctorValidation.errors.age}
                </p>
              )}
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
              {addAttempted && addDoctorValidation.errors.email && (
                <p className="text-xs text-destructive">
                  {addDoctorValidation.errors.email}
                </p>
              )}
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
              {addAttempted && addDoctorValidation.errors.phone && (
                <p className="text-xs text-destructive">
                  {addDoctorValidation.errors.phone}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-foreground">
                Temporary Password
              </Label>
              <Input
                type="password"
                placeholder="min 6 characters"
                value={newDoctor.password}
                onChange={(e) =>
                  setNewDoctor({ ...newDoctor, password: e.target.value })
                }
                className="h-9 text-sm bg-muted border-border text-foreground placeholder:text-muted-foreground"
              />
              {addAttempted && addDoctorValidation.errors.password && (
                <p className="text-xs text-destructive">
                  {addDoctorValidation.errors.password}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-foreground">
                Confirm Password
              </Label>
              <Input
                type="password"
                placeholder="Confirm password"
                value={newDoctor.confirmPassword}
                onChange={(e) =>
                  setNewDoctor({
                    ...newDoctor,
                    confirmPassword: e.target.value,
                  })
                }
                className="h-9 text-sm bg-muted border-border text-foreground placeholder:text-muted-foreground"
              />
              {addAttempted && addDoctorValidation.errors.confirmPassword && (
                <p className="text-xs text-destructive">
                  {addDoctorValidation.errors.confirmPassword}
                </p>
              )}
            </div>
            <Button
              disabled={isSubmitting}
              size="sm"
              className="w-full bg-accent text-accent-foreground font-medium hover:bg-accent/90"
              onClick={handleAddDoctor}
            >
              {isSubmitting ? "Adding..." : "Add Doctor"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorsTab;
