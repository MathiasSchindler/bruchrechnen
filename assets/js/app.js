import modules from "./modules/index.js";
import {
  normalizeFraction,
  formatFractionForDisplay,
  randomChoice,
} from "./utils/fraction.js";
import {
  difficultyLevels,
  defaultDifficulty,
  adaptiveConfig,
  getDifficultySettings,
  shiftDifficulty,
  clampDifficulty,
} from "./config/difficulty.js";

const selectors = {
  modeSelect: document.querySelector("#exercise-mode"),
  startButton: document.querySelector("#start-session"),
  problemCard: document.querySelector(".problem-card"),
  problemTitle: document.querySelector("#exercise-title"),
  problemDescription: document.querySelector("#exercise-description"),
  problemStatement: document.querySelector("#problem-statement"),
  problemHint: document.querySelector("#problem-hint"),
  inputArea: document.querySelector("#input-area"),
  answerForm: document.querySelector("#answer-form"),
  submitButton: document.querySelector("#submit-answer"),
  skipButton: document.querySelector("#skip-problem"),
  feedback: document.querySelector("#feedback"),
  statTotal: document.querySelector("#stat-total"),
  statCorrect: document.querySelector("#stat-correct"),
  statAccuracy: document.querySelector("#stat-accuracy"),
  statStreak: document.querySelector("#stat-streak"),
  fractionTemplate: document.querySelector("#fraction-input-template"),
  mixedTemplate: document.querySelector("#mixed-fraction-input-template"),
  multiTemplate: document.querySelector("#multiple-choice-template"),
  clozeTemplate: document.querySelector("#cloze-template"),
  difficultySelect: document.querySelector("#difficulty-select"),
  difficultyLabel: document.querySelector("#difficulty-label"),
  badgeStrip: document.querySelector("#badge-strip"),
  badgeList: document.querySelector("#badge-list"),
};

const state = {
  mode: null,
  currentModule: null,
  currentProblem: null,
  total: 0,
  correct: 0,
  streak: 0,
  awaitingAnswer: false,
  nextTimeoutId: null,
  difficultyMode: "auto",
  difficultyLevel: defaultDifficulty,
  recentResults: [],
  tasksSinceAdjustment: 0,
  bestStreak: 0,
  badges: new Set(),
};

const AUTO_ADVANCE_DELAY = 1100;

const BADGE_DEFINITIONS = [
  {
    id: "streak-bronze",
    label: "Serie ×3",
    className: "badge-bronze",
    condition: (stats) => stats.bestStreak >= 3,
  },
  {
    id: "streak-silver",
    label: "Serie ×6",
    className: "badge-silver",
    condition: (stats) => stats.bestStreak >= 6,
  },
  {
    id: "streak-gold",
    label: "Serie ×10",
    className: "badge-gold",
    condition: (stats) => stats.bestStreak >= 10,
  },
  {
    id: "accuracy-star",
    label: "Trefferquote ≥ 85%",
    className: "badge-silver",
    condition: (stats) => stats.total >= 12 && stats.correct / stats.total >= 0.85,
  },
];

function setContent(element, content, isHtml = false) {
  if (!element) return;
  if (content == null) {
    element[isHtml ? "innerHTML" : "textContent"] = "";
    return;
  }
  if (isHtml) {
    element.innerHTML = content;
  } else {
    element.textContent = content;
  }
}

function cancelPendingAdvance() {
  if (state.nextTimeoutId) {
    clearTimeout(state.nextTimeoutId);
    state.nextTimeoutId = null;
  }
}

function parseFractionString(value) {
  if (typeof value !== "string") return null;
  if (!value.includes("/")) {
    const numerator = Number(value);
    if (Number.isNaN(numerator)) {
      return null;
    }
    return { numerator, denominator: 1 };
  }
  const [numPart, denPart] = value.split("/");
  const numerator = Number(numPart);
  const denominator = Number(denPart);
  if (Number.isNaN(numerator) || Number.isNaN(denominator) || denominator === 0) {
    return null;
  }
  return { numerator, denominator };
}

function populateDifficultySelect() {
  if (!selectors.difficultySelect) return;
  difficultyLevels.forEach((level) => {
    const option = document.createElement("option");
    option.value = level.id;
    option.textContent = level.label;
    selectors.difficultySelect.appendChild(option);
  });
  selectors.difficultySelect.value = "auto";
  updateDifficultyLabel();
  syncDifficultySelect();
}

