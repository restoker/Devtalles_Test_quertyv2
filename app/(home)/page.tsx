import CardsSections from "@/components/CardsSections";
import Hero from "./_ui/hero";
import FuturisticFooter from "./_ui/footer";
import ReactLenis from "lenis/react";

export default function Home() {
  return (
    <ReactLenis root>
      <Hero />
      <div className="w-full bg-black relative">
        <div className="relative z-20">
          <CardsSections />
          <FuturisticFooter />
        </div>
        <div className="absolute inset-0 w-full h-full bg-black/5 z-10 backdrop-blur-2xl"></div>
        <video src="/img/b4.mp4" autoPlay muted loop className="absolute inset-0 w-full h-full object-cover z-0" />
      </div>
    </ReactLenis>
  );
}
