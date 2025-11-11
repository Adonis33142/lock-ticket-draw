import { Card } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { useEffect, useState } from "react";

export const DrawCountdown = () => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 45,
    seconds: 30,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <Card className="bg-gradient-to-r from-card via-card to-card border-border/50 shadow-glow-lg">
      <div className="p-6">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Clock className="h-6 w-6 text-primary animate-glow-pulse" />
          <h2 className="text-xl font-bold text-foreground">Next Draw In</h2>
        </div>
        
        <div className="flex items-center justify-center gap-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary tabular-nums">
              {String(timeLeft.hours).padStart(2, '0')}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Hours</div>
          </div>
          <div className="text-3xl text-primary">:</div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary tabular-nums">
              {String(timeLeft.minutes).padStart(2, '0')}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Minutes</div>
          </div>
          <div className="text-3xl text-primary">:</div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary tabular-nums">
              {String(timeLeft.seconds).padStart(2, '0')}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Seconds</div>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-4">
          All entries remain encrypted until draw completes
        </p>
      </div>
    </Card>
  );
};
