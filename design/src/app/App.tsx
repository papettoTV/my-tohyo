import { HeroSection } from "./components/HeroSection";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";

export default function App() {
  return (
    <div className="size-full">
      <Header />
      <HeroSection />
      <Footer />
    </div>
  );
}