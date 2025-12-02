import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Plus,
  Search,
  Filter,
  ShieldCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  Bell,
  FileText,
  Building2,
  Car,
  Users,
  Upload,
} from "lucide-react";

const complianceStats = {
  total: 28,
  valid: 20,
  expiringSoon: 5,
  expired: 3,
};

const documents = [
  {
    id: 1,
    name: "PACRA Business Registration",
    category: "Business License",
    issueDate: "2024-01-15",
    expiryDate: "2025-01-14",
    status: "valid",
    daysRemaining: 43,
    reminderDays: [30, 14, 7],
  },
  {
    id: 2,
    name: "ZRA Tax Clearance Certificate",
    category: "Tax",
    issueDate: "2024-06-01",
    expiryDate: "2024-12-31",
    status: "expiring-soon",
    daysRemaining: 29,
    reminderDays: [30, 14, 7],
  },
  {
    id: 3,
    name: "NAPSA Compliance Certificate",
    category: "Statutory",
    issueDate: "2024-10-01",
    expiryDate: "2024-12-09",
    status: "expiring-soon",
    daysRemaining: 7,
    reminderDays: [30, 14, 7],
  },
  {
    id: 4,
    name: "NHIMA Registration",
    category: "Statutory",
    issueDate: "2024-03-01",
    expiryDate: "2025-02-28",
    status: "valid",
    daysRemaining: 88,
    reminderDays: [30, 14, 7],
  },
  {
    id: 5,
    name: "Vehicle Insurance - ABL 1234",
    category: "Vehicle",
    issueDate: "2024-01-01",
    expiryDate: "2024-11-30",
    status: "expired",
    daysRemaining: -2,
    reminderDays: [30, 14, 7],
  },
  {
    id: 6,
    name: "Fire Safety Certificate",
    category: "Safety",
    issueDate: "2024-05-15",
    expiryDate: "2025-05-14",
    status: "valid",
    daysRemaining: 163,
    reminderDays: [30, 14, 7],
  },
  {
    id: 7,
    name: "Contractor License - Solar",
    category: "Professional",
    issueDate: "2024-02-01",
    expiryDate: "2024-12-15",
    status: "expiring-soon",
    daysRemaining: 13,
    reminderDays: [30, 14, 7],
  },
  {
    id: 8,
    name: "Workers Compensation Insurance",
    category: "Insurance",
    issueDate: "2024-06-01",
    expiryDate: "2024-11-25",
    status: "expired",
    daysRemaining: -7,
    reminderDays: [30, 14, 7],
  },
];

const upcomingDeadlines = [
  { title: "PAYE Submission", date: "2024-12-10", type: "statutory" },
  { title: "NAPSA Contribution", date: "2024-12-10", type: "statutory" },
  { title: "NHIMA Remittance", date: "2024-12-10", type: "statutory" },
  { title: "VAT Return", date: "2024-12-21", type: "tax" },
  { title: "Annual Return Filing", date: "2025-01-31", type: "corporate" },
];

const statusConfig = {
  valid: { color: "bg-success/10 text-success border-success/20", icon: CheckCircle2 },
  "expiring-soon": { color: "bg-warning/10 text-warning border-warning/20", icon: Clock },
  expired: { color: "bg-destructive/10 text-destructive border-destructive/20", icon: AlertTriangle },
};

const categoryIcons: Record<string, React.ComponentType<any>> = {
  "Business License": Building2,
  Tax: FileText,
  Statutory: ShieldCheck,
  Vehicle: Car,
  Safety: ShieldCheck,
  Professional: Users,
  Insurance: ShieldCheck,
};

