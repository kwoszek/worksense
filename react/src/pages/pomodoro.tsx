import { useEffect, useRef, useState } from "react";
import DefaultLayout from "@/layouts/default";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";

type Mode = "work" | "short" | "long";

const SETTINGS_KEY = "pomodoroSettings";

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

const defaultSettings = {
  workMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakInterval: 4,
  autoStartNext: true,
  sound: true,
};

export default function PomodoroPage() {
  const saved = loadSettings() ?? defaultSettings;
  const [settings] = useState(() => ({ ...defaultSettings, ...saved }));

  const [mode, setMode] = useState<Mode>("work");
  const [isRunning, setIsRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(() => settings.workMinutes * 60);
  const [cycles, setCycles] = useState(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    // ensure seconds match mode when mode changes
    if (mode === "work") setSecondsLeft(settings.workMinutes * 60);
    if (mode === "short") setSecondsLeft(settings.shortBreakMinutes * 60);
    if (mode === "long") setSecondsLeft(settings.longBreakMinutes * 60);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  useEffect(() => {
    if (!isRunning) return;
    intervalRef.current = window.setInterval(() => {
      setSecondsLeft((s) => s - 1);
    }, 1000);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [isRunning]);

  useEffect(() => {
    if (secondsLeft > 0) return;
    // session ended
    // small sound
    if (settings.sound) {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        o.type = "sine";
        o.frequency.value = 880;
        g.gain.value = 0.02;
        o.start();
        setTimeout(() => {
          o.stop();
          ctx.close();
        }, 200);
      } catch (e) {
        // ignore
      }
    }

    if (mode === "work") {
      const nextCycles = cycles + 1;
      setCycles(nextCycles);
      const isLong = nextCycles % settings.longBreakInterval === 0;
      const nextMode: Mode = isLong ? "long" : "short";
      setMode(nextMode);
      if (!settings.autoStartNext) setIsRunning(false);
    } else {
      // from break to work
      setMode("work");
      if (!settings.autoStartNext) setIsRunning(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.code === "Space") {
        e.preventDefault();
        setIsRunning((v) => !v);
      } else if (e.key.toLowerCase() === "r") {
        // reset
        setSecondsLeft(() => {
          if (mode === "work") return settings.workMinutes * 60;
          if (mode === "short") return settings.shortBreakMinutes * 60;
          return settings.longBreakMinutes * 60;
        });
        setIsRunning(false);
      } else if (e.key.toLowerCase() === "s") {
        // skip
        setSecondsLeft(0);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, settings]);

  const minutes = Math.floor(Math.max(0, secondsLeft) / 60);
  const seconds = Math.floor(Math.max(0, secondsLeft) % 60);

  const totalForMode = mode === "work" ? settings.workMinutes * 60 : mode === "short" ? settings.shortBreakMinutes * 60 : settings.longBreakMinutes * 60;
  const progress = 1 - secondsLeft / totalForMode;

  function handleStartPause() {
    setIsRunning((v) => !v);
  }

  function handleReset() {
    setIsRunning(false);
    if (mode === "work") setSecondsLeft(settings.workMinutes * 60);
    if (mode === "short") setSecondsLeft(settings.shortBreakMinutes * 60);
    if (mode === "long") setSecondsLeft(settings.longBreakMinutes * 60);
  }

  function handleSkip() {
    setSecondsLeft(0);
  }

  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-6 py-8 md:py-10">
        <div className="w-full max-w-xl p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Pomodoro</h2>
            <div className="text-sm opacity-80">Mode: {mode === "work" ? "Work" : mode === "short" ? "Short Break" : "Long Break"}</div>
          </div>

          <div className="mt-6 flex flex-col items-center gap-4">
            <div className="text-6xl font-mono">{String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}</div>
            <div className="w-full h-2 bg-muted/30 rounded overflow-hidden">
              <div className="h-2 bg-accent" style={{ width: `${Math.max(0, Math.min(1, progress)) * 100}%` }} />
            </div>
            <div className="flex gap-3 mt-4">
              <Button onPress={handleStartPause} size="sm">{isRunning ? "Pause" : "Start"}</Button>
              <Button onPress={handleReset} size="sm" variant="ghost">Reset</Button>
              <Button onPress={handleSkip} size="sm" variant="flat">Skip</Button>
             
            </div>
             <div className="flex gap-3 mt-4">
                 <Link href="/pomodoro/settings" underline="always" color="foreground">Settings</Link>
            </div>
            <div className="text-xs opacity-70 mt-2">Shortcuts: Space = start/pause · R = reset · S = skip</div>
          </div>
        </div>
      </section>
    </DefaultLayout>
  );
}
