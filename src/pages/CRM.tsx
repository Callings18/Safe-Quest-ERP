import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Plus,
  Filter,
  MoreHorizontal,
  Phone,
  Mail,
  Building2,
  User,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

const leads = [
  {
    id: 1,
    name: "Copper Mining Corporation",
    contact: "David Mulenga",
    email: "david@coppermining.zm",
    phone: "+260 977 123 456",
    value: "K450,000",
    stage: "Proposal",
    probability: 75,
    assignedTo: "James Phiri",
  },
  {
    id: 2,
    name: "Zambia Retail Holdings",
    contact: "Grace Banda",
    email: "grace@zrh.co.zm",
    phone: "+260 966 789 012",
    value: "K120,000",
    stage: "Qualification",
    probability: 40,
    assignedTo: "Sarah Tembo",
  },
  {
    id: 3,
    name: "Sunshine Farms Ltd",
    contact: "Peter Zimba",
    email: "peter@sunshinefarms.zm",
    phone: "+260 955 456 789",
    value: "K280,000",
    stage: "Negotiation",
    probability: 85,
    assignedTo: "James Phiri",
  },
  {
    id: 4,
    name: "National Bank of Zambia",
    contact: "Monica Chanda",
    email: "monica@nbz.co.zm",
    phone: "+260 978 321 654",
    value: "K1,200,000",
    stage: "Discovery",
    probability: 25,
    assignedTo: "John Mwamba",
  },
];

const stages = [
  { name: "New", count: 8, value: "K2.1M" },
  { name: "Discovery", count: 5, value: "K1.8M" },
  { name: "Qualification", count: 4, value: "K980K" },
  { name: "Proposal", count: 3, value: "K1.2M" },
  { name: "Negotiation", count: 2, value: "K650K" },
];

const stageColors: Record<string, string> = {
  New: "bg-muted text-muted-foreground",
  Discovery: "bg-info/10 text-info border-info/20",
  Qualification: "bg-warning/10 text-warning border-warning/20",
  Proposal: "bg-primary/10 text-primary border-primary/20",
  Negotiation: "bg-success/10 text-success border-success/20",
};

export default function CRM() {
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">CRM & Sales</h1>
            <p className="text-muted-foreground">
              Manage leads, opportunities, and customer relationships
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Lead
          </Button>
        </div>

        {/* Pipeline Overview */}
        <div className="grid gap-4 md:grid-cols-5">
          {stages.map((stage, index) => (
            <Card key={stage.name} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className={stageColors[stage.name]}>
                    {stage.name}
                  </Badge>
                  <span className="text-lg font-bold">{stage.count}</span>
                </div>
                <p className="text-sm text-muted-foreground">Pipeline value</p>
                <p className="text-xl font-semibold text-primary">{stage.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="leads" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <TabsList>
              <TabsTrigger value="leads">Leads</TabsTrigger>
              <TabsTrigger value="contacts">Contacts</TabsTrigger>
              <TabsTrigger value="companies">Companies</TabsTrigger>
              <TabsTrigger value="deals">Deals</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search leads..." className="pl-9 w-64" />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <TabsContent value="leads">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="text-left p-4 font-medium text-muted-foreground">Company</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Contact</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Value</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Stage</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Probability</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Assigned To</th>
                        <th className="p-4"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {leads.map((lead) => (
                        <tr key={lead.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Building2 className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium hover:text-primary cursor-pointer transition-colors">
                                  {lead.name}
                                </p>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Mail className="h-3 w-3" />
                                  <span>{lead.email}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                                <User className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">{lead.contact}</p>
                                <p className="text-xs text-muted-foreground">{lead.phone}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="font-semibold">{lead.value}</span>
                          </td>
                          <td className="p-4">
                            <Badge variant="outline" className={stageColors[lead.stage]}>
                              {lead.stage}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary rounded-full"
                                  style={{ width: `${lead.probability}%` }}
                                />
                              </div>
                              <span className="text-sm text-muted-foreground">{lead.probability}%</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="text-sm">{lead.assignedTo}</span>
                          </td>
                          <td className="p-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                <DropdownMenuItem>Edit Lead</DropdownMenuItem>
                                <DropdownMenuItem>Create Quote</DropdownMenuItem>
                                <DropdownMenuItem>Convert to Deal</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contacts">
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Contact management coming soon...
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="companies">
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Company management coming soon...
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deals">
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Deal management coming soon...
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