function updateDifficultyLabel() {
  if (!selectors.difficultyLabel) return;
  const levelInfo = difficultyLevels.find((level) => level.id === state.difficultyLevel);
  const fallbackId = clampDifficulty(state.difficultyLevel);
  const fallbackInfo = difficultyLevels.find((level) => level.id === fallbackId);
  const labelText = (levelInfo || fallbackInfo)?.label || fallbackId;
  const modeSuffix = state.difficultyMode === "auto" ? " (Auto)" : " (Manuell)";
  setContent(selectors.difficultyLabel, `Aktuell: ${labelText}${modeSuffix}`);
}

function handleDifficultyChange(event) {
  const value = event.target.value;
  if (value === "auto") {
    state.difficultyMode = "auto";
    state.difficultyLevel = defaultDifficulty;
    state.recentResults = [];
    state.tasksSinceAdjustment = 0;
  } else {
    state.difficultyMode = "manual";
    state.difficultyLevel = clampDifficulty(value);
  }
  updateDifficultyLabel();
  syncDifficultySelect();
}

function syncDifficultySelect() {
  if (!selectors.difficultySelect) return;
  selectors.difficultySelect.value =
    state.difficultyMode === "auto" ? "auto" : state.difficultyLevel;
}

function updateBadgeDisplay() {
  if (!selectors.badgeList) return;
  selectors.badgeList.innerHTML = "";
  if (state.badges.size === 0) {
    const placeholder = document.createElement("span");
    placeholder.className = "badge";
    placeholder.textContent = "Noch keine Auszeichnungen";
    selectors.badgeList.appendChild(placeholder);
    return;
  }

  state.badges.forEach((badgeId) => {
    const def = BADGE_DEFINITIONS.find((badge) => badge.id === badgeId);
    if (!def) return;
    const badgeEl = document.createElement("span");
    badgeEl.className = `badge ${def.className}`;
    badgeEl.textContent = def.label;
    selectors.badgeList.appendChild(badgeEl);
  });
}

function evaluateBadges() {
  let updated = false;
  BADGE_DEFINITIONS.forEach((badge) => {
    if (badge.condition(state) && !state.badges.has(badge.id)) {
      state.badges.add(badge.id);
      updated = true;
    }
  });
  if (updated) {
    updateBadgeDisplay();
  }
}

function maybeAdjustDifficulty(wasCorrect) {
  if (state.difficultyMode !== "auto") {
    return;
  }
  state.recentResults.push(wasCorrect);
  if (state.recentResults.length > adaptiveConfig.windowSize) {
    state.recentResults.shift();
  }
  state.tasksSinceAdjustment += 1;

  if (
    state.recentResults.length < adaptiveConfig.windowSize ||
    state.tasksSinceAdjustment < adaptiveConfig.cooldownTasks
  ) {
    return;
  }

  const correctCount = state.recentResults.filter(Boolean).length;
  let nextLevel = state.difficultyLevel;
  if (correctCount >= adaptiveConfig.increaseThreshold) {
    nextLevel = shiftDifficulty(state.difficultyLevel, 1);
  } else if (correctCount <= adaptiveConfig.decreaseThreshold) {
    nextLevel = shiftDifficulty(state.difficultyLevel, -1);
  }

  if (nextLevel !== state.difficultyLevel) {
    state.difficultyLevel = nextLevel;
    state.tasksSinceAdjustment = 0;
    updateDifficultyLabel();
    syncDifficultySelect();
  }
}

function init() {
  populateModeSelect();
  populateDifficultySelect();
  selectors.modeSelect.addEventListener("change", handleModeChange);
  selectors.startButton.addEventListener("click", () => startSession());
  selectors.answerForm.addEventListener("submit", handleSubmit);
  selectors.skipButton.addEventListener("click", handleSkip);
  document.addEventListener("wheel", handleNumberInputScroll, { passive: false });
  selectors.difficultySelect?.addEventListener("change", handleDifficultyChange);
  updateBadgeDisplay();
  setDefaultMode();
}

