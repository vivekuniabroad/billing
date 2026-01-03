import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Check, Printer, Receipt } from 'lucide-react';
import { Sale } from '@/types/product';
import { useSettings } from '@/context/SettingsContext';

interface SaleReceiptProps {
  sale: Sale | null;
  open: boolean;
  onClose: () => void;
}

export function SaleReceipt({ sale, open, onClose }: SaleReceiptProps) {
  const { formatPrice, settings } = useSettings();
  
  if (!sale) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 font-display">
            <div className="flex h-12 w-12 items-center justify-center rounded-full gradient-success shadow-medium">
              <Check className="h-6 w-6 text-success-foreground" />
            </div>
            Sale Complete!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="rounded-xl bg-secondary/50 p-4 space-y-1">
            <p className="text-sm text-muted-foreground">Receipt #{sale.id.slice(0, 8)}</p>
            <p className="text-sm text-muted-foreground">
              {new Date(sale.date).toLocaleString()}
            </p>
            <p className="text-sm font-medium text-foreground">{settings.shopName}</p>
          </div>

          <div className="space-y-3">
            {sale.items.map(item => (
              <div key={item.product.id} className="flex justify-between items-center">
                <div>
                  <span className="text-foreground font-medium">{item.product.name}</span>
                  <span className="text-muted-foreground ml-2">× {item.quantity}</span>
                </div>
                <span className="font-medium text-foreground">
                  {formatPrice(item.product.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <Separator />

          <div className="flex justify-between items-center text-xl">
            <span className="font-bold text-foreground">Total</span>
            <span className="font-bold text-primary">{formatPrice(sale.total)}</span>
          </div>

          {sale.isPending && (
            <div className="p-3 rounded-xl bg-accent/10 border border-accent/20">
              <p className="text-sm font-medium text-accent">Credit Sale - Payment Pending</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={handlePrint} className="flex-1">
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button onClick={onClose} className="flex-1 gradient-primary text-primary-foreground">
              <Receipt className="h-4 w-4" />
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
