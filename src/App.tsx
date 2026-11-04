import { useEffect, useState } from "react";
import { preload, SPLASH, STREET, roomUrls } from "./lib/preload";
import { HouseDef, houses } from "./data/houses";
import { requestMotion } from "./lib/motion";
import { Splash } from "./components/Splash";
import { Neighborhood } from "./components/Neighborhood";
import { RoomView } from "./components/RoomView";

type Screen = "splash" | "street" | "room";

export default function App() {
  const [screen, setScreen] = useState<Screen>("splash");
  const [house, setHouse] = useState<HouseDef | null>(null);
  const [roomIdx, setRoomIdx] = useState(0);

  // Warm the cache in order of need: splash now, street while on splash, rooms once on the street.
  useEffect(() => {
    preload(SPLASH);
    preload(STREET);
  }, []);
  useEffect(() => {
    if (screen === "street") preload(roomUrls());
  }, [screen]);

  // Tint the iPhone browser bars: cream on splash, blue top / white bottom on street, white in a room.
  useEffect(() => {
    const color = screen === "street" ? "#5bb8fb" : screen === "room" ? "#ffffff" : "#fff4dc";
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", color);
    // Bottom bar samples the page background: white on the street (the white card sits at the bottom).
    const bottom = screen === "street" ? "#ffffff" : color;
    document.documentElement.style.background = bottom;
    document.body.style.background = bottom;
  }, [screen]);

  return (
    <div className="app">
      {screen === "splash" && (
        <Splash
          onEnter={async () => {
            await requestMotion(); // must be inside the tap handler for iOS
            setScreen("street");
          }}
        />
      )}
      {screen === "street" && (
        <Neighborhood
          initial={Math.max(0, houses.findIndex((h) => h.id === house?.id))}
          onBack={() => setScreen("splash")}
          onPick={(h) => {
            setHouse(h);
            setRoomIdx(0);
            setScreen("room");
          }}
        />
      )}
      {screen === "room" && house && (
        <RoomView
          house={house}
          roomIdx={roomIdx}
          onRoom={setRoomIdx}
          onExit={() => setScreen("street")}
        />
      )}
    </div>
  );
}
