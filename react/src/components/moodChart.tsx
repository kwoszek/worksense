import {Card, CardHeader, CardBody} from "@heroui/card";
import HeatMap from '@uiw/react-heat-map';
import { useSelector } from 'react-redux';
import { selectAuthUser } from '@/features/auth/authSlice';
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
        <p className="text-2xl opacity-60">Your wellness streak is <strong className="opacity-100">{streak} day{streak > 1 ? "s" : ""}</strong></p>
      </CardBody>
    </Card>
    <Card className="p-3">
        <CardHeader>
          <h2 className="text-2xl opacity-60">Your mood chart</h2>
        </CardHeader>
      <CardBody>
         <HeatMap
          value={value}
          style={{ color: '#22c55e' }}
          weekLabels={['', 'Mon', '', 'Wed', '', 'Fri', '']}
          startDate={startDate}
        />
      </CardBody>
    </Card>
    </>
  );
}

export default MoodChart;