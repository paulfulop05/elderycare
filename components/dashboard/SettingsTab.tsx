import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  validatePasswordChangeForm,
  validateUsernameForm,
} from "@/lib/validation";
import { User, Lock, Trash2 } from "lucide-react";
import { toast } from "sonner";

const SettingsTab = () => {
  const [section, setSection] = useState<"main" | "username" | "password">(
    "main",
  );
  const [username, setUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [usernameAttempted, setUsernameAttempted] = useState(false);
  const [passwordAttempted, setPasswordAttempted] = useState(false);

  const usernameValidation = validateUsernameForm(username);
  const passwordValidation = validatePasswordChangeForm({
    currentPassword,
    newPassword,
  });

  const goToMain = () => {
    setSection("main");
    setUsernameAttempted(false);
    setPasswordAttempted(false);
  };

  const handleSaveUsername = () => {
    setUsernameAttempted(true);

    if (!usernameValidation.isValid) {
      toast.error("Please enter a valid username.");
      return;
    }

    setUsername(usernameValidation.sanitized.username);
    toast.success("Username updated (prototype)");
    goToMain();
  };

  const handleSavePassword = () => {
    setPasswordAttempted(true);

    if (!passwordValidation.isValid) {
      toast.error("Please fix the password fields before saving.");
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    toast.success("Password changed (prototype)");
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
              onClick={() => setSection("username")}
            >
              <User className="h-3.5 w-3.5 mr-2" /> Change Username
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

      {section === "username" && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <h3 className="font-display text-sm font-semibold text-foreground">
            Change Username
          </h3>
          <div className="space-y-1">
            <Label className="text-xs text-foreground">New Username</Label>
            <Input
              className="h-8 text-sm bg-muted border-border text-foreground"
              placeholder="Enter new username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
            {usernameAttempted && usernameValidation.errors.username && (
              <p className="text-xs text-destructive">
                {usernameValidation.errors.username}
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
              disabled={!usernameValidation.isValid}
              className="bg-accent text-accent-foreground hover:bg-accent/80 hover:shadow-md active:scale-[0.97] transition-all duration-200"
              onClick={handleSaveUsername}
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
