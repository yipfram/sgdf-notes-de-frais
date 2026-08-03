import { SpeedInsights } from "@vercel/speed-insights/next";
import { EnregistrementPwa } from "../pwa-registration";

export default function MainLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      {children}
      <SpeedInsights />
      <EnregistrementPwa />
    </>
  );
}
