import {Card, CardHeader, CardBody} from "@heroui/card";
import DefaultLayout from "@/layouts/default";
import {Calendar} from "@heroui/calendar";
import MoodChart from "@/components/moodChart";
import React, { useState } from "react";
// Card and Divider not needed here; chart component renders its own cards
import { useGetCheckinsQuery, useAddCheckinMutation } from "@/services/forumApi";
import { useMeQuery } from "@/services/usersApi";
import { Button } from "@heroui/button";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { useSelector } from "react-redux";
import { selectAuthUser } from "@/features/auth/authSlice";
import { useLocation } from 'react-router-dom';
import { Slider } from "@heroui/slider";
import { Divider } from "@heroui/divider";
import { useGetLatestAnalysisQuery } from "@/services/analysisApi";
import {today, getLocalTimeZone, parseDate} from "@internationalized/date";



export default function ProgressPage() {
  const location = useLocation();
   const { data: checkins, refetch: checkinRefetch } = useGetCheckinsQuery();
    const { data: latestAnalysis, refetch: analysisRefetch } = useGetLatestAnalysisQuery();
    const [addCheckin, { isLoading: creating }] = useAddCheckinMutation();
    const user = useSelector(selectAuthUser);
    // For updating streak after new check-in
    const { refetch: meRefetch } = useMeQuery();
    const state = location.state
    const [isOpen, setIsOpen] = useState(state === 'open' ? true :false);
    const [stress, setStress] = useState(5);
    const [energy, setEnergy] = useState(5);
    const [description, setDescription] = useState("");
  
  const todayTwo = new Date().toISOString().slice(0, 10);
  const hasToday = !!checkins?.find((c: any) => c.userid === user?.id && (c.date ?? '').slice(0,10) ===   todayTwo);
  
    console.log(latestAnalysis);
    // transform API checkins to the shape expected by MoodChart
    const chartCheckins = checkins
      ?.filter((c: any) => c.userid === user?.id)
      .map((c: any) => ({
        date: c.date ?? undefined,
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
        await checkinRefetch();
        await analysisRefetch();
        // Refresh /me to update streak immediately
        await meRefetch();
      } catch (err) {
        // swallow — UI will keep modal open
      }
    }

    // Calendar state for day details
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [dayModalOpen, setDayModalOpen] = useState(false);

    function openDay(d: string) {
      setSelectedDate(d);
      setDayModalOpen(true);
    }

    // build map of user's checkins by date
    const userCheckins = checkins?.filter((c: any) => c.userid === user?.id) || [];
    const checkinByDate: Record<string, any> = {};
    for (const c of userCheckins) {
      const d = (c.date ?? (c as any).createdAt ?? '').slice(0,10);
      if (d) checkinByDate[d] = c;
    }

    // first check-in in ISO 8601 (full) if any
    const firstCheckinISO: string | undefined = (() => {
      const dates = userCheckins
        .map((c: any) => (c.date ?? (c as any).createdAt ?? ''))
        .filter(Boolean)
        .map((s: string) => {
          const parsed = new Date(s);
          return isNaN(parsed.getTime()) ? null : parsed;
        })
        .filter(Boolean) as Date[];
      if (!dates.length) return undefined;
      const earliest = dates.reduce((a, b) => (a.getTime() <= b.getTime() ? a : b));
      return earliest.toISOString().slice(0,10);
    })();

    console.log('First check-in date:', firstCheckinISO);

  return (
    <DefaultLayout>
  <div className="flex flex-col md:flex-row justify-center gap-5 px-4 md:px-0">
  <div className= "flex flex-col gap-5 w-full md:w-1/2" >
      
            <MoodChart checkins={chartCheckins} />
          

    
      <Card className="p-5">
      <CardHeader>
        <h2 className="opacity-80 text-2xl">Podsumowanie twojego progresu</h2>
      </CardHeader>
      <CardBody>
         {latestAnalysis?.progressSummary ? (
          <p className="text-md opacity-80">{latestAnalysis.progressSummary}</p>
         ) :          <p className="text-lg mb-3">Tu możesz śledzić swoje samopoczucie i postępy w dbaniu o siebie. Trzymaj tak dalej!</p>
}
      </CardBody>
      </Card>
    </div>
  <div className="flex flex-col gap-5 w-full md:w-3/10">
      <Card className="p-3">
        <CardHeader>
          <h2 className="text-2xl opacity-80">Codzienny Check-in</h2>
        </CardHeader>
      <CardBody>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-center gap-3">
                      
                      <Button onPress={() => setIsOpen(true)} isDisabled={hasToday} size="lg">{hasToday?"Ju zrobiłeś dzisiaj check-in":"Nowy Check-in"}</Button>
                    </div>
                    {latestAnalysis && (
                      <div className="mt-3  opacity-80">
                        <p className="font-semibold mb-1 text-lg mb-2">Najnowszy przegląd check-in</p>
                        <p>{latestAnalysis.message}</p>
                      </div>
                    )}
                  </div>
      </CardBody>
    </Card>
      
      <Card className="p-3">
        <CardHeader>
          <h2 className="text-2xl opacity-80">Historia check-inów</h2>
        </CardHeader>
        <CardBody>
            <div className="checkin-calendar flex justify-center pt-2">
              <Calendar
                showMonthAndYearPickers
                 maxValue={today(getLocalTimeZone())}
                 minValue={firstCheckinISO? parseDate(firstCheckinISO): undefined}
                aria-label="Kalendarz check-in"
                showHelper={false}
                visibleMonths={1}
                className="border rounded-medium"
                isDateUnavailable={(date: any) => {
                  // date has { year, month, day }
                  if (!date || typeof date.year !== 'number') return true;
                  const key = `${date.year}-${String(date.month).padStart(2,'0')}-${String(date.day).padStart(2,'0')}`;
                  // unavailable means no checkin for that date
                  return !(checkinByDate && !!checkinByDate[key]);
                }}
                onChange={(value: any) => {
                  if (!value) return;
                  const key = `${value.year}-${String(value.month).padStart(2,'0')}-${String(value.day).padStart(2,'0')}`;
                  if (checkinByDate && checkinByDate[key]) openDay(key);
                }}
              />

              <style>{`.checkin-calendar [data-slot="cell-button"][data-unavailable="false"]{background-color: rgba(16,185,129,0.12); border-radius: 0.375rem;} .checkin-calendar [data-slot="cell-button"][data-unavailable="true"]{opacity:0.6;}`}</style>
            </div>
          </CardBody>
      </Card>

    </div>
    </div>
    <Modal isOpen={isOpen} placement="top-center" onOpenChange={setIsOpen}>
                      <ModalContent>
                        {(onClose) => (
                  <>
                    <ModalHeader className="flex flex-col gap-1 text-2xl">Zrób Check-in</ModalHeader>
                    <Divider/>

                    <ModalBody>
                      <form className="flex flex-col gap-10 px-5" onSubmit={handleCreate}>
                        <div className="mt-5">
                          <label className="text-md opacity-80">Poziom stresu: {stress}</label>
                         
                 <Slider
                 minValue={0}
                  maxValue={10}
                  name="stress"
                  value={stress}
                  onChange={(v: number | number[]) => setStress(Array.isArray(v) ? v[0] : v)}
                 color="success"
                 size="sm"
                />
                        </div>
                        <div>
                          <label className="text-md opacity-80">Poziom energii: {energy}</label>
                          <Slider
                           minValue={0}
                            maxValue={10}
                            name="energy"
                            value={energy}
                            onChange={(v: number | number[]) => setEnergy(Array.isArray(v) ? v[0] : v)}
                           color="success"
                           size="sm"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-sm opacity-70" htmlFor="desc">Notatki</label>
                          <textarea id="desc" name="description" className="min-h-24 rounded-medium border p-3" value={description} maxLength={1000} onChange={(e) => setDescription(e.target.value)} />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button color="danger" variant="flat" onPress={onClose}>Anuluj</Button>
                          <Button color="success" type="submit" isDisabled={creating} isLoading={creating}>Zapisz</Button>
                        </div>
                      </form>
                    </ModalBody>
                    <ModalFooter />
                  </>
                )}
              </ModalContent>
            </Modal>

                    <Modal isOpen={dayModalOpen} placement="top-center" onOpenChange={setDayModalOpen}>
                        <ModalContent>
                          {() => (
                          <>
                            <ModalHeader className="text-2xl "><h2 className="m-3">Szczegóły check-in: {selectedDate}</h2></ModalHeader>
                            <Divider />
                            <ModalBody>
                              {selectedDate && checkinByDate[selectedDate] ? (
                                <div className="space-y-5 p-5 opacity-80 text-lg">
                                  <p><strong>Poziom stresu:</strong> {checkinByDate[selectedDate].stress ?? '-'}</p>
                                  <p><strong>Poziom energii:</strong> {checkinByDate[selectedDate].energy ?? '-'}</p>
                                  <p ><strong>Notatki:</strong> {checkinByDate[selectedDate].description || checkinByDate[selectedDate].note || '-'}</p>
                                </div>
                              ) : (
                                <p>Brak check-in dla tego dnia.</p>
                              )}
                            </ModalBody>
                            <ModalFooter />
                          </>
                        )}
                      </ModalContent>
                    </Modal>

                    

    </DefaultLayout>
  );
}
