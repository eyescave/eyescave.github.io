import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { StatCards } from "@/components/StatCards";
import { ProfitChart } from "@/components/ProfitChart";
import { LayoutDashboard, Lightbulb, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DashboardSidebar />
        <main className="flex-1 p-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div className="flex items-center gap-6">
                <img 
                  src="/placeholder.svg" 
                  alt="Logo" 
                  className="h-8 w-8"
                />
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2"
                    onClick={() => navigate('/')}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Button>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2"
                    onClick={() => navigate('/ideas')}
                  >
                    <Lightbulb className="h-4 w-4" />
                    Ideas
                  </Button>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2"
                    onClick={() => navigate('/habits')}
                  >
                    <BookOpen className="h-4 w-4" />
                    Habits
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
            </div>
          </div>

          <StatCards />
          
          <div className="lg:col-span-2">
            <ProfitChart />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;