import React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';
import DesktopWidget from './DesktopWidget';
import { type WidgetInstance } from '@/contexts/WidgetContext';

interface StocksWidgetProps {
  widget: WidgetInstance;
}

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

// Sample stock data
const SAMPLE_STOCKS: Stock[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 189.84, change: 2.34, changePercent: 1.25 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 141.80, change: -1.20, changePercent: -0.84 },
  { symbol: 'MSFT', name: 'Microsoft', price: 378.91, change: 4.56, changePercent: 1.22 },
  { symbol: 'AMZN', name: 'Amazon.com', price: 178.25, change: 3.12, changePercent: 1.78 },
  { symbol: 'META', name: 'Meta Platforms', price: 505.95, change: -2.45, changePercent: -0.48 },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 495.22, change: 12.34, changePercent: 2.56 },
];

const StocksWidget: React.FC<StocksWidgetProps> = ({ widget }) => {
  const isSmall = widget.size === 'small';
  const isLarge = widget.size === 'large';

  // Show different amounts based on size
  const visibleStocks = isSmall ? SAMPLE_STOCKS.slice(0, 2) : isLarge ? SAMPLE_STOCKS : SAMPLE_STOCKS.slice(0, 4);

  const formatPrice = (price: number) => price.toFixed(2);
  const formatChange = (change: number) => (change >= 0 ? '+' : '') + change.toFixed(2);
  const formatPercent = (percent: number) => (percent >= 0 ? '+' : '') + percent.toFixed(2) + '%';

  if (isSmall) {
    return (
      <DesktopWidget widget={widget}>
        <div className="flex flex-col h-full p-3">
          <p className="text-white/50 text-xs mb-2">Stocks</p>
          {visibleStocks.map(stock => (
            <div key={stock.symbol} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
              <span className="text-white font-medium text-sm">{stock.symbol}</span>
              <div className="text-right">
                <p className="text-white text-sm">${formatPrice(stock.price)}</p>
                <p className={cn(
                  'text-xs',
                  stock.change >= 0 ? 'text-green-400' : 'text-red-400'
                )}>
                  {formatPercent(stock.changePercent)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </DesktopWidget>
    );
  }

  return (
    <DesktopWidget widget={widget}>
      <div className="flex flex-col h-full p-4">
        <p className="text-white/50 text-xs mb-3">Stocks</p>

        <div className="flex-1 overflow-y-auto space-y-1">
          {visibleStocks.map(stock => (
            <div
              key={stock.symbol}
              className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
            >
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm">{stock.symbol}</p>
                {isLarge && (
                  <p className="text-white/50 text-xs truncate">{stock.name}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className="text-white text-sm">${formatPrice(stock.price)}</p>
                  <p className={cn(
                    'text-xs',
                    stock.change >= 0 ? 'text-green-400' : 'text-red-400'
                  )}>
                    {formatChange(stock.change)}
                  </p>
                </div>

                <div className={cn(
                  'px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1',
                  stock.change >= 0
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-red-500/20 text-red-400'
                )}>
                  {stock.change >= 0
                    ? <TrendingUp className="w-3 h-3" />
                    : <TrendingDown className="w-3 h-3" />
                  }
                  {formatPercent(stock.changePercent)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {isLarge && (
          <div className="mt-3 pt-3 border-t border-white/10">
            <p className="text-white/40 text-xs text-center">
              Market data delayed. Updated 5 min ago.
            </p>
          </div>
        )}
      </div>
    </DesktopWidget>
  );
};

export default StocksWidget;
