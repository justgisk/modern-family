# Modern Family: House Postcards (vibe-code brief)

## One-liner
A just-for-fun mobile web app. Pick a Modern Family house from a little neighborhood, then peek inside its rooms as tiny tilt-able 3D postcards. No goal, no score, no login. Just cozy nostalgia.

## Vibe
- Cute, warm, collectible. Think "diorama postcard" or "View-Master card", not architectural render, not isometric.
- Playful sitcom energy: bright California daylight, slightly saturated, soft shadows, hand-illustrated or painterly-3D look.
- Everything should feel like a physical card you hold in your hand.

## Non-goals
- No isometric cutaway dollhouse.
- No realistic architecture visualization or walkable first-person 3D.
- No accounts, backend, scoring, or story mode.
- No official show logo or screenshots (see Legal note).

## User flow

1. **Splash screen**
   - Modern Family logo (wordmark, centered), subtle floating/breathing animation.
   - "Tap to enter" (also serves as the user gesture needed to request motion permission on iOS).
2. **Neighborhood screen (house picker)**
   - Horizontal scrollable street / map. Three houses seen from the outside, illustrated in the same cute 3D-card style:
     - **Dunphy house** (Phil, Claire, Haley, Alex, Luke)
     - **Pritchett house** (Jay and Gloria, Manny, Joe)
     - **Tucker-Pritchett house** (Mitch, Cameron, Lily)
   - Interaction: swipe/drag the street sideways with parallax layers (sky, far trees, lawns, houses, foreground fence/plants). Snap to each house. Tap a house (or a "Go inside" pill) to enter.
   - Houses should echo the real exteriors from the show as closely as is reasonable (roofline, colors, porch, garage, landscaping).
3. **Room view (the 3D postcard)**
   - Full-screen card showing one room at a time.
   - Tilting the phone shifts perspective (gyroscope parallax): layers at different depths move at different rates so the room feels like it has real depth.
   - Fallback on desktop or when motion is denied: mouse move or finger drag tilts the card.
   - A bottom room switcher (chips or small thumbnails) to hop between rooms with a quick card flip or slide transition.
   - Top-left back/exit button returns to the neighborhood.
   - Optional tiny caption per room ("Phil & Claire's room") with a one-line fun fact or inside joke.
4. **Exit**
   - Back to the neighborhood, scroll to another house, repeat.

## Houses and rooms

### Dunphy house
- Living room
- Kitchen
- Dining room
- Phil & Claire's bedroom
- Stretch: Haley's room, Alex's room, Luke's room, garage, backyard

### Pritchett house (Jay & Gloria)
- Living room
- Kitchen
- Jay & Gloria's bedroom
- Stretch: Jay's den/recliner corner, Gloria's closet, patio/pool, Manny's room

### Tucker-Pritchett house (Mitch & Cam)
- Living room
- Kitchen
- Mitch & Cam's bedroom
- Stretch: Lily's room, dining nook

MVP = 3 to 4 rooms per house. Add the stretch rooms only if time allows. Each house needs a clearly different palette and furniture style so they feel distinct.

## The 3D postcard technique

Goal: cheap, cute depth that works on a phone, not a real 3D engine scene.

**Recommended approach: layered parallax card**
- Each room is built from 4 to 7 transparent PNG/WebP layers: back wall, floor, mid furniture, hero props, foreground objects (plant, lamp, couch arm).
- Layers sit at different `translateZ` depths inside a CSS 3D container (`perspective` + `transform-style: preserve-3d`).
- Device orientation (`beta`/`gamma`) drives a small `rotateX/rotateY` on the card plus per-layer translate offsets. Clamp to about ±12° and smooth with lerp so it feels springy, not jittery.
- Card has rounded corners, thin border, soft drop shadow, and a faint glare highlight that slides with tilt, like a holographic postcard.

**Alternative (if layers feel flat):** three.js plane stack, or a single image plus depth map with a displacement shader. Only switch to this if CSS layers look weak.

