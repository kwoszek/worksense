import {Card, CardHeader, CardBody, CardFooter} from "@heroui/card";
import DefaultLayout from "@/layouts/default";
import { Link } from "@heroui/link";
import HeatMap from '@uiw/react-heat-map';

export default function ProgressPage() {
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
  return (
    <DefaultLayout>
      <div className="flex justify-center gap-5 ">
      <div className= " flex flex-col gap-5 w-1/2" >
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
    
    </div>
    <div className="flex flex-col gap-5 w-3/10">
      <Card>
        <CardHeader>
          <h2 className="text-2xl opacity-60">Hello User!</h2>
        </CardHeader>
      <CardBody>
        <Link underline="always" color="success" href="#" className="text-3xl opacity-80">Tell me about your day</Link>
      </CardBody>
    </Card>
     <Card>
        <CardHeader>
          <h2 className="text-2xl opacity-60">Proposed Exercise</h2>
        </CardHeader>
      <CardBody>
        <h2   className="text-5xl opacity-80">🧘🏿‍️ Meditate for 10 minutes</h2>
      </CardBody>
    </Card>
    </div>
    </div>
    </DefaultLayout>
  );
}
