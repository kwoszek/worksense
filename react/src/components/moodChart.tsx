import {Card, CardHeader, CardBody} from "@heroui/card";
import HeatMap from '@uiw/react-heat-map';
import { useSelector } from 'react-redux';
import { selectAuthUser } from '@/features/auth/authSlice';
import {Tooltip} from "@heroui/tooltip";
// No longer need analyses; moodScore is returned on checkins

type Checkin = { date: string; stress?: number; energy?: number; moodScore?: number };

interface Props {
  checkins?: Checkin[];
}

type HeatValue = { date: string; count: number; content: string };

function buildValueFromCheckins(checkins?: Checkin[]): HeatValue[] {
  if (!checkins || !checkins.length) return [{}];
  const sorted = [...checkins].sort((a, b) => (a.date > b.date ? 1 : -1));

  return sorted.map((v) => {
    const date = v.date?.slice(0, 10) ?? new Date().toISOString().slice(0, 10);
    const stress = typeof v.stress === 'number' ? v.stress : 5;
    const energy = typeof v.energy === 'number' ? v.energy : 5;

    // Priority: moodScore from checkin (comes from AI via API) -> fallback formula
    const moodScore = typeof v.moodScore === 'number' ? v.moodScore : undefined;
    const fallbackCount = energy + (10 - stress);
    const count = typeof moodScore === 'number' ? moodScore : fallbackCount;

    return { date, count, content: `Mood: ${count} | Stress: ${stress} | Energy: ${energy}` };
  });
}

function MoodChart({ checkins }: Props) {
  const value = buildValueFromCheckins(checkins);
  const startDate = value.length ? new Date(value[0].date) : new Date();
  const user = useSelector(selectAuthUser);
  const streak = user?.streak ?? 0;
  return (
    <>
     <Card className="p-3">
      <CardBody>
        <p className="text-2xl opacity-100 text-foreground-500">Twoja seria dbania o siebie: <strong className="opacity-100 text-foreground">{streak} {streak > 1 ? "dni" : "dzień"}</strong></p>
      </CardBody>
    </Card>
    <Card className="p-3">
        <CardHeader>
          <h2 className="text-2xl opacity-80">Wykres nastroju</h2>
        </CardHeader>
      <CardBody>
         <HeatMap
          value={value}
          style={{ color: 'success' }}
          weekLabels={['', 'Pn', '', 'Śr', '', 'Pt', '']}
          startDate={startDate}
          rectProps={{
          rx: "2"
        }}
          panelColors={{

        
      
      0: "#88888833",

1: "#d0e7ff",   // bardzo jasny błękit — lekki, spokojny
2: "#b9dcff",   // chłodny, nadal jasny niebieski
3: "#a2d1ff",   // czytelny błękit, ale wciąż łagodny

4: "#8bd0f2",   // jaśniejszy, bardziej turkusowy
5: "#74cbe4",   // naturalny pastelowy turkus

6: "#5fc9d1",   // wyraźniejszy turkus — początek "pozytywnych" odcieni
7: "#54d4bb",   // świeży miękki zielono-turkusowy

8: "#68e3ae",   // jasna pastelowa zieleń
9: "#82efb6",   // bardzo pozytywna, ale miękka zieleń

10: "#b6ffd1"   // najjaśniejsza, bardzo przyjemna zieleń — „top mood”
      }} rectRender={(props, data) => {
        if(data.count){
           console.log('rectRender data:', data);
        console.log('rectRender props:', props);
        }
       
        return (
          <>
        {data.count ? ( <Tooltip placement="top" content={<div className="text-left"><p className="font-bold ">{data.date}</p> <p>nastrój: {data.count}</p> </div>} showArrow={true} offset={5}>
            <rect {...props} />
          </Tooltip>):(<rect {...props} />)}
         
          </>
        );
      }}
    
        />
      </CardBody>
    </Card>
    </>
  );
}

function dayLabel(n: number) {
  if (!n) return '0 dni';
  if (n === 1) return '1 dzień';
  return `${n} dni`;
}

export default MoodChart;