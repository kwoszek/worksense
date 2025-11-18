import { useState } from "react";
import DefaultLayout from "@/layouts/default";
import { Button } from "@heroui/button";
import { useNavigate } from "react-router-dom";

const KEY = "pomodoroSettings";

export default function PomodoroSettingsPage() {
  const nav = useNavigate();
  const raw = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
  const parsed = raw ? JSON.parse(raw) : null;

  const [workMinutes, setWorkMinutes] = useState(parsed?.workMinutes ?? 25);
  const [shortBreakMinutes, setShortBreakMinutes] = useState(parsed?.shortBreakMinutes ?? 5);
  const [longBreakMinutes, setLongBreakMinutes] = useState(parsed?.longBreakMinutes ?? 15);
  const [longBreakInterval, setLongBreakInterval] = useState(parsed?.longBreakInterval ?? 4);
  const [autoStartNext, setAutoStartNext] = useState(parsed?.autoStartNext ?? true);
  const [sound, setSound] = useState(parsed?.sound ?? true);

  function save() {
    const payload = { workMinutes: Number(workMinutes), shortBreakMinutes: Number(shortBreakMinutes), longBreakMinutes: Number(longBreakMinutes), longBreakInterval: Number(longBreakInterval), autoStartNext: !!autoStartNext, sound: !!sound };
    localStorage.setItem(KEY, JSON.stringify(payload));
    nav("/focus");
  }

  return (
    <DefaultLayout>
      <section className="max-w-xl mx-auto p-6">
        <h2 className="text-2xl mb-4">Pomodoro Settings</h2>
        <div className="grid gap-3">
          <label>
            Work minutes
            <input className="ml-2 p-1 border rounded w-20" type="number" value={workMinutes} onChange={(e) => setWorkMinutes(Number(e.target.value))} />
          </label>
          <label>
            Short break minutes
            <input className="ml-2 p-1 border rounded w-20" type="number" value={shortBreakMinutes} onChange={(e) => setShortBreakMinutes(Number(e.target.value))} />
          </label>
          <label>
            Long break minutes
            <input className="ml-2 p-1 border rounded w-20" type="number" value={longBreakMinutes} onChange={(e) => setLongBreakMinutes(Number(e.target.value))} />
          </label>
          <label>
            Long break every (cycles)
            <input className="ml-2 p-1 border rounded w-20" type="number" value={longBreakInterval} onChange={(e) => setLongBreakInterval(Number(e.target.value))} />
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={autoStartNext} onChange={(e) => setAutoStartNext(e.target.checked)} />
            Auto start next session
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={sound} onChange={(e) => setSound(e.target.checked)} />
            Play sound when session ends
          </label>
          <div className="flex gap-3">
            <Button onPress={save}>Save</Button>
            <Button onPress={() => nav("/focus")} variant="ghost">Cancel</Button>
          </div>
        </div>
      </section>
    </DefaultLayout>
  );
}
