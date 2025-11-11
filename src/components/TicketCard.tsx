import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Unlock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface TicketCardProps {
  id: number;
  isPurchased: boolean;
  isRevealed: boolean;
  value?: string;
}

export const TicketCard = ({ id, isPurchased, isRevealed, value }: TicketCardProps) => {
  const [purchased, setPurchased] = useState(isPurchased);

  const handlePurchase = () => {
    setPurchased(true);
    toast.success("Ticket purchased! Entry encrypted.", {
      description: `Ticket #${id} is now yours`,
    });
  };

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-card to-card/80 border-border/50 shadow-card hover:shadow-glow transition-all duration-300 hover:scale-105">
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-mono text-muted-foreground">
            #{String(id).padStart(4, '0')}
          </span>
          {purchased ? (
            <Lock className="h-6 w-6 text-accent animate-glow-pulse" />
          ) : (
            <Unlock className="h-6 w-6 text-muted-foreground opacity-50" />
          )}
        </div>

        <div className="h-32 flex items-center justify-center">
          {isRevealed && purchased ? (
            <div className="text-center animate-scale-in">
              <p className="text-sm text-muted-foreground mb-1">Entry Value</p>
              <p className="text-3xl font-bold text-primary">{value}</p>
            </div>
          ) : purchased ? (
            <div className="text-center space-y-2">
              <Lock className="h-12 w-12 mx-auto text-accent animate-float" />
              <p className="text-sm text-accent">Encrypted Entry</p>
            </div>
          ) : (
            <div className="text-center space-y-2">
              <div className="w-20 h-20 mx-auto rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                <span className="text-2xl text-muted-foreground/50">?</span>
              </div>
              <p className="text-sm text-muted-foreground">Available</p>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-border/50">
          {purchased ? (
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Status: Encrypted</p>
            </div>
          ) : (
            <Button 
              onClick={handlePurchase}
              className="w-full bg-primary hover:bg-primary/90 shadow-glow"
            >
              Purchase Entry
            </Button>
          )}
        </div>
      </div>

      {purchased && !isRevealed && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-secondary/5 animate-shimmer"
               style={{
                 backgroundSize: '200% 200%',
                 backgroundImage: 'linear-gradient(90deg, transparent, hsl(var(--primary) / 0.1), transparent)'
               }} 
          />
        </div>
      )}
    </Card>
  );
};
