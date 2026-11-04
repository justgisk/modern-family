// Single source of truth for every screen AND the asset checklist.
// Drop a file at the listed `src` path and the placeholder swaps to your art automatically.

export type Box = { x: number; y: number; w: number; h: number }; // percent of the card

export type LayerDef = {
  key: string;
  file: string; // e.g. layer-2-furniture.webp
  src: string; // public URL
  depth: number; // negative = far, positive = near. Drives parallax.
  transparent: boolean; // true = cutout PNG/WebP with alpha
  size: string;
  desc: string;
  ph: Box; // where the placeholder box sits
  tint: string;
  box?: Box; // exact placement for the real art (percent of the card); omit = full-bleed
  fit?: "cover" | "contain";
  alt?: string; // second pose: swaps with `src` while the pointer moves / finger drags (same feel as the street)
};

export type RoomDef = {
  id: string;
  name: string;
  caption: string;
  wall: string;
  floor: string;
  layers: LayerDef[];
  bubble?: { text: string; x: number; y: number; tx: number; ty: number }; // card percent: bubble centre, and the point its tail aims at
};

export type HouseDef = {
  id: string;
  name: string;
  family: string;
  blurb: string;
  accent: string;
  exterior: { src: string; size: string; desc: string };
  rooms: RoomDef[];
};

export type SharedAsset = {
  key: string;
  src: string;
  size: string;
  desc: string;
  transparent: boolean;
  optional?: boolean;
};

const ROOM_SIZE = "1200x1600";

type RoomCopy = { wall: string; furniture: string; character: string; foreground: string };

function room(
  house: string,
  id: string,
  name: string,
  caption: string,
  colors: [string, string],
  copy: RoomCopy,
  custom?: LayerDef[], // hand-placed layers (Figma) that replace the default five slots
  bubble?: RoomDef["bubble"],
): RoomDef {
  const base = `/assets/${house}/${id}`;
  const slots: Omit<LayerDef, "src" | "size">[] = [
    {
      key: "wall",
      file: "layer-0-wall.webp",
      depth: -60,
      transparent: false,
      desc: copy.wall,
      ph: { x: 0, y: 0, w: 100, h: 100 },
      tint: colors[0],
    },
    {
      key: "floor",
      file: "layer-1-floor.webp",
      depth: -30,
      transparent: true,
      desc: "Floor and rug only. Transparent above the floor line so the wall shows through.",
      ph: { x: 0, y: 64, w: 100, h: 36 },
      tint: colors[1],
    },
    {
      key: "furniture",
      file: "layer-2-furniture.webp",
      depth: 0,
      transparent: true,
      desc: copy.furniture,
      ph: { x: 8, y: 38, w: 84, h: 36 },
      tint: "#e9b872",
    },
    {
      key: "character",
      file: "layer-3-character.webp",
      depth: 35,
      transparent: true,
      desc: copy.character,
      ph: { x: 36, y: 28, w: 28, h: 50 },
      tint: "#7aa7d9",
    },
    {
      key: "foreground",
      file: "layer-4-foreground.webp",
      depth: 80,
      transparent: true,
      desc: copy.foreground,
      ph: { x: -2, y: 70, w: 36, h: 32 },
      tint: "#6fb27c",
    },
  ];
  return {
    id,
    name,
    caption,
    wall: colors[0],
    floor: colors[1],
    bubble,
    layers: custom ?? slots.map((s) => ({ ...s, src: `${base}/${s.file}`, size: ROOM_SIZE })),
  };
}

