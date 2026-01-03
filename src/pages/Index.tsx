import Navbar from "@/components/Navbar";
import TickerBar from "@/components/TickerBar";
import ModelTabs from "@/components/ModelTabs";
import ChartSection from "@/components/ChartSection";
import ModelChat from "@/components/ModelChat";
import Leaderboard from "@/components/Leaderboard";
import UpcomingMatches from "@/components/UpcomingMatches";
import Footer from "@/components/Footer";
import { AutomationStatusPanel } from "@/components/AutomationStatusPanel";

const Index = () => {
  return (
    <div className="min-h-screen bg-background bg-grid">
      <Navbar />
      <TickerBar />

      {/* Main Content - offset for fixed navbar and ticker */}
      <main className="pt-32 pb-8">
        <div className="container mx-auto px-4">
          {/* Hero Update Banner */}
          <div className="mb-6 p-4 bg-card border border-border rounded-lg">
            <p className="text-sm text-muted-foreground">
              <span className="text-accent font-semibold">Güncelleme:</span>{" "}
              Sezon 1 tamamlandı!{" "}
              <span className="text-primary font-semibold">Mystery Model</span> 324 maçta{" "}
              <span className="text-success font-semibold">%78 kazanma oranı</span> ile şampiyon oldu.
              Toplam <span className="text-accent font-semibold">2,847 birim</span> kâr elde etti. ⚽🏀
            </p>
          </div>

          {/* Model Tabs */}
          <ModelTabs />

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {/* Left Column - Chart */}
            <div className="lg:col-span-2 space-y-6">
              <ChartSection />
              <Leaderboard />
              <AutomationStatusPanel />
            </div>

            {/* Right Column - Chat & Matches */}
            <div className="space-y-6">
              <ModelChat />
              <UpcomingMatches />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
