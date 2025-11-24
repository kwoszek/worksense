import {Card, CardHeader, CardBody} from "@heroui/card";
import HeatMap from '@uiw/react-heat-map';
import { useSelector } from 'react-redux';
import { useRef} from 'react';
import { selectAuthUser } from '@/features/auth/authSlice';
import {Tooltip} from "@heroui/tooltip";
// No longer need analyses; moodScore is returned on checkins

type Checkin = { date: string; stress?: number; energy?: number; moodScore?: number };

interface Props {
  checkins?: Checkin[];
}

type HeatValue = { date: string; count: number; content: string };

function buildValueFromCheckins(checkins?: Checkin[]): HeatValue[] {
  if (!checkins || !checkins.length) return [];
  const sorted = [...checkins].sort((a, b) => (a.date > b.date ? 1 : -1));

  return sorted.map((v) => {
    const date = v.date?.slice(0, 10) ?? new Date().toISOString().slice(0, 10);
    const stress = typeof v.stress === 'number' ? v.stress : 5;
    const energy = typeof v.energy === 'number' ? v.energy : 5;

    // Priority: moodScore from checkin (comes from AI via API) -> fallback formula
    const moodScore = typeof v.moodScore === 'number' ? v.moodScore : undefined;
    const fallbackCount = energy + (10 - stress);
    const count = typeof moodScore === 'number' ? moodScore : fallbackCount;

    return { date, count, content: `Nastrój: ${count} | Stres: ${stress} | Energia: ${energy}` };
  });
}


function MoodChart({ checkins }: Props) {
  // Resize/observer logic removed — chart will render with default SVG sizing and CSS.
  const value = buildValueFromCheckins(checkins);
  const startDate = value.length ? new Date(value[0].date) : new Date();
  const user = useSelector(selectAuthUser);
  const streak = user?.streak ?? 0;
  const heatmapContainerRef = useRef<HTMLDivElement | null>(null);
  return (
    <>
     <Card className="p-3">
      <CardBody>
        <p className="text-2xl opacity-100 text-foreground-500">Twoja seria dbania o siebie: <strong className="opacity-100 text-foreground">{streak} {streak > 1 || streak==0 ? "dni" : "dzień"}</strong></p>
      </CardBody>
    </Card>
    <Card className="p-3">
        <CardHeader>
          <h2 className="text-2xl opacity-80">Wykres nastroju</h2>
        </CardHeader>
      <CardBody>
        <div ref={heatmapContainerRef} className="w-full heatmap-container overflow-x-scroll h-50 ">
         <HeatMap
          className="h-40 w-200 scale-125 p-5 pl-20"
          value={value}
          style={{ color: 'success', '--rhm-rect-active': "#a9c7f5" }}
          weekLabels={['', 'Pn', '', 'Śr', '', 'Pt', '']}
          monthLabels={['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru']}
          startDate={startDate}
          rectProps={{
          rx: "2",
        }}
          panelColors={{

      0: "#88888833",



2:  "#e6d8f8",  
3:  "#d1b6f3",  
4:  "#b894ee",  

5:  "#a9c7f5",  
6:  "#7fb1f0",  

7:  "#75d2db",  
8:  "#5acb9c",  

9:  "#56bf7e",  
10:  "#c8d968",  

11: "#f4e676"  

      }} rectRender={(props, data) => {
       
        const titleText = `${data.date} — nastrój: ${data.count && data.count > 10 ? 10 : data.count}`;
        
        return (
          <>
        {data.count ? ( <Tooltip placement="top" content={<div className="text-left"><p className="font-bold ">{titleText}</p> </div>} showArrow={true} offset={5}>
            <rect {...props} />
          </Tooltip>):(<rect {...props} />)}
         
          </>
        );
      }}
        />
        </div>
       
      </CardBody>
    </Card>
    </>
  );
}


export default MoodChart;