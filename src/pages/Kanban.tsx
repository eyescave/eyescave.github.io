import { KanbanBoard } from "@/components/KanbanBoard";
import { SidebarProvider } from "@/components/ui/sidebar";
import { KanbanSidebar } from "@/components/KanbanSidebar";

const Kanban = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <KanbanSidebar />
        <main className="flex-1">
          <div className="container mx-auto">
            <h1 className="text-3xl font-bold mb-8">Kanban Board</h1>
            <KanbanBoard />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Kanban;