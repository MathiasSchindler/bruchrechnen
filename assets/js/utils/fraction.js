export function gcd(a, b) {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    [x, y] = [y, x % y];
  }
  return x === 0 ? 1 : x;
}

export function lcm(a, b) {
  return Math.abs(a * b) / gcd(a, b);
}

export function simplifyFraction(fraction) {
  const { numerator, denominator } = fraction;
  const divisor = gcd(numerator, denominator);
  return {
    numerator: numerator / divisor,
    denominator: denominator / divisor,
  };
}

export function normalizeFraction({ numerator, denominator }) {
  const sign = denominator < 0 ? -1 : 1;
  return simplifyFraction({
    numerator: numerator * sign,
    denominator: denominator * sign,
  });
}

export function toImproperFraction({ whole, numerator, denominator }) {
  const sign = whole < 0 ? -1 : 1;
  const totalNumerator = Math.abs(whole) * denominator + numerator;
  return normalizeFraction({
    numerator: totalNumerator * sign,
    denominator,
  });
}

export function toMixedFraction({ numerator, denominator }) {
  const normalized = normalizeFraction({ numerator, denominator });
  const whole = Math.trunc(normalized.numerator / normalized.denominator);
  const remainder = Math.abs(normalized.numerator % normalized.denominator);
  return {
    whole,
    numerator: remainder,
    denominator: normalized.denominator,
  };
}

export function fractionToString({ numerator, denominator }) {
  const normalized = normalizeFraction({ numerator, denominator });
  return normalized.denominator === 1
    ? `${normalized.numerator}`
    : `${normalized.numerator}/${normalized.denominator}`;
}

export function mixedFractionToString({ whole, numerator, denominator }) {
  if (numerator === 0) {
    return `${whole}`;
  }
  return `${whole} ${numerator}/${denominator}`;
}

export function formatFractionForDisplay(
  fraction,
  { size = "normal", normalize = true } = {}
) {
  const normalized = normalizeFraction(fraction);
  const displayFraction = normalize ? normalized : fraction;
  const text = displayFraction.denominator === 1
    ? `${displayFraction.numerator}`
    : `${displayFraction.numerator}/${displayFraction.denominator}`;
  const classes = ["fraction-display"];
  if (size === "small") {
    classes.push("small");
  }

  const html = displayFraction.denominator === 1
    ? `<span class="fraction-display whole">${displayFraction.numerator}</span>`
    : `<span class="${classes.join(" ")}"><span class="fraction-top">${displayFraction.numerator}</span><span class="fraction-bar" aria-hidden="true"></span><span class="fraction-bottom">${displayFraction.denominator}</span></span>`;

  return {
    text,
    html,
    fraction: normalized,
  };
}

export function mixedFractionToDisplay(mixed, { size = "normal" } = {}) {
  const { whole, numerator, denominator } = mixed;
  if (numerator === 0) {
    return {
      text: `${whole}`,
      html: `<span class="fraction-display whole">${whole}</span>`,
    };
  }

  const fractionDisplay = formatFractionForDisplay({ numerator, denominator }, { size });
  return {
    text: `${whole} ${fractionDisplay.text}`,
    html: `<span class="mixed-fraction">${whole}&nbsp;${fractionDisplay.html}</span>`,
  };
}

export function addFractions(a, b) {
  const denominator = lcm(a.denominator, b.denominator);
  const numerator =
    (a.numerator * (denominator / a.denominator)) +
    (b.numerator * (denominator / b.denominator));
  return normalizeFraction({ numerator, denominator });
}

export function subtractFractions(a, b) {
  return addFractions(a, { numerator: -b.numerator, denominator: b.denominator });
}

export function multiplyFractions(a, b) {
  return normalizeFraction({
    numerator: a.numerator * b.numerator,
    denominator: a.denominator * b.denominator,
  });
}

export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomChoice(items) {
  return items[Math.floor(Math.random() * items.length)];
}

export function generateReducibleFraction({
  maxWhole = 9,
  minDenominator = 2,
  maxDenominator = 12,
  factorRange = [2, 6],
} = {}) {
  const denominator = randomInt(minDenominator, maxDenominator);
  const numerator = randomInt(1, denominator - 1);
  const factor = randomInt(factorRange[0], factorRange[1]);
  return {
    numerator: numerator * factor,
    denominator: denominator * factor,
  };
}
