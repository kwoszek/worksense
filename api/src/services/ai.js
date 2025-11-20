const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * ŁĄCZONE WYWOŁANIE:
 * - pojedynczy checkin (energy, stress, description)
 * - historia ocen samopoczucia (moodScores[] – od najstarszej do najnowszej)
 *
 * Zwraca:
 * {
 *   moodScore: number;         // 1-10, na heat mapę
 *   message: string;           // 3-5 zdań wsparcia + rekomendacje "na już"
 *   progressSummary: string;   // 2-3 zdania o trendzie (bez rekomendacji działań)
 * }
 */
async function analyzeCheckinAndProgress({ energy, stress, description, moodScores }) {
  const prompt = buildCombinedPrompt({ energy, stress, description, moodScores });

  const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: prompt,
  });

  const text =
    (response.output &&
      response.output[0] &&
      response.output[0].content &&
      response.output[0].content[0] &&
      response.output[0].content[0].text) ||
    response.output_text ||
    "";

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    // bezpieczny fallback
    parsed = {
      moodScore: 5,
      message:
        "Dziękuję za Twój check-in. Niestety nie udało się przetworzyć odpowiedzi AI, ale pamiętaj, że Twoje samopoczucie jest ważne.",
      progressSummary:
        "Nie udało się odczytać podsumowania progresu, ale to, że regularnie monitorujesz swój nastrój, jest już dużym krokiem.",
    };
  }
  return parsed;
}


// SCALONY PROMPT: CHECKIN + PROGRES
function buildCombinedPrompt({ energy, stress, description, moodScores }) {
  // Proste odkażenie znaków nowej linii, aby nie psuć instrukcji
  const cleanDescription = (description || "").replace(/\r?\n+/g, " ").trim();
  const scores = Array.isArray(moodScores) ? moodScores : [];
  const scoresList = scores.join(", ");

  return `Jesteś systemem wspierającym dobrostan użytkownika. Otrzymasz dzisiejsze dane check-in oraz historię ocen nastroju.
Twoje ZADANIE: Wygeneruj WYŁĄCZNIE poprawny JSON (bez komentarzy, bez dodatkowego tekstu, bez backticków) w formacie:
{"moodScore": <liczba 1-10>, "message": "<3-5 zdań>", "progressSummary": "<2-3 zdania>"}

WYMAGANIA FORMATU:
- Output musi być pojedynczym obiektem JSON (brak tablicy, brak dodatkowych kluczy).
- moodScore: liczba całkowita z zakresu 1–10.
- message: 2-3 zdania, empatyczne, naturalne po polsku, w drugiej osobie ("Twoje", "Możesz"). Zawiera krótki odbiór dnia + 1–4 konkretnych mini rekomendacji (wplecionych w tekst, nie w bullet listę): np. krótka medytacja oddechowa, technika Pomodoro, spacer 5–10 min, rozciąganie, nawodnienie, rozmowa z zaufaną osobą, 3 głębokie oddechy (box breathing), krótki journaling. Zero diagnoz medycznych.
- progressSummary: 2–3 zdania o trendzie z moodScores (stabilizacja, poprawa, pogorszenie, wahania). Krótko, rzeczowo, bez powtarzania rekomendacji z message.
- Nie dodawaj żadnych ostrzeżeń prawnych ani dużych disclaimerów; możesz subtelnie wspomnieć, że to wsparcie, a nie terapia, tylko jeśli dane są bardzo trudne.
- Unikaj tonu "robotycznego" i jednocześnie nie udawaj osobistego terapeuty.
- Używaj prostego, zrozumiałego języka, unikaj żargonu psychologicznego.
- Zwróć uwagę na błędy gramatyczne i ortograficzne, twój output musi być poprawny językowo.

DANE DZISIEJSZE:
Energia (0-10): ${energy}
Stres (0-10): ${stress}
Opis dnia: "${cleanDescription}"

HISTORIA moodScores (najstarsze -> najnowsze): [${scoresList}]

LOGIKA OCENY moodScore (wytyczne – zastosuj zdrowy rozsądek zamiast surowego wzoru):
- Wyższa energia i niższy stres => wyższy wynik.
- Bardzo wysoki stres (>=8) obniża wynik (chyba że energia też wysoka i opis zawiera pozytywne aspekty – wtedy umiarkowany).
- Jeśli opis zawiera słowa typu "zmęcz", "przytł", "niepok", "stres", możesz obniżyć wynik o 1-2.
- Jeśli opis zawiera pozytywne elementy ("postęp", "spacer", "udało", "fajnie"), możesz podnieść o 1-2.
- Unikaj skrajności 1 lub 10 bez bardzo wyraźnych przesłanek.

ANALIZA PROGRESU (progressSummary):
Rozważ trend: porównaj średnią pierwszej połowy z drugą, ostatni wynik vs średnia globalna, wariancję (duże wahania vs stabilność). Użyj prostych słów: "lekka poprawa", "stabilnie", "fluktuacje", "spadek". Jeśli brak danych lub 0-1 element, napisz że potrzeba więcej wpisów.

ZABRONIONE:
- Żadnych '<script>' / HTML / markdown.
- Żadnych dodatkowych kluczy poza trzema wskazanymi.
- Żadnych wstępów, etykiet, nagłówków, cytatów – tylko czysty JSON.
- Nie powtarzaj surowych liczb energii/stresu w message (możesz je parafrazować: "niska energia", "wysoki stres").

OUTPUT: TYLKO JSON.
`;
}

module.exports = {
  analyzeCheckinAndProgress,
};