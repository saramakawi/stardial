import { Body, GeoVector, Ecliptic } from 'astronomy-engine';

export type PlanetName =
  | 'Sun' | 'Moon' | 'Mercury' | 'Venus' | 'Mars'
  | 'Jupiter' | 'Saturn' | 'Uranus' | 'Neptune' | 'Pluto';

export interface PlanetPosition {
  name: PlanetName;
  longitude: number;   // ecliptic longitude 0–360°
  sign: string;        // which zodiac sign
  degreeInSign: number;// 0–30° within that sign
  symbol: string;      // glyph for the planet
}


const PLANET_BODIES: Record<PlanetName, Body> = {
  Sun: Body.Sun,
  Moon: Body.Moon,
  Mercury: Body.Mercury,
  Venus: Body.Venus,
  Mars: Body.Mars,
  Jupiter: Body.Jupiter,
  Saturn: Body.Saturn,
  Uranus: Body.Uranus,
  Neptune: Body.Neptune,
  Pluto: Body.Pluto,
};

const PLANET_SYMBOLS: Record<PlanetName, string> = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇',
};

export const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

export const ZODIAC_SYMBOLS = [
  '♈', '♉', '♊', '♋', '♌', '♍',
  '♎', '♏', '♐', '♑', '♒', '♓',
];

// Convert a 0–360° longitude into sign + degree-within-sign
function longitudeToSign(longitude: number) {
  const signIndex = Math.floor(longitude / 30) % 12;
  return {
    sign: ZODIAC_SIGNS[signIndex],
    signIndex,
    degreeInSign: longitude % 30,
  };
}

// THE CORE FUNCTION: compute all planet positions for a given date
export function getPlanetPositions(date: Date): PlanetPosition[] {
  return (Object.keys(PLANET_BODIES) as PlanetName[]).map((name) => {
    // Geocentric position vector (as seen from Earth), then convert to ecliptic
    const vector = GeoVector(PLANET_BODIES[name], date, true);
    const longitude = Ecliptic(vector).elon;   // ecliptic longitude in degrees, 0–360
    const { sign, signIndex, degreeInSign } = longitudeToSign(longitude);
    return { name, longitude, sign, signIndex, degreeInSign, symbol: PLANET_SYMBOLS[name] };
  });
}

export interface MoonPhase {
  phaseAngle: number;     // 0–360°
  illumination: number;   // 0–1 (fraction lit)
  name: string;
  symbol: string;
}

export function getMoonPhase(date: Date): MoonPhase {
  const positions = getPlanetPositions(date);
  const sun = positions.find((p) => p.name === 'Sun')!;
  const moon = positions.find((p) => p.name === 'Moon')!;

  // Phase angle = how far the Moon is "ahead" of the Sun, 0–360°
  const phaseAngle = (moon.longitude - sun.longitude + 360) % 360;

  // Illumination fraction from the phase angle
  const illumination = (1 - Math.cos((phaseAngle * Math.PI) / 180)) / 2;

  // Map the angle to the 8 traditional phases
  const phases = [
    { name: 'New Moon', symbol: '🌑' },
    { name: 'Waxing Crescent', symbol: '🌒' },
    { name: 'First Quarter', symbol: '🌓' },
    { name: 'Waxing Gibbous', symbol: '🌔' },
    { name: 'Full Moon', symbol: '🌕' },
    { name: 'Waning Gibbous', symbol: '🌖' },
    { name: 'Last Quarter', symbol: '🌗' },
    { name: 'Waning Crescent', symbol: '🌘' },
  ];
  const index = Math.floor(((phaseAngle + 22.5) % 360) / 45);
  const { name, symbol } = phases[index];

  return { phaseAngle, illumination, name, symbol };
}