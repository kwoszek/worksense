
import DefaultLayout from "@/layouts/default";
import Mockup3Devices from "../resources/Mockup3Devices.png";
import {Button, ButtonGroup} from "@heroui/button";
import {Card, CardHeader, CardBody} from "@heroui/card";
import {Divider} from "@heroui/divider";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Link } from "@heroui/link";


export default function Landing(){
    return (
        <>
         <DefaultLayout>
            <div className="min-h-screen">
            <div className="  flex  justify-center items-start  gap-10 p-6 mt-40">
                <div className="w-1/3 flex flex-col gap-6 ">
                <div className="translate-x-20 -translate-y-15">
                    <h1 className="text-8xl font-bold mb-0 ">WorkSense</h1>
                <h2 className="text-xl  self-start ">Twoje miejsce na zdrowszą pracę i naukę</h2>
                </div>
                <div className="pl-20 flex flex-col items-start gap-10">
                    <p> Aplikacja internetowa, która pomaga pokonać wypalenie zawodowe i szkolne, uczy higieny pracy i prowadzi Cię krok po kroku do zdrowszego, bardziej zrównoważonego życia.</p>
                    <ButtonGroup className="opacity-80">
                        <Button color="success"> <Link href="/login" color="black">Rozpocznij Teraz</Link> </Button>
                        <Button > <a href="#tutorial">Zobacz jak to działa</a> </Button>
                    </ButtonGroup>
                </div>
                </div>
                
                <img src={Mockup3Devices} alt="image of 3 devices with our website shown on them" className="w-1/2" />

            </div>
            <section className=" w-8/10 m-auto mt-50">
                <h2 className="text-5xl font-bold mb-6">Dlaczego stworzyliśmy WorkSense?</h2>
                <p className="w-2/3 text-lg">Wypalenie dotyka coraz młodszych ludzi — zarówno pracujących, jak i uczących się.
                Presja, przeciążenie informacjami, brak odpoczynku i chaotyczny tryb pracy sprawiają, że:</p>
                <ul className="list-disc ml-10 my-6">
                    <li>spada koncentracja,</li>
                    <li>rośnie stres,</li>
                    <li>zanika motywacja,</li>
                    <li>tracimy radość z nauki i pracy.</li>

                </ul>
                <p className="w-2/3 text-lg">WorkSense powstał, aby temu przeciwdziałać.
                Nasza misja jest prosta: <b>pomóc Ci zrozumieć siebie, wesprzeć Cię psychologicznie i nauczyć Cię pracować w zdrowy, świadomy sposób.</b></p>
            </section>
             <section className=" w-8/10 m-auto mt-30">
                <h2 className="text-5xl font-bold mb-6">Co oferuje WorkSense?</h2>
                <div className="grid grid-cols-4 gap-5">
                <Card>
                    <CardHeader>Codzienny Check-Up</CardHeader>
                    <Divider/>
                    <CardBody>Monitoruj stres, energię i samopoczucie. Otrzymuj spersonalizowane wskazówki od sztucznej inteligencji.</CardBody>
                </Card>
                <Card>
                    <CardHeader>Forum Wsparcia</CardHeader>
                    <Divider/>
                    <CardBody>Dołącz do społeczności osób, które przechodzą przez podobne wyzwania. Bez ocen, bez presji — tylko zrozumienie.</CardBody>
                </Card>
                <Card>
                    <CardHeader>Statystyki i Progres</CardHeader>
                    <Divider/>
                    <CardBody>Obserwuj, jak zmienia się Twój stres, rytm pracy i samopoczucie. Zobacz, jak robisz postępy.</CardBody>
                </Card>
                <Card>
                    <CardHeader>Baza Artykułów</CardHeader>
                    <Divider/>
                    <CardBody>Dostęp do rzetelnej wiedzy psychologicznej, technik regeneracji i porad specjalistów.</CardBody>
                </Card>
                <Card>
                    <CardHeader>Tryb Focus (Pomodoro)</CardHeader>
                    <Divider/>
                    <CardBody>Pracuj i ucz się rytmicznie, bez przeciążenia. Zdrowy rytm = mniej stresu, więcej efektów.</CardBody>
                </Card>
                <Card>
                    <CardHeader>Przypomnienia oparte o Screen Time</CardHeader>
                    <Divider/>
                    <CardBody>Aplikacja dba o Twoje przerwy, nawodnienie i równowagę.</CardBody>
                </Card>
                <Card>
                    <CardHeader>Gamifikacja Dobrego Samopoczucia</CardHeader>
                    <Divider/>
                    <CardBody>Zdobywaj odznaki za dbanie o siebie i budowanie zdrowych nawyków.</CardBody>
                </Card>
                <Card>
                    
                    <CardBody>Zobacz więcej funkcji</CardBody>
                </Card>
                </div>
            </section>
            <section className="w-8/10 m-auto mt-30">
                <h2 className="text-5xl font-bold mb-6">Jak działa WorkSense?</h2>
                 <Carousel className="background-transparent border-0">
      <CarouselContent id="tutorial">
        
          <CarouselItem  >
            <div className="p-1">
              <Card shadow="sm" >
                <CardHeader className="p-5">
                    <h2 className="text-2xl">1. Wykonaj codzienny check-in</h2>
                </CardHeader>
                <Divider />
                <CardBody className="p-10">
                    <p className="text-lg">Zajmuje mniej niż minutę. <br />
                    Zbieramy dane o Twoim stresie, energii, śnie i nastroju.</p>
                    <br />
                    <h3 className="text-xl">Co otrzymujesz</h3>
                    <ul className="list-disc">
                        <li>szybkie podsumowanie stanu psychicznego</li>
                        <li>propozycje dalszych działań</li>
                        <li>wsparcie w budowaniu samoświadomości</li>
                    </ul>
                </CardBody>
              </Card>
            </div>
          </CarouselItem>
       
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
            </section>
            </div>
        </DefaultLayout>
        </>
    )
}