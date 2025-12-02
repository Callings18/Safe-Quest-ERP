import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Construction, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ComingSoonProps {
  title: string;
  description: string;
}

export default function ComingSoon({ title, description }: ComingSoonProps) {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full animate-slide-up">
          <CardContent className="pt-12 pb-8 text-center space-y-4">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Construction className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-muted-foreground">{description}</p>
            <p className="text-sm text-muted-foreground">
              This module is under development and will be available soon.
            </p>
            <Button onClick={() => navigate("/")} className="gap-2 mt-4">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
