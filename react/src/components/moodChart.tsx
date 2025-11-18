import {Card, CardHeader, CardBody} from "@heroui/card";
import HeatMap from '@uiw/react-heat-map';

type Checkin = { date: string; stress?: number; energy?: number };

interface Props {
  checkins?: Checkin[];
}

function buildValueFromCheckins(checkins?: Checkin[]) {
  if (checkins && checkins.length) {
    // sort by date ascending
    const sorted = [...checkins].sort((a, b) => (a.date > b.date ? 1 : -1));
    return sorted.map((v) => {
      const stress = typeof v.stress === 'number' ? v.stress : 5;
      const energy = typeof v.energy === 'number' ? v.energy : 5;
      const count = energy + (10 - stress);
      // ensure date is YYYY-MM-DD
      const date = v.date?.slice(0, 10) ?? new Date().toISOString().slice(0, 10);
      return { date, count, content: `Stress: ${stress} | Energy: ${energy}` };
    });
  }

  // fallback sample
  const sample = [
    { date: '2016/01/11', stress: 6, energy: 7 },
    { date: '2016/01/12', stress: 2, energy: 9 },
    { date: '2016/01/13', stress: 4, energy: 6 },
  ];
  return sample.map((v) => ({ date: v.date, count: (v.energy ?? 0) + (10 - (v.stress ?? 0)), content: `Stress: ${v.stress} | Energy: ${v.energy}` }));
}

function MoodChart({ checkins }: Props) {
  const value = buildValueFromCheckins(checkins);
  const startDate = value.length ? new Date(value[0].date) : new Date();

  // compute consecutive-streak up to today (local days)
  function toLocalYMD(dateStr: string) {
    if (!dateStr) return null;
    // if ISO-like with T, use Date constructor
    if (dateStr.includes('T')) {
      const d = new Date(dateStr);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }
    // assume YYYY-MM-DD -> construct local date
    const parts = dateStr.split('-');
    if (parts.length >= 3) {
      const y = Number(parts[0]);
      const m = Number(parts[1]) - 1;
      const day = Number(parts[2]);
      const d = new Date(y, m, day);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }
    return null;
  }

  const dateSet = new Set<string>();
  if (checkins && checkins.length) {
    for (const c of checkins) {
      const d = toLocalYMD(c.date ?? '');
      if (d) dateSet.add(d);
    }
  }

  const today = new Date();
  let streak = 0;
  // start from today (include today's checkin)
  let cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  while (true) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`;
    if (dateSet.has(key)) {
      streak += 1;
      cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() - 1);
    } else {
      break;
    }
  }

  return (
    <>
     <Card className="p-3">
      <CardBody>
        <p className="text-2xl opacity-60">Your wellness streak is <strong className="opacity-100">{streak} day{streak > 1 ? "s" : ""}</strong> </p>
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