// Figma 82:710, a 354x500 card. Boxes are px converted to percent of that card.
const CW = 354;
const CH = 500;
// Furniture and people are shrunk toward this point so the room has more air around them.
const SCALE = 0.88;
const AX = CW / 2;
const AY = 400;
function fig(dir: string, key: string, file: string, depth: number, x: number, y: number, w: number, h: number, fit: "cover" | "contain", desc: string, shrink = true): LayerDef {
  if (shrink) {
    x = AX + (x - AX) * SCALE;
    y = AY + (y - AY) * SCALE;
    w *= SCALE;
    h *= SCALE;
  }
  const box = { x: (x / CW) * 100, y: (y / CH) * 100, w: (w / CW) * 100, h: (h / CH) * 100 };
  return { key, file, src: `/assets/dunphy/${dir}/${file}`, depth, transparent: true, size: "png", desc, ph: box, box, fit, tint: "#e9b872" };
}
function dunphyLivingRoom(): LayerDef[] {
  return [
    { ...fig("living-room", "wall", "wall.webp", -60, 0, 0.5, CW, CH, "cover", "Living room wall with staircase.", false), transparent: false, box: { x: 0, y: -2.27, w: 100, h: 118.05 } },
    fig("living-room", "furniture", "furniture.webp", 0, 17, 219, 320, 170, "contain", "Sofa, coffee table and rug."),
    fig("living-room", "character-2", "character-2.webp", 35, 63, 188, 125, 196, "cover", "Girl on the sofa."),
    fig("living-room", "character", "character-1.webp", 35, 169, 181, 129, 202, "contain", "Guitar player on the sofa."),
    fig("living-room", "foreground", "foreground.webp", 80, 51, 287, 253, 163, "contain", "Coffee table tray in the foreground."),
  ];
}

// Figma 88:828, same 354x500 card. Boxes are the exact Figma px, no shrink.
function pritchettLivingRoom(): LayerDef[] {
  const p = (key: string, file: string, depth: number, x: number, y: number, w: number, h: number, desc: string, extra?: Partial<LayerDef>): LayerDef => ({
    ...fig("living-room", key, file, depth, x, y, w, h, "contain", desc, false),
    src: `/assets/pritchett/living-room/${file}`,
    ...extra,
  });
  return [
    { ...p("wall", "wall.webp", -60, 0, 0.5, CW, CH, "Living room wall.", { fit: "cover" }), transparent: false },
    p("furniture", "furniture.webp", 0, 28, 204.5, 298, 151, "Brown leather loveseat with cushions."),
    p("character", "jay-1.webp", 35, 164, 159.5, 135, 205, "Jay reading Phil's-osophy.", { alt: "/assets/pritchett/living-room/jay-2.webp" }),
    p("foreground", "foreground.webp", 80, 51, 305.5, 251, 143, "Foreground props."),
  ];
}

// Figma 88:846, same 354x500 card, exact px, no shrink.
function pritchettKitchen(): LayerDef[] {
  const k = (key: string, file: string, depth: number, x: number, y: number, w: number, h: number, desc: string, fit: "cover" | "contain" = "contain"): LayerDef => ({
    ...fig("kitchen", key, file, depth, x, y, w, h, fit, desc, false),
    src: `/assets/pritchett/kitchen/${file}`,
  });
  return [
    { ...k("wall", "wall.webp", -60, 0, 0.5, CW, CH, "Kitchen wall.", "cover"), transparent: false },
    k("kitchen-zone", "kitchen-zone.webp", 0, 135, 93.5, 219, 251, "Kitchen zone: cabinets and counters."),
    k("dining-zone", "dining-zone.webp", 10, 0, -28.5, 206.65, 438.38, "Dining zone."),
    k("character", "character.webp", 35, 125.7, 196.5, 99.3, 152.11, "Person in the kitchen.", "cover"),
    k("foreground", "foreground.webp", 80, 168, 354.5, 154, 103, "Boy with toy mixer and bulldozer."),
  ];
}

// Figma 96:908, same 354x500 card, exact px, no shrink.
function tuckerLivingRoom(): LayerDef[] {
  const t = (key: string, file: string, depth: number, x: number, y: number, w: number, h: number, desc: string, extra?: Partial<LayerDef>): LayerDef => ({
    ...fig("living-room", key, file, depth, x, y, w, h, "cover", desc, false),
    src: `/assets/tucker-pritchett/living-room/${file}`,
    ...extra,
  });
  const wall = t("wall", "wall.webp", -60, 0, 0.5, CW, CH, "Living room wall.", { transparent: false });
  // Figma crops the wall inside the card: 130.81% x 132.35%, offset -14.97% / -19.83%.
  wall.box = { x: -14.97, y: -19.83 + 0.1, w: 130.81, h: 132.35 };
  return [
    wall,
    t("furniture", "furniture.webp", 0, 201.5 - 427 / 2, 171.5 - 127, 427, 254, "Bookshelf, console table and door."),
    t("foreground", "foreground.webp", 10, 22, 239.5, 310, 170, "Sofa and coffee table."),
    t("character", "lily-1.webp", 35, 186, 246.5, 132, 198, "Lily in a blue dress with flower basket. Glows on pose 2.", {
      fit: "contain",
      alt: "/assets/tucker-pritchett/living-room/lily-2.webp",
    }),
  ];
}

