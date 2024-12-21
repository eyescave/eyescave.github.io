import { KanbanBoard } from "@/components/KanbanBoard";

const Kanban = () => {
  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-8">Kanban Board</h1>
      <KanbanBoard />
    </div>
  );
};

export default Kanban;