function populateModeSelect() {
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Modus wählen";
  selectorAppend(defaultOption);

  modules.forEach((module) => {
    const option = document.createElement("option");
    option.value = module.id;
    option.textContent = module.name;
    option.dataset.description = module.description;
    selectorAppend(option);
  });

  const mixOption = document.createElement("option");
  mixOption.value = "mix";
  mixOption.textContent = "Mischmodus (alle Aufgaben)";
  mixOption.dataset.description =
    "Zufällige Mischung aus allen verfügbaren Aufgabentypen.";
  selectorAppend(mixOption);
}

function selectorAppend(option) {
  selectors.modeSelect.appendChild(option);
}

function setDefaultMode() {
  const defaultMode = "mix";
  selectors.modeSelect.value = defaultMode;
  startSession(defaultMode);
}

function handleModeChange(event) {
  const selectedMode = event.target.value;
  if (!selectedMode) {
    showFeedback("Bitte wähle einen Aufgabenmodus.", "error");
    return;
  }
  startSession(selectedMode);
}

function startSession(selectedMode = selectors.modeSelect.value) {
  if (!selectedMode) {
    showFeedback("Bitte wähle zuerst einen Aufgabenmodus.", "error");
    selectors.modeSelect.focus();
    return;
  }

  selectors.modeSelect.value = selectedMode;
  state.mode = selectedMode;
  if (state.difficultyMode === "auto") {
    state.difficultyLevel = defaultDifficulty;
    state.recentResults = [];
    state.tasksSinceAdjustment = 0;
  }
  updateDifficultyLabel();
  syncDifficultySelect();
  resetStats();
  updateStats();
  cancelPendingAdvance();
  selectors.problemCard.classList.remove("success-flash");
  selectors.problemCard.dataset.state = "active";
  selectors.submitButton.disabled = false;
  selectors.skipButton.disabled = false;
  selectors.submitButton.textContent = "Antwort prüfen";
  selectors.skipButton.textContent = "Aufgabe überspringen";
  setContent(selectors.feedback, "");
  selectors.feedback.className = "feedback";
  const hintBody = selectors.problemHint?.querySelector(".hint-body");
  if (hintBody) {
    setContent(hintBody, "", true);
  }
  if (selectors.problemHint) {
    selectors.problemHint.hidden = true;
    selectors.problemHint.open = false;
  }
  loadNextProblem();
}

function resetStats() {
  state.total = 0;
  state.correct = 0;
  state.streak = 0;
  state.bestStreak = 0;
  state.badges = new Set();
  state.recentResults = [];
  state.tasksSinceAdjustment = 0;
  updateBadgeDisplay();
}

function loadNextProblem() {
  cancelPendingAdvance();
  selectors.problemCard.classList.remove("success-flash");
  state.awaitingAnswer = true;
  selectors.answerForm.reset();
  setContent(selectors.feedback, "");
  selectors.feedback.className = "feedback";

  const module = pickModuleForSession();
  const difficultySettings = getDifficultySettings(module.id, state.difficultyLevel);
  const problem = module.generateProblem({
    difficulty: state.difficultyLevel,
    settings: difficultySettings,
    mode: state.difficultyMode,
  });

  state.currentModule = module;
  state.currentProblem = {
    ...problem,
    assignedDifficulty: state.difficultyLevel,
  };

  selectors.problemTitle.textContent = module.name;
  selectors.problemDescription.textContent = module.description;
  setContent(
    selectors.problemStatement,
    problem.prompt,
    Boolean(problem.promptIsHtml)
  );

  if (problem.hint) {
    const summary = selectors.problemHint.querySelector("summary");
    const body = selectors.problemHint.querySelector(".hint-body");
    setContent(body, problem.hint, Boolean(problem.hintIsHtml));
    summary.textContent = problem.hintTitle || "Tipp anzeigen";
    selectors.problemHint.hidden = false;
    selectors.problemHint.open = false;
  } else {
    const body = selectors.problemHint.querySelector(".hint-body");
    if (body) {
      setContent(body, "", true);
    }
    selectors.problemHint.hidden = true;
  }

  renderInput(problem.input);
  selectors.submitButton.textContent = "Antwort prüfen";
  selectors.submitButton.disabled = problem.input.type === "multiple-choice";
  selectors.skipButton.disabled = false;

  if (problem.input.type === "multiple-choice") {
    selectors.inputArea.addEventListener(
      "change",
      () => {
        const hasSelection = selectors.inputArea.querySelector(
          "input[type='radio']:checked"
        );
        selectors.submitButton.disabled = !hasSelection;
      },
      { once: true }
    );
  }

  const focusable = selectors.inputArea.querySelector("input, button");
  focusable?.focus();
}

