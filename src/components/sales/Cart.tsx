import { ShoppingCart, Receipt, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CartItem } from './CartItem';
import { CartItem as CartItemType } from '@/types/product';
import { Separator } from '@/components/ui/separator';
import { useSettings } from '@/context/SettingsContext';

interface CartProps {
  items: CartItemType[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  onCheckout: () => void;
  onCreditSale?: () => void;
}

export function Cart({ items, onUpdateQuantity, onRemove, onCheckout, onCreditSale }: CartProps) {
  const { formatPrice } = useSettings();
  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-card/50 p-10">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary animate-pulse">
          <ShoppingCart className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="mt-5 font-display text-xl font-semibold text-foreground">Cart is empty</h3>
        <p className="mt-2 text-sm text-muted-foreground text-center">
          Select products from the list to add them here
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card shadow-medium overflow-hidden">
      <div className="flex items-center justify-between p-5 gradient-primary">
        <div className="flex items-center gap-3">
          <ShoppingCart className="h-5 w-5 text-primary-foreground" />
          <h2 className="font-display text-lg font-semibold text-primary-foreground">Current Sale</h2>
        </div>
        <span className="rounded-full bg-primary-foreground/20 px-3 py-1 text-sm font-medium text-primary-foreground">
          {itemCount} items
        </span>
      </div>

      <div className="max-h-[350px] space-y-2 overflow-y-auto p-4">
        {items.map(item => (
          <CartItem
            key={item.product.id}
            item={item}
            onUpdateQuantity={onUpdateQuantity}
            onRemove={onRemove}
          />
        ))}
      </div>

      <Separator />

      <div className="p-5">
        <div className="mb-5 space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Subtotal ({itemCount} items)</span>
            <span>{formatPrice(total)}</span>
          </div>
          <div className="flex justify-between text-xl font-bold text-foreground">
            <span>Total</span>
            <span className="text-primary">{formatPrice(total)}</span>
          </div>
        </div>

        <div className="space-y-2">
          <Button
            onClick={onCheckout}
            className="w-full h-12 gradient-primary text-primary-foreground shadow-medium hover:shadow-glow transition-all"
            size="lg"
          >
            <Receipt className="h-5 w-5" />
            Complete Sale
          </Button>
          
          {onCreditSale && (
            <Button
              onClick={onCreditSale}
              variant="outline"
              className="w-full h-12 border-accent text-accent hover:bg-accent hover:text-accent-foreground transition-all"
              size="lg"
            >
              <UserPlus className="h-5 w-5" />
              Credit Sale (Pay Later)
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
