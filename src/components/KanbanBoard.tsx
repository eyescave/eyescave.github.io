import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { useToast } from "./ui/use-toast";

type Task = {
  id: string;
  content: string;
  status: "todo" | "inProgress" | "done";
};

export function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const { toast } = useToast();

  const addTask = () => {
    if (!newTask.trim()) {
      toast({
        title: "Task cannot be empty",
        variant: "destructive",
      });
      return;
    }

    const task: Task = {
      id: Date.now().toString(),
      content: newTask,
      status: "todo",
    };

    setTasks([...tasks, task]);
    setNewTask("");
    toast({
      title: "Task added successfully",
    });
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: Task["status"]) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status } : task
    ));

    toast({
      title: "Task moved successfully",
    });
  };

  const columns = [
    { title: "To Do", status: "todo" as const },
    { title: "In Progress", status: "inProgress" as const },
    { title: "Done", status: "done" as const },
  ];

  return (
    <div className="p-6">
      <div className="mb-6 flex gap-4">
        <Input
          placeholder="Add a new task..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && addTask()}
          className="max-w-md"
        />
        <Button onClick={addTask}>
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((column) => (
          <div
            key={column.status}
            className="bg-muted p-4 rounded-lg"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.status)}
          >
            <h3 className="font-semibold mb-4">{column.title}</h3>
            <div className="space-y-3">
              {tasks
                .filter((task) => task.status === column.status)
                .map((task) => (
                  <Card
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    className="p-3 cursor-move bg-background hover:shadow-md transition-shadow"
                  >
                    <p>{task.content}</p>
                  </Card>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}