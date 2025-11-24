import { Divider } from "@heroui/divider";
import DefaultLayout from "@/layouts/default";
import Article from "@/components/article";

export default function ArticlesPage() {

  const przeglady = [
  {
    title: "Burnout wśród uczniów i studentów – czym jest wypalenie w edukacji",
    link: "https://szkolnagieldapracy.pl/wypalenie/",
  },
  {
    title: "Stres szkolny – niedostrzegane cierpienie dzieci",
    link: "https://zdrowie.pap.pl/rodzice/stres-szkolny-niedostrzegane-cierpienie-dzieci",
  },
  {
    title: "Szkolne wypalenie. O dobrostanie nauczyciela oraz ucznia …",
    link: "https://didactica.uken.krakow.pl/article/view/11628",  // Janus-Sitarz 2024 :contentReference[oaicite:0]{index=0}
  },
  {
    title: "Wypalenie uczniowskie a presja szkolna – jak znaleźć równowagę?",
    link: "https://www.malecharaktery.pl/artykul/wypalenie-uczniowskie-a-presja-szkolna-jak-znalezc-rownowage",
  },

  {
    title: "Wypalenie zawodowe – czym jest, co je powoduje i jak mu zapobiegać?",
    link: "https://dorada.uj.edu.pl/artykuly/wypalenie-zawodowe-czym-jest-co-je-powoduje-i-jak-mu-zapobiegac",  // Dorada UJ :contentReference[oaicite:1]{index=1}
  },
  {
    title: "Jak sobie radzić z wypaleniem zawodowym?",
    link: "https://efl.pl/pl/biznes-i-ty/artykuly/jak-sobie-radzic-z-wypaleniem-zawodowym",  // EFL poradnik :contentReference[oaicite:2]{index=2}
  },
  {
    title: "Wypalenie zawodowe – przyczyny, objawy i strategie zapobiegania",
    link: "https://open.icm.edu.pl/handle/123456789/26237",  // Gawron 2025 :contentReference[oaicite:3]{index=3}
  },
  {
    title: "Wypalenie zawodowe – przyczyny, objawy, skutki, zapobieganie",
    link: "https://yadda.icm.edu.pl/baztech/element/bwmeta1.element.baztech-ec918b69-4626-4c92-aa61-2a7158eea07a",  // Ostrowska & Michcik :contentReference[oaicite:4]{index=4}
  }
];
const badania = [
  // szkolne / akademickie
  {
    title: "Wypalenie szkolne wśród uczniów – niepokojące zjawisko edukacyjne …",
    link: "https://czasopisma.aps.edu.pl/index.php/pow/article/view/2603",  // Gonciarz 2025 :contentReference[oaicite:5]{index=5}
  },
  {
    title: "Profile wypalenia szkolnego wśród polskich adolescentów …",
    link: "https://czasopisma.uwm.edu.pl/index.php/pp/article/view/10909",  // Tomaszek & Muchacka-Cymerman :contentReference[oaicite:6]{index=6}
  },
  {
    title: "Stres i wypalenie nauką zdalną oraz używanie substancji psychoaktywnych …",
    link: "http://hdl.handle.net/11320/19261",  // Muchacka-Cymerman & Tomaszek :contentReference[oaicite:7]{index=7}
  },
  {
    title: "Czynniki osobowościowe i relacyjne wypalenia szkolnego u gimnazjalistów",
    link: "https://wsp.edu.pl/wp-content/uploads/2020/06/RP-2017-4.pdf",  // Pedagogiczny kwartalnik, analiza samooceny i relacji :contentReference[oaicite:8]{index=8}
  },
  {
    title: "Polietiologia wypalenia szkolnego – przegląd czynników ryzyka",
    link: "https://wuw.pl/data/include/cms/Kwartalnik_Pedagogiczny_2_2018.pdf",  // teoria czynników ryzyka :contentReference[oaicite:9]{index=9}

  // zawodowe
  },
  {
    title: "Wypalenie zawodowe nauczycieli – raport dużego badania (7106 nauczycieli)",
    link: "https://www.gazetaprawna.pl/wiadomosci/kraj/artykuly/8692403%2Cwypalenie-zawodowe-nauczycieli-szkoly-przedszkola.html",  // raport GazetaPrawna / Librus :contentReference[oaicite:10]{index=10}
  },
  {
    title: "Wypalenie zawodowe – charakterystyka zjawiska. Sposoby przeciwdziałania",
    link: "https://yadda.icm.edu.pl/baztech/element/bwmeta1.element.baztech-4c11842f-86ad-4905-8a69-717f5bed1d30",  // Gembalska-Kwiecień & Ignac-Nowicka :contentReference[oaicite:11]{index=11}
  },
  {
    title: "Nawet co dziesiąty młody Polak może odczuwać wypalenie pandemiczne",
    link: "https://www.gazetaprawna.pl/wiadomosci/kraj/artykuly/8334720%2Cwypalenie-pandemiczne-objawy-depresyjne-i-lekowe-polacy-badanie.html",  // badanie UŚ :contentReference[oaicite:12]{index=12}
  },
  {
    title: "Wypalenie zawodowe – przyczyny, objawy i strategie zapobiegania (badanie literaturowe)",
    link: "https://open.icm.edu.pl/handle/123456789/26237",  // Gawron 2025 :contentReference[oaicite:13]{index=13}
  }
];
const czynnikiKonsekwencje = [
  // szkolne / akademickie
  {
    title: "Wypalenie szkolne, charakterystyka zjawiska – zagrożenie w edukacji",
    link: "https://zbc.uz.zgora.pl/repozytorium/publication/91550",  // Góralewska-Słońska 2024 :contentReference[oaicite:14]{index=14}
  },
  {
    title: "Polietiologia wypalenia szkolnego: cechy osobowości, relacje i perfekcjonizm",
    link: "https://wuw.pl/data/include/cms/Kwartalnik_Pedagogiczny_2_2018.pdf",  // czynnik ryzyka osobowościowy / relacyjny :contentReference[oaicite:15]{index=15}
  },
  {
    title: "Relacje rodzinne a wypalenie szkolne – profil ryzyka u nastolatków",
    link: "https://czasopisma.uwm.edu.pl/index.php/pp/article/view/10909",  // Tomaszek & Muchacka-Cymerman :contentReference[oaicite:16]{index=16}
  },

  // zawodowe
  {
    title: "Każdy jest narażony na wypalenie zawodowe (tekst popularny)",
    link: "https://zielonalinia.gov.pl/en/-/kazdy-jest-narazony-na-wypalenie-zawodowe",
  },
  {
    title: "Jak uniknąć wypalenia zawodowego? Psycholog zdradza prosty sposób",
    link: "https://forsal.pl/praca/aktualnosci/artykuly/10578299%2Cjak-uniknac-wypalenia-zawodowego-psycholog-zdradza-prosty-sposob.html",  // Forsal.pl :contentReference[oaicite:17]{index=17}
  }
];
const prewencja = [
  // szkolne / akademickie
  {
    title: "Stres i przemęczenie psychiczne uczniów – zjawisko wypalenia szkolnego",
    link: "https://www.mocnasiecporadnictwa.pl/blog/wsparcie/stres-i-przemeczenie-psychiczne-uczniow-zjawisko-wypalenia-szkolnego",  // blog poradniczy :contentReference[oaicite:18]{index=18}
  },
  {
    title: "Szkolne wypalenie – rola nauczyciela i budowanie relacji ochronnych",
    link: "https://didactica.uken.krakow.pl/article/view/11628",  // Janus-Sitarz 2024 :contentReference[oaicite:19]{index=19}
  },

  // zawodowe
  {
    title: "Jak zapobiegać wypaleniu zawodowemu? [RAPORT]",
    link: "https://zielonalinia.gov.pl/ru/-/jak-zapobiegac-wypaleniu-zawodowemu-raport",  // Zielona Linia :contentReference[oaicite:20]{index=20}
  },
  {
    title: "Wypalenie zawodowe – poradnik prewencyjny Time2Grow dla pracodawców",
    link: "https://dobrekadry.pl/wp-content/uploads/2024/03/Wypalenie-zawodowe-%E2%80%93-zapobieganie-i-przeciwdzialanie.-Poradnik-dla-pracodawcow-PL.pdf",  // Time2Grow poradnik :contentReference[oaicite:21]{index=21}
  },
  {
    title: "Poradnik dla medyków: Wypalenie zawodowe (lekarskie dyżury, empatia, grupy Balinta)",
    link: "https://poz.pzwl.pro/wp-content/uploads/2023/11/Wypalenie-zawodowe.pdf",  // poradnik PZWL :contentReference[oaicite:22]{index=22}
  }
];



  return (
    <DefaultLayout>

      <div className="grid place-items-start w-full grid-cols-2 p-20">
      <div className="  px-5 mb-25 p-10">
     
        <h2 className="text-4xl opacity-100 mt-3">Przeglądy</h2>
      
     <Divider/>
     {
        przeglady.map(a => (
        <Article tittle={a.title}  href={a.link} />
        ))}
       
     </div>
     <div className="  px-5 mb-25 p-10">
     
        <h2 className="text-4xl opacity-100 mt-3">Badania</h2>
      
     <Divider/>
     {
        badania.map(a => (
        <Article tittle={a.title}  href={a.link} />
        ))}
       
     </div>
      <div className=" px-5 mb-25 p-10">
     
        <h2 className="text-4xl opacity-100 mt-3">Czynniki ryzyka, konsekwencje i mechanizmy</h2>
      
     <Divider/>
     {
        czynnikiKonsekwencje.map(a => (
        <Article tittle={a.title}  href={a.link} />
        ))}
       
     </div>
     <div className=" px-5 mb-25 p-10">
     
        <h2 className="text-4xl opacity-100 mt-3">Prewencja</h2>
      
     <Divider/>
     {
        prewencja.map(a => (
        <Article tittle={a.title}  href={a.link} />
        ))}
       
     </div>
      </div>
    </DefaultLayout>
  );
}