function pickModuleForSession() {
  if (state.mode === "mix") {
    return randomChoice(modules);
  }
  const module = modules.find((mod) => mod.id === state.mode);
  if (!module) {
    console.warn(`Modus ${state.mode} nicht gefunden, verwende Fallback.`);
    return modules[0];
  }
  return module;
}

function renderInput(input) {
  selectors.inputArea.innerHTML = "";

  switch (input.type) {
    case "fraction":
      renderFractionInput(input);
      break;
    case "mixed-fraction":
      renderMixedFractionInput(input);
      break;
    case "multiple-choice":
      renderMultipleChoice(input);
      break;
    case "cloze":
      renderClozeInput(input);
      break;
    default:
      console.warn("Unbekannter Eingabetyp", input.type);
  }
}

function renderFractionInput({ label }) {
  const fragment = selectors.fractionTemplate.content.cloneNode(true);
  if (label) {
    fragment.querySelector("fieldset").setAttribute("aria-label", label);
  }
  selectors.inputArea.appendChild(fragment);
}

function renderMixedFractionInput({ label }) {
  const fragment = selectors.mixedTemplate.content.cloneNode(true);
  if (label) {
    fragment.querySelector("fieldset").setAttribute("aria-label", label);
  }
  const wrapper = fragment.querySelector(".fraction-wrapper");
  const fractionFragment = selectors.fractionTemplate.content.cloneNode(true);
  wrapper.appendChild(fractionFragment);
  selectors.inputArea.appendChild(fragment);
}

function renderMultipleChoice({ options }) {
  const fragment = selectors.multiTemplate.content.cloneNode(true);
  const fieldset = fragment.querySelector("fieldset");

  options.forEach((option, index) => {
    const label = document.createElement("label");
    const input = document.createElement("input");
    input.type = "radio";
    input.name = "multiple-choice";
    input.value = option.value;
    input.id = option.id || `${state.currentProblem.id}-opt-${index}`;

    const text = document.createElement("span");
    text.innerHTML = option.label;
    if (option.labelText) {
      input.setAttribute("aria-label", option.labelText);
    }

    label.appendChild(input);
    label.appendChild(text);
    fieldset.appendChild(label);

    input.addEventListener("change", () => {
      selectors.submitButton.disabled = false;
    });
  });

  selectors.inputArea.appendChild(fragment);
}

