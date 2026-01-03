import { useState } from 'react';
import { Settings as SettingsIcon, Store, CreditCard, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSettings } from '@/context/SettingsContext';
import { CURRENCIES } from '@/types/product';
import { toast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings();
  const [shopName, setShopName] = useState(settings.shopName);
  const [currency, setCurrency] = useState(settings.currency);

  const handleSave = () => {
    updateSettings({ shopName, currency });
    toast({
      title: 'Settings saved',
      description: 'Your preferences have been updated.',
    });
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-primary shadow-medium">
            <SettingsIcon className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground">Manage your shop preferences</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 max-w-2xl">
        <Card className="border-border shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display">
              <Store className="h-5 w-5 text-primary" />
              Shop Information
            </CardTitle>
            <CardDescription>Basic details about your shop</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="shopName">Shop Name</Label>
              <Input
                id="shopName"
                value={shopName}
                onChange={e => setShopName(e.target.value)}
                placeholder="Enter shop name"
                className="h-12"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display">
              <CreditCard className="h-5 w-5 text-accent" />
              Currency Settings
            </CardTitle>
            <CardDescription>Set your preferred currency for transactions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency Type</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {CURRENCIES.map(curr => (
                    <SelectItem key={curr.code} value={curr.code}>
                      <span className="flex items-center gap-2">
                        <span className="font-bold">{curr.symbol}</span>
                        <span>{curr.name}</span>
                        <span className="text-muted-foreground">({curr.code})</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 rounded-xl bg-secondary/50 border border-border">
              <p className="text-sm text-muted-foreground">Preview:</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {CURRENCIES.find(c => c.code === currency)?.symbol}1,234.56
              </p>
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSave} size="lg" className="w-fit gradient-primary text-primary-foreground shadow-medium hover:shadow-glow transition-all">
          <Save className="h-5 w-5" />
          Save Settings
        </Button>
      </div>
    </div>
  );
}