export default function Compliance() {
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Compliance & Reminders</h1>
            <p className="text-muted-foreground">
              Track licenses, permits, and statutory filing deadlines
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Document
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="animate-slide-up">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Documents</p>
                  <p className="text-2xl font-bold">{complianceStats.total}</p>
                </div>
                <div className="p-3 rounded-xl bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="animate-slide-up" style={{ animationDelay: "50ms" }}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Valid</p>
                  <p className="text-2xl font-bold text-success">{complianceStats.valid}</p>
                </div>
                <div className="p-3 rounded-xl bg-success/10">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="animate-slide-up" style={{ animationDelay: "100ms" }}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Expiring Soon</p>
                  <p className="text-2xl font-bold text-warning">{complianceStats.expiringSoon}</p>
                </div>
                <div className="p-3 rounded-xl bg-warning/10">
                  <Clock className="h-5 w-5 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="animate-slide-up" style={{ animationDelay: "150ms" }}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Expired</p>
                  <p className="text-2xl font-bold text-destructive">{complianceStats.expired}</p>
                </div>
                <div className="p-3 rounded-xl bg-destructive/10">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alert Banner */}
        {complianceStats.expired > 0 && (
          <Card className="border-destructive/30 bg-destructive/5 animate-slide-up" style={{ animationDelay: "200ms" }}>
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-destructive">Action Required</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    You have {complianceStats.expired} expired documents that require immediate attention.
                    Failure to renew may result in penalties or business interruption.
                  </p>
                </div>
                <Button variant="destructive" size="sm">View Expired</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Documents */}
          <div className="lg:col-span-2 space-y-4">
            <Tabs defaultValue="all" className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="expiring">Expiring</TabsTrigger>
                  <TabsTrigger value="expired">Expired</TabsTrigger>
                </TabsList>
                
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search documents..." className="pl-9 w-48" />
                  </div>
                </div>
              </div>

              <TabsContent value="all" className="space-y-3">
                {documents.map((doc, index) => {
                  const StatusIcon = statusConfig[doc.status as keyof typeof statusConfig].icon;
                  const CategoryIcon = categoryIcons[doc.category] || FileText;
                  return (
                    <Card
                      key={doc.id}
                      className={`hover:border-primary/30 transition-colors cursor-pointer animate-slide-up ${
                        doc.status === "expired" ? "border-destructive/30" : ""
                      }`}
                      style={{ animationDelay: `${250 + index * 50}ms` }}
                    >
                      <CardContent className="py-4">
                        <div className="flex items-start gap-4">
                          <div className={`p-2 rounded-lg ${
                            doc.status === "valid" ? "bg-success/10" :
                            doc.status === "expiring-soon" ? "bg-warning/10" : "bg-destructive/10"
                          }`}>
                            <CategoryIcon className={`h-5 w-5 ${
                              doc.status === "valid" ? "text-success" :
                              doc.status === "expiring-soon" ? "text-warning" : "text-destructive"
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h4 className="font-semibold truncate">{doc.name}</h4>
                                <p className="text-sm text-muted-foreground">{doc.category}</p>
                              </div>
                              <Badge variant="outline" className={statusConfig[doc.status as keyof typeof statusConfig].color}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {doc.status === "valid" ? "Valid" : doc.status === "expiring-soon" ? "Expiring" : "Expired"}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 mt-3 text-sm">
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>Expires: {new Date(doc.expiryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                              </div>
                              {doc.daysRemaining > 0 ? (
                                <span className={doc.daysRemaining <= 30 ? "text-warning font-medium" : "text-muted-foreground"}>
                                  {doc.daysRemaining} days remaining
                                </span>
                              ) : (
                                <span className="text-destructive font-medium">
                                  Expired {Math.abs(doc.daysRemaining)} days ago
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">View</Button>
                            <Button size="sm">Renew</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </TabsContent>

              <TabsContent value="expiring" className="space-y-3">
                {documents.filter(d => d.status === "expiring-soon").map((doc) => {
                  const CategoryIcon = categoryIcons[doc.category] || FileText;
                  return (
                    <Card key={doc.id} className="hover:border-primary/30 transition-colors cursor-pointer border-warning/30">
                      <CardContent className="py-4">
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-warning/10">
                            <CategoryIcon className="h-5 w-5 text-warning" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold">{doc.name}</h4>
                            <p className="text-sm text-warning">Expires in {doc.daysRemaining} days</p>
                          </div>
                          <Button size="sm">Renew Now</Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </TabsContent>

              <TabsContent value="expired" className="space-y-3">
                {documents.filter(d => d.status === "expired").map((doc) => {
                  const CategoryIcon = categoryIcons[doc.category] || FileText;
                  return (
                    <Card key={doc.id} className="hover:border-primary/30 transition-colors cursor-pointer border-destructive/30">
                      <CardContent className="py-4">
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-destructive/10">
                            <CategoryIcon className="h-5 w-5 text-destructive" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold">{doc.name}</h4>
                            <p className="text-sm text-destructive">Expired {Math.abs(doc.daysRemaining)} days ago</p>
                          </div>
                          <Button variant="destructive" size="sm">Urgent: Renew</Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Upcoming Deadlines */}
            <Card className="animate-slide-up" style={{ animationDelay: "300ms" }}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Upcoming Deadlines
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingDeadlines.map((deadline, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div>
                      <p className="text-sm font-medium">{deadline.title}</p>
                      <p className="text-xs text-muted-foreground">{deadline.type}</p>
                    </div>
                    <Badge variant="outline">
                      {new Date(deadline.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Reminder Settings */}
            <Card className="animate-slide-up" style={{ animationDelay: "350ms" }}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  Reminder Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Email notifications</span>
                  <Badge className="bg-success/10 text-success border-success/20">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">SMS alerts</span>
                  <Badge className="bg-success/10 text-success border-success/20">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">WhatsApp reminders</span>
                  <Badge variant="outline">Inactive</Badge>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-2">
                  Configure Reminders
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
