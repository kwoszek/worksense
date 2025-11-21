import {Card, CardHeader, CardBody} from "@heroui/card";
import HeatMap from '@uiw/react-heat-map';
import { useEffect, useRef } from 'react';
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

    return { date, count, content: `Mood: ${count} | Stress: ${stress} | Energy: ${energy}` };
  });
}

function MoodChart({ checkins }: Props) {
  const value = buildValueFromCheckins(checkins);
  const startDate = value.length ? new Date(value[0].date) : new Date();
  const user = useSelector(selectAuthUser);
  const streak = user?.streak ?? 0;
  const heatmapContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = heatmapContainerRef.current;
    if (!container) return;

    const updateViewBox = () => {
      const svg = container.querySelector('svg');
      if (!svg) return;

      // if viewBox already exists, skip
      if (svg.getAttribute('viewBox')) return;

      let width = 0;
      let height = 0;
      try {
        const bbox = (svg as SVGSVGElement).getBBox();
        width = bbox.width;
        height = bbox.height;
      } catch (e) {
        // ignore
      }

      if ((!width || !height) && (svg as any).clientWidth && (svg as any).clientHeight) {
        width = (svg as any).clientWidth;
        height = (svg as any).clientHeight;
      }

      if ((!width || !height)) {
        const rect = svg.getBoundingClientRect();
        width = rect.width;
        height = rect.height;
      }

      if (width && height) {
        svg.setAttribute('viewBox', `0 0 ${Math.max(1, Math.round(width))*4} ${Math.max(1, Math.round(height))*1.5}`);
      }
    };

    updateViewBox();

    let observer: any = null;
    if ((window as any).ResizeObserver) {
      const RO = (window as any).ResizeObserver;
      observer = new RO(() => updateViewBox());
      observer.observe(container);
    }
    window.addEventListener('resize', updateViewBox);
    return () => {
      window.removeEventListener('resize', updateViewBox);
      if (observer && typeof observer.disconnect === 'function') observer.disconnect();
    };
  }, [value]);
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
        <div ref={heatmapContainerRef} className="w-full">
         <HeatMap
          value={value}
          style={{ color: 'success'  }}
          weekLabels={['', 'Pn', '', 'Śr', '', 'Pt', '']}
          startDate={startDate}
          rectProps={{
          rx: "2",
        }}
          panelColors={{

      0: "#88888833",

1: "#e3f2ff",
2: "#cde9ff",
3: "#b0dcff",

4: "#8ed2f3",
5: "#6bcbdc",

6: "#4ecfbe",
7: "#3edb98",

8: "#4fe87a",
9: "#6ff38c",

10: "#48e064"
      }} rectRender={(props, data) => {
        const titleText = `${data.date} — nastrój: ${data.count && data.count > 10 ? 10 : data.count}`;
        return (
          <>
        {data.count ? ( <Tooltip placement="top" content={<div className="text-left"><p className="font-bold ">{data.date}</p> <p>nastrój: {data.count>10?"10":data.count}</p> </div>} showArrow={true} offset={5}>
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