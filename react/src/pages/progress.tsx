import {Card, CardHeader, CardBody} from "@heroui/card";
import DefaultLayout from "@/layouts/default";
import { Link } from "@heroui/link";
import MoodChart from "@/components/moodChart";
import ProposedExercise from "@/components/proposedExercise";


export default function ProgressPage() {

  return (
    <DefaultLayout>
      <div className="flex justify-center gap-5 ">
      <div className= " flex flex-col gap-5 w-1/2" >
      <MoodChart/>
    
      <Card className="p-5">
      <CardHeader>
        <h2 className="opacity-60 text-2xl">Your Progress Details</h2>
      </CardHeader>
      <CardBody>
         <p className="text-lg ">Here you can track your wellness and mood over time. Keep up the great work!</p>
      </CardBody>
      </Card>
    </div>
    <div className="flex flex-col gap-5 w-3/10">
      <Card className="p-3">
        <CardHeader>
          <h2 className="text-2xl opacity-60">Hello User!</h2>
        </CardHeader>
      <CardBody>
        <Link underline="always" color="success" href="#" className="text-3xl opacity-80">Tell me about your day</Link>
      </CardBody>
    </Card>
    <ProposedExercise/>
    </div>
    </div>
    </DefaultLayout>
  );
}
