import { Users, ShoppingCart, Trophy } from "lucide-react";
import { useState, useEffect } from "react";

interface StreakData {
  count: number;
  lastClickDate: string;
  weekLog: { [key: string]: boolean };
}

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Helper function to initialize week log
const initializeWeekLog = () => {
  const weekLog: { [key: string]: boolean } = {};
  DAYS_OF_WEEK.forEach((_, index) => {
    weekLog[index] = false;
  });
  return weekLog;
};

export function StatCards() {
  const [streak, setStreak] = useState<StreakData>({ 
    count: 0, 
    lastClickDate: "", 
    weekLog: initializeWeekLog()
  });

  useEffect(() => {
    const savedStreak = localStorage.getItem("dailyStreak");
    if (savedStreak) {
      const parsedStreak = JSON.parse(savedStreak);
      // Ensure weekLog exists and has proper structure
      setStreak({
        count: parsedStreak.count || 0,
        lastClickDate: parsedStreak.lastClickDate || "",
        weekLog: parsedStreak.weekLog || initializeWeekLog()
      });
    }
  }, []);

  const handleStreakClick = () => {
    const today = new Date();
    const todayString = today.toDateString();
    
    if (streak.lastClickDate === todayString) {
      return;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const isConsecutiveDay = streak.lastClickDate === yesterday.toDateString();

    let newCount;
    if (!streak.lastClickDate || isConsecutiveDay) {
      newCount = streak.count + 1;
    } else if (streak.lastClickDate !== todayString) {
      newCount = 1;
    } else {
      newCount = streak.count;
    }

    // Update week log
    const newWeekLog = { ...streak.weekLog };
    newWeekLog[today.getDay()] = true;

    const newStreak = { 
      count: newCount, 
      lastClickDate: todayString,
      weekLog: newWeekLog
    };
    
    setStreak(newStreak);
    localStorage.setItem("dailyStreak", JSON.stringify(newStreak));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div 
        className="stat-card cursor-pointer"
        style={{ 
          background: 'linear-gradient(135deg, #FF8C42 0%, #FFB566 100%)',
          color: 'white'
        }}
        onClick={handleStreakClick}
      >
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-medium">Daily Streak</p>
            <h3 className="text-3xl font-bold mt-2">{streak.count}</h3>
            <div className="flex gap-1 mt-2">
              {DAYS_OF_WEEK.map((day, index) => (
                <div
                  key={day}
                  className={`h-1.5 w-1.5 rounded-full ${
                    streak.weekLog[index] 
                      ? 'bg-white' 
                      : 'bg-white/30'
                  }`}
                  title={day}
                />
              ))}
            </div>
          </div>
          <Trophy className="h-8 w-8 opacity-80" />
        </div>
      </div>
      
      <div className="stat-card clients">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-medium">Total Tasks Completed</p>
            <h3 className="text-3xl font-bold mt-2">63</h3>
            <p className="text-sm mt-2">+1 last day</p>
          </div>
          <Users className="h-8 w-8 opacity-80" />
        </div>
      </div>
      
      <div className="stat-card purchases">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Habits Complete</p>
            <h3 className="text-3xl font-bold mt-2">10</h3>
            <p className="text-sm mt-2 text-gray-600">+1 last day</p>
          </div>
          <ShoppingCart className="h-8 w-8 text-gray-400" />
        </div>
      </div>
    </div>
  );
}