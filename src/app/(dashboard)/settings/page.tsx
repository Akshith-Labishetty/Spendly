"use client";

import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProfileSchema, changePasswordSchema, type UpdateProfileInput, type ChangePasswordInput } from "@/lib/validations";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Moon, Sun, Monitor, ShieldAlert, CheckCircle2, User } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { register: registerProfile, handleSubmit: handleProfileSubmit, formState: { isSubmitting: isProfileSubmitting } } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: session?.user?.name || "",
      currency: (session?.user as any)?.currency || "INR",
    }
  });

  const { register: registerPassword, handleSubmit: handlePasswordSubmit, reset: resetPassword, formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting } } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onProfileSubmit = async (data: UpdateProfileInput) => {
    setError(null);
    setProfileSuccess(false);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "profile", ...data }),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      await update({ name: data.name, currency: data.currency });
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      setError("Failed to update profile.");
    }
  };

  const onPasswordSubmit = async (data: ChangePasswordInput) => {
    setError(null);
    setPasswordSuccess(false);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "password", ...data }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to change password");
      setPasswordSuccess(true);
      resetPassword();
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to change password.");
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you absolutely sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.")) {
      return;
    }

    try {
      const res = await fetch("/api/settings", { method: "DELETE" });
      if (res.ok) {
        signOut({ callbackUrl: "/" });
      }
    } catch (err) {
      setError("Failed to delete account.");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and preferences.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive border border-destructive/20 font-medium">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          {/* Profile Settings */}
          <Card>
            <form onSubmit={handleProfileSubmit(onProfileSubmit)}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" /> Profile
                </CardTitle>
                <CardDescription>Update your personal information.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" {...registerProfile("name")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency Code</Label>
                  <Input id="currency" {...registerProfile("currency")} placeholder="INR, USD, EUR..." />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t p-6 pb-6 mt-6">
                <p className="text-sm text-muted-foreground">
                  {profileSuccess ? (
                    <span className="flex items-center text-green-500 gap-1"><CheckCircle2 className="h-4 w-4" /> Saved successfully</span>
                  ) : "Please save to apply changes."}
                </p>
                <Button type="submit" disabled={isProfileSubmitting}>Save Changes</Button>
              </CardFooter>
            </form>
          </Card>

          {/* Appearance Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize the theme of Spendly.</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-4">
              <Button 
                variant={theme === 'light' ? 'default' : 'outline'} 
                className="flex-1 gap-2"
                onClick={() => setTheme('light')}
              >
                <Sun className="h-4 w-4" /> Light
              </Button>
              <Button 
                variant={theme === 'dark' ? 'default' : 'outline'} 
                className="flex-1 gap-2"
                onClick={() => setTheme('dark')}
              >
                <Moon className="h-4 w-4" /> Dark
              </Button>
              <Button 
                variant={theme === 'system' ? 'default' : 'outline'} 
                className="flex-1 gap-2"
                onClick={() => setTheme('system')}
              >
                <Monitor className="h-4 w-4" /> System
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Password Settings */}
          <Card>
            <form onSubmit={handlePasswordSubmit(onPasswordSubmit)}>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your account password securely.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" {...registerPassword("currentPassword")} />
                  {passwordErrors.currentPassword && <p className="text-xs text-destructive">{passwordErrors.currentPassword.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" {...registerPassword("newPassword")} />
                  {passwordErrors.newPassword && <p className="text-xs text-destructive">{passwordErrors.newPassword.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                  <Input id="confirmNewPassword" type="password" {...registerPassword("confirmNewPassword")} />
                  {passwordErrors.confirmNewPassword && <p className="text-xs text-destructive">{passwordErrors.confirmNewPassword.message}</p>}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t p-6 pb-6 mt-6">
                <p className="text-sm text-muted-foreground">
                  {passwordSuccess ? (
                    <span className="flex items-center text-green-500 gap-1"><CheckCircle2 className="h-4 w-4" /> Password updated</span>
                  ) : "Minimum 8 characters."}
                </p>
                <Button type="submit" disabled={isPasswordSubmitting}>Update Password</Button>
              </CardFooter>
            </form>
          </Card>

          {/* Danger Zone */}
          <Card className="border-destructive/20">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <ShieldAlert className="h-5 w-5" /> Danger Zone
              </CardTitle>
              <CardDescription>Irreversible actions for your account.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h4 className="font-medium text-sm">Delete Account</h4>
                  <p className="text-xs text-muted-foreground">Permanently delete all your data and transactions.</p>
                </div>
                <Button variant="destructive" onClick={handleDeleteAccount}>
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
