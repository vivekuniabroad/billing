import { Package, TrendingUp } from 'lucide-react';
import { Product } from '@/types/product';
import { cn } from '@/lib/utils';
import { useSettings } from '@/context/SettingsContext';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  disabled?: boolean;
}

export function ProductCard({ product, onSelect, disabled }: ProductCardProps) {
  const { formatPrice } = useSettings();
  
  return (
    <button
      onClick={() => onSelect(product)}
      disabled={disabled || product.stock === 0}
      className={cn(
        'group relative flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-5 text-left transition-all duration-300',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        'hover:shadow-medium hover:-translate-y-1',
        disabled || product.stock === 0
          ? 'cursor-not-allowed opacity-50'
          : 'cursor-pointer hover:border-primary/50'
      )}
    >
      {/* Usage badge */}
      {product.usageCount > 50 && (
        <div className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full gradient-accent shadow-glow-accent">
          <TrendingUp className="h-3.5 w-3.5 text-accent-foreground" />
        </div>
      )}
      
      <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-secondary to-muted transition-transform group-hover:scale-110">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full rounded-xl object-cover"
          />
        ) : (
          <Package className="h-8 w-8 text-muted-foreground" />
        )}
      </div>
      
      <div className="w-full text-center">
        <h3 className="text-sm font-medium text-foreground line-clamp-2 leading-tight">
          {product.name}
        </h3>
        <p className="mt-2 text-xl font-bold text-primary">
          {formatPrice(product.price)}
        </p>
        <p className={cn(
          'mt-1 text-xs font-medium',
          product.stock <= 5 ? 'text-destructive' : 'text-muted-foreground'
        )}>
          {product.stock} in stock
        </p>
      </div>

      {product.stock === 0 && (
        <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-background/90 backdrop-blur-sm">
          <span className="px-3 py-1 rounded-full bg-destructive/10 text-sm font-semibold text-destructive">
            Out of Stock
          </span>
        </div>
      )}
    </button>
  );
}
