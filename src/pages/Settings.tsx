import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, User, Lock, Bell, Building2, Shield, LogOut, Save, Mail, Phone, Camera } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useCompanySettings, useUpdateCompanySettings, useMyRoles, useStaffUsers, useSetUserRole } from "@/hooks/useCompanySettings";

export default function Settings() {
  const { user, signOut, updatePassword } = useAuth();
  const queryClient = useQueryClient();
  const { data: company } = useCompanySettings();
  const updateCompany = useUpdateCompanySettings();
  const { data: myRoles } = useMyRoles();
  const { data: staff } = useStaffUsers();
  const setRole = useSetUserRole();
  const isAdmin = myRoles?.includes("admin");

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const [profileForm, setProfileForm] = useState({
    full_name: "",
    phone: "",
  });
  const [passwordForm, setPasswordForm] = useState({ current: "", next: "", confirm: "" });
  const [savingPassword, setSavingPassword] = useState(false);
  const [companyForm, setCompanyForm] = useState({
    company_name: "", tpin: "", address: "", city: "", phone: "", email: "",
    bank_name: "", bank_branch: "", account_name: "", account_number: "",
  });
  const [prefs, setPrefs] = useState<Record<string, { email: boolean; sms: boolean }>>({});

  useEffect(() => {
    if (profile) {
      setProfileForm({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
      });
      const stored = (profile.notification_prefs || {}) as Record<string, { email: boolean; sms: boolean }>;
      setPrefs(stored);
    }
  }, [profile]);

  useEffect(() => {
    if (company) {
      setCompanyForm({
        company_name: company.company_name || "",
        tpin: company.tpin || "",
        address: company.address || "",
        city: company.city || "",
        phone: company.phone || "",
        email: company.email || "",
        bank_name: company.bank_name || "",
        bank_branch: company.bank_branch || "",
        account_name: company.account_name || "",
        account_number: company.account_number || "",
      });
    }
  }, [company]);

  const updateProfile = useMutation({
    mutationFn: async (data: typeof profileForm) => {
      if (!user?.id) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: data.full_name,
          phone: data.phone,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile updated successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to update profile: " + error.message);
    },
  });

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(profileForm);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your account and system preferences</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-flex">
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Lock className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="company" className="gap-2">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Company</span>
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="roles" className="gap-2">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Roles</span>
              </TabsTrigger>
            )}
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal information and how others see you.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  {/* Avatar Section */}
                  <div className="flex items-center gap-6">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={profile?.avatar_url || ""} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xl">
                        {getInitials(profile?.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <Button type="button" variant="outline" size="sm" className="gap-2">
                        <Camera className="h-4 w-4" />
                        Change Photo
                      </Button>
                      <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max 2MB.</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        value={profileForm.full_name}
                        onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                        placeholder="Your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          value={user?.email || ""}
                          disabled
                          className="pl-9 bg-muted"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Contact support to change your email.</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                          placeholder="+260 97X XXX XXX"
                          className="pl-9"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={updateProfile.isPending} className="gap-2">
                      {updateProfile.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                      <Save className="h-4 w-4" />
                      Save Changes
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Sign Out Card */}
            <Card className="border-destructive/30">
              <CardHeader>
                <CardTitle className="text-destructive">Sign Out</CardTitle>
                <CardDescription>Sign out of your account on this device.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="destructive" onClick={handleSignOut} className="gap-2">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>Change your password to keep your account secure.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <Input type="password" placeholder="Enter new password" value={passwordForm.next} onChange={(e) => setPasswordForm({ ...passwordForm, next: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Confirm New Password</Label>
                  <Input type="password" placeholder="Confirm new password" value={passwordForm.confirm} onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })} />
                </div>
                <Button
                  className="gap-2"
                  disabled={savingPassword}
                  onClick={async () => {
                    if (passwordForm.next.length < 6) {
                      toast.error("Password must be at least 6 characters");
                      return;
                    }
                    if (passwordForm.next !== passwordForm.confirm) {
                      toast.error("Passwords do not match");
                      return;
                    }
                    setSavingPassword(true);
                    const { error } = await updatePassword(passwordForm.next);
                    setSavingPassword(false);
                    if (error) toast.error(error.message);
                    else {
                      toast.success("Password updated");
                      setPasswordForm({ current: "", next: "", confirm: "" });
                    }
                  }}
                >
                  {savingPassword && <Loader2 className="h-4 w-4 animate-spin" />}
                  <Lock className="h-4 w-4" />
                  Update Password
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Saved to your profile on this Supabase project.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: "invoice_reminders", label: "Invoice Reminders", description: "Get notified about overdue invoices" },
                  { key: "payment_received", label: "Payment Received", description: "Notification when payment is received" },
                  { key: "loan_repayments", label: "Loan Repayments", description: "Reminders for upcoming loan repayments" },
                  { key: "compliance_deadlines", label: "Compliance Deadlines", description: "Alerts for document expirations" },
                  { key: "payroll_processing", label: "Payroll Processing", description: "Notifications for payroll runs" },
                ].map((item) => {
                  const value = prefs[item.key] || { email: true, sms: false };
                  return (
                    <div key={item.key} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <div>
                        <p className="font-medium">{item.label}</p>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <label className="flex items-center gap-2">
                          <Switch
                            checked={value.email}
                            onCheckedChange={(checked) => setPrefs((p) => ({ ...p, [item.key]: { ...value, email: checked } }))}
                          />
                          Email
                        </label>
                        <label className="flex items-center gap-2">
                          <Switch
                            checked={value.sms}
                            onCheckedChange={(checked) => setPrefs((p) => ({ ...p, [item.key]: { ...value, sms: checked } }))}
                          />
                          SMS
                        </label>
                      </div>
                    </div>
                  );
                })}
                <Button
                  className="gap-2"
                  onClick={async () => {
                    if (!user?.id) return;
                    const { error } = await supabase.from("profiles").update({ notification_prefs: prefs }).eq("id", user.id);
                    if (error) toast.error(error.message);
                    else toast.success("Preferences saved");
                  }}
                >
                  <Save className="h-4 w-4" />Save preferences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="company" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>Used on invoices and official documents.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2"><Label>Company Name</Label><Input value={companyForm.company_name} onChange={(e) => setCompanyForm({ ...companyForm, company_name: e.target.value })} /></div>
                  <div className="space-y-2"><Label>TPIN</Label><Input value={companyForm.tpin} onChange={(e) => setCompanyForm({ ...companyForm, tpin: e.target.value })} /></div>
                  <div className="space-y-2 md:col-span-2"><Label>Address</Label><Input value={companyForm.address} onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })} /></div>
                  <div className="space-y-2"><Label>City</Label><Input value={companyForm.city} onChange={(e) => setCompanyForm({ ...companyForm, city: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Phone</Label><Input value={companyForm.phone} onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })} /></div>
                  <div className="space-y-2 md:col-span-2"><Label>Email</Label><Input type="email" value={companyForm.email} onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })} /></div>
                </div>
                <Button className="gap-2" onClick={() => updateCompany.mutate(companyForm)} disabled={updateCompany.isPending}>
                  <Save className="h-4 w-4" />Save Company Info
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Bank Details</CardTitle>
                <CardDescription>Shown on invoices.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2"><Label>Bank Name</Label><Input value={companyForm.bank_name} onChange={(e) => setCompanyForm({ ...companyForm, bank_name: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Branch</Label><Input value={companyForm.bank_branch} onChange={(e) => setCompanyForm({ ...companyForm, bank_branch: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Account Name</Label><Input value={companyForm.account_name} onChange={(e) => setCompanyForm({ ...companyForm, account_name: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Account Number</Label><Input value={companyForm.account_number} onChange={(e) => setCompanyForm({ ...companyForm, account_number: e.target.value })} /></div>
                </div>
                <Button className="gap-2" onClick={() => updateCompany.mutate(companyForm)} disabled={updateCompany.isPending}>
                  <Save className="h-4 w-4" />Save Bank Details
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {isAdmin && (
            <TabsContent value="roles" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Staff roles</CardTitle>
                  <CardDescription>Assign ERP access. First registered user is admin automatically.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(staff || []).map((s) => (
                    <div key={s.id} className="p-4 rounded-lg border space-y-2">
                      <p className="font-medium">{s.full_name || s.email}</p>
                      <p className="text-xs text-muted-foreground">{s.email}</p>
                      <div className="flex flex-wrap gap-2">
                        {["admin", "manager", "accountant", "sales", "technician", "loan_officer", "hr"].map((role) => {
                          const on = s.roles.includes(role as never);
                          return (
                            <Button
                              key={role}
                              size="sm"
                              variant={on ? "default" : "outline"}
                              onClick={() => setRole.mutate({ userId: s.id, role, enabled: !on })}
                            >
                              {role}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </AppLayout>
  );
}
