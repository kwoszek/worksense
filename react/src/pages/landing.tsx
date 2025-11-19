
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
import { useSelector } from "react-redux";
import { selectAuthUser } from '@/features/auth/authSlice';
import Group8 from "../resources/Group8.png";



export default function Landing(){
    const authedUser = useSelector(selectAuthUser);
    return (
        <>
         <DefaultLayout>
            <div className="min-h-screen scroll-smooth">
            <div className="  flex  justify-center items-start  gap-10 p-6 mt-40">
                <div className="w-1/3 flex flex-col gap-6 ">
                <div className="translate-x-20 -translate-y-15">
                    <h1 className="text-8xl font-bold mb-0 ">WorkSense</h1>
                <h2 className="text-xl  self-start ">Twoje miejsce na zdrowszą pracę i naukę</h2>
                </div>
                <div className="pl-20 flex flex-col items-start gap-10">
                    <p> Aplikacja internetowa, która pomaga pokonać wypalenie zawodowe i szkolne, uczy higieny pracy i prowadzi Cię krok po kroku do zdrowszego, bardziej zrównoważonego życia.</p>
                    <ButtonGroup className="opacity-80">
                        <Button color="success"> <Link href={authedUser?"/dashboard":"/login"} color="black">Rozpocznij Teraz</Link> </Button>
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
                <div className="grid grid-cols-4 gap-5 text-center">
                <Card className="w-full">
                    <CardHeader >
                        <h3 className="text-xl text-center w-full">Codzienny Check-Up</h3></CardHeader>
                    <Divider/>
                    <CardBody >Monitoruj stres, energię i samopoczucie. Otrzymuj spersonalizowane wskazówki od sztucznej inteligencji.</CardBody>
                </Card>
                <Card>
                    <CardHeader className="text-xl text-center">
                        <h3 className="text-xl text-center w-full">Forum Wsparcia</h3></CardHeader>
                    <Divider/>
                    <CardBody>
                        Dołącz do społeczności osób, które przechodzą przez podobne wyzwania. Bez ocen, bez presji — tylko zrozumienie.</CardBody>
                </Card>
                <Card>
                    <CardHeader className="text-xl text-center">
                        <h3 className="text-xl text-center w-full">Statystyki i Progres</h3></CardHeader>
                    <Divider/>
                    <CardBody>Obserwuj, jak zmienia się Twój stres, rytm pracy i samopoczucie. Zobacz, jak robisz postępy.</CardBody>
                </Card>
                <Card>
                    <CardHeader className="text-xl text-center">
                        <h3 className="text-xl text-center w-full">Baza Artykułów</h3></CardHeader>
                    <Divider/>
                    <CardBody>Dostęp do rzetelnej wiedzy psychologicznej, technik regeneracji i porad specjalistów.</CardBody>
                </Card>
                <Card>
                    <CardHeader className="text-xl text-center">
                        <h3 className="text-xl text-center w-full">Tryb Focus (Pomodoro)</h3></CardHeader>
                    <Divider/>
                    <CardBody>Pracuj i ucz się rytmicznie, bez przeciążenia. Zdrowy rytm = mniej stresu, więcej efektów.</CardBody>
                </Card>
                <Card>
                    <CardHeader className="text-xl text-center">
                        <h3 className="text-xl text-center w-full">Przypomnienia oparte o Screen Time</h3></CardHeader>
                    <Divider/>
                    <CardBody>Aplikacja dba o Twoje przerwy, nawodnienie i równowagę.</CardBody>
                </Card>
                <Card>
                    <CardHeader className="text-xl text-center">
                        <h3 className="text-xl text-center w-full">Gamifikacja Dobrego Samopoczucia</h3></CardHeader>
                    <Divider/>
                    <CardBody>Zdobywaj odznaki za dbanie o siebie i budowanie zdrowych nawyków.</CardBody>
                </Card>
                <Card>
                    
                    <CardBody className="flex justify-center"><Link className="text-xl text-center m-auto" isBlock showAnchorIcon color="success" href={authedUser?"/dashboard":"/login"} >
                        zobacz więcej...
                    </Link></CardBody>
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
                    <h2 className="text-3xl">1. Wykonaj codzienny check-in</h2>
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
          <CarouselItem  >
            <div className="p-1">
              <Card shadow="sm" >
                <CardHeader className="p-5">
                    <h2 className="text-3xl">2. Otrzymaj zalecenia od sztucznej inteligencji</h2>
                </CardHeader>
                <Divider />
                <CardBody className="p-10">
                    
                    <h3 className="text-xl">Na podstawie Twoich odpowiedzi sugerujemy:</h3>
                    <ul className="list-disc">
                        <li>krótkie przerwy</li>
                        <li>techniki oddechowe</li>
                        <li>artykuły</li>
                        <li>aktywności fizyczne</li>
                        <li>zadania na poprawę energii i koncentracji.</li>
                    </ul>
                </CardBody>
              </Card>
            </div>
          </CarouselItem>
          <CarouselItem  >
            <div className="p-1">
              <Card shadow="sm" >
                <CardHeader className="p-5">
                    <h2 className="text-3xl">3. Pracuj lepiej dzięki Trybowi Focus</h2>
                </CardHeader>
                <Divider />
                <CardBody className="p-10">
                    
                    <h3 className="text-xl">Proste cykle Pomodoro pomagają:</h3>
                    <ul className="list-disc">
                        <li>unikać przeciążenia,</li>
                        <li>utrzymać rytm,</li>
                        <li>pracować świadomie,</li>
                        <li>zachować granice między wysiłkiem a odpoczynkiem.</li>
            
                    </ul>
                </CardBody>
              </Card>
            </div>
          </CarouselItem>
           <CarouselItem  >
            <div className="p-1">
              <Card shadow="sm" >
                <CardHeader className="p-5">
                    <h2 className="text-3xl">4. dołącz do forum i znajdź wsparcie</h2>
                </CardHeader>
                <Divider />
                <CardBody className="p-10">
                    
                    <h3 className="text-xl">Ludzie, którzy przeszli przez to samo, najlepiej rozumieją Twoją sytuację.
                        Rozmawiaj, dziel się doświadczeniami, pomagaj innym.</h3>
                    
                </CardBody>
              </Card>
            </div>
          </CarouselItem>
           <CarouselItem  >
            <div className="p-1">
              <Card shadow="sm" >
                <CardHeader className="p-5">
                    <h2 className="text-3xl">5. Oglądaj swoje statystyki</h2>
                </CardHeader>
                <Divider />
                <CardBody className="p-10">
                    
                    <h3 className="text-xl">Twoje dane zmieniają się codziennie — widzisz:</h3>
                    <ul className="list-disc">
                        <li>spadek stresu,</li>
                        <li>poprawę energii,</li>
                        <li>regularność pracy,</li>
                        <li>rozwój zdrowych nawyków.</li>
                        
                    </ul>
                    <p>Motywacja rośnie, gdy widzisz realny progres.</p>
                    
                </CardBody>
              </Card>
            </div>
          </CarouselItem>
            <CarouselItem  >
            <div className="p-1">
              <Card shadow="sm" >
                <CardHeader className="p-5">
                    <h2 className="text-3xl">6. Zdobywaj odznaki i nagrody</h2>
                </CardHeader>
                <Divider />
                <CardBody className="p-10">
                    
                    <h3 className="text-xl">Dbasz o siebie = zdobywasz punkty.
                    Nawyki stają się przyjemniejsze dzięki elementom grywalizacji.</h3>
                    
                </CardBody>
              </Card>
            </div>
          </CarouselItem>
          
       
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
            </section>
            <section className=" w-8/10 m-auto mt-50">
                <h2 className="text-5xl font-bold mb-6">Dlaczego WorkSense działa</h2>
                
                <div className="flex w-full text-center gap-5">

                    <Card className="w-1/3 p-10 text-2xl">
                            Psychoedukacja o stresie i wypaleniu
                    </Card>
                    <Card className="w-1/3 p-10 text-2xl">Zmiana nawyków pracy</Card>
                    <Card className="w-1/3 p-10 text-2xl">Wsparcie społeczne</Card>

                </div>
            </section>
             <section className=" w-8/10 m-auto mt-50">
                <h2 className="text-5xl font-bold mb-6 ">Plan rozwoju</h2>
                <div className="flex relative">
                <div>
                    <h3 className="text-3xl opacity-80 mb-5">Już w krótce...</h3>
                    <ul className="list-disc mb-6 ml-6 text-lg">
                        <li>aplikacja mobilna,</li>
                        <li>integracja ze smartwatchami (monitoring stresu, snu, aktywności),</li>
                        <li>inteligentniejsze przypomnienia,</li>
                        <li>własne artykuły i materiały edukacyjne,</li>
                        <li>webinary i zajęcia z psychologami.</li>
                    </ul>
                </div>
                <img src={Group8} className="h-150 right-15 -top-50 absolute" alt="picture of an apple watch and app store page with our app" />
                </div>
            </section>
             <section className=" w-8/10 m-auto mt-50">
                <h2 className="text-5xl font-bold mb-6">Kim jesteśmy</h2>
                
            </section>
             <section className=" w-8/10 m-auto mt-50 flex-col flex items-center">
                <h2 className="text-3xl font-bold mb-6 text-center">Zadbaj o siebie już dziś</h2>
                <Button color="success" className="w-1/4"> <Link showAnchorIcon href={authedUser?"/dashboard":"/login"} color="black" >Rozpocznij Teraz</Link> </Button>
                
            </section>

            </div>
        </DefaultLayout>
        </>
    )
}