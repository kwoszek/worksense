import { Card, CardBody, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import DefaultLayout from "@/layouts/default";
import Article from "@/components/article";

export default function ArticlesPage() {

  const articles = [
  { tittle: "How to Prevent and Overcome Burnout (APS)", summary: "Guidelines on preventing burnout through self-care and reflection.", href: "https://psychology.org.au/getmedia/85f586e3-a856-47f2-a306-d0568e318193/aps-burnout-community-resource.pdf" },
  { tittle: "Job Burnout: How to Spot It and Take Action", summary: "Mayo Clinic guide explaining symptoms of burnout and what to do next.", href: "https://www.mayoclinic.org/healthy-lifestyle/adult-health/in-depth/burnout/art-20046642" },
  { tittle: "Preventing Burnout: Protecting Your Well-Being", summary: "APA strategies to avoid burnout.", href: "https://www.psychiatry.org/news-room/apa-blogs/preventing-burnout-protecting-your-well-being" },
  { tittle: "Breaking Down Burnout in the Workplace", summary: "Mayo Clinic analysis of workplace burnout and solutions.", href: "https://mcpress.mayoclinic.org/mental-health/breaking-down-burnout-in-the-workplace/" },
  { tittle: "Burnout Prevention & Recovery", summary: "HelpGuide’s burnout recognition and recovery model.", href: "https://www.helpguide.org/mental-health/stress/burnout-prevention-and-recovery" },
  { tittle: "Burnout and the Brain", summary: "Explores neuroscience behind burnout.", href: "https://www.psychologicalscience.org/observer/burnout-and-the-brain" },
  { tittle: "Tips to Keep Burnout at Bay", summary: "Daily habits to reduce burnout risk.", href: "https://www.mayoclinichealthsystem.org/hometown-health/speaking-of-health/5-tips-to-keep-burnout-at-bay" },
  { tittle: "Burnout — Psychology Today", summary: "Overview of burnout and coping methods.", href: "https://www.psychologytoday.com/us/basics/burnout" },
  { tittle: "12 Ways to Recover From Burnout", summary: "Cleveland Clinic’s recovery tips.", href: "https://health.clevelandclinic.org/how-to-recover-from-burnout" },
  { tittle: "Plan to Prevent Physician Burnout", summary: "Mayo Clinic's plan to reduce burnout in healthcare.", href: "https://www.safetyandhealthmagazine.com/articles/15002-mayo-clinic-publishes-plan-to-help-prevent-physician-burnout" },
  { tittle: "What to Do If You Are Experiencing Burnout", summary: "Immediate steps for dealing with burnout.", href: "https://www.verywellmind.com/what-to-do-if-you-are-experiencing-burnout-5216152" },
  { tittle: "Burnout Recovery — Verywell Mind", summary: "Long-term burnout recovery strategies.", href: "https://www.verywellmind.com/burnout-recovery-and-prevention-6753704" },
  { tittle: "Exercise That Helps Reduce Burnout", summary: "Research showing moderate exercise reduces burnout.", href: "https://www.health.com/moderate-exercise-may-reduce-job-burnout-8676128" },
  { tittle: "How to Bounce Back From Burnout", summary: "Lifestyle-focused burnout recovery explained.", href: "https://www.vogue.com/article/burnout-recovery" }
];
const polskieArtykulyWypalenie = [
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
      <Card className="w-full md:w-6/10 m-auto px-5 mb-25 p-10">
      <CardHeader>
        <h2 className="text-6xl opacity-100 mt-3">Pomocne artykuły po polsku</h2>
      </CardHeader>
     <Divider/>
      <CardBody>{
        polskieArtykulyWypalenie.map(a => (
        <Article tittle={a.tittle} summary={a.summary} href={a.href} />
        ))}
        </CardBody>
     </Card>
     <Card className="w-full md:w-6/10 m-auto px-5  p-10">
      <CardHeader>
        <h2 className="text-6xl opacity-60 mt-3">Pomocne artykuły po angielsku</h2>
      </CardHeader>
     <Divider/>
      <CardBody>{
        articles.map(a => (
        <Article tittle={a.tittle} summary={a.summary} href={a.href} />
        ))}
        </CardBody>
     </Card>
    </DefaultLayout>
  );
}
