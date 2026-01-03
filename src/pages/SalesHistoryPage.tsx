import { useState, useMemo } from 'react';
import { BarChart3, Calendar, Download, TrendingUp, Package, Clock, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useSalesHistory } from '@/context/SalesHistoryContext';
import { useSettings } from '@/context/SettingsContext';
import { format, startOfDay, endOfDay, subDays, isToday, isYesterday } from 'date-fns';

const CHART_COLORS = ['hsl(262, 83%, 58%)', 'hsl(340, 82%, 52%)', 'hsl(160, 84%, 39%)', 'hsl(38, 92%, 50%)', 'hsl(200, 80%, 50%)'];

export default function SalesHistoryPage() {
  const { sales, getMonthlySalesData, getTopProductsByMonth, getSalesByDateRange } = useSalesHistory();
  const { formatPrice, settings } = useSettings();
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  const monthlyData = getMonthlySalesData();

  // Today's sales
  const todaysSales = useMemo(() => {
    const today = new Date();
    return sales.filter(s => isToday(new Date(s.date)));
  }, [sales]);

  const todaysTotal = todaysSales.reduce((sum, s) => sum + s.total, 0);

  // Yesterday's sales
  const yesterdaysSales = useMemo(() => {
    return sales.filter(s => isYesterday(new Date(s.date)));
  }, [sales]);

  const yesterdaysTotal = yesterdaysSales.reduce((sum, s) => sum + s.total, 0);

  const filteredSales = useMemo(() => {
    const now = new Date();
    let start: Date;
    
    switch (dateFilter) {
      case '7d':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        return sales;
    }
    
    return getSalesByDateRange(start, now);
  }, [dateFilter, sales, getSalesByDateRange]);

  const totalRevenue = filteredSales.reduce((sum, s) => sum + s.total, 0);
  const avgOrderValue = filteredSales.length > 0 ? totalRevenue / filteredSales.length : 0;

  const bestMonth = monthlyData.reduce((best, curr) => 
    curr.total > (best?.total || 0) ? curr : best
  , monthlyData[0]);

  const topProducts = useMemo(() => {
    if (selectedMonth === 'all') {
      const productMap: Record<string, { name: string; qty: number; revenue: number }> = {};
      sales.forEach(sale => {
        sale.items.forEach(item => {
          const key = item.product.name;
          if (!productMap[key]) {
            productMap[key] = { name: key, qty: 0, revenue: 0 };
          }
          productMap[key].qty += item.quantity;
          productMap[key].revenue += item.product.price * item.quantity;
        });
      });
      return Object.values(productMap).sort((a, b) => b.qty - a.qty).slice(0, 5);
    }
    
    const [year, month] = selectedMonth.split('-').map(Number);
    return getTopProductsByMonth(year, month).slice(0, 5).map(p => ({
      name: p.productName,
      qty: p.quantity,
      revenue: p.revenue,
    }));
  }, [selectedMonth, sales, getTopProductsByMonth]);

  const handleExport = () => {
    const csvContent = [
      ['Date', 'Items', 'Total'].join(','),
      ...filteredSales.map(s => [
        format(new Date(s.date), 'yyyy-MM-dd HH:mm'),
        s.items.map(i => `${i.product.name} x${i.quantity}`).join('; '),
        s.total.toFixed(2),
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-hero shadow-glow">
              <BarChart3 className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">Sales History</h1>
              <p className="text-muted-foreground">{sales.length} total transactions</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Select value={dateFilter} onValueChange={(v: typeof dateFilter) => setDateFilter(v)}>
              <SelectTrigger className="w-[140px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
            
            <Button onClick={handleExport} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>
      </div>

      {/* Today & Yesterday Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <Card className="border-border shadow-medium overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Sun className="h-4 w-4 text-primary" />
              Today's Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <p className="text-3xl font-bold text-primary">{formatPrice(todaysTotal)}</p>
              <span className="text-sm text-muted-foreground">{todaysSales.length} orders</span>
            </div>
            {todaysSales.length > 0 && (
              <div className="mt-3 space-y-1 max-h-32 overflow-y-auto">
                {todaysSales.slice(0, 5).map(sale => (
                  <div key={sale.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{format(new Date(sale.date), 'HH:mm')}</span>
                    <span className="font-medium text-foreground">{formatPrice(sale.total)}</span>
                  </div>
                ))}
                {todaysSales.length > 5 && (
                  <p className="text-xs text-muted-foreground">+{todaysSales.length - 5} more</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border shadow-medium overflow-hidden bg-gradient-to-br from-accent/10 to-accent/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-accent" />
              Yesterday's Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <p className="text-3xl font-bold text-accent">{formatPrice(yesterdaysTotal)}</p>
              <span className="text-sm text-muted-foreground">{yesterdaysSales.length} orders</span>
            </div>
            {yesterdaysSales.length > 0 && (
              <div className="mt-3 space-y-1 max-h-32 overflow-y-auto">
                {yesterdaysSales.slice(0, 5).map(sale => (
                  <div key={sale.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{format(new Date(sale.date), 'HH:mm')}</span>
                    <span className="font-medium text-foreground">{formatPrice(sale.total)}</span>
                  </div>
                ))}
                {yesterdaysSales.length > 5 && (
                  <p className="text-xs text-muted-foreground">+{yesterdaysSales.length - 5} more</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="border-border shadow-medium overflow-hidden">
          <div className="h-1 gradient-primary" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">{formatPrice(totalRevenue)}</p>
          </CardContent>
        </Card>
        
        <Card className="border-border shadow-medium overflow-hidden">
          <div className="h-1 gradient-accent" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-accent">{filteredSales.length}</p>
          </CardContent>
        </Card>
        
        <Card className="border-border shadow-medium overflow-hidden">
          <div className="h-1 gradient-success" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Order Value</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-success">{formatPrice(avgOrderValue)}</p>
          </CardContent>
        </Card>
        
        <Card className="border-border shadow-medium overflow-hidden">
          <div className="h-1 bg-warning" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Best Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-foreground">
              {bestMonth ? `${bestMonth.month} ${bestMonth.year}` : 'N/A'}
            </p>
            {bestMonth && (
              <p className="text-sm text-muted-foreground">{formatPrice(bestMonth.total)}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        {/* Monthly Sales Chart */}
        <Card className="border-border shadow-medium">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Monthly Sales Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <YAxis 
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                    tickFormatter={(value) => `${settings.currencySymbol}${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.75rem',
                    }}
                    formatter={(value: number) => [formatPrice(value), 'Revenue']}
                  />
                  <Bar dataKey="total" fill="hsl(262, 83%, 58%)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No sales data yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Products Chart */}
        <Card className="border-border shadow-medium">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-display flex items-center gap-2">
              <Package className="h-5 w-5 text-accent" />
              Top Selling Products
            </CardTitle>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all">All Time</SelectItem>
                {monthlyData.map(m => (
                  <SelectItem key={`${m.year}-${m.monthNum}`} value={`${m.year}-${m.monthNum}`}>
                    {m.month} {m.year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            {topProducts.length > 0 ? (
              <div className="space-y-3">
                {topProducts.map((product, idx) => (
                  <div key={product.name} className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-primary-foreground"
                      style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
                    >
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.qty} sold</p>
                    </div>
                    <p className="font-semibold text-foreground">{formatPrice(product.revenue)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                No product data
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions Table */}
      <Card className="border-border shadow-medium">
        <CardHeader>
          <CardTitle className="font-display">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredSales.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead>Date</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.slice(0, 20).map(sale => (
                    <TableRow key={sale.id} className="border-border">
                      <TableCell className="font-medium">
                        {format(new Date(sale.date), 'MMM dd, yyyy HH:mm')}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[300px] truncate">
                          {sale.items.map(i => i.product.name).join(', ')}
                        </div>
                      </TableCell>
                      <TableCell>
                        {sale.items.reduce((sum, i) => sum + i.quantity, 0)}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-primary">
                        {formatPrice(sale.total)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              No transactions found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
