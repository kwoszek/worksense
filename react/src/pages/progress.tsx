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
import ReactApexChart from "react-apexcharts";



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

    // const [energyAndStressChart, setEnergyAndStressChart] = useState({
          
    //         series: [{
    //           name: 'Energia',
    //           data: checkins?.map((c: any) => c.energy) || []
    //         }, {
    //           name: 'Stres',
    //           data:checkins?.map((c: any) => c.stress) || []
    //         }]
    //         options: {
    //           chart: {
    //             height: 350,
    //             type: 'area'
    //           },
    //           dataLabels: {
    //             enabled: false
    //           },
    //           stroke: {
    //             curve: 'smooth'
    //           },
    //           xaxis: {
    //             type: 'datetime',
    //             categories: checkins?.map((c: any) => c.date) || []
    //           },
    //           tooltip: {
    //             x: {
    //               format: 'dd/MM/yy HH:mm'
    //             },
    //           },
    //         },
          
          
    //     });
  
  const todayTwo = new Date().toISOString().slice(0, 10);
  const hasToday = !!checkins?.find((c: any) => c.userid === user?.id && (c.date ?? '').slice(0,10) ===   todayTwo);
  
   
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

   

    // compute average mood per weekday (Mon..Sun)
    const weekdayLabels = ["Pon","Wto","Śro","Czw","Pią","Sob","Nie"];
    const weekdayBuckets = Array.from({ length: 7 }, () => ({ sum: 0, count: 0 }));
    for (const c of userCheckins) {
      const dateStr = c.date ?? (c as any).createdAt ?? '';
      const parsed = new Date(dateStr);
      if (isNaN(parsed.getTime())) continue;
      // map JS getDay (0=Sun,1=Mon...) to index 0=Mon
      const wd = (parsed.getDay() + 6) % 7;
      const mood = typeof c.moodScore === 'number'
        ? c.moodScore
        : ((typeof c.energy === 'number' ? c.energy : 5) + (10 - (typeof c.stress === 'number' ? c.stress : 5)));
      weekdayBuckets[wd].sum += mood;
      weekdayBuckets[wd].count += 1;
    }
    const weekdayAverages = weekdayBuckets.map(b => b.count ? +(b.sum / b.count).toFixed(2) : null);
  // reference variables to avoid any unused-var lint glitches
  void weekdayLabels;
  void weekdayAverages;

  // --- Usage percentage statistics ---
  const MS_PER_DAY = 24 * 60 * 60 * 1000;

  function formatYmd(d: Date) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function calculateUsage(period: 'week' | 'month' | '6months') {
    const end = new Date();
    let start = new Date();
    if (period === 'week') start.setDate(end.getDate() - 6); // last 7 days including today
    if (period === 'month') start.setMonth(end.getMonth() - 1);
    if (period === '6months') start.setMonth(end.getMonth() - 6);

    // If there's a first check-in and it's later than the period start, use it
    if (firstCheckinISO) {
      const first = new Date(firstCheckinISO);
      // normalize time portion to midnight for fair comparison
      const firstMid = new Date(first.getFullYear(), first.getMonth(), first.getDate());
      if (firstMid.getTime() > start.getTime()) start = firstMid;
    }

    // If start is in the future relative to end (no valid window), return zeros
    if (start.getTime() > end.getTime()) {
      return { daysWithCheckin: 0, totalDays: 0, percent: 0, start: formatYmd(start), end: formatYmd(end) };
    }

    // count days in range (inclusive)
    const totalDays = Math.floor((end.setHours(0,0,0,0) - start.setHours(0,0,0,0)) / MS_PER_DAY) + 1;

    // iterate each day and check presence in checkinByDate
    let daysWithCheckin = 0;
    for (let i = 0; i < totalDays; i++) {
      const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      const key = formatYmd(d);
      if (checkinByDate && checkinByDate[key]) daysWithCheckin++;
    }

    const percent = totalDays > 0 ? Math.round((daysWithCheckin / totalDays) * 100) : 0;
    return { daysWithCheckin, totalDays, percent, start: formatYmd(start), end: formatYmd(new Date()) };
  }

  const weekUsage = calculateUsage('week');
  const monthUsage = calculateUsage('month');
  const sixMonthUsage = calculateUsage('6months');


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
      <Card >
        <CardHeader className="p-5">
        <h2 className="opacity-80 text-2xl">Wykres stresu i energii</h2>
      </CardHeader>
        <CardBody>
           <div id="chart">
                {checkins && <ReactApexChart className="text-foreground" options={{
              chart: {
                height: 350,
                type: 'area',
                foreColor: "currentColor",
              },
              dataLabels: {
                enabled: false
              },
              stroke: {
                curve: 'smooth'
              },
              xaxis: {
                type: 'datetime',
                categories: checkins?.map((c: any) => c.date) || []
              },
              yaxis: {
                 min: 0,
                max: 10,
               },
              tooltip: {
                x: {
                  format: 'dd/MM/yy',
                 
                },
              },
            }} series={[{
              name: 'Energia',
              data: checkins?.map((c: any) => c.energy) || []
            }, {
              name: 'Stres',
              data:checkins?.map((c: any) => c.stress) || []
            }]} type="area" height={350} />}
              </div>
        </CardBody>
      </Card>
      <Card>
        <CardHeader className="p-5">
        <h2 className="opacity-80 text-2xl">Wykres wskaźnika nastroju</h2>
      </CardHeader>
        <CardBody>
           <div id="chart">
                {checkins && <ReactApexChart className="text-foreground" options={{
              chart: {
                height: 350,
                type: 'area',
                foreColor: "currentColor",
                
              },
             colors:['#F49356'],
              dataLabels: {
                enabled: false
              },
              stroke: {
                curve: 'smooth'
              },
              xaxis: {
                type: 'datetime',
                categories: checkins?.map((c: any) => c.date) || []
              },
               yaxis: {
                 min: 0,
                max: 10,
               },
              tooltip: {
                x: {
                  format: 'dd/MM/yy',
                 
                },
              },
            }} series={[{
              name: 'Wskaźnik nastroju',
              data: checkins?.map((c: any) => c.moodScore) || []
            }]} type="area" height={350} />}
              </div>
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
                        <p className="font-semibold text-lg mb-2">Najnowszy przegląd check-in</p>
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
      <Card className="p-3">
          <CardHeader>
            <h2 className="text-2xl opacity-80">Użycie aplikacji</h2>
          </CardHeader>
          <CardBody>
            <div className="flex flex-col gap-3 text-lg opacity-80">
              <div className="flex justify-between items-center">
                <div>Ostatni tydzień</div>
                <div className="text-right">
                  <div className="font-semibold">{weekUsage.percent}%</div>
                  <div className="text-sm opacity-60">{weekUsage.daysWithCheckin}/{weekUsage.totalDays} dni ({weekUsage.start} — {weekUsage.end})</div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div>Ostatni miesiąc</div>
                <div className="text-right">
                  <div className="font-semibold">{monthUsage.percent}%</div>
                  <div className="text-sm opacity-60">{monthUsage.daysWithCheckin}/{monthUsage.totalDays} dni ({monthUsage.start} — {monthUsage.end})</div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div>Ostatnie 6 miesięcy</div>
                <div className="text-right">
                  <div className="font-semibold">{sixMonthUsage.percent}%</div>
                  <div className="text-sm opacity-60">{sixMonthUsage.daysWithCheckin}/{sixMonthUsage.totalDays} dni ({sixMonthUsage.start} — {sixMonthUsage.end})</div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      <Card>
        <CardHeader className="p-5">
        <h2 className="opacity-80 text-2xl">Sredni nastrój w dzień tygodnia</h2>
      </CardHeader>
        <CardBody>
           <div id="chart">
                {checkins && <ReactApexChart className="text-foreground" options={ {
              chart: {
                height: 350,
                type: 'bar',
                foreColor: "currentColor",
              },
            
              dataLabels: { enabled: false },
              xaxis: { categories: weekdayLabels },
               yaxis: { min: 0, max: 10 },
              tooltip: { x: { format: 'dd/MM/yy' } }
            } } series={[{ name: 'Wskaźnik nastroju', data: weekdayAverages }]} type="bar" height={350} />}
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
                 aria-label="stress slider"
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
                           aria-label="energy slider"
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