function renderClozeInput({ template = [], gaps = [] }) {
  const fragment = selectors.clozeTemplate.content.cloneNode(true);
  const row = fragment.querySelector(".cloze-row");
  const gapMap = new Map(gaps.map((gap) => [gap.id, gap]));

  template.forEach((segment) => {
    switch (segment.type) {
      case "text": {
        const span = document.createElement("span");
        span.className = "cloze-text";
        span.textContent = segment.content ?? "";
        row.appendChild(span);
        break;
      }
      case "fraction": {
        const span = document.createElement("span");
        span.className = "cloze-text";
        const display = formatFractionForDisplay(segment.value, {
          normalize: segment.normalize !== false,
        });
        span.innerHTML = display.html;
        row.appendChild(span);
        break;
      }
      case "gap": {
        const gap = gapMap.get(segment.id);
        if (!gap) {
          console.warn("Gap definition fehlt", segment.id);
          return;
        }
        const blank = document.createElement("div");
        blank.className = "cloze-blank";
        blank.dataset.gapId = gap.id;

        if (gap.label) {
          const labelEl = document.createElement("label");
          labelEl.className = "cloze-blank-label";
          labelEl.textContent = gap.label;
          blank.appendChild(labelEl);
        }

        if (gap.kind === "number") {
          const input = document.createElement("input");
          input.type = "number";
          input.name = gap.id;
          input.id = `gap-${gap.id}`;
          input.required = true;
          input.step = gap.step ?? 1;
          if (gap.allowNegative === false) {
            input.min = gap.min ?? "0";
          } else if (typeof gap.min !== "undefined") {
            input.min = String(gap.min);
          }
          if (typeof gap.max !== "undefined") {
            input.max = String(gap.max);
          }
          if (gap.placeholder) {
            input.placeholder = gap.placeholder;
          }
          blank.appendChild(input);
        } else if (gap.kind === "fraction") {
          const fractionFragment = selectors.fractionTemplate.content.cloneNode(true);
          const fieldset = fractionFragment.querySelector("fieldset");
          fieldset.setAttribute("aria-label", gap.label || "Bruch einsetzen");
          const numeratorInput = fieldset.querySelector("input[name='numerator']");
          const denominatorInput = fieldset.querySelector("input[name='denominator']");
          numeratorInput.name = `${gap.id}__numerator`;
          numeratorInput.id = `gap-${gap.id}-num`;
          numeratorInput.required = true;
          if (gap.allowNegative === false) {
            numeratorInput.min = "0";
          } else if (typeof gap.minNumerator !== "undefined") {
            numeratorInput.min = String(gap.minNumerator);
          }
          if (typeof gap.maxNumerator !== "undefined") {
            numeratorInput.max = String(gap.maxNumerator);
          }
          if (gap.placeholderNumerator) {
            numeratorInput.placeholder = gap.placeholderNumerator;
          }
          denominatorInput.name = `${gap.id}__denominator`;
          denominatorInput.id = `gap-${gap.id}-den`;
          denominatorInput.required = true;
          denominatorInput.min = gap.minDenominator || "1";
          if (typeof gap.maxDenominator !== "undefined") {
            denominatorInput.max = String(gap.maxDenominator);
          }
          if (gap.placeholderDenominator) {
            denominatorInput.placeholder = gap.placeholderDenominator;
          }
          blank.appendChild(fieldset);
        } else if (gap.kind === "multiple-choice") {
          const fieldset = document.createElement("fieldset");
          fieldset.className = "multiple-choice";
          fieldset.setAttribute("aria-label", gap.label || "Antwort auswählen");
          gap.options.forEach((option, index) => {
            const optionLabel = document.createElement("label");
            const optionInput = document.createElement("input");
            optionInput.type = "radio";
            optionInput.name = gap.id;
            optionInput.value = option.value;
            optionInput.id = `${gap.id}-option-${index}`;
            const optionText = document.createElement("span");
            optionText.innerHTML = option.label;
            optionLabel.appendChild(optionInput);
            optionLabel.appendChild(optionText);
            fieldset.appendChild(optionLabel);
          });
          blank.appendChild(fieldset);
        }

        row.appendChild(blank);
        break;
      }
      default:
        console.warn("Unbekanntes Segment im Lückentext", segment);
    }
  });

  selectors.inputArea.appendChild(fragment);
}

function handleSubmit(event) {
  event.preventDefault();
  if (!state.awaitingAnswer) {
    loadNextProblem();
    return;
  }

  const userAnswer = readUserAnswer(state.currentProblem.input.type);
  if (!userAnswer) {
    showFeedback("Bitte gib eine gültige Antwort ein.", "error");
    return;
  }

  const result = evaluateAnswer(userAnswer, state.currentProblem.solution);
  cancelPendingAdvance();
  state.total += 1;
  if (result.correct) {
    state.correct += 1;
    state.streak += 1;
    state.bestStreak = Math.max(state.bestStreak, state.streak);
    showFeedback(result.message, "success", result.isHtml);
    selectors.skipButton.disabled = true;
    selectors.submitButton.disabled = true;
    selectors.submitButton.textContent = "Antwort prüfen";
    selectors.problemCard.classList.remove("success-flash");
    void selectors.problemCard.offsetWidth;
    selectors.problemCard.classList.add("success-flash");
    state.awaitingAnswer = false;
    cancelPendingAdvance();
    state.nextTimeoutId = setTimeout(() => {
      selectors.problemCard.classList.remove("success-flash");
      loadNextProblem();
    }, AUTO_ADVANCE_DELAY);
  } else {
    state.streak = 0;
    showFeedback(result.message, "error", result.isHtml);
    selectors.submitButton.textContent = "Neue Aufgabe";
    selectors.skipButton.disabled = true;
    selectors.submitButton.disabled = false;
    state.awaitingAnswer = false;
  }
  maybeAdjustDifficulty(result.correct);
  updateStats();
  evaluateBadges();
}

function handleSkip() {
  cancelPendingAdvance();
  loadNextProblem();
}

