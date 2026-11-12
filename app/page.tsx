import { Nav } from "@/components/layout/Nav";
import { Hero } from "@/components/sections/Hero";
import { Belief } from "@/components/sections/Belief";
import { Build } from "@/components/sections/Build";
import { How } from "@/components/sections/How";
import { Trust } from "@/components/sections/Trust";
import { Philosophy } from "@/components/sections/Philosophy";
import { Enquiry } from "@/components/sections/Enquiry";
import { Footer } from "@/components/layout/Footer";
import { MotionRoot, ScrollProgress } from "@/components/framer/motion-kit";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { getLeaderboard } from "@/lib/leaderboard";

export const revalidate = 60;

export default async function Home() {
  const { entries, demo } = await getLeaderboard();
  return (
    <MotionRoot>
      <SmoothScroll>
      <ScrollProgress />
      <Nav />
      <main>
        <Hero />
        <Belief />
        <Build />
        <How />
        <Trust entries={entries} demo={demo} />
        <Philosophy />
        <Enquiry />
      </main>
      <Footer />
      </SmoothScroll>
    </MotionRoot>
  );
}
