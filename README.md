# WorkSense – README

WorkSense to aplikacja wspierająca higienę pracy, zapobieganie wypaleniu oraz budowanie zdrowych nawyków poprzez technikę Pomodoro, codzienne check-iny i analizy oparte na danych. Projekt został stworzony w ramach hackathonu przez zespół FigoFagoFego z Gliwic.

---

## Funkcje

### Technika Pomodoro

Cykl pracy oparty na sesjach koncentracji i krótkich przerwach. Automatyczne ustawianie bloków i przypomnienia.

### Codzienne check-iny

Krótkie pytania oceniające nastrój, poziom stresu i samopoczucie.

### Analiza tekstu

Za zgodą użytkownika treści są analizowane z wykorzystaniem OpenAI API, aby dostarczyć lepszych wskazówek.

### Heatmapa nastroju

Wizualizacja zmian nastroju w czasie na podstawie dziennych ocen.

### Zabezpieczona rejestracja

Integracja z Google reCAPTCHA. Hosting na SeoHost.

---

## Technologie

* React
* TypeScript
* OpenAI API
* HeroUI
* MariaDB

---

## Instalacja

```
git clone https://github.com/<repo>/worksense.git
cd worksense
cd react
npm install
npm run dev

cd worksense
cd api
npm install
npm run dev
```

### Konfiguracja `api/.env`:

```
PORT=
MYSL_HOST=
MYSL_PORT=
MYSL_DATABASE=
MYSL_USER=
MYSL_PASSWORD=
OPENAI_API_KEY=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_TTL=
JWT_REFRESH_TTL=
BODY_LIMIT=
```

### aby rejestracja działała lokalnie trzeba usunąć wszystkie funkcje związane z reCAPTCHA
---

## Plan rozwoju

* Integracja z aplikacją mobilną i smartwatchami
* Monitorowanie stresu i aktywności
* Rozszerzone przypomnienia
* Moduł psychoedukacyjny i własne artykuły
* Współpraca ze specjalistami w formie mini-warsztatów

---

## Zespół

FigoFagoFego – zespół uczniów technikum informatycznego z Gliwic pracujących nad praktycznymi projektami wspierającymi zdrowie psychiczne i organizację pracy.

---

## Licencja

Projekt objęty licencją EULA dołączoną do repozytorium.


