import {Card, CardHeader, CardBody} from "@heroui/card";
import DefaultLayout from "@/layouts/default";
import { Link } from "@heroui/link";
import MoodChart from "@/components/moodChart";
import React, { useState } from "react";
// Card and Divider not needed here; chart component renders its own cards
import { useGetCheckinsQuery, useAddCheckinMutation } from "@/services/forumApi";
import { Button } from "@heroui/button";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Input } from "@heroui/input";
import { useSelector } from "react-redux";
import { selectAuthUser } from "@/features/auth/authSlice";
import { useLocation } from 'react-router-dom';
import { Slider } from "@heroui/slider";
import { Divider } from "@heroui/divider";
import { useGetLatestAnalysisQuery } from "@/services/analysisApi";


export default function ProgressPage() {
  const location = useLocation();
   const { data: checkins } = useGetCheckinsQuery();
    const { data: latestAnalysis } = useGetLatestAnalysisQuery();
    const [addCheckin, { isLoading: creating }] = useAddCheckinMutation();
    const user = useSelector(selectAuthUser);
    const state = location.state
    const [isOpen, setIsOpen] = useState(state === 'open' ? true :false);
    const [stress, setStress] = useState(5);
    const [energy, setEnergy] = useState(5);
    const [description, setDescription] = useState("");
  
    const today = new Date().toISOString().slice(0, 10);
    const hasToday = !!checkins?.find((c) => c.userid === user?.id && c.date.slice(0,10) === today);
  
    console.log(latestAnalysis);
    // transform API checkins to the shape expected by MoodChart
    const chartCheckins = checkins
      ?.filter((c: any) => c.userid === user?.id)
      .map((c: any) => ({
        date: c.createdAt ?? c.date,
        stress: c.stress ?? 5,
        energy: c.energy ?? 5,
        moodScore: c.moodScore ?? undefined,
      }));
  
    async function handleCreate(e: React.FormEvent) {
      e.preventDefault();
      if (!user?.id) return;
      if (hasToday) return; // prevent duplicate checkin for today
      try {
        await addCheckin({ userId: user.id, stress, energy, description }).unwrap();
        setStress(5);
        setEnergy(5);
        setDescription("");
        setIsOpen(false);
      } catch (err) {
        // swallow — UI will keep modal open
      }
    }

  return (
    <DefaultLayout>
      <div className="flex justify-center gap-5 ">
      <div className= " flex flex-col gap-5 w-1/2" >
      
            <MoodChart checkins={chartCheckins} />
          

    
      <Card className="p-5">
      <CardHeader>
        <h2 className="opacity-60 text-2xl">Your Progress Details</h2>
      </CardHeader>
      <CardBody>
         {latestAnalysis?.progresssummary || latestAnalysis?.progressSummary ? (
          <p className="text-md opacity-80">{latestAnalysis.progresssummary || latestAnalysis.progressSummary}</p>
         ) :          <p className="text-lg mb-3">Here you can track your wellness and mood over time. Keep up the great work!</p>
}
      </CardBody>
      </Card>
    </div>
    <div className="flex flex-col gap-5 w-3/10">
      <Card className="p-3">
        <CardHeader>
          <h2 className="text-2xl opacity-60">Daily Check-ins</h2>
        </CardHeader>
      <CardBody>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      {hasToday && <div className="text-sm opacity-70">You've already checked in today.</div>}
                      <Button onPress={() => setIsOpen(true)} isDisabled={hasToday}>New Check-in</Button>
                    </div>
                    {latestAnalysis && (
                      <div className="mt-3 text-sm opacity-80">
                        <p className="font-semibold mb-1">Latest check-in overview</p>
                        <p>{latestAnalysis.message}</p>
                      </div>
                    )}
                  </div>
      </CardBody>
    </Card>
    </div>
    </div>
    <Modal isOpen={isOpen} placement="top-center" onOpenChange={setIsOpen}>
              <ModalContent>
                {(onClose) => (
                  <>
                    <ModalHeader className="flex flex-col gap-1 text-2xl">Create Check-in</ModalHeader>
                    <Divider/>

                    <ModalBody>
                      <form className="flex flex-col gap-10 px-5" onSubmit={handleCreate}>
                        <div className="mt-5">
                          <label className="text-md opacity-80">Stress: {stress}</label>
                         
                           <Slider
                           minValue={0}
                            maxValue={10}
                            isRequired
                            labelPlacement="outside"
                            name="stress"
                            value={stress}
                            onChange={setStress}
                           color="success"
                           size="sm"
                            
                          />
                        </div>
                        <div>
                          <label className="text-md opacity-80">Energy: {energy}</label>
                          <Slider
                           minValue={0}
                            maxValue={10}
                            isRequired
                            labelPlacement="outside"
                            name="energy"
                            value={energy}
                            onChange={setEnergy}
                           color="success"
                           size="sm"
                            
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-sm opacity-70" htmlFor="desc">Notes</label>
                          <textarea id="desc" name="description" className="min-h-24 rounded-medium border p-3" value={description} onChange={(e) => setDescription(e.target.value)} />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button color="danger" variant="flat" onPress={onClose}>Cancel</Button>
                          <Button color="success" type="submit" isDisabled={creating} isLoading={creating}>Save</Button>
                        </div>
                      </form>
                    </ModalBody>
                    <ModalFooter />
                  </>
                )}
              </ModalContent>
            </Modal>
            
    </DefaultLayout>
  );
}
