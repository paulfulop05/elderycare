import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  validatePasswordChangeForm,
  isValidPhoneNumber,
  sanitizeText,
} from "@/lib/validation";
import { User, Lock, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { authService } from "@/lib/services/client/authService";
import { doctorService } from "@/lib/services/client/doctorService";

const SettingsTab = () => {
  const currentUser = authService.getCurrentUser();
  const [section, setSection] = useState<"main" | "profile" | "password">(
    "main",
  );
  const [name, setName] = useState(currentUser?.name ?? "");
  const [age, setAge] = useState("");
  const [email, setEmail] = useState(currentUser?.email ?? "");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [profileAttempted, setProfileAttempted] = useState(false);
  const [passwordAttempted, setPasswordAttempted] = useState(false);

  useEffect(() => {
    if (!currentUser || currentUser.did <= 0) {
      return;
    }

    void doctorService
      .getById(String(currentUser.did))
      .then((doctor) => {
        if (!doctor) {
          return;
        }

        setName(doctor.name);
        setAge(String(doctor.age));
        setEmail(doctor.email);
        setPhoneNumber(doctor.phone);
      })
      .catch(() => {
        toast.error("Failed to load profile settings.");
      });
  }, [currentUser]);

  const profileValidation = useMemo(() => {
    const errors: {
      name?: string;
      age?: string;
      email?: string;
      phoneNumber?: string;
    } = {};

    const sanitizedName = sanitizeText(name);
    const sanitizedEmail = sanitizeText(email).toLowerCase();
    const sanitizedPhoneNumber = sanitizeText(phoneNumber);
    const parsedAge = Number.parseInt(age, 10);

    if (
      !sanitizedName ||
      sanitizedName.length < 2 ||
      sanitizedName.length > 80
    ) {
      errors.name = "Name must be 2-80 characters.";
    }

    if (!Number.isFinite(parsedAge) || parsedAge < 24 || parsedAge > 90) {
      errors.age = "Age must be between 24 and 90.";
    }

    if (!sanitizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedEmail)) {
      errors.email = "Enter a valid email address.";
    }

    if (!isValidPhoneNumber(sanitizedPhoneNumber)) {
      errors.phoneNumber = "Enter a valid phone number.";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      sanitized: {
        name: sanitizedName,
        age: Number.isFinite(parsedAge) ? parsedAge : 0,
        email: sanitizedEmail,
        phoneNumber: sanitizedPhoneNumber,
      },
    };
  }, [name, age, email, phoneNumber]);

  const passwordValidation = validatePasswordChangeForm({
    currentPassword,
    newPassword,
  });

  const goToMain = () => {
    setSection("main");
    setProfileAttempted(false);
    setPasswordAttempted(false);
  };

  const handleSaveProfile = async () => {
    setProfileAttempted(true);

    if (!profileValidation.isValid) {
      toast.error("Please fix profile fields before saving.");
      return;
    }

    if (!currentUser || currentUser.did <= 0) {
      toast.error("You must be logged in to update profile.");
      return;
    }

    try {
      const updated = await doctorService.updateMyProfile({
        did: String(currentUser.did),
        ...profileValidation.sanitized,
      });

      authService.setCurrentUserProfile({
        name: updated.name,
        email: updated.email,
      });

      setName(updated.name);
      setAge(String(updated.age));
      setEmail(updated.email);
      setPhoneNumber(updated.phoneNumber);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update profile.";
      toast.error(message);
      return;
    }

    toast.success("Profile updated.");
    goToMain();
  };

  const handleSavePassword = async () => {
    setPasswordAttempted(true);

    if (!passwordValidation.isValid) {
      toast.error("Please fix the password fields before saving.");
      return;
    }

    if (!currentUser || currentUser.did <= 0) {
      toast.error("You must be logged in to change password.");
      return;
    }

    try {
      await doctorService.updateMyPassword(
        String(currentUser.did),
        currentPassword,
        newPassword,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to change password.";
      toast.error(message);
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    toast.success("Password changed.");
    goToMain();
  };

  return (
    <div className="max-w-md">
      <h2 className="font-display text-lg font-semibold text-foreground mb-4">
        Settings
      </h2>

      {section === "main" && (
        <div className="space-y-3">
          <div className="bg-card border border-border rounded-xl p-4 space-y-2">
            <h3 className="font-display text-sm font-semibold text-foreground mb-1">
              Account
            </h3>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-foreground h-8"
              onClick={() => setSection("profile")}
            >
              <User className="h-3.5 w-3.5 mr-2" /> Edit Profile
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-foreground h-8"
              onClick={() => setSection("password")}
            >
              <Lock className="h-3.5 w-3.5 mr-2" /> Change Password
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-destructive h-8"
              onClick={() =>
                toast.info("Account deletion is a prototype action.")
              }
            >
              <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete Account
            </Button>
          </div>
        </div>
      )}

      {section === "profile" && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <h3 className="font-display text-sm font-semibold text-foreground">
            Edit Profile
          </h3>
          <div className="space-y-1">
            <Label className="text-xs text-foreground">Name</Label>
            <Input
              className="h-8 text-sm bg-muted border-border text-foreground"
              placeholder="Enter full name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            {profileAttempted && profileValidation.errors.name && (
              <p className="text-xs text-destructive">
                {profileValidation.errors.name}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-foreground">Age</Label>
            <Input
              type="number"
              className="h-8 text-sm bg-muted border-border text-foreground"
              placeholder="Enter age"
              value={age}
              onChange={(event) => setAge(event.target.value)}
            />
            {profileAttempted && profileValidation.errors.age && (
              <p className="text-xs text-destructive">
                {profileValidation.errors.age}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-foreground">Email</Label>
            <Input
              type="email"
              className="h-8 text-sm bg-muted border-border text-foreground"
              placeholder="Enter email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            {profileAttempted && profileValidation.errors.email && (
              <p className="text-xs text-destructive">
                {profileValidation.errors.email}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-foreground">Phone Number</Label>
            <Input
              className="h-8 text-sm bg-muted border-border text-foreground"
              placeholder="+1 555-0000"
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(event.target.value)}
            />
            {profileAttempted && profileValidation.errors.phoneNumber && (
              <p className="text-xs text-destructive">
                {profileValidation.errors.phoneNumber}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-border text-foreground"
              onClick={goToMain}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!profileValidation.isValid}
              className="bg-accent text-accent-foreground hover:bg-accent/80 hover:shadow-md active:scale-[0.97] transition-all duration-200"
              onClick={handleSaveProfile}
            >
              Save
            </Button>
          </div>
        </div>
      )}

      {section === "password" && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <h3 className="font-display text-sm font-semibold text-foreground">
            Change Password
          </h3>
          <div className="space-y-1">
            <Label className="text-xs text-foreground">Current Password</Label>
            <Input
              type="password"
              className="h-8 text-sm bg-muted border-border text-foreground"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
            />
            {passwordAttempted && passwordValidation.errors.currentPassword && (
              <p className="text-xs text-destructive">
                {passwordValidation.errors.currentPassword}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-foreground">New Password</Label>
            <Input
              type="password"
              className="h-8 text-sm bg-muted border-border text-foreground"
              placeholder="••••••••"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
            />
            {passwordAttempted && passwordValidation.errors.newPassword && (
              <p className="text-xs text-destructive">
                {passwordValidation.errors.newPassword}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-border text-foreground"
              onClick={goToMain}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!passwordValidation.isValid}
              className="bg-accent text-accent-foreground hover:bg-accent/80 hover:shadow-md active:scale-[0.97] transition-all duration-200"
              onClick={handleSavePassword}
            >
              Save
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsTab;