**Motion permission**
- iOS requires `DeviceOrientationEvent.requestPermission()` triggered by a user tap. Do it on the splash "Tap to enter".
- If denied or unavailable, silently fall back to pointer-driven tilt. No error screens.

## Visual design notes
- Warm sunny palette per house:
  - Dunphy: homey suburban, warm wood, soft greens and creams, lived-in clutter.
  - Pritchett: bold and glamorous, rich reds, golds, big statement decor, lush plants.
  - Tucker-Pritchett: modern-cozy, art, books, lighter tones, playful details.
- Rounded, chunky typography for UI (friendly sans). Minimal UI chrome so the postcards are the star.
- Small delight details: idle floating dust specks or light rays, a subtle shadow breathing, haptic tick on room switch if supported, sound optional (off by default).

## Asset plan
- Generate the exterior street illustrations and room layers with an image generation tool, in one consistent style prompt (same lighting, same illustration look) so all cards match.
- For each room, generate a full room image first, then separate or re-generate it into depth layers (background, midground, foreground) with transparent backgrounds. Use background removal to cut out props.
- Keep each layer around 1000 to 1600 px wide, WebP, to keep load fast. Preload the current house's rooms.
- Keep a `/public/assets/{house}/{room}/layer-N.webp` folder convention plus a small `rooms.json` describing layers and their depth values.

## Suggested tech stack
- Vite + React + TypeScript (or plain Vite + vanilla if simpler), mobile-first.
- Framer Motion (or CSS transitions) for screen and card transitions.
- No backend. Static host (Vercel, Netlify, or GitHub Pages).
- PWA manifest so it can be added to the home screen and run full screen.

## Data shape (sketch)
```json
{
  "houses": [
    {
      "id": "dunphy",
      "name": "The Dunphys",
      "exterior": "/assets/dunphy/exterior.webp",
      "rooms": [
        {
          "id": "living-room",
          "name": "Living Room",
          "layers": [
            { "src": "/assets/dunphy/living-room/layer-0.webp", "depth": 0 },
            { "src": "/assets/dunphy/living-room/layer-1.webp", "depth": 40 }
          ]
        }
      ]
    }
  ]
}
```

## Build order
1. Scaffold the app, routes/screens (splash, neighborhood, room), and `rooms.json` with placeholder colored layers.
2. Build the tilt-able postcard component with placeholder layers. Get gyro + mouse fallback feeling great before any art.
3. Build the neighborhood scroll with parallax and snap to houses.
4. Wire up room switcher, transitions, and exit flow.
5. Generate and drop in real art: Dunphy first, then Pritchett, then Tucker-Pritchett.
6. Polish: glare, dust particles, haptics, loading states, PWA manifest.
7. Test on a real iPhone and an Android phone, plus desktop.

## Done when
- Splash, then neighborhood, then room, then back, works smoothly on mobile.
- Tilting the phone visibly shifts the room's depth layers without jank (60fps).
- All three houses have at least 3 rooms each with distinct looks.
- Desktop and motion-denied fallback both feel good.

## Characters
- Small faceless doodle figures placed in the rooms (hair + signature outfit + pose only, no facial features, no actor likeness).
- Recognizable by silhouette, hair and clothes, plus signature props (Phil's dad-joke energy, Claire's wine glass, Jay's recliner, Gloria's heels, Mitch & Cam's styling).
- Idle micro-animation (breathing, head bob) is a nice touch.

## Legal note
Personal, non-commercial fan project, shared on social media for portfolio and content purposes. Never monetized (no ads, no paid app, no merch, no App Store).
- Houses and rooms: homage to the show's real layouts and exteriors, drawn in our own illustration style. No screenshots or stills from the show.
- Logo: original "Modern Family"-style wordmark, not the official logo.
- Characters: faceless doodles only. No faces, no actor likenesses.
- Add a visible footer or credit line: "Unofficial fan project. Not affiliated with or endorsed by the show or its owners. All rights belong to their respective owners."
- If a takedown request ever arrives, remove it promptly.
