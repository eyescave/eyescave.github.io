import { Search, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { StatCards } from "@/components/StatCards";
import { ProfitChart } from "@/components/ProfitChart";
import { PropertyListings } from "@/components/PropertyListings";
import { DailyStreak } from "@/components/DailyStreak";

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
              <DailyStreak />
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input 
                  placeholder="Search" 
                  className="pl-10 w-64"
                />
              </div>
              <button className="p-2 rounded-lg bg-gray-900 text-white">
                <Calendar className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex gap-4 mb-8">
            <button className="px-6 py-2 rounded-full bg-blue-50 text-sm">Week</button>
            <button className="px-6 py-2 rounded-full text-sm text-gray-500">Month</button>
            <button className="px-6 py-2 rounded-full text-sm text-gray-500">Year</button>
          </div>

          <StatCards />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <ProfitChart />
            </div>
            <div>
              <PropertyListings />
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;