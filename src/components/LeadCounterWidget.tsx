import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, TrendingUp } from "lucide-react";

interface LeadCounterWidgetProps {
  submitSuccess?: boolean;
}

export default function LeadCounterWidget({ submitSuccess }: LeadCounterWidgetProps) {
  const [count, setCount] = useState<number | null>(null);
  const [isIncrementing, setIsIncrementing] = useState(false);

  // Fetch count from server API
  const fetchCount = async () => {
    try {
      const res = await fetch("/api/leads/today-count");
      if (res.ok) {
        const data = await res.json();
        if (data.success && typeof data.count === "number") {
          return data.count;
        }
      }
    } catch (err) {
      console.error("Error fetching lead count:", err);
    }
    return null;
  };

  useEffect(() => {
    let active = true;

    const initialize = async () => {
      const serverCount = await fetchCount();
      if (!active) return;

      if (serverCount !== null) {
        setCount(serverCount);
      } else {
        // Dynamic mock fallback based on local time to keep it highly realistic
        const currentHour = new Date().getHours();
        const baseCurve = Math.floor(40 + (currentHour * 4.5) + Math.sin(currentHour / 3) * 10);
        const dateSeed = new Date().getDate();
        const fluctuation = (dateSeed * 7) % 15;
        setCount(baseCurve + fluctuation);
      }
    };

    initialize();

    // Set up polling interval to sync with database count
    const syncInterval = setInterval(async () => {
      const serverCount = await fetchCount();
      if (!active) return;
      if (serverCount !== null) {
        setCount(prev => {
          if (prev !== null && serverCount > prev) {
            setIsIncrementing(true);
            setTimeout(() => setIsIncrementing(false), 1000);
          }
          return serverCount;
        });
      }
    }, 20000); // Poll every 20 seconds for updates

    // Simulate occasional micro-increments in between polls to create active human-feel social proof
    const simulationInterval = setInterval(() => {
      if (Math.random() < 0.35) { // 35% chance of another user downloading in this window
        setCount(prev => {
          if (prev !== null) {
            setIsIncrementing(true);
            setTimeout(() => setIsIncrementing(false), 1000);
            return prev + 1;
          }
          return prev;
        });
      }
    }, 12000); // evaluate simulation every 12 seconds

    return () => {
      active = false;
      clearInterval(syncInterval);
      clearInterval(simulationInterval);
    };
  }, []);

  // Instantly increment when the local user submits their lead successfully
  useEffect(() => {
    if (submitSuccess) {
      setCount(prev => {
        if (prev !== null) {
          setIsIncrementing(true);
          setTimeout(() => setIsIncrementing(false), 1000);
          return prev + 1;
        }
        return prev;
      });
    }
  }, [submitSuccess]);

  if (count === null) {
    return (
      <div className="h-10 w-full animate-pulse bg-slate-100 rounded-full flex items-center justify-center">
        <span className="text-xs text-slate-400 font-medium">Securing connection...</span>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50/60 border border-amber-200/50 rounded-full text-amber-900 shadow-sm/5 hover:bg-amber-50 transition-colors duration-300 select-none"
    >
      <TrendingUp className="h-4 w-4 text-amber-600 shrink-0" />
      <span className="text-xs font-semibold tracking-wide text-amber-800">
        <span className="inline-flex items-center justify-center min-w-[24px]">
          <AnimatePresence mode="wait">
            <motion.span
              key={count}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className={`font-bold tabular-nums ${isIncrementing ? "text-amber-600 scale-110" : ""}`}
            >
              {count}
            </motion.span>
          </AnimatePresence>
        </span>{" "}
        guides claimed today
      </span>
      <Sparkles className="h-3 w-3 text-amber-500 shrink-0 animate-spin-slow" />
    </motion.div>
  );
}
