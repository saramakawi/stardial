// This module provides functions to compute planetary positions, moon phases, 
// and aspects for a given date using the astronomy-engine library.

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
  retrograde: boolean; // retrograde indicator
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
  '♈\uFE0E', '♉\uFE0E', '♊\uFE0E', '♋\uFE0E', '♌\uFE0E', '♍\uFE0E',
  '♎\uFE0E', '♏\uFE0E', '♐\uFE0E', '♑\uFE0E', '♒\uFE0E', '♓\uFE0E',
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
  // A point slightly later, to measure direction of motion
  const later = new Date(date.getTime() + 24 * 60 * 60 * 1000); // +1 day

  return (Object.keys(PLANET_BODIES) as PlanetName[]).map((name) => {
    const vector = GeoVector(PLANET_BODIES[name], date, true);
    const longitude = Ecliptic(vector).elon;

    // Longitude one day later, to detect direction
    const laterVector = GeoVector(PLANET_BODIES[name], later, true);
    const laterLongitude = Ecliptic(laterVector).elon;

    // Handle the 360→0 wrap: normalize the delta to -180..180
    let delta = laterLongitude - longitude;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    // Retrograde if moving backward. Sun and Moon never retrograde.
    const retrograde = delta < 0 && name !== 'Sun' && name !== 'Moon';

    const { sign, signIndex, degreeInSign } = longitudeToSign(longitude);
    return { name, longitude, sign, signIndex, degreeInSign, symbol: PLANET_SYMBOLS[name], retrograde };
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

export interface Aspect {
  planetA: PlanetName;
  planetB: PlanetName;
  type: string;        // 'Conjunction', 'Trine', etc.
  angle: number;       // the ideal angle (0, 60, 90, 120, 180)
  orb: number;         // how far from exact, in degrees
  symbol: string;
}

const ASPECT_TYPES = [
  { type: 'Conjunction', angle: 0,   symbol: '☌', orb: 8 },
  { type: 'Sextile',     angle: 60,  symbol: '⚹', orb: 4 },
  { type: 'Square',      angle: 90,  symbol: '□', orb: 6 },
  { type: 'Trine',       angle: 120, symbol: '△', orb: 6 },
  { type: 'Opposition',  angle: 180, symbol: '☍', orb: 8 },
];

// Smallest angle between two longitudes (0–180)
function angularDifference(a: number, b: number): number {
  const diff = Math.abs(a - b) % 360;
  return diff > 180 ? 360 - diff : diff;
}

export function getAspects(positions: PlanetPosition[]): Aspect[] {
  const aspects: Aspect[] = [];
  // Compare every unique pair of planets
  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      const sep = angularDifference(positions[i].longitude, positions[j].longitude);
      // Does this separation match any aspect within its orb?
      for (const asp of ASPECT_TYPES) {
        const orb = Math.abs(sep - asp.angle);
        if (orb <= asp.orb) {
          aspects.push({
            planetA: positions[i].name,
            planetB: positions[j].name,
            type: asp.type,
            angle: asp.angle,
            orb: Number(orb.toFixed(1)),
            symbol: asp.symbol,
          });
          break; // a pair matches at most one aspect
        }
      }
    }
  }
  return aspects;
}