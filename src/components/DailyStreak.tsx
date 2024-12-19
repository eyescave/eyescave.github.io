import { useState, useEffect } from "react";
import { Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface StreakData {
  count: number;
  lastClickDate: string;
}

export function DailyStreak() {
  const [streak, setStreak] = useState<StreakData>({ count: 0, lastClickDate: "" });
  const { toast } = useToast();

  useEffect(() => {
    const savedStreak = localStorage.getItem("dailyStreak");
    if (savedStreak) {
      setStreak(JSON.parse(savedStreak));
    }
  }, []);

  const handleStreakClick = () => {
    const today = new Date().toDateString();
    
    if (streak.lastClickDate === today) {
      toast({
        title: "Already clicked today!",
        description: "Come back tomorrow to continue your streak!",
      });
      return;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const isConsecutiveDay = streak.lastClickDate === yesterday.toDateString();

    let newCount;
    if (!streak.lastClickDate || isConsecutiveDay) {
      newCount = streak.count + 1;
    } else if (streak.lastClickDate !== today) {
      newCount = 1; // Reset streak if not consecutive
    } else {
      newCount = streak.count;
    }

    const newStreak = { count: newCount, lastClickDate: today };
    setStreak(newStreak);
    localStorage.setItem("dailyStreak", JSON.stringify(newStreak));

    toast({
      title: isConsecutiveDay ? "Streak continued!" : "New streak started!",
      description: `Current streak: ${newCount} day${newCount === 1 ? '' : 's'}`,
    });
  };

  return (
    <div className="flex items-center gap-4">
      <Button
        onClick={handleStreakClick}
        className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
      >
        <Trophy className="mr-2 h-4 w-4" />
        Daily Streak
      </Button>
      <span className="text-sm font-medium">
        {streak.count} day{streak.count === 1 ? '' : 's'}
      </span>
    </div>
  );
}