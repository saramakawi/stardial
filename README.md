## What is Stardial? ##

Stardial computes the real positions of the Sun, Moon, and planets for any date — past, present, or future — and renders them as an interactive astrological chart. Pick a date and the entire sky recomputes: where each body sits in the zodiac, which ones are retrograde, the angular relationships, aspects, between them, and the phase of the Moon. All computation runs client-side from astronomical algorithms — there is no API and no backend. This app is a testament to my love for mathematics, astronomy, and astrology.


## What does it do? ##

Today's Sky: a daily snapshot of the current Sun sign, Moon sign, and Moon phase (drawn as an SVG, showing the real illuminated fraction).

Interactive Date Picker: change the date and the wheel, positions, and aspects recompute instantly.

Live Zodiac Wheel: a custom SVG visualization placing all ten bodies at their true geocentric positions for any chosen date.

Aspects: detects and draws the major angular relationships between planets (conjunction, sextile, square, trine, opposition) directly across the wheel.

Retrograde Detection: flags planets in apparent retrograde motion.

Transit Timeline: charts how a selected body's ecliptic longitude changes over time.


## What's the math behind it? ##

Everything that's visualized is computed, so let's get into the math.

## Planetary Positions ## 

Positions come from astronomy-engine, which implements VSOP87-derived algorithms accurate to roughly one arcminute. For each body, Stardial computes a geocentric position vector (the body as seen from Earth) and converts it to ecliptic longitude, an angle from 0° to 360° around the plane of Earth's orbit.

NOTE: Astrological charts are Earth-centered by definition. Geocentric computations is the correct framing here.

## Mapping the sky to the Zodiac ##

The zodiac is the ecliptic circle divided into twelve equal 30° signs. So the bridge from astronomy to the chart is modular arithmetic:

  signIndex = Math.floor(longitude / 30) % 12   // which sign
  degreeInSign = longitude % 30                     // position within it

That's the whole translation. Everything visual derives from this one mapping.

## Placing planets on the wheel ##

Each body's ecliptic longitude is an angle, converted to an (x, y) point with trigonometry:

```
  angle = (-longitude - 90) × π/180          // negated for counterclockwise progression
  x = centerX + radius × cos(angle)
  y = centerY + radius × sin(angle)
```

The sign negation and 90° offset orient the wheel so the signs run counterclockwise in the traditional direction. The same routine places sign glyphs, planets, and aspect endpoints. One function is reused for any different radii.

## Aspects ##

An aspect is a meaningful angle between two planets. Stardial compares every unique pair (45 pairs for ten bodies), computes the smallest angular separation between them, and flags the pair when that separation falls within a tolerance ("orb") of a major aspect angle.

```
  Aspect         Degrees    Orb
  Conjunction    0°         8°
  Sextile        60°        4°
  Square         90°        6°
  Trine          120°       6°
  Opposition     180°       8°
```

Matched pairs are drawn as lines across the wheel, colored by family (harmonious vs. tense).

## Retrograde Detection ##

A planet is retrograde when, viewed from Earth, it appears to move backward through the zodiac. Stardial detects this with a finite difference: it computes each body's longitude at the chosen instant and one day later, normalizes the difference across the 0°/360° boundary, and flags the body as retrograde if its longitude decreased.

NOTE: The Sun and Moon are excluded because, from a geocentric perspective, they never appear to reverse.

## Moon Phase ##

The Moon's phase is a function of its angular separation from the Sun: 0° is a new moon, 180° is a full moon. From that phase angle, the illuminated fraction follows from (1 − cos(angle)) / 2, and the phase glyph is drawn as an SVG whose terminator curve reflects the illuminated shape.


## Architecture ##

Computation is fully separated from presentation. All astronomical logic lives in src/lib/astronomy.ts as pure functions (getPlanetPositions(date), getAspects(positions), getMoonPhase(date)) with no React or DOM dependencies. The React layer only renders the results. This means the math is independently testable and the UI is a shell over a computational core.

```
  src/
  ├── lib/
  │   └── astronomy.ts      # pure computation: positions, aspects, phases
  ├── components/
  │   ├── zodiac-wheel.tsx  # custom SVG chart
  │   ├── transit-timeline.tsx
  │   ├── todays-sky.tsx
  │   └── moon-glyph.tsx    # SVG moon phase
  └── App.tsx               # composition + state
```

Expensive recomputation is memoized with useMemo, keyed on the selected date — so changing unrelated state never recomputes the ephemeris.

## Tech Stack ##

React & TypeScript: typed throughout; the planet/aspect/house data models are explicit interfaces

Vite: build tooling and dev server

Tailwind CSS v4: styling

astronomy-engine: the astronomical computation library

Recharts: the transit timeline chart

Custom SVG: the zodiac wheel and moon-phase glyph are hand-built, not charted

No backend, no API keys, no external data calls — the entire app is static and computes everything in the browser.


## Running Locally ##

```
  git clone https://github.com/saramakawi/stardial.git
  cd stardial
  npm install
  npm run dev
```

Then open http://localhost:5173.

To build for production:

```
  npm run build
  npm run preview
```

## Design ##

Stardial is styled after antique celestial atlases, the hand-engraved star charts of the 17th and 18th centuries. Aged paper, sepia ink, fine concentric rules, and copperplate-style linework. The zodiac wheel is the centerpiece rendered as an engraving on the paper background.


## Notes on Scope ##

As of now, Stardial computes planetary positions with high accuracy. Astrological interpretation is not the goal of the project; the goal was to do the astronomy correctly and visualize it well. The framing leans on the technical aspects; the computation is ephemeris-grade math, and the chart reflects where the planets actually are.

A birth-chart house system (Ascendant, Midheaven, whole-sign houses) is planned as a future addition; it requires birth location and careful timezone handling, which are out of scope for the current build.