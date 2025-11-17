import {Card, CardHeader, CardBody} from "@heroui/card";
import HeatMap from '@uiw/react-heat-map';

  const value = [
  { date: '2016/01/11', count: 2 },
  { date: '2016/01/12', count: 20 },
  { date: '2016/01/13', count: 10 },
  ...[...Array(17)].map((_, idx) => ({
    date: `2016/02/${idx + 10}`, count: idx, content: ''
  })),
  { date: '2016/04/11', count: 2 },
  { date: '2016/05/01', count: 5 },
  { date: '2016/05/02', count: 5 },
  { date: '2016/05/04', count: 11 },
];


function MoodChart() {
  return (
    <>
     <Card>
      <CardBody>
        <p className="text-2xl opacity-60">Your wellness streak is <strong className="opacity-100">50 days</strong> </p>
      </CardBody>
    </Card>
    <Card>
        <CardHeader>
          <h2 className="text-2xl opacity-60">Your mood chart</h2>
        </CardHeader>
      <CardBody>
         <HeatMap
        value={value}
        style={{ color: '#ffffff'}}
        weekLabels={['', 'Mon', '', 'Wed', '', 'Fri', '']}
        startDate={new Date('2016/01/01')}
      />
      </CardBody>
    </Card>
    </>
  );
}


export default MoodChart;