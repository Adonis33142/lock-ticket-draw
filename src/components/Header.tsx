import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/logo.png";

export const Header = () => {
  const [connected, setConnected] = useState(false);

  const handleConnect = () => {
    // Mock wallet connection
    setConnected(!connected);
  };

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img 
              src={logo} 
              alt="Encrypted Raffle Chamber" 
              className="h-12 w-12 animate-glow-pulse"
            />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Encrypted Raffle Chamber
              </h1>
              <p className="text-sm text-muted-foreground">Your Luck, Encrypted.</p>
            </div>
          </div>
          
          <Button
            onClick={handleConnect}
            className={`gap-2 ${
              connected 
                ? "bg-secondary hover:bg-secondary/90 shadow-glow" 
                : "bg-primary hover:bg-primary/90 shadow-glow"
            }`}
          >
            <Wallet className="h-4 w-4" />
            {connected ? "Wallet Connected" : "Connect Rainbow Wallet"}
          </Button>
        </div>
      </div>
    </header>
  );
};
