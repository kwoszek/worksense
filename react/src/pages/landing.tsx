
import DefaultLayout from "@/layouts/default";
import Mockup3Devices from "../resources/Mockup3Devices.png";
import {Button, ButtonGroup} from "@heroui/button";
import {Card, CardHeader, CardBody} from "@heroui/card";
import {Divider} from "@heroui/divider";
import forumScr from "../resources/forumScr.png";
import focusScr from "../resources/FocusScr.png";
import checkInScr from "../resources/checkInScr.png";
import Progress from "../resources/Progress.png";
import stats from "../resources/stats.png";
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
import {Accordion, AccordionItem} from "@heroui/react";
import Favi from '../resources/favi';
import ColumnSrc from '../resources/column';
import Badges from '../resources/Badges.png';



export default function Landing(){
    const authedUser = useSelector(selectAuthUser);
    return (
        <>
         <DefaultLayout>
            <div className=" min-h-screen scroll-smooth">
            <div className="flex flex-col md:flex-row justify-center items-center gap-10 p-6 mt-10 md:mt-25 h-[80svh]">
                <div className="w-full md:w-1/3 flex flex-col gap-6  relative md:-top-[5vw] ">
                <div className="md:translate-x-20 md:-translate-y-15">
                    <h1 className="text-4xl md:text-8xl font-bold mb-0">WorkSense</h1>
                <h2 className="text-lg md:text-xl self-start">Twoje miejsce na zdrowszą pracę i naukę</h2>
                </div>
                <div className="w-full md:pl-20 flex flex-col items-start gap-6">
                    <p className="opacity-80"> Aplikacja internetowa, która pomaga pokonać wypalenie zawodowe i szkolne, uczy higieny pracy i prowadzi Cię krok po kroku do zdrowszego, bardziej zrównoważonego życia.</p>
                    <ButtonGroup className="opacity-80">
                        <Button color="success"> <Link href={authedUser?"/dashboard":"/login"} color="secondary">Rozpocznij Teraz</Link> </Button>
                        <Button > <a href="#tutorial">Zobacz jak to działa</a> </Button>
                    </ButtonGroup>
                </div>
                </div>

                <img src={Mockup3Devices} alt="image of 3 devices with our website shown on them" className="w-full md:w-1/2 " />

            </div>
            <section className="w-full max-w-screen-lg mx-auto mt-12 px-4 sm:px-10">
                <h2 className="text-4xl md:text-5xl font-bold mb-6">Dlaczego stworzyliśmy WorkSense?</h2>

                <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="opacity-80 md:flex-1">
                        <p className="w-full text-lg">Wypalenie dotyka coraz młodszych ludzi — zarówno pracujących, jak i uczących się. Presja, przeciążenie informacjami, brak odpoczynku i chaotyczny tryb pracy sprawiają, że:</p>
                        <ul className="list-disc ml-6 my-4">
                            <li>spada koncentracja,</li>
                            <li>rośnie stres,</li>
                            <li>zanika motywacja,</li>
                            <li>tracimy radość z nauki i pracy.</li>
                        </ul>
                        <p className="w-full text-lg">WorkSense powstał, aby temu przeciwdziałać. Nasza misja jest prosta: <b>pomóc Ci zrozumieć siebie, wesprzeć Cię i nauczyć Cię pracować w zdrowy, świadomy sposób.</b></p>
                    </div>

                    <div className="md:ml-6 md:flex-0">
                        <Favi className="drop-shadow-accent-foreground drop-shadow-xl/55 w-40 md:w-56 mx-auto" title="Worksense icon" />
                    </div>
                </div>

            </section>
             <section className="w-full md:w-8/10 mx-auto mt-30 px-4 md:px-0">
                <h2 className="text-5xl font-bold mb-6">Co oferuje WorkSense?</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-center opacity-80">
                <Card className=" p-3">
                    <CardHeader >
                        <h3 className="text-2xl text-center w-full">Codzienny Check-Up</h3></CardHeader>
                    <Divider/>
                    <CardBody className="opacity-80">Monitoruj stres, energię i samopoczucie. Otrzymuj spersonalizowane wskazówki od sztucznej inteligencji.</CardBody>
                </Card>
                <Card className=" p-3">
                    <CardHeader className="text-xl text-center">
                        <h3 className="text-2xl text-center w-full">Forum Wsparcia</h3></CardHeader>
                    <Divider/>
                    <CardBody className="opacity-80">
                        Dołącz do społeczności osób, które przechodzą przez podobne wyzwania. Bez ocen, bez presji — tylko zrozumienie.</CardBody>
                </Card>
                <Card className=" p-3">
                    <CardHeader className="text-2xl text-center">
                        <h3 className="text-2xl text-center w-full">Statystyki i Progres</h3></CardHeader>
                    <Divider/>
                    <CardBody className="opacity-80">Obserwuj, jak zmienia się Twój stres, rytm pracy i samopoczucie. Zobacz, jak robisz postępy.</CardBody>
                </Card>
                <Card className=" p-3">
                    <CardHeader className="text-2xl text-center">
                        <h3 className="text-2xl text-center w-full">Baza Artykułów</h3></CardHeader>
                    <Divider/>
                    <CardBody className="opacity-80">Dostęp do rzetelnej wiedzy psychologicznej, technik regeneracji i porad specjalistów.</CardBody>
                </Card>
                <Card className=" p-3">
                    <CardHeader className="text-2xl text-center">
                        <h3 className="text-2xl text-center w-full">Tryb Focus (Pomodoro)</h3></CardHeader>
                    <Divider/>
                    <CardBody className="opacity-80">Pracuj i ucz się rytmicznie, bez przeciążenia. Zdrowy rytm = mniej stresu, więcej efektów.</CardBody>
                </Card>
                <Card className=" p-3">
                    <CardHeader className="text-2xl text-center">
                        <h3 className="text-2xl text-center w-full">Przypomnienia oparte o Screen Time</h3></CardHeader>
                    <Divider/>
                    <CardBody className="opacity-80">Aplikacja dba o Twoje przerwy, nawodnienie i równowagę.</CardBody>
                </Card>
                <Card className=" p-3">
                    <CardHeader className="text-2xl text-center">
                        <h3 className="text-2xl text-center w-full">Gamifikacja Dobrego Samopoczucia</h3></CardHeader>
                    <Divider/>
                    <CardBody className="opacity-80">Zdobywaj odznaki za dbanie o siebie i budowanie zdrowych nawyków.</CardBody>
                </Card>
                <Card className=" p-3">
                    
                    <CardBody className="flex justify-center"><Link className="text-xl text-center m-auto" isBlock showAnchorIcon color="success" href={authedUser?"/dashboard":"/login"} >
                        zobacz więcej...
                    </Link></CardBody>
                </Card>
                </div>
            </section>
                        <section className="box-border w-[80vw] max-w-screen-lg  mx-auto mt-35 px-4 md:px-0">
                                <h2 className="text-4xl md:text-5xl font-bold mb-6">Jak działa WorkSense?</h2>
                                 <Carousel className="background-transparent border-0">
            <CarouselContent id="tutorial">
        
                    <CarouselItem  >
                        <div className="p-1">
                            <Card shadow="sm" >
                                <CardHeader className="p-5">
                                        <h2 className="text-2xl md:text-3xl">1. Wykonaj codzienny check-in</h2>
                                </CardHeader>
                                <Divider />
                                <CardBody className="p-6 md:p-10">
                                        <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-center justify-center">
                                                <div className="md:flex-1">
                                                 <p className="text-lg opacity-80">Zajmuje mniej niż minutę. <br />
                                                 <br />
                                        Zbieramy dane o Twoim stresie, energii, śnie i nastroju.</p>
                    
                                        <h3 className="text-2xl mt-4">Co otrzymujesz</h3>
                                        <ul className="list-disc ml-6 opacity-80 mt-3">
                                                <li>szybkie podsumowanie stanu psychicznego</li>
                                                <li>propozycje dalszych działań</li>
                                                <li>wsparcie w budowaniu samoświadomości</li>
                                        </ul>
                                                </div>
                                                <img src={checkInScr} alt="zdjęcie sekcji check in" className="w-full md:w-3/5 mb-5 shadow-lg/20 shadow-success rounded-lg" />
                    
                                        </div>
                                </CardBody>
                            </Card>
                        </div>
                    </CarouselItem>
                    <CarouselItem  >
                        <div className="p-1">
                            <Card shadow="sm" >
                                <CardHeader className="p-5">
                                        <h2 className="text-2xl md:text-3xl">2. Otrzymaj zalecenia od sztucznej inteligencji</h2>
                                </CardHeader>
                                <Divider />
                                <CardBody className="p-6 md:p-10">
                                        <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-center justify-center">
                                        <div className="md:flex-1">
                                        <h3 className="text-xl">Na podstawie Twoich odpowiedzi sugerujemy:</h3>
                                        <ul className="list-disc opacity-80 ml-6 mt-3">
                                                <li>krótkie przerwy</li>
                                                <li>techniki oddechowe</li>
                                                <li>artykuły</li>
                                                <li>aktywności fizyczne</li>
                                                <li>zadania na poprawę energii i koncentracji.</li>
                                        </ul>
                                        </div>
                                        <img src={Progress} alt=""  className="w-full md:w-3/5 mb-5 shadow-lg/20 shadow-success rounded-lg"/>
                                        </div>
                                </CardBody>
                            </Card>
                        </div>
                    </CarouselItem>
                    <CarouselItem  >
                        <div className="p-1">
                            <Card shadow="sm" >
                                <CardHeader className="p-5">
                                        <h2 className="text-2xl md:text-3xl">3. Pracuj lepiej dzięki Trybowi Focus</h2>
                                </CardHeader>
                                <Divider />
                                <CardBody className="p-6 md:p-10 ">
                    
                                        <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-center justify-center">
                                        <div className="md:flex-1">
                                        <h3 className="text-2xl">Proste cykle Pomodoro pomagają:</h3>
                                        <ul className="list-disc opacity-80 mt-4 ml-6">
                                                <li>unikać przeciążenia,</li>
                                                <li>utrzymać rytm,</li>
                                                <li>pracować świadomie,</li>
                                                <li>zachować granice między wysiłkiem a odpoczynkiem.</li>
            
                                        </ul>
                                        </div>
                                        <img src={focusScr} alt="zdjęcie zakładki focus" className="w-full md:w-3/5 mb-5 shadow-lg/20 shadow-success rounded-lg" />
                                        </div>
                    
                                </CardBody>
                            </Card>
                        </div>
                    </CarouselItem>
                     <CarouselItem  >
                        <div className="p-1">
                            <Card shadow="sm" >
                                <CardHeader className="p-5">
                                        <h2 className="text-2xl md:text-3xl">4. dołącz do forum i znajdź wsparcie</h2>
                                </CardHeader>
                                <Divider />
                                <CardBody className="p-6 md:p-10">
                                     <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-center justify-center">
                                        <div className="md:flex-1">
                                        <h3 className="text-lg m-2 text-center md:text-left">Ludzie, którzy przeszli przez to samo, najlepiej rozumieją Twoją sytuację. Rozmawiaj, dziel się doświadczeniami, pomagaj innym.</h3>
                                        </div>
                                        <img src={forumScr} alt="zdjęcie naszego forum" className="w-full md:w-3/5 mb-5 m-auto shadow-lg/20 shadow-success rounded-lg"/>
                                        </div>
                                        
                                       
                    
                                </CardBody>
                            </Card>
                        </div>
                    </CarouselItem>
                     <CarouselItem  >
                        <div className="p-1">
                            <Card shadow="sm" >
                                <CardHeader className="p-5">
                                        <h2 className="text-2xl md:text-3xl">5. Oglądaj swoje statystyki</h2>
                                </CardHeader>
                                <Divider />
                                <CardBody className="p-6 md:p-10">

                                     <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-center justify-center">
                                        <div className="md:flex-1">
                                        <h3 className="text-xl">Twoje dane zmieniają się codziennie — widzisz:</h3>
                                        <ul className="list-disc ml-6">
                                                <li>spadek stresu,</li>
                                                <li>poprawę energii,</li>
                                                <li>regularność pracy,</li>
                                                <li>rozwój zdrowych nawyków.</li>
                        
                                        </ul>
                                        <p className="mt-3">Motywacja rośnie, gdy widzisz realny progres.</p>
                                        </div>
                                        <img src={stats} alt="zdjęcie zakładki focus" className="w-full md:w-3/5 mb-5 shadow-lg/20 shadow-success rounded-lg" />
                                        </div>

                                        
                    
                                </CardBody>
                            </Card>
                        </div>
                    </CarouselItem>
                        <CarouselItem  >
                        <div className="p-1">
                            <Card shadow="sm" >
                                <CardHeader className="p-5">
                                        <h2 className="text-2xl md:text-3xl">6. Zdobywaj odznaki i nagrody</h2>
                                </CardHeader>
                                <Divider />
                                <CardBody className="p-6 md:p-10">
                                        <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-center justify-center">
                                             <div className="md:flex-1">
                                        <h3 className="text-xl">Dbasz o siebie = zdobywasz odznaki. Nawyki stają się przyjemniejsze dzięki elementom grywalizacji.</h3>
                                       
                                        <p className="mt-3">Możesz także zdobyć obramówkę do avatara w zależności od twojej aktualnej serii serii.</p>
                                        </div>
                                          

                                        <img src={Badges} alt="zdjęcie sekcji z odznakami" className="w-full md:w-3/5 mb-5 shadow-lg/20 shadow-success rounded-lg" />
                                        </div>
                                        
                    
                                </CardBody>
                            </Card>
                        </div>
                    </CarouselItem>
          
       
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
        </Carousel>
                        </section>
            <section className="w-full h-fit md:w-8/10 mx-auto mt-35 px-4 md:px-0">
                <h2 className="text-5xl font-bold mb-6">Dlaczego WorkSense działa</h2>
                
                                <div className="flex flex-col sm:flex-row w-full text-center gap-5 opacity-80 ">
                    
                                        <div className="w-full sm:w-1/3 p-10 text-2xl flex flex-col  justify-between">
                                        <p className="">Zmiana nawyków pracy</p>
                                         <div className="pt-15"> <ColumnSrc className="text-foreground grow-0 shrink-0 w-[40vw] sm:w-[15vw] m-auto h-fit" title="Column icon"/></div>
                                         
                                         </div>
                    
                                         <div className="w-full sm:w-1/3 p-10 text-2xl flex  flex-col justify-between ">
                                         <p className="">Psychoedukacja o stresie i wypaleniu</p>
                                         <div className="pt-15"> <ColumnSrc className="text-foreground grow-0 shrink-0 w-[40vw] sm:w-[15vw] m-auto h-fit" title="Column icon"/></div>
                                       
                                        </div>
                    
                                        <div className="w-full sm:w-1/3 p-10 text-2xl flex  flex-col justify-between "> 
                                            <p className="">Wsparcie społeczne</p>
                                            <div className="pt-15"><ColumnSrc className="text-foreground grow-0 shrink-0 w-[40vw] sm:w-[15vw] m-auto h-fit" title="Column icon"/></div>
                                            
                                        </div>
                                </div>
            </section>
             <section className="w-9/10 m-auto mt-20 sm:mt-80">
                <h2 className="text-5xl font-bold mb-6 ">Plan rozwoju</h2>
                <div className=" flex-col md:flex-row relative justify-center">
                <div className="md:w-1/2">
                    <h3 className="text-3xl opacity-80 mb-5 ">Już w krótce...</h3>
                    <ul className="list-disc mb-6 ml-6 text-lg">
                        <li>aplikacja mobilna,</li>
                        <li>integracja ze smartwatchami (monitoring stresu, snu, aktywności),</li>
                        <li>inteligentniejsze przypomnienia,</li>
                        <li>własne artykuły i materiały edukacyjne,</li>
                        <li>webinary i zajęcia z psychologami.</li>
                    </ul>
                </div>
                     <img src={Group8} className="w-[90vw] md:w-1/2 max-h-150 right-5 -top-50 md:absolute object-contain" alt="picture of an apple watch and app store page with our app" />
                </div>
            </section>
                 <section className="w-full md:w-8/10 mx-auto mt-20 sm:mt-60 px-4 md:px-0 text-justify">
                <h2 className="text-5xl font-bold mb-6 ">Kim jesteśmy</h2>
                <p className="opacity-80 md:w-2/3">Jesteśmy zespołem figoFagoFego z Gliwic, uczniami jednej klasy technikum informatycznego. W ramach hackathonu postawiliśmy na temat bliski naszej generacji — narastające przeciążenie, stres i wypalenie, z którymi mierzy się coraz więcej młodych ludzi.</p>
                <br />
                <p className="opacity-80 md:w-2/3">WorkSense to projekt, w którym łączymy wiedzę techniczną z empatią i zrozumieniem dla zdrowia psychicznego. Każdy z nas wnosi do zespołu inne umiejętności — programowanie, projektowanie interfejsów, analizę danych czy kreatywne myślenie. Wspólnie budujemy rozwiązanie, które nie tylko działa, lecz także wspiera użytkowników w budowaniu zdrowych nawyków i lepszej jakości życia.</p>

                
            </section>
                 <section className="w-full md:w-8/10 mx-auto mt-50 flex-col flex items-center px-4 md:px-0">
                     <h2 className="text-3xl md:text-3xl font-bold mb-6 text-center">Zadbaj o siebie już dziś</h2>
                    <Button color="success" className="w-full md:w-1/4"> <Link showAnchorIcon href={authedUser?"/dashboard":"/login"} color="foreground" >Rozpocznij Teraz</Link> </Button>
                
            </section>
             
                 <section className="w-full md:w-8/10 mx-auto mt-50 px-4 md:px-0">
                <h2 className="text-5xl font-bold mb-6">FAQ</h2>
                 <Accordion variant="shadow">
                <AccordionItem key="1" aria-label="Czy WorkSense zastępuje psychologa?" title="Czy WorkSense zastępuje psychologa?">
                 <p className="opacity-80 m-5">Nie. WorkSense jest narzędziem wspierającym — pomaga monitorować samopoczucie, budować zdrowe nawyki i redukować stres, ale nie zastępuje terapii ani konsultacji u specjalisty. Jeśli objawy są nasilone lub długotrwałe, zalecamy kontakt z psychologiem lub psychiatrą.</p>
                 </AccordionItem>
                <AccordionItem key="2" aria-label="Czy mogę korzystać na telefonie?" title="Czy mogę korzystać na telefonie?">
                    <p className="opacity-80 m-5">Tak. WorkSense działa w pełni na telefonach poprzez wersję przeglądarkową. Strona jest responsywna, więc wszystkie funkcje — check-up, timer, forum i statystyki — wygodnie działają mobilnie. W planach mamy stworzenie dedykowanej aplikacji mobilnej.</p>
                 
                </AccordionItem>
                <AccordionItem key="3" aria-label="Skąd pochodzą artykuły dostępne w aplikacji?" title="Skąd pochodzą artykuły dostępne w aplikacji?">
                    <p className="opacity-80 m-5">Artykuły pochodzą wyłącznie z rzetelnych, sprawdzonych i wiarygodnych źródeł, takich jak portale psychologiczne, instytucje zdrowia publicznego i organizacje zajmujące się zdrowiem mentalnym. Każdy tekst przechodzi weryfikację, aby mieć pewność, że treści są faktyczne, aktualne i oparte na badaniach.</p>
                
                </AccordionItem>
                <AccordionItem key="4" aria-label="Czy mogę używać WorkSense bez konta?" title="Czy mogę używać WorkSense bez konta?">
                    <p className="opacity-80 m-5">W ograniczonym zakresie tak — możesz zobaczyć część strony informacyjnej. Jednak pełny dostęp do funkcji, takich jak check-up, statystyki, forum, timer czy odznaki, wymaga założenia konta, abyśmy mogli zapisać Twoje dane i postępy.</p>
                
                </AccordionItem>
                <AccordionItem key="5" aria-label="Co zrobić, jeśli czuję się bardzo przeciążony — od czego zacząć w aplikacji?" title="Co zrobić, jeśli czuję się bardzo przeciążony — od czego zacząć w aplikacji?">
                    <p className="opacity-80 m-5">Najlepiej zacząć od krótkiego codziennego check-upu. Dzięki niemu aplikacja oceni Twój poziom energii, stresu i nastroju, a następnie zaproponuje konkretne działania dopasowane do Twojej sytuacji — na przykład przerwę, aktywność, materiał do przeczytania lub sesję Pomodoro, aby uporządkować pracę. To najprostszy i najbezpieczniejszy sposób, by zacząć.</p>
                </AccordionItem>
                    <AccordionItem key="6" aria-label="Czy moje odpowiedzi w check-upie są prywatne i kto ma do nich dostęp?" title="Czy moje odpowiedzi w check-upie są prywatne i kto ma do nich dostęp?">
                        <p className="opacity-80 m-5">Twoje dane są prywatne, zaszyfrowane i widoczne tylko dla Ciebie. Nie udostępniamy ich innym użytkownikom ani podmiotom zewnętrznym. Korzystamy z nich jedynie do generowania rekomendacji i statystyk powiązanych z Twoim kontem.</p>
                </AccordionItem>
                <AccordionItem key="7" aria-label="Czym właściwie jest wypalenie zawodowe i skąd mam wiedzieć, że mnie dotyczy?" title="Czym właściwie jest wypalenie zawodowe i skąd mam wiedzieć, że mnie dotyczy?">
                    <p className="opacity-80 m-5">Wypalenie to stan długotrwałego wyczerpania psychicznego, emocjonalnego i fizycznego wynikającego z przeciążenia obowiązkami lub stresem. Może objawiać się brakiem motywacji, trudnością w skupieniu, poczuciem bezradności, zwiększoną irytacją czy ciągłym zmęczeniem. Jeśli czujesz, że mimo wysiłku nie masz energii, trudno Ci się zaangażować lub Twoje samopoczucie wyraźnie spadło — to mogą być sygnały wypalenia.</p>
                </AccordionItem>

                
                </Accordion>
            </section>

            </div>
        </DefaultLayout>
        </>
    )
}