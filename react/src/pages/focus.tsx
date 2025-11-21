import { useEffect, useRef, useState } from "react";
import DefaultLayout from "@/layouts/default";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import {Card} from "@heroui/card";
import {
  Modal,
  ModalContent,
  useDisclosure,
} from "@heroui/react";

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

export default function FocusPage() {
  const saved = loadSettings() ?? defaultSettings;
  const [settings] = useState(() => ({ ...defaultSettings, ...saved }));
   const {isOpen, onOpen, onOpenChange} = useDisclosure();

  const [mode, setMode] = useState<Mode>("work");
  const [isRunning, setIsRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(() => settings.workMinutes * 60);
  const [cycles, setCycles] = useState(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
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
        setSecondsLeft(() => {
          if (mode === "work") return settings.workMinutes * 60;
          if (mode === "short") return settings.shortBreakMinutes * 60;
          return settings.longBreakMinutes * 60;
        });
        setIsRunning(false);
      } else if (e.key.toLowerCase() === "s") {
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
        <Card className="w-full max-w-xl p-6  mb-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Focus</h2>
             
            <div className="text-sm opacity-80">Tryb: {mode === "work" ? "Praca" : mode === "short" ? "Krótka przerwa" : "Długa przerwa"}</div>
          </div>
          <div className="flex gap-3 justify-center mt-2">
              <Link onPress={onOpen} underline="always" color="foreground">O technice</Link>
              <Link href="/focus/settings" underline="always" color="foreground">Ustawienia</Link>
            </div>

          <div className="mt-20 flex flex-col items-center gap-4">
            <div className="text-6xl font-mono">{String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}</div>
            <div className="w-full h-1 bg-muted-foreground  rounded overflow-hidden">
              <div className="h-1 bg-success" style={{ width: `${Math.max(0, Math.min(1, progress)) * 100}%` }} />
            </div>
            <div className="flex gap-3 mt-4 ">
              <Button onPress={handleStartPause} size="sm" color={isRunning ? "danger" : "success"} className="opacity-80">{isRunning ? "Pauza" : "Start"}</Button>
              <Button onPress={handleReset} size="sm" variant="ghost">Reset</Button>
              <Button onPress={handleSkip} size="sm" variant="flat">Pomiń</Button>
              
            </div>
           
            <div className="text-xs opacity-70 mt-2">Skróty: Spacja = start/pauza · R = reset · S = pomiń</div>
          </div>
        </Card>
      </section>



 <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl" className="mb-[5vh]">
        <ModalContent className="w-full max-h-[90vh] overflow-y-auto ">
            <section className="max-w-2xl mx-auto p-6 mt-10">
        <h1 className="text-4xl font-semibold mb-2">O technice pomodoro</h1>
        <p className="opacity-80">Technika Pomodoro to prosta metoda zarządzania czasem: pracujesz w krótkich, intensywnych blokach (standardowo 25 minut), po każdym bloku robisz krótką przerwę (5 minut), a po czterech blokach wykonujesz dłuższą przerwę (15–30 minut). Celem jest podział pracy na wykonalne fragmenty, które ułatwiają koncentrację i regularną regenerację.</p>

        <p className="mt-5 text-xl">Jak dokładnie to wygląda krok po kroku:</p>

        <ol className="list-decimal ml-10 opacity-80 mt-3">
            <li>Wybierz zadanie.</li>
            <li>pracujesz naczęściej 25 minut </li>
            <li>robisz 5 minut przerwy</li>
            <li>po 4 cyklach robisz przerwę 15-30 minut</li>
            <li>Dostosuj długości do siebie (np. 50/10 dla dłuższych bloków), ale zachowaj rytm pracy ↔ przerwy.</li>
        </ol>

        <p className="mt-5 text-xl">Dlaczego to pomaga z wypaleniem i uczy higieny pracy:</p>
        <ul className="list-disc ml-10 opacity-80 mt-3" >
            <li>Zapobiega przeciążeniu poznawczemu: krótkie przerwy przywracają uwagę i zmniejszają zmęczenie.</li>
            <li>Uczy graniczenia czasu pracy: regularne przerwy przeciwdziałają „ciągłemu siedzeniu” i długim, nieprzerwanym sesjom, które prowadzą do wypalenia.</li>
            <li>Wzmacnia poczucie sprawczości: małe, mierzalne postępy (ukończony blok) zwiększają motywację i zmniejszają prokrastynację.</li>
            <li>Ułatwia samoobserwację: monitorując liczbę ukończonych bloków widzisz realny rytm swojej energii i możesz korygować tempo.</li>
        </ul>

        <Link href="https://www.verywellmind.com/pomodoro-technique-5245237" showAnchorIcon color="success" className=" mt-10">
        Przeczytaj więcej o technice Pomodoro
        </Link>
        
      </section>  
        </ModalContent>
      </Modal>


    </DefaultLayout>
  );
}
