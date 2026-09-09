import { SpeedInsights } from "@vercel/speed-insights/next";

export default function MainLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      {children}
      <SpeedInsights />
    </>
  );
}
