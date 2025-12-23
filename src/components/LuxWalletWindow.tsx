import React, { useState } from 'react';
import ZWindow from './ZWindow';
import { Wallet, Send, ArrowDownLeft, ArrowUpRight, RefreshCw, Copy, Check, TrendingUp, Shield, Zap, Globe } from 'lucide-react';

interface LuxWalletWindowProps {
  onClose: () => void;
}

interface Transaction {
  id: string;
  type: 'send' | 'receive';
  amount: string;
  address: string;
  time: string;
  status: 'confirmed' | 'pending';
}

const LuxWalletWindow: React.FC<LuxWalletWindowProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'send' | 'receive'>('overview');
  const [copied, setCopied] = useState(false);

  const walletAddress = '0xZ3eK...4y2F';
  const fullAddress = '0xZ3eKaY1337c0d3rH4nz0L1f34y2F';

  const mockTransactions: Transaction[] = [
    { id: '1', type: 'receive', amount: '+420.69 LUX', address: '0xDe...Fi', time: '2 min ago', status: 'confirmed' },
    { id: '2', type: 'send', amount: '-100 LUX', address: '0xHa...nz', time: '1 hour ago', status: 'confirmed' },
    { id: '3', type: 'receive', amount: '+1,337 LUX', address: '0xCh...ad', time: '3 hours ago', status: 'confirmed' },
    { id: '4', type: 'send', amount: '-50 LUX', address: '0xGi...Me', time: 'Yesterday', status: 'pending' },
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(fullAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ZWindow
      title="Lux Wallet"
      onClose={onClose}
      initialPosition={{ x: 300, y: 100 }}
      initialSize={{ width: 420, height: 580 }}
      windowType="default"
    >
      <div className="flex flex-col h-full bg-gradient-to-b from-indigo-950 via-purple-950 to-black">
        {/* Header with Balance */}
        <div className="p-6 text-center border-b border-white/10">
          {/* Lux Logo */}
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-2xl rotate-45 transform" />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-10 h-10">
                <path d="M50 85 L15 25 L85 25 Z" fill="white" />
              </svg>
            </div>
          </div>
          
          <p className="text-white/50 text-sm mb-1">Total Balance</p>
          <h2 className="text-4xl font-bold text-white mb-1">69,420.00</h2>
          <p className="text-cyan-400 flex items-center justify-center gap-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">LUX</span>
          </p>
          
          <div className="flex items-center justify-center gap-2 mt-3">
            <span className="text-white/50 text-xs font-mono">{walletAddress}</span>
            <button
              onClick={handleCopy}
              className="p-1 hover:bg-white/10 rounded transition-colors"
            >
              {copied ? (
                <Check className="w-3 h-3 text-green-400" />
              ) : (
                <Copy className="w-3 h-3 text-white/50" />
              )}
            </button>
          </div>
          
          <p className="text-[10px] text-white/30 mt-2">
            "Not your keys, not your coins. Your keys? Still not financial advice." - Z
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3 p-4 border-b border-white/10">
          <button
            onClick={() => setActiveTab('send')}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:opacity-90 transition-opacity"
          >
            <ArrowUpRight className="w-4 h-4" />
            Send
          </button>
          <button
            onClick={() => setActiveTab('receive')}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors"
          >
            <ArrowDownLeft className="w-4 h-4" />
            Receive
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2 p-4 border-b border-white/10">
          <div className="text-center p-2 rounded-lg bg-white/5">
            <Shield className="w-4 h-4 mx-auto mb-1 text-green-400" />
            <p className="text-[10px] text-white/50">Post-Quantum</p>
            <p className="text-xs text-white font-medium">Secured</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-white/5">
            <Zap className="w-4 h-4 mx-auto mb-1 text-yellow-400" />
            <p className="text-[10px] text-white/50">TPS</p>
            <p className="text-xs text-white font-medium">100,000+</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-white/5">
            <Globe className="w-4 h-4 mx-auto mb-1 text-cyan-400" />
            <p className="text-[10px] text-white/50">Network</p>
            <p className="text-xs text-white font-medium">Mainnet</p>
          </div>
        </div>

        {/* Transactions */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex items-center justify-between px-4 py-2">
            <h3 className="text-sm font-medium text-white/70">Recent Activity</h3>
            <button className="p-1 hover:bg-white/10 rounded transition-colors">
              <RefreshCw className="w-4 h-4 text-white/50" />
            </button>
          </div>
          
          <div className="space-y-1 px-2">
            {mockTransactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      tx.type === 'receive'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {tx.type === 'receive' ? (
                      <ArrowDownLeft className="w-5 h-5" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-white font-medium">
                      {tx.type === 'receive' ? 'Received' : 'Sent'}
                    </p>
                    <p className="text-xs text-white/50">{tx.address}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`text-sm font-medium ${
                      tx.type === 'receive' ? 'text-green-400' : 'text-white'
                    }`}
                  >
                    {tx.amount}
                  </p>
                  <p className="text-xs text-white/40">{tx.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-white/10 bg-black/40">
          <p className="text-[10px] text-white/30 text-center">
            Lux Network • Multi-consensus blockchain • Powered by ☕ and questionable decisions
          </p>
        </div>
      </div>
    </ZWindow>
  );
};

export default LuxWalletWindow;
