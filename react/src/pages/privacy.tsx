import DefaultLayout from "@/layouts/default";

export default function PrivacyPage() {
  return (
    <DefaultLayout>
        <div className="w-9/10 sm:w-2/3 m-auto">
    <h1 className="font-bold text-4xl mb-5">Polityka prywatności – WorkSense</h1>

    <h2 className="font-bold text-2xl">1. Gromadzenie danych</h2>
    <p className="mb-3">
      WorkSense zbiera dane podawane dobrowolnie przez użytkownika w codziennym check-upie, takie jak nastrój, poziom stresu, energia i inne wskaźniki samopoczucia. Dane te mogą być analizowane przy użyciu <strong>OpenAI API</strong>, aby wygenerować spersonalizowane rekomendacje.
      W procesie rejestracji stosujemy <strong>Google reCAPTCHA</strong> w celu ochrony przed automatycznymi kontami i nadużyciami.
      Aplikacja korzysta z hostingu <strong>SEOHost</strong>, który przechowuje dane techniczne i pliki aplikacji w sposób bezpieczny.
    </p>

    <h2 className="font-bold text-2xl">2. Wykorzystanie danych</h2>
    <p className="mb-3">
      Dane użytkownika są używane wyłącznie do: 
      <ul>
        <li>personalizacji rekomendacji opartych na analizie OpenAI,</li>
        <li>monitorowania postępów i wizualizacji statystyk,</li>
        <li>poprawy działania aplikacji i wykrywania nadużyć (reCAPTCHA),</li>
        <li>przechowywania danych w bezpieczny sposób na serwerach SEOHost.</li>
      </ul>
    </p>

    <h2 className="font-bold text-2xl">3. Ochrona danych</h2>
    <p className="mb-3">
      W szystkie dane są przechowywane w sposób szyfrowany. Nie udostępniamy danych osobom trzecim poza usługami niezbędnymi do działania aplikacji (OpenAI API, SEOHost, Google reCAPTCHA), które przetwarzają dane zgodnie z własnymi politykami prywatności.
    </p>

    <h2 className="font-bold text-2xl">4. Prawo użytkownika</h2>
    <p className="mb-3">
      Użytkownik ma prawo do: 
      <ul>
        <li>wglądu w swoje dane,</li>
        <li>ich edycji lub usunięcia,</li>
        <li>wycofania zgody na przetwarzanie danych w dowolnym momencie.</li>
      </ul>
    </p>

    <h2 className="font-bold text-2xl">5. Dzieci i młodzież</h2>
    <p className="mb-3">
      Aplikacja jest przeznaczona dla użytkowników powyżej 13 roku życia. Rodzice lub opiekunowie powinni nadzorować korzystanie młodszych osób.
    </p>

    <h2 className="font-bold text-2xl">6. Zmiany polityki prywatności</h2>
    <p className="mb-3">
      Zastrzegamy sobie prawo do aktualizacji polityki prywatności. Każda zmiana zostanie ogłoszona w aplikacji i na stronie internetowej.
    </p>
  </div>
    </DefaultLayout>
  );
}
