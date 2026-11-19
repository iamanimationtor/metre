/**
 * Architectural layout model — derives a parametric floor plan per residential
 * unit from its average net area, producing room-level quantities used by the
 * takeoff engine: partition lengths, wet areas, paint surfaces and the exact
 * count of electrical points & plumbing fixtures per Iranian norms.
 */

export interface RoomDef {
  key: string;
  label: string;
  /** Net floor area in m². */
  area: number;
  /** True for tile-finished wet rooms. */
  wet?: boolean;
}

export interface UnitLayout {
  rooms: RoomDef[];
  bedrooms: number;
  bathrooms: number;
  netArea: number;
  /** Interior partition length (single-wall meters) for this unit. */
  partitionLength: number;
  /** Wet floor area for waterproofing (m²). */
  wetFloorArea: number;
  /** Wall+floor tile area for wet rooms (m²). */
  tileArea: number;
  // MEP counts
  outlets: number;
  switches: number;
  lightPoints: number;
  dataPoints: number;
  faucets: number; // ست شیرآلات
  wcs: number;
  showers: number;
  kitchenSinks: number;
  washerHooks: number;
  /** Heating load in kcal/h (130 per m² — region-agnostic conservative value). */
  heatLoad: number;
  radiatorSections: number;
  cabinetRuns: number;
  interiorDoors: number;
}

const r1 = (n: number) => Math.round(n * 10) / 10;
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

export function designUnit(netAreaRaw: number): UnitLayout {
  const netArea = clamp(netAreaRaw, 45, 320);

  const bedrooms =
    netArea < 70 ? 1 : netArea < 100 ? 2 : netArea < 140 ? 3 : netArea < 195 ? 4 : 5;
  const bathrooms = bedrooms <= 2 ? 1 : 2;
  const hasGuestWc = netArea >= 95;

  const living = r1(netArea * (bedrooms >= 4 ? 0.36 : 0.4));
  const kitchen = r1(clamp(netArea * 0.11, 7, 18));
  const master = r1(clamp(netArea * 0.14, 11, 20));
  const otherBeds = bedrooms - 1;
  const otherBedArea = r1(clamp(netArea * (otherBeds > 1 ? 0.1 : 0.12), 9, 15)) ;
  const bathTotal = bathrooms * 5 + (hasGuestWc ? 2.5 : 0);
  const hallEntry = r1(Math.max(4, netArea * 0.06));

  const rooms: RoomDef[] = [
    { key: "living", label: "پذیرایی و نشیمن", area: living },
    { key: "kitchen", label: "آشپزخانه", area: kitchen, wet: true },
    { key: "master", label: "اتاق خواب مستر", area: master },
  ];
  if (otherBeds === 1) rooms.push({ key: "bed2", label: "اتاق خواب", area: otherBedArea });
  else for (let i = 0; i < otherBeds; i++) rooms.push({ key: `bed${i + 2}`, label: `اتاق خواب ${i + 2}`, area: otherBedArea });
  rooms.push({ key: "bath", label: "حمام و سرویس بهداشتی", area: r1(bathTotal), wet: true });
  rooms.push({ key: "entry", label: "ورودی و راهرو", area: hallEntry });

  // Partition model: exterior-excluded internal walls scale with rooms & size
  const partitionLength = r1(4.2 * bedrooms + 0.11 * netArea + 4.5);

  const wetFloorArea = r1(bathTotal + kitchen);
  // Walls tiled ~1.8 m high perimeter of baths + kitchen backsplash
  const tileArea = r1(bathTotal * 3.4 + (hasGuestWc ? 6 : 0) + Math.min(kitchen * 0.55, 8));

  // Electrical points — Iranian habit-based standards
  const livingOutlets = living >= 24 ? 10 : 8; // پذیرایی + آنتن/دکور
  const outFinal = livingOutlets + 8 + bedrooms * 4 + 3; // پذیرایی + آشپزخانه + خواب‌ها + راهرو/کولر
  const switches = 2 + bedrooms * 2 + (hasGuestWc ? 1 : 0) + 2; // ورود، پذیرایی دوپل، اتاق‌ها
  const lightPoints = 3 + bedrooms * 1 + 2 + bathrooms + 2; // پذیرایی+نهارخوری، خواب، آشپزخانه+راهرو، سرویس‌ها، بالکن/انباری
  const dataPoints = 1 + bedrooms; // تلویزیون پذیرایی + اتاق‌ها

  const faucets = bathrooms * 2 + 2; // روشویی+حمام هر سرویس + سینک + ظرفشویی
  const wcs = bathrooms + (hasGuestWc ? 1 : 0);
  const showers = bathrooms;
  const kitchenSinks = 1;
  const washerHooks = 1;

  const heatLoad = Math.round(netArea * 130); // kcal/h
  const radiatorSections = Math.ceil((heatLoad * 1.1) / 135); // +10% ضریب اطمینان

  const cabinetRuns = r1(clamp(2.6 + netArea / 28, 3, 9));
  const interiorDoors = bedrooms + bathrooms + (hasGuestWc ? 1 : 0) + 1; // ورودی واحد جدا محاسبه می‌شود

  return {
    rooms,
    bedrooms,
    bathrooms: bathrooms + (hasGuestWc ? 1 : 0),
    netArea: r1(netArea),
    partitionLength,
    wetFloorArea,
    tileArea,
    outlets: outFinal,
    switches,
    lightPoints,
    dataPoints,
    faucets,
    wcs,
    showers,
    kitchenSinks,
    washerHooks,
    heatLoad,
    radiatorSections,
    cabinetRuns,
    interiorDoors,
  };
}
