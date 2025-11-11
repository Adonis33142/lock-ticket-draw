import { Header } from "@/components/Header";
import { TicketCard } from "@/components/TicketCard";
import { DrawCountdown } from "@/components/DrawCountdown";
import { Shield } from "lucide-react";

const Index = () => {
  // Mock data for raffle tickets
  const tickets = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    isPurchased: i < 3, // First 3 are purchased for demo
    isRevealed: false,
    value: `${Math.floor(Math.random() * 1000)}`,
  }));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Info Banner */}
        <div className="bg-card/50 border border-border/50 rounded-lg p-6 backdrop-blur-sm">
          <div className="flex items-start gap-4">
            <Shield className="h-8 w-8 text-primary flex-shrink-0 mt-1 animate-glow-pulse" />
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Provably Fair Encrypted Raffle System
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Purchase raffle entries with full encryption. Your entry values remain completely hidden 
                until the draw concludes, ensuring fairness and preventing front-running. Connect your 
                Rainbow Wallet to participate.
              </p>
            </div>
          </div>
        </div>

        {/* Countdown Timer */}
        <DrawCountdown />

        {/* Tickets Grid */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Available Tickets
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tickets.map((ticket) => (
              <TicketCard key={ticket.id} {...ticket} />
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card/50 border border-border/50 rounded-lg p-6 backdrop-blur-sm">
            <p className="text-sm text-muted-foreground mb-1">Total Pool</p>
            <p className="text-3xl font-bold text-primary">0.5 ETH</p>
          </div>
          <div className="bg-card/50 border border-border/50 rounded-lg p-6 backdrop-blur-sm">
            <p className="text-sm text-muted-foreground mb-1">Encrypted Entries</p>
            <p className="text-3xl font-bold text-accent">24</p>
          </div>
          <div className="bg-card/50 border border-border/50 rounded-lg p-6 backdrop-blur-sm">
            <p className="text-sm text-muted-foreground mb-1">Next Winner Prize</p>
            <p className="text-3xl font-bold text-secondary">0.35 ETH</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
