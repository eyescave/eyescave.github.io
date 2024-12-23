import { Calendar } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { StatCards } from "@/components/StatCards";
import { ProfitChart } from "@/components/ProfitChart";

const Index = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DashboardSidebar />
        <main className="flex-1 p-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div>
                <h1 className="text-3xl font-bold mb-2">Monitor health of your business</h1>
                <p className="text-gray-600">Control and analyze your data in the easiest way</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 rounded-lg bg-gray-900 text-white">
                <Calendar className="h-5 w-5" />
              </button>
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