// Figma 96:926, same 354x500 card, exact px, no shrink.
function tuckerKitchen(): LayerDef[] {
  const k = (key: string, file: string, depth: number, x: number, y: number, w: number, h: number, desc: string, extra?: Partial<LayerDef>): LayerDef => ({
    ...fig("kitchen", key, file, depth, x, y, w, h, "cover", desc, false),
    src: `/assets/tucker-pritchett/kitchen/${file}`,
    ...extra,
  });
  const wall = k("wall", "wall.webp", -60, 0, 0.5, CW, CH, "Kitchen wall.", { transparent: false });
  wall.box = { x: 0, y: -2.19 + 0.1, w: 100, h: 118.12 }; // Figma crops the wall inside the card
  return [
    wall,
    k("character", "character.webp", -10, 255, 160.5, 99.3, 152.11, "Person behind the counter, behind the cabinets."),
    k("furniture", "furniture.webp", 0, 0, 32.5, 354, 416, "Cabinets, counters and window."),
    k("mitch", "mitch-1.webp", 35, 52, 136.5, 213, 319, "Mitch leaning on the counter with his I love me mug. Sips on pose 2.", {
      fit: "contain",
      alt: "/assets/tucker-pritchett/kitchen/mitch-2.webp",
    }),
    k("foreground", "foreground.webp", 60, 271, 293.5, 126, 186, "Wooden kitchen cart.", { fit: "contain" }),
  ];
}

function dunphyKitchen(): LayerDef[] {
  const k = (key: string, file: string, depth: number, x: number, y: number, w: number, h: number, desc: string, fit: "cover" | "contain" = "contain") =>
    fig("kitchen", key, file, depth, x, y, w, h, fit, desc, false); // scene is composed against the wall, so no shrink
  return [
    { ...fig("kitchen", "wall", "wall.webp", -60, 0, 0.5, CW, CH, "cover", "Kitchen with chandelier, cabinets and wood floor.", false), transparent: false },
    k("furniture", "furniture.webp", 0, 0, -13.5, 354, 346, "Kitchen island, cabinets and counters."),
    k("character", "character-1.webp", 35, 42, 159.5, 144, 220, "Woman in a robe holding a mug."),
    k("foreground", "foreground.webp", 20, 35, 219.5, 284, 211, "Island with fruit bowl and stools."),
    k("character-2", "character-2.webp", 35, 205, 219.5, 131, 172, "Girl sitting on a stool.", "cover"),
  ];
}

