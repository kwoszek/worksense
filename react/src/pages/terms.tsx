import DefaultLayout from "@/layouts/default";

export default function TermsPage() {
  return (
    <DefaultLayout>
     <div className="w-9/10 sm:w-2/3 m-auto">
    <h1 className="font-bold text-4xl mb-5">End User License Agreement (EULA) – WorkSense</h1>

    <h2 className="font-bold text-2xl">1. Licencja</h2>
    <p className="mb-3">
      WorkSense udziela użytkownikowi niewyłącznej, niezbywalnej licencji na korzystanie z aplikacji wyłącznie do celów osobistych i edukacyjnych.
    </p>

    <h2 className="font-bold text-2xl">2. Ograniczenia</h2>
    <p className="mb-3">
      Użytkownik nie może:
      <ul>
        <li>kopiować, modyfikować ani dystrybuować aplikacji,</li>
        <li>odtwarzać, dekompilować ani tworzyć produktów pochodnych,</li>
        <li>używać aplikacji w sposób naruszający prawo lub prawa osób trzecich.</li>
      </ul>
    </p>

    <h2 className="font-bold text-2xl">3. Własność intelektualna</h2>
    <p className="mb-3">
      Wszystkie prawa autorskie, znaki towarowe i technologie użyte w WorkSense należą do zespołu <strong>FigoFagoFego</strong>.
    </p>

    <h2 className="font-bold text-2xl">4. Wyłączenie odpowiedzialności</h2>
    <p className="mb-3">
      Aplikacja dostarcza narzędzia wspierające zdrowie psychiczne i higienę pracy, ale <strong>nie zastępuje profesjonalnej diagnozy ani terapii</strong>. Użytkownik korzysta z aplikacji na własną odpowiedzialność.
    </p>

    <h2 className="font-bold text-2xl">5. Zawieszenie lub zakończenie licencji</h2>
    <p className="mb-3">
      Licencja może zostać zawieszona lub zakończona w przypadku naruszenia postanowień EULA.
    </p>

    <h2 className="font-bold text-2xl">6. Zmiany w EULA</h2>
    <p className="mb-3">
      Zespół WorkSense zastrzega sobie prawo do aktualizacji warunków licencji. Kontynuowanie korzystania z aplikacji po aktualizacji oznacza akceptację nowych warunków.
    </p>
  </div>
    </DefaultLayout>
  );
}
