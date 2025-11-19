import {Card, CardHeader, CardBody} from "@heroui/card";
import DefaultLayout from "@/layouts/default";
import { Link } from "@heroui/link";
import MoodChart from "@/components/moodChart";
import ProposedExercise from "@/components/proposedExercise";
import React, { useState } from "react";
// Card and Divider not needed here; chart component renders its own cards
import { useGetCheckinsQuery, useAddCheckinMutation } from "@/services/forumApi";
import { Button } from "@heroui/button";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Input } from "@heroui/input";
import { useSelector } from "react-redux";
import { selectAuthUser } from "@/features/auth/authSlice";


export default function ProgressPage() {

   const { data: checkins } = useGetCheckinsQuery();
    const [addCheckin, { isLoading: creating }] = useAddCheckinMutation();
    const user = useSelector(selectAuthUser);
  
    const [isOpen, setIsOpen] = useState(false);
    const [stress, setStress] = useState(5);
    const [energy, setEnergy] = useState(5);
    const [description, setDescription] = useState("");
  
    const today = new Date().toISOString().slice(0, 10);
    const hasToday = !!checkins?.find((c) => c.userid === user?.id && c.date.slice(0,10) === today);
  
  
    // transform API checkins to the shape expected by MoodChart
    const chartCheckins = checkins
      ?.filter((c: any) => c.userid === user?.id)
      .map((c: any) => ({
        date: c.createdAt ?? c.date,
        stress: c.stress ?? 5,
        energy: c.energy ?? 5,
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
         <p className="text-lg ">Here you can track your wellness and mood over time. Keep up the great work!</p>
      </CardBody>
      </Card>
    </div>
    <div className="flex flex-col gap-5 w-3/10">
      <Card className="p-3">
        <CardHeader>
          <h2 className="text-2xl opacity-60">Daily Check-ins</h2>
        </CardHeader>
      <CardBody>
        
                  <div className="flex items-center gap-3">
                    {hasToday && <div className="text-sm opacity-70">You've already checked in today.</div>}
                    <Button onPress={() => setIsOpen(true)} isDisabled={hasToday}>New Check-in</Button>
                    </div>
      </CardBody>
    </Card>
    <ProposedExercise/>
    </div>
    </div>
    <Modal isOpen={isOpen} placement="top-center" onOpenChange={setIsOpen}>
              <ModalContent>
                {(onClose) => (
                  <>
                    <ModalHeader className="flex flex-col gap-1">Create Check-in</ModalHeader>
                    <ModalBody>
                      <form className="flex flex-col gap-4" onSubmit={handleCreate}>
                        <div>
                          <label className="text-sm opacity-80">Stress: {stress}</label>
                          <Input
                            isRequired
                            labelPlacement="outside"
                            name="stress"
                            value={String(stress)}
                            onValueChange={(v: any) => setStress(Number(v))}
                            type="range"
                            min={0}
                            max={10}
                          />
                        </div>
                        <div>
                          <label className="text-sm opacity-80">Energy: {energy}</label>
                          <Input
                            isRequired
                            labelPlacement="outside"
                            name="energy"
                            value={String(energy)}
                            onValueChange={(v: any) => setEnergy(Number(v))}
                            type="range"
                            min={0}
                            max={10}
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-sm opacity-70" htmlFor="desc">Notes</label>
                          <textarea id="desc" name="description" className="min-h-24 rounded-medium border p-3" value={description} onChange={(e) => setDescription(e.target.value)} />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button color="danger" variant="flat" onPress={onClose}>Cancel</Button>
                          <Button color="primary" type="submit" isDisabled={creating} isLoading={creating}>Save</Button>
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
