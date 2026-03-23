import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Lock, Trash2 } from "lucide-react";
import { toast } from "sonner";

const SettingsTab = () => {
  const [section, setSection] = useState<"main" | "username" | "password">(
    "main",
  );

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
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-border text-foreground"
              onClick={() => setSection("main")}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-accent text-accent-foreground hover:bg-accent/80 hover:shadow-md active:scale-[0.97] transition-all duration-200"
              onClick={() => {
                toast.success("Username updated (prototype)");
                setSection("main");
              }}
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
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-foreground">New Password</Label>
            <Input
              type="password"
              className="h-8 text-sm bg-muted border-border text-foreground"
              placeholder="••••••••"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-border text-foreground"
              onClick={() => setSection("main")}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-accent text-accent-foreground hover:bg-accent/80 hover:shadow-md active:scale-[0.97] transition-all duration-200"
              onClick={() => {
                toast.success("Password changed (prototype)");
                setSection("main");
              }}
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
