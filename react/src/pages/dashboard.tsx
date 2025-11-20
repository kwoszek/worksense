import {Card, CardHeader, CardBody} from "@heroui/card";
import DefaultLayout from "@/layouts/default";
import { Link } from "react-router-dom";

import { Divider } from "@heroui/divider";
import Post from "@/components/post";
import MoodChart from "@/components/moodChart";
import { useGetCheckinsQuery } from "@/services/forumApi";
import { useSelector } from "react-redux";
import { selectAuthUser } from "@/features/auth/authSlice";
import { useGetPostsQuery } from "@/services/forumApi";
import { useGetAnalysesQuery } from "@/services/analysisApi";

export default function DashboardPage() {
  const today = new Date().toISOString().slice(0, 10);
  const { data: checkins } = useGetCheckinsQuery();
  const user = useSelector(selectAuthUser);
  const { data: analyses } = useGetAnalysesQuery();
  const latestAnalysis = analyses && analyses.length ? analyses[0] : null;
   const hasToday = !!checkins?.find((c) => c.userid === user?.id && c.date.slice(0,10) === today);

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
    tittle: "Wypalenie zawodowe – czym jest, co je powoduje i jak mu zapobiegać?",
    summary: "Psychologiczne spojrzenie na przyczyny, objawy i strategie zapobiegania wypaleniu zawodowemu.",
    href: "https://dorada.uj.edu.pl/artykuly/wypalenie-zawodowe-czym-jest-co-je-powoduje-i-jak-mu-zapobiegac"
  },
  {
    tittle: "Wypalenie zawodowe – przyczyny, objawy, skutki i leczenie",
    summary: "Psychologia w praktyce: omówienie triady wypalenia oraz propozycje leczenia.",
    href: "https://psychologiawpraktyce.pl/article/wypalenie-zawodowe-przyczyny-objawy-skutki-i-leczenie"
  },
  {
    tittle: "Wypalenie zawodowe – pięć głównych przyczyn",
    summary: "Psychoterapia.com analizuje najczęściej wymieniane przyczyny psychologiczne wypalenia.",
    href: "https://www.psychoterapia.com/czytelnia/problemy-psychologiczne/wypalenie-zawodowe-5-glownych-przyczyn/"
  },
  {
    tittle: "Wypalenie zawodowe – następstwo stresu zawodowego",
    summary: "Artykuł naukowy z NSZ (Akademia Obrony Narodowej) o stresie jako głównym czynniku wypalenia.",
    href: "https://nsz.wat.edu.pl/Wypalenie-zawodowe-nastepstwo-stresu-zawodowego%2C129541%2C0%2C1.html"
  },
  {
    tittle: "Wypalenie zawodowe jako rezultat niedopasowania zawodu",
    summary: "Artykuł z Homo et Societas omawiający związek między wypaleniem a niedopasowaniem zawodowym.",
    href: "https://cejsh.icm.edu.pl/cejsh/element/bwmeta1.element.ojs-doi-10_4467_25436104HS_23_005_19117"
  },
  {
    tittle: "Wypalenie zawodowe nauczyciela – psychologiczny zespół emocjonalnego wyczerpania",
    summary: "Artykuł naukowy o wypaleniu wśród nauczycieli: etapy wypalenia i zaburzenia emocjonalne.",
    href: "https://cejsh.icm.edu.pl/cejsh/element/bwmeta1.element.desklight-bec06587-2f93-4a54-a57c-61790d124488/c/tom34-16-adamczyk.pdf"
  },
  {
    tittle: "Zmęczenie pracą czy wypalenie zawodowe?",
    summary: "Psychologia.edu.pl: analizuje różnice między zmęczeniem a syndromem wypalenia.",
    href: "https://psychologia.edu.pl/czytelnia/63-terapia-uzalenienia-i-wspouzalenienia/320-zmeczenie-praca-czy-wypalenie-zawodowe.pdf"
  },
  {
    tittle: "Stres, zaburzenia lękowe i wypalenie zawodowe – raport SWPS",
    summary: "Raport Uniwersytetu SWPS o jakości życia i zdrowiu psychicznym w środowisku akademickim.",
    href: "https://swps.pl/centrum-prasowe/informacje-prasowe/36963-stres-zaburzenia-lekowe-i-wypalenie-zawodowe-raport-o-zdrowiu-psychicznym-i-jakosci-zycia-w-srodowisku-akademickim"
  },
  {
    tittle: "Wypalenie zawodowe i aktywistyczne w trzecim sektorze",
    summary: "Artykuł z NGO.pl o wypaleniu w organizacjach pozarządowych oraz jego psychologicznym wpływie.",
    href: "https://publicystyka.ngo.pl/wypalenie-zawodowe-i-aktywistyczne-w-trzecim-sektorze-w-polsce-chorwacji-i-slowenii"
  },
  {
    tittle: "Wypalenie zawodowe – możliwości terapeutyczne i psychologiczne",
    summary: "Rozdział książki o terapii i autoterapii wypalenia zawodowego — psychologiczne i psychiatryczne podejścia.",
    href: "https://wydawnictwo.ipin.edu.pl/pl/oferta/wypalenie-zawodowe"
  }
];
  return (
    <DefaultLayout>
      <div className="flex flex-wrap justify-center gap-5">
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
         {hasToday ? <div className="text-sm opacity-70">Check-in na dzisiaj zrobiony!!</div>:<Link  to="/progress" className="text-3xl opacity-80 text-success underline" state="open">Zrób codzienny check-in</Link>}
        
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
        articles.map(a => (
          <>
          <Link color="success" className="opacity-60 m-2" to={a.href}  target="_blank" rel="noopener noreferrer">{a.tittle}</Link>
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
