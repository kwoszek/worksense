import {Card, CardHeader, CardBody} from "@heroui/card";
import DefaultLayout from "@/layouts/default";
import { Link } from "react-router-dom";
import { useEffect, useState } from 'react';

import { Divider } from "@heroui/divider";
import Post from "@/components/post";
import MoodChart from "@/components/moodChart";
import { useGetCheckinsQuery } from "@/services/forumApi";
import { useSelector } from "react-redux";
import { selectAuthUser } from "@/features/auth/authSlice";
import { useGetPostsQuery } from "@/services/forumApi";
import { useGetAnalysesQuery } from "@/services/analysisApi";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/modal";

export default function DashboardPage() {
  // current date in Europe/Warsaw in YYYY-MM-DD format
  // Use Intl.DateTimeFormat to ensure timeZone support across browsers (Safari older versions
  // sometimes ignore the timeZone option when using Date.prototype.toLocaleDateString).
  const getWarsawYmd = () => {
    try {
      const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Warsaw', year: 'numeric', month: '2-digit', day: '2-digit' });
      return fmt.format(new Date());
    } catch (e) {
      // Fallback: use UTC-based YYYY-MM-DD. This is less correct around timezone boundaries
      // but guarantees a stable string on environments without Intl timezone support.
      console.log('Intl timezone formatting not supported, falling back to UTC date');
      return new Date().toISOString().slice(0, 10);
    }
  };
  const today = getWarsawYmd();
  
  const { data: checkins } = useGetCheckinsQuery();
  const user = useSelector(selectAuthUser);
  const { data: analyses } = useGetAnalysesQuery();
  const latestAnalysis = analyses && analyses.length ? analyses[0] : null;
  const hasToday = !!checkins?.find((c) => c.userid === user?.id && c.date.slice(0,10) === today);
  const [showFirstLoginModal, setShowFirstLoginModal] = useState(false);

  useEffect(() => {
    if (!user?.id || typeof window === 'undefined') return;
    const key = `ws_first_login_seen_${user.id}`;
    const hasSeen = localStorage.getItem(key);
    if (!hasSeen) {
      setShowFirstLoginModal(true);
    }
  }, [user?.id]);

  const handleDismissFirstLogin = () => {
    if (user?.id && typeof window !== 'undefined') {
      localStorage.setItem(`ws_first_login_seen_${user.id}`, 'true');
    }
    setShowFirstLoginModal(false);
  };
  

  const chartCheckins = checkins
    ?.filter((c: any) => c.userid === user?.id)
    .map((c: any) => ({
      date: c.createdAt ?? c.date,
      stress: c.stress ?? 5,
      energy: c.energy ?? 5,
      moodScore: c.moodScore ?? undefined,
    }));
  const {data: popularPosts, isLoading: isLoadingPopularPosts} = useGetPostsQuery({ limit: 5, offset: 0, orderBy: 'likes', direction: 'DESC' });
  const articles = [
  {
    title: "Wypalenie zawodowe – czym jest, co je powoduje i jak mu zapobiegać?",
    summary: "Psychologiczne spojrzenie na przyczyny, objawy i strategie zapobiegania wypaleniu zawodowemu.",
    href: "https://dorada.uj.edu.pl/artykuly/wypalenie-zawodowe-czym-jest-co-je-powoduje-i-jak-mu-zapobiegac"
  },
  {
    title: "Wypalenie zawodowe – przyczyny, objawy, skutki i leczenie",
    summary: "Psychologia w praktyce: omówienie triady wypalenia oraz propozycje leczenia.",
    href: "https://psychologiawpraktyce.pl/article/wypalenie-zawodowe-przyczyny-objawy-skutki-i-leczenie"
  },
  {
    title: "Wypalenie zawodowe – pięć głównych przyczyn",
    summary: "Psychoterapia.com analizuje najczęściej wymieniane przyczyny psychologiczne wypalenia.",
    href: "https://www.psychoterapia.com/czytelnia/problemy-psychologiczne/wypalenie-zawodowe-5-glownych-przyczyn/"
  },
  {
    title: "Wypalenie zawodowe – następstwo stresu zawodowego",
    summary: "Artykuł naukowy z NSZ (Akademia Obrony Narodowej) o stresie jako głównym czynniku wypalenia.",
    href: "https://nsz.wat.edu.pl/Wypalenie-zawodowe-nastepstwo-stresu-zawodowego%2C129541%2C0%2C1.html"
  },
  {
    title: "Wypalenie zawodowe jako rezultat niedopasowania zawodu",
    summary: "Artykuł z Homo et Societas omawiający związek między wypaleniem a niedopasowaniem zawodowym.",
    href: "https://cejsh.icm.edu.pl/cejsh/element/bwmeta1.element.ojs-doi-10_4467_25436104HS_23_005_19117"
  },
  {
    title: "Wypalenie zawodowe nauczyciela – psychologiczny zespół emocjonalnego wyczerpania",
    summary: "Artykuł naukowy o wypaleniu wśród nauczycieli: etapy wypalenia i zaburzenia emocjonalne.",
    href: "https://cejsh.icm.edu.pl/cejsh/element/bwmeta1.element.desklight-bec06587-2f93-4a54-a57c-61790d124488/c/tom34-16-adamczyk.pdf"
  },
  {
    title: "Zmęczenie pracą czy wypalenie zawodowe?",
    summary: "Psychologia.edu.pl: analizuje różnice między zmęczeniem a syndromem wypalenia.",
    href: "https://psychologia.edu.pl/czytelnia/63-terapia-uzalenienia-i-wspouzalenienia/320-zmeczenie-praca-czy-wypalenie-zawodowe.pdf"
  },
  {
    title: "Stres, zaburzenia lękowe i wypalenie zawodowe – raport SWPS",
    summary: "Raport Uniwersytetu SWPS o jakości życia i zdrowiu psychicznym w środowisku akademickim.",
    href: "https://swps.pl/centrum-prasowe/informacje-prasowe/36963-stres-zaburzenia-lekowe-i-wypalenie-zawodowe-raport-o-zdrowiu-psychicznym-i-jakosci-zycia-w-srodowisku-akademickim"
  },
  {
    title: "Wypalenie zawodowe i aktywistyczne w trzecim sektorze",
    summary: "Artykuł z NGO.pl o wypaleniu w organizacjach pozarządowych oraz jego psychologicznym wpływie.",
    href: "https://publicystyka.ngo.pl/wypalenie-zawodowe-i-aktywistyczne-w-trzecim-sektorze-w-polsce-chorwacji-i-slowenii"
  },
  {
    title: "Wypalenie zawodowe – możliwości terapeutyczne i psychologiczne",
    summary: "Rozdział książki o terapii i autoterapii wypalenia zawodowego — psychologiczne i psychiatryczne podejścia.",
    href: "https://wydawnictwo.ipin.edu.pl/pl/oferta/wypalenie-zawodowe"
  }
];
  return (
    <DefaultLayout >
      <Modal isOpen={showFirstLoginModal} onOpenChange={(open) => {
        if (!open) handleDismissFirstLogin();
      }} placement="center" backdrop="blur">
        <ModalContent className="p-3">
          {() => (
            <>
              <ModalHeader className="text-3xl flex flex-col gap-1">Witamy w Worksense!</ModalHeader>
              <ModalBody>
                <p className="opacity-80 bg-[#FF000024] text-lg p-5 rounded-lg">Pamiętaj nasza aplikacja NIE zastępuje profesjonalnej pomocy psychologicznej, a jedynie stanowi formę wsparcia.</p>
              </ModalBody>
            
            </>
          )}
        </ModalContent>
      </Modal>
      <div className="flex flex-wrap justify-center gap-5 px-4 md:px-0">
      <div className= "flex flex-col gap-5 w-full sm:w-1/2 min-w-0" >
      <MoodChart checkins={chartCheckins} />
    <Card className="p-5 hidden sm:block">
      <CardHeader>
        <h2 className="opacity-80 text-2xl">Popularne posty</h2>

      </CardHeader>
      <CardBody>
         {!isLoadingPopularPosts ? (
              popularPosts?.map((post) => (
                <Post key={post.id} {...post} />
              ))
            ) : (
              <></>
          )}
      </CardBody>
    </Card>

    
    </div>
    <div className="flex flex-col gap-5 w-full sm:w-1/3 min-w-0">
      <Card className="p-3">
        <CardHeader>
          <h2 className="text-2xl opacity-80">Cześć {user?.username}!</h2>
        </CardHeader>
      <CardBody>
         {hasToday ? <div className="text-sm opacity-70">Już wykonałeś dzisiejszy check-in!</div> : <Link  to="/progress" className="text-3xl opacity-80 text-success underline" state="open">Zrób codzienny check-in</Link>}
        
      </CardBody>
    </Card>
     {latestAnalysis && (
      <Card className="p-3">
        <CardHeader>
          <h2 className="text-2xl opacity-80">Twój najnowszy check-in</h2>
        </CardHeader>
        <CardBody>
          <p className="text-sm opacity-60">{latestAnalysis.message}</p>
        </CardBody>
      </Card>
     )}
     <Card>
      <CardHeader>
        <h2 className="text-2xl opacity-80">Wybrane artykuły</h2>
      </CardHeader>
      <Divider />
      <CardBody>{
        articles.map((a) => (
          <>
          <Link color="success" className="opacity-60 m-2" to={a.href}  target="_blank" rel="noopener noreferrer">{a.title}</Link>
          <Divider />
          </>
        ))}
      </CardBody>
     </Card>
    </div>
    </div>
    </DefaultLayout>
  );
}
