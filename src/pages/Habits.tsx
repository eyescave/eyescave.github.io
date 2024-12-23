import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const Habits = () => {
  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar />
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Habits Tracker</h1>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Habit
          </Button>
        </div>
        <p className="text-gray-600">Track and manage your daily habits here.</p>
      </div>
    </div>
  );
};

export default Habits;