function readUserAnswer(type) {
  switch (type) {
    case "fraction": {
      const numeratorInput = selectors.inputArea.querySelector(
        "input[name='numerator']"
      );
      const denominatorInput = selectors.inputArea.querySelector(
        "input[name='denominator']"
      );
      if (!numeratorInput || !denominatorInput) {
        return null;
      }
      const numerator = Number(numeratorInput.value);
      const denominator = Number(denominatorInput.value);
      if (Number.isNaN(numerator) || Number.isNaN(denominator) || denominator === 0) {
        return null;
      }
      return normalizeFraction({ numerator, denominator });
    }
    case "mixed-fraction": {
      const wholeInput = selectors.inputArea.querySelector("input[name='whole']");
      const numeratorInput = selectors.inputArea.querySelector(
        "input[name='numerator']"
      );
      const denominatorInput = selectors.inputArea.querySelector(
        "input[name='denominator']"
      );
      if (!wholeInput || !numeratorInput || !denominatorInput) {
        return null;
      }
      const whole = Number(wholeInput.value);
      const numerator = Number(numeratorInput.value);
      const denominator = Number(denominatorInput.value);
      if (
        Number.isNaN(whole) ||
        Number.isNaN(numerator) ||
        Number.isNaN(denominator) ||
        denominator === 0
      ) {
        return null;
      }
      const improper = whole * denominator + numerator;
      return normalizeFraction({ numerator: improper, denominator });
    }
    case "multiple-choice": {
      const selected = selectors.inputArea.querySelector(
        "input[name='multiple-choice']:checked"
      );
      if (!selected) {
        return null;
      }
      return selected.value;
    }
    case "cloze": {
      const gaps = state.currentProblem.input?.gaps ?? [];
      const answers = {};
      for (const gap of gaps) {
        if (gap.kind === "number") {
          const field = selectors.inputArea.querySelector(
            `input[name='${gap.id}']`
          );
          if (!field) {
            return null;
          }
          const value = Number(field.value);
          if (Number.isNaN(value)) {
            return null;
          }
          answers[gap.id] = value;
        } else if (gap.kind === "fraction") {
          const numeratorField = selectors.inputArea.querySelector(
            `input[name='${gap.id}__numerator']`
          );
          const denominatorField = selectors.inputArea.querySelector(
            `input[name='${gap.id}__denominator']`
          );
          if (!numeratorField || !denominatorField) {
            return null;
          }
          const numerator = Number(numeratorField.value);
          const denominator = Number(denominatorField.value);
          if (
            Number.isNaN(numerator) ||
            Number.isNaN(denominator) ||
            denominator === 0
          ) {
            return null;
          }
          answers[gap.id] = normalizeFraction({ numerator, denominator });
        } else if (gap.kind === "multiple-choice") {
          const selection = selectors.inputArea.querySelector(
            `input[name='${gap.id}']:checked`
          );
          if (!selection) {
            return null;
          }
          answers[gap.id] = selection.value;
        }
      }
      return { type: "cloze", answers };
    }
    default:
      return null;
  }
}