export const houses: HouseDef[] = [
  {
    id: "dunphy",
    name: "The Dunphys",
    family: "Phil, Claire, Haley, Alex, Luke",
    blurb: "Suburban chaos, dad jokes, and a very full fridge.",
    accent: "#5aa469",
    exterior: {
      src: "/assets/dunphy/exterior.webp",
      size: "1600x1200",
      desc: "Two-story suburban house, front lawn, garage, porch. Transparent background, no sky.",
    },
    rooms: [
      room("dunphy", "living-room", "Living Room", "Where every family meeting goes sideways.", ["#f3e3c3", "#c99a63"], {
        wall: "Cream walls, big window, family photos, soft daylight.",
        furniture: "Sectional couch, coffee table, TV console, cozy throw blanket.",
        character: "Phil (faceless): tousled hair, polo and khakis, mid dad-joke pose.",
        foreground: "Potted plant and lamp cropped at the left edge.",
      }, dunphyLivingRoom(), { text: "do me ~", x: 47, y: 36.9, tx: 63, ty: 44 }),
      room("dunphy", "kitchen", "Kitchen", "The island knows everything.", ["#f6ead0", "#b98a5a"], {
        wall: "Warm kitchen wall, cabinets, window over the sink.",
        furniture: "Kitchen island with stools, fridge covered in notes, counter appliances.",
        character: "Claire (faceless): bob haircut, cardigan, holding a wine glass.",
        foreground: "Fruit bowl on the counter edge.",
      }, dunphyKitchen()),
    ],
  },
  {
    id: "pritchett",
    name: "The Pritchetts",
    family: "Jay, Gloria, Manny, Joe",
    blurb: "Big personality, bigger decor, one very comfortable recliner.",
    accent: "#c4413f",
    exterior: {
      src: "/assets/pritchett/exterior.webp",
      size: "1600x1200",
      desc: "Large upscale home, grand entrance, lush landscaping. Transparent background, no sky.",
    },
    rooms: [
      room("pritchett", "living-room", "Living Room", "Statement sofa. Statement everything.", ["#a7353a", "#d8b46a"], {
        wall: "Deep red walls, gold-framed art, tall windows.",
        furniture: "Big plush sofa, gold accents, ornate side tables.",
        character: "Jay (faceless): gray hair, button-up shirt, relaxed in his recliner.",
        foreground: "Large potted palm cropped at the right edge.",
      }, pritchettLivingRoom()),
      room("pritchett", "kitchen", "Kitchen", "Gloria is cooking and also talking.", ["#c7623f", "#e0c28a"], {
        wall: "Warm terracotta kitchen wall, decorative tiles.",
        furniture: "Large island, copper pots, stools, stove area.",
        character: "Gloria (faceless): long dark curly hair, bold dress, heels.",
        foreground: "Wine bottles and fruit at the counter edge.",
      }, pritchettKitchen()),
    ],
  },
  {
    id: "tucker-pritchett",
    name: "The Tucker-Pritchetts",
    family: "Mitch, Cam, Lily",
    blurb: "Art, books, plants, and a dramatic entrance at all times.",
    accent: "#4b8fcf",
    exterior: {
      src: "/assets/tucker-pritchett/exterior.webp",
      size: "1600x1200",
      desc: "Cozy two-story craftsman-style home, porch, garden. Transparent background, no sky.",
    },
    rooms: [
      room("tucker-pritchett", "living-room", "Living Room", "Curated, but make it cozy.", ["#d4e4e1", "#b9a98a"], {
        wall: "Light wall, bookshelves, framed art, big window.",
        furniture: "Comfy sofa, stylish chairs, coffee table with books.",
        character: "Cam and Mitch (faceless): Cam in a colorful shirt, Mitch in a neat sweater.",
        foreground: "Houseplants at the left edge.",
      }, tuckerLivingRoom()),
      room("tucker-pritchett", "kitchen", "Kitchen", "Dinner party prep, with flair.", ["#e8efe0", "#a8b89b"], {
        wall: "Bright kitchen wall, open shelves, cookbooks.",
        furniture: "Counter island, stools, stand mixer, hanging pots.",
        character: "Cam (faceless) in an apron with a big gesture.",
        foreground: "Herb pots on the counter edge.",
      }, tuckerKitchen()),
    ],
  },
];

export const sharedAssets: SharedAsset[] = [
  {
    key: "logo",
    src: "/assets/shared/logo.webp",
    size: "1200x400",
    desc: "Original Modern Family-style wordmark (not the official logo). Transparent.",
    transparent: true,
    optional: true,
  },
  {
    key: "street-sky",
    src: "/assets/shared/street-sky.webp",
    size: "2400x1600",
    desc: "Neighborhood sky with soft clouds. Opaque. Scrolls slowest.",
    transparent: false,
  },
  {
    key: "street-trees",
    src: "/assets/shared/street-trees.webp",
    size: "3600x1000",
    desc: "Far row of trees and hills. Transparent above and below. Scrolls slowly.",
    transparent: true,
  },
  {
    key: "street-road",
    src: "/assets/shared/street-road.webp",
    size: "3600x600",
    desc: "Sidewalk and road strip along the bottom. Transparent above.",
    transparent: true,
  },
  {
    key: "street-foreground",
    src: "/assets/shared/street-foreground.webp",
    size: "7200x700",
    desc: "Hedges, mailboxes, flowers along the very front. Transparent. Scrolls fastest.",
    transparent: true,
    optional: true,
  },
];
