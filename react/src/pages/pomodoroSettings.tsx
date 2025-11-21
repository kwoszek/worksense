import { useState } from "react";
import DefaultLayout from "@/layouts/default";
import { Button } from "@heroui/button";
import { useNavigate } from "react-router-dom";
import {NumberInput} from "@heroui/react";
import {Checkbox} from "@heroui/react";
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
        <h2 className="text-4xl mb-4">Ustawienia trybu Focus</h2>
        <div className="grid grid-cols-2 gap-5 m-10">
         
            
            <NumberInput size="lg" labelPlacement="outside" type="number" minValue={1} label="Minuty pracy" value={workMinutes} onValueChange={setWorkMinutes}  endContent={<span className="text-default-400 text-small mr-2">min</span>}/>
       
        
           
            <NumberInput  size="lg" labelPlacement="outside" type="number" minValue={1}  label="Minuty krótkiej przerwy" value={shortBreakMinutes} onValueChange={setShortBreakMinutes} endContent={<span className="text-default-400 text-small mr-2">min</span>} />
          
           
            <NumberInput  size="lg" labelPlacement="outside" type="number"minValue={1}  label="Minuty długiej przerwy" value={longBreakMinutes} onValueChange={setLongBreakMinutes} endContent={<span className="text-default-400 text-small mr-2">min</span>}/>
         
            
            <NumberInput  size="lg" labelPlacement="outside" type="number" minValue={1}  label="Długa przerwa co (cykle)" value={longBreakInterval} onValueChange={setLongBreakInterval} endContent={<span className="text-default-400 text-small mr-2">cykli</span>}/>
         
          
          

            <Checkbox color="success" isSelected={autoStartNext} onValueChange={setAutoStartNext} > Automatycznie uruchom następną sesję</Checkbox>        
            <Checkbox isSelected={sound} color="success" onValueChange={setSound} > Odtwarzaj dźwięk po zakończeniu sesji</Checkbox>
         
            
           
          
          <div className="flex gap-3">
            <Button onPress={save} color="success">Zapisz</Button>
            <Button onPress={() => nav("/focus")} variant="ghost">Anuluj</Button>
          </div>
        </div>
      </section>
    </DefaultLayout>
  );
}