function evaluateAnswer(userAnswer, solution) {
  const explanation = state.currentProblem.explanation;
  const explanationIsHtml = Boolean(state.currentProblem.explanationIsHtml);
  const solutionDisplayHtml = state.currentProblem.solutionDisplayHtml;

  if (solution?.type === "cloze") {
    if (!userAnswer || userAnswer.type !== "cloze") {
      return {
        correct: false,
        message: "Bitte fülle alle Lücken aus.",
        isHtml: false,
      };
    }

    const gaps = state.currentProblem.input?.gaps ?? [];
    const answers = solution.answers || {};
    const incorrect = [];

    Object.entries(answers).forEach(([gapId, expected], index) => {
      const actual = userAnswer.answers?.[gapId];
      const gapDefinition = gaps.find((gap) => gap.id === gapId);
      const gapLabel = gapDefinition?.label || `Lücke ${index + 1}`;
      let isCorrect = false;
      let expectedDisplay = "";

      if (expected.kind === "fraction") {
        const expectedNormalized = normalizeFraction(expected.value);
        expectedDisplay = formatFractionForDisplay(expectedNormalized).html;
        if (actual && actual.numerator !== undefined && actual.denominator !== undefined) {
          const actualNormalized = normalizeFraction(actual);
          isCorrect =
            actualNormalized.numerator === expectedNormalized.numerator &&
            actualNormalized.denominator === expectedNormalized.denominator;
        }
      } else if (expected.kind === "number") {
        expectedDisplay = `${expected.value}`;
        if (typeof actual === "number") {
          isCorrect = Number(actual) === Number(expected.value);
        }
      } else {
        expectedDisplay = expected.display ?? `${expected.value}`;
        isCorrect = actual === expected.value;
      }

      if (!isCorrect) {
        incorrect.push({ gapLabel, expectedDisplay });
      }
    });

    const correct = incorrect.length === 0;
    const correctionHtml = incorrect
      .map((item) => `<strong>${item.gapLabel}:</strong> ${item.expectedDisplay}`)
      .join("<br>");
    let message = correct
      ? "Richtig! Sehr gut gemacht."
      : `Leider falsch. So wäre es richtig:<br>${correctionHtml}`;
    if (explanation) {
      message += explanationIsHtml ? ` ${explanation}` : ` ${explanation}`;
    }
    const messageIsHtml = !correct || explanationIsHtml;
    return { correct, message, isHtml: messageIsHtml };
  }

  if (typeof solution === "string" || solution?.type === "multiple-choice") {
    const target = typeof solution === "string" ? solution : solution.value;
    const correct = userAnswer === target;
    let displayHtml = solutionDisplayHtml ?? target;
    if (!solutionDisplayHtml) {
      const parsed = parseFractionString(target);
      if (parsed) {
        displayHtml = formatFractionForDisplay(parsed).html;
      }
    }
    let message = correct
      ? "Richtig! Sehr gut gemacht."
      : `Leider falsch. Richtig wäre ${displayHtml}.`;
    if (explanation) {
      message += explanationIsHtml ? ` ${explanation}` : ` ${explanation}`;
    }
    const isHtml = !correct || explanationIsHtml || displayHtml !== target;
    return { correct, message, isHtml };
  }

  const normalizedSolution = normalizeFraction(solution);
  const correct =
    userAnswer.numerator === normalizedSolution.numerator &&
    userAnswer.denominator === normalizedSolution.denominator;
  const solutionDisplay = solutionDisplayHtml
    ? solutionDisplayHtml
    : formatFractionForDisplay(normalizedSolution).html;
  let message = correct
    ? "Richtig! Sehr gut gemacht."
    : `Leider falsch. Die richtige Lösung lautet ${solutionDisplay}.`;
  if (explanation) {
    message += explanationIsHtml ? ` ${explanation}` : ` ${explanation}`;
  }

  return { correct, message, isHtml: !correct || explanationIsHtml || Boolean(solutionDisplayHtml) };
}

function showFeedback(message, variant = "info", isHtml = false) {
  setContent(selectors.feedback, message, isHtml);
  selectors.feedback.className = `feedback ${variant}`;
}

function updateStats() {
  selectors.statTotal.textContent = state.total;
  selectors.statCorrect.textContent = state.correct;
  const accuracy = state.total === 0 ? 0 : Math.round((state.correct / state.total) * 100);
  selectors.statAccuracy.textContent = `${accuracy}%`;
  selectors.statStreak.textContent = state.streak;
}

function handleNumberInputScroll(event) {
  const target = event.target;
  if (!(target instanceof HTMLInputElement) || target.type !== "number") {
    return;
  }

  if (!selectors.problemCard.contains(target)) {
    return;
  }

  event.preventDefault();

  if (document.activeElement !== target) {
    target.focus();
  }

  const parsedStep = parseFloat(target.step);
  const step = Number.isFinite(parsedStep) && parsedStep > 0 ? parsedStep : 1;
  const parsedCurrent = target.value === "" ? NaN : Number(target.value);
  const baseValue = Number.isFinite(parsedCurrent) ? parsedCurrent : 0;
  const direction = event.deltaY < 0 ? 1 : -1;

  let nextValue = baseValue + step * direction;

  if (target.name === "denominator" && nextValue <= 0) {
    nextValue = 1;
  }

  const minValue = target.min === "" ? null : Number(target.min);
  if (Number.isFinite(minValue)) {
    nextValue = Math.max(nextValue, minValue);
  }

  const maxValue = target.max === "" ? null : Number(target.max);
  if (Number.isFinite(maxValue)) {
    nextValue = Math.min(nextValue, maxValue);
  }

  target.value = String(nextValue);
  target.dispatchEvent(new Event("input", { bubbles: true }));
}

init();
