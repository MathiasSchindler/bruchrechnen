# Bruchtrainer

Eine kleine, modulare HTML-/JavaScript-Anwendung zum Üben von Brüchen für Kinder. Enthält Aufgaben zum Umwandeln, Kürzen, Erweitern sowie Rechnen mit Brüchen. Die Oberfläche ist bewusst leichtgewichtig gehalten und lässt sich einfach um neue Aufgabentypen erweitern.

## Features

- 💡 **Sechs Aufgabenmodule**: Gemischte in unechte Brüche, unechte in gemischte Brüche, Kürzen, Erweitern, Vergleichen sowie Addieren/Subtrahieren/Multiplizieren.
- 🎯 **Mischmodus**: Kombiniert alle Module für abwechslungsreiche Übungsreihen.
- 🔁 **Unendliche Aufgaben**: Jede Aufgabenstellung wird zufällig generiert.
- 🧠 **Sofortiges Feedback**: Zeigt richtige Lösung, Hinweise und springt nach einem kurzen Erfolgssignal automatisch weiter.
- 🧮 **Lesbare Darstellung**: Alle Brüche werden typografisch korrekt mit Zähler, Bruchstrich und Nenner dargestellt.
- 📊 **Statistiken**: Überblick über gelöste Aufgaben, Trefferquote und aktuelle Serie.
- 🚀 **Direkter Einstieg**: Der Mischmodus startet automatisch; Moduswechsel sind jederzeit möglich.
- 🧱 **Modularer Aufbau**: Neue Module lassen sich per Plug-and-Play ergänzen.

## Projektstruktur

```
mathe/
├── index.html             # Einstiegspunkt mit Templates und App-Layout
├── assets/
│   ├── css/
│   │   └── styles.css     # Zentrales Stylesheet
│   └── js/
│       ├── app.js         # App-Logik, UI-Steuerung und State-Handling
│       ├── modules/
│       │   ├── arithmetic.js
│       │   ├── expandFraction.js
│       │   ├── compareFractions.js
│       │   ├── mixedToImproper.js
│       │   ├── improperToMixed.js
│       │   ├── simplifyFraction.js
│       │   └── index.js   # Registry aller Module
│       └── utils/
│           └── fraction.js # Mathematische Helferfunktionen
└── README.md
```

## Nutzung

1. Starte lokal z. B. mit `python3 -m http.server` oder öffne die Datei `index.html` direkt im Browser.
2. Die Übungen beginnen automatisch im Mischmodus. Wähle bei Bedarf einen anderen Modus oder klicke auf **„Los geht's“**, um neu zu beginnen.
3. Beantworte die Aufgaben; richtige Lösungen führen nach einem kurzen Erfolgssignal automatisch zur nächsten Runde.

Für ein lokales Setup mit automatischem Reload kannst du einen beliebigen statischen Webserver verwenden, z. B. mit Node.js:

```bash
npx serve .
```

## Ein neues Modul hinzufügen

1. Lege eine neue Datei in `assets/js/modules/` an, z. B. `divideFractions.js`.
2. Exportiere ein Objekt mit den Eigenschaften `id`, `name`, `description` und einer Methode `generateProblem()`.
3. `generateProblem()` sollte ein Objekt im Format zurückgeben:

```js
{
  id: "eindeutige-id",
  prompt: "Aufgabenstellung als Text", // optional: promptIsHtml = true
  input: { type: "fraction" | "mixed-fraction" | "multiple-choice", ... },
  solution: { numerator, denominator } | { type: "multiple-choice", value: "..." },
  solutionDisplayHtml: "<span class='fraction-display'>…</span>",
  explanation: "Kurzer Hinweis auf den Rechenweg", // optional: explanationIsHtml = true
  hint: "Tipp zur Strategie", // optional: hintIsHtml = true
}
```

4. Trage das Modul in `assets/js/modules/index.js` in das Array ein.
5. Optional: Passe Styles oder Templates an, falls dein Eingabetyp weitere UI-Elemente benötigt.

## Anpassungen & Tipps

- Die Zufallsgeneratoren befinden sich in `assets/js/utils/fraction.js`. Passe dort gewünschte Wertebereiche an.
- Für gemischte Antworten steht bereits ein Template zur Verfügung (`mixed-fraction`).
- Die CSS-Variablen am Anfang von `styles.css` erleichtern spätere Farb- oder Typografie-Anpassungen.

Viel Spaß beim Üben! 🎉
