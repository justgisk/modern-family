import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import basicSsl from "@vitejs/plugin-basic-ssl";

// https is required for iPhone gyro (DeviceOrientation only fires on secure pages).
export default defineConfig({
  plugins: [react(), basicSsl()],
  server: { host: true },
});
