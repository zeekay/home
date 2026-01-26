import React, { useState, useMemo } from 'react';
import ZWindow from './ZWindow';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Clock,
  Smartphone,
  Bell,
  Moon,
  Lock,
  Users,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  TrendingUp,
  TrendingDown,
  Timer,
  Ban,
  Check,
  Shield,
  Eye,
  MessageSquare,
  Globe,
  Gamepad2,
  Music,
  Camera,
  Mail,
  Calendar,
  Map,
  ShoppingBag,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface ZScreenTimeWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

// Mock data for demonstration
const mockDailyData = [
  { day: 'Sun', hours: 4.5, color: '#8b5cf6' },
  { day: 'Mon', hours: 3.2, color: '#8b5cf6' },
  { day: 'Tue', hours: 5.1, color: '#8b5cf6' },
  { day: 'Wed', hours: 2.8, color: '#8b5cf6' },
  { day: 'Thu', hours: 4.2, color: '#8b5cf6' },
  { day: 'Fri', hours: 6.3, color: '#ef4444' }, // Over limit
  { day: 'Sat', hours: 5.8, color: '#ef4444' },
];

const mockWeeklyData = [
  { week: 'Week 1', hours: 28 },
  { week: 'Week 2', hours: 32 },
  { week: 'Week 3', hours: 25 },
  { week: 'Week 4', hours: 31 },
];

const mockAppUsage = [
  { name: 'Safari', icon: Globe, time: '2h 15m', percent: 28, color: '#3b82f6', category: 'Productivity' },
  { name: 'Messages', icon: MessageSquare, time: '1h 45m', percent: 22, color: '#10b981', category: 'Social' },
  { name: 'Instagram', icon: Camera, time: '1h 20m', percent: 17, color: '#ec4899', category: 'Social' },
  { name: 'Spotify', icon: Music, time: '1h 05m', percent: 14, color: '#22c55e', category: 'Entertainment' },
  { name: 'Games', icon: Gamepad2, time: '45m', percent: 9, color: '#f59e0b', category: 'Games' },
  { name: 'Mail', icon: Mail, time: '30m', percent: 6, color: '#6366f1', category: 'Productivity' },
  { name: 'Maps', icon: Map, time: '20m', percent: 4, color: '#14b8a6', category: 'Utilities' },
];

const mockPickupsData = [
  { day: 'Sun', pickups: 45 },
  { day: 'Mon', pickups: 62 },
  { day: 'Tue', pickups: 58 },
  { day: 'Wed', pickups: 71 },
  { day: 'Thu', pickups: 55 },
  { day: 'Fri', pickups: 89 },
  { day: 'Sat', pickups: 67 },
];

const mockNotificationsData = [
  { app: 'Messages', count: 156 },
  { app: 'Instagram', count: 89 },
  { app: 'Mail', count: 67 },
  { app: 'Twitter', count: 45 },
  { app: 'Slack', count: 34 },
];

const mockAppLimits = [
  { name: 'Social', limit: '1h', used: '1h 45m', exceeded: true },
  { name: 'Games', limit: '30m', used: '45m', exceeded: true },
  { name: 'Entertainment', limit: '2h', used: '1h 05m', exceeded: false },
];

const mockAlwaysAllowed = [
  { name: 'Phone', icon: Smartphone },
  { name: 'Messages', icon: MessageSquare },
  { name: 'Maps', icon: Map },
  { name: 'Calendar', icon: Calendar },
];

const mockFamilyMembers = [
  { name: 'Alex', avatar: 'A', screenTime: '3h 45m', status: 'Under limit' },
  { name: 'Jordan', avatar: 'J', screenTime: '5h 20m', status: 'Over limit' },
  { name: 'Taylor', avatar: 'T', screenTime: '2h 10m', status: 'Under limit' },
];

type Tab = 'overview' | 'appUsage' | 'downtime' | 'limits' | 'alwaysAllowed' | 'privacy' | 'family';

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: Clock },
  { id: 'appUsage', label: 'App Usage', icon: Smartphone },
  { id: 'downtime', label: 'Downtime', icon: Moon },
  { id: 'limits', label: 'App Limits', icon: Timer },
  { id: 'alwaysAllowed', label: 'Always Allowed', icon: Check },
  { id: 'privacy', label: 'Content & Privacy', icon: Shield },
  { id: 'family', label: 'Family', icon: Users },
];

const ZScreenTimeWindow: React.FC<ZScreenTimeWindowProps> = ({ onClose, onFocus }) => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const [downtimeEnabled, setDowntimeEnabled] = useState(true);
  const [downtimeStart, setDowntimeStart] = useState('22:00');
  const [downtimeEnd, setDowntimeEnd] = useState('07:00');
  const [contentRestrictions, setContentRestrictions] = useState({
    explicitContent: false,
    webContent: true,
    appStore: true,
    privacy: true,
  });

  // Calculate comparison to previous week
  const weekComparison = useMemo(() => {
    const thisWeek = mockDailyData.reduce((sum, d) => sum + d.hours, 0);
    const lastWeek = 28.5; // Mock previous week data
    const diff = thisWeek - lastWeek;
    const percentChange = ((diff / lastWeek) * 100).toFixed(0);
    return { thisWeek, lastWeek, diff, percentChange, increased: diff > 0 };
  }, []);

  const totalPickups = mockPickupsData.reduce((sum, d) => sum + d.pickups, 0);
  const avgPickups = Math.round(totalPickups / 7);
  const totalNotifications = mockNotificationsData.reduce((sum, d) => sum + d.count, 0);

  const renderSidebar = () => (
    <div className="w-[200px] bg-gray-100 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
      <div className="p-4 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Screen Time</h2>
            <p className="text-xs text-gray-500">Today: 4h 32m</p>
          </div>
        </div>
      </div>

      <Separator className="mx-0 my-2 bg-gray-200 dark:bg-gray-700" />

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                w-full flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer text-sm transition-colors
                ${isActive
                  ? 'bg-purple-500 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'}
              `}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-gray-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Header with date navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
            <ChevronLeft className="w-5 h-5 text-gray-500" />
          </button>
          <h3 className="font-semibold text-gray-900 dark:text-white">This Week</h3>
          <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'daily' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('daily')}
          >
            Daily
          </Button>
          <Button
            variant={viewMode === 'weekly' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('weekly')}
          >
            Weekly
          </Button>
        </div>
      </div>

      {/* Usage Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">Screen Time</h4>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {weekComparison.thisWeek.toFixed(1)}h
              <span className="text-sm font-normal text-gray-500 ml-2">this week</span>
            </p>
          </div>
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm ${
            weekComparison.increased
              ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
              : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
          }`}>
            {weekComparison.increased ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {weekComparison.percentChange}% vs last week
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={viewMode === 'daily' ? mockDailyData : mockWeeklyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis
              dataKey={viewMode === 'daily' ? 'day' : 'week'}
              stroke="#9ca3af"
              fontSize={12}
            />
            <YAxis
              stroke="#9ca3af"
              fontSize={12}
              tickFormatter={(v) => `${v}h`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#fff'
              }}
              formatter={(value: number) => [`${value}h`, 'Screen Time']}
            />
            <Bar
              dataKey="hours"
              radius={[4, 4, 0, 0]}
            >
              {mockDailyData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || '#8b5cf6'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pickups & Notifications */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <Smartphone className="w-5 h-5 text-blue-500" />
            <h4 className="font-medium text-gray-900 dark:text-white">Pickups</h4>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalPickups}</p>
          <p className="text-sm text-gray-500">Avg {avgPickups}/day</p>
          <div className="mt-3 h-16">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockPickupsData}>
                <Bar dataKey="pickups" fill="#3b82f6" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-5 h-5 text-orange-500" />
            <h4 className="font-medium text-gray-900 dark:text-white">Notifications</h4>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalNotifications}</p>
          <p className="text-sm text-gray-500">This week</p>
          <div className="mt-3 space-y-1">
            {mockNotificationsData.slice(0, 3).map((item) => (
              <div key={item.app} className="flex items-center justify-between text-xs">
                <span className="text-gray-600 dark:text-gray-400">{item.app}</span>
                <span className="text-gray-900 dark:text-white font-medium">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Most Used Apps */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <h4 className="font-medium text-gray-900 dark:text-white mb-4">Most Used</h4>
        <div className="space-y-3">
          {mockAppUsage.slice(0, 5).map((app) => {
            const Icon = app.icon;
            return (
              <div key={app.name} className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${app.color}20` }}
                >
                  <Icon className="w-4 h-4" style={{ color: app.color }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{app.name}</span>
                    <span className="text-sm text-gray-500">{app.time}</span>
                  </div>
                  <Progress value={app.percent} className="h-1.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderAppUsage = () => (
    <div className="space-y-6">
      <h3 className="font-semibold text-gray-900 dark:text-white text-lg">App Usage</h3>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <div className="space-y-4">
          {mockAppUsage.map((app) => {
            const Icon = app.icon;
            return (
              <div key={app.name} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${app.color}20` }}
                >
                  <Icon className="w-6 h-6" style={{ color: app.color }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white">{app.name}</span>
                      <span className="text-xs text-gray-500 ml-2">{app.category}</span>
                    </div>
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">{app.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${app.percent}%`, backgroundColor: app.color }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-8">{app.percent}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Categories breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <h4 className="font-medium text-gray-900 dark:text-white mb-4">By Category</h4>
        <div className="grid grid-cols-2 gap-4">
          {['Social', 'Productivity', 'Entertainment', 'Games'].map((cat) => (
            <div key={cat} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-sm text-gray-500">{cat}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {cat === 'Social' && '3h 05m'}
                {cat === 'Productivity' && '2h 45m'}
                {cat === 'Entertainment' && '1h 05m'}
                {cat === 'Games' && '45m'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDowntime = () => (
    <div className="space-y-6">
      <h3 className="font-semibold text-gray-900 dark:text-white text-lg">Downtime</h3>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Moon className="w-5 h-5 text-purple-500" />
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Scheduled Downtime</h4>
              <p className="text-sm text-gray-500">Only allowed apps will be available</p>
            </div>
          </div>
          <Switch
            checked={downtimeEnabled}
            onCheckedChange={setDowntimeEnabled}
          />
        </div>

        {downtimeEnabled && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">From</span>
              <input
                type="time"
                value={downtimeStart}
                onChange={(e) => setDowntimeStart(e.target.value)}
                className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">To</span>
              <input
                type="time"
                value={downtimeEnd}
                onChange={(e) => setDowntimeEnd(e.target.value)}
                className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">Days</span>
              <div className="flex gap-1">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                  <button
                    key={i}
                    className={`w-7 h-7 rounded-full text-xs font-medium ${
                      i === 0 || i === 6
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <Ban className="w-5 h-5 text-red-500" />
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">Block at Downtime</h4>
            <p className="text-sm text-gray-500">Block at end of limit</p>
          </div>
        </div>
        <Switch defaultChecked />
      </div>
    </div>
  );

  const renderLimits = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 dark:text-white text-lg">App Limits</h3>
        <Button size="sm" variant="outline">
          <Plus className="w-4 h-4 mr-1" />
          Add Limit
        </Button>
      </div>

      <div className="space-y-3">
        {mockAppLimits.map((limit) => (
          <div
            key={limit.name}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">{limit.name}</h4>
                <p className="text-sm text-gray-500">Daily limit: {limit.limit}</p>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs ${
                limit.exceeded
                  ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                  : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
              }`}>
                {limit.exceeded ? 'Exceeded' : 'Within limit'}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full ${limit.exceeded ? 'bg-red-500' : 'bg-green-500'}`}
                  style={{ width: limit.exceeded ? '100%' : '65%' }}
                />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">{limit.used}</span>
            </div>
            <div className="flex items-center justify-end gap-2 mt-3">
              <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <Minus className="w-4 h-4 text-gray-500" />
              </button>
              <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <Plus className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAlwaysAllowed = () => (
    <div className="space-y-6">
      <h3 className="font-semibold text-gray-900 dark:text-white text-lg">Always Allowed</h3>
      <p className="text-sm text-gray-500">These apps are available during Downtime and after App Limits expire.</p>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <h4 className="font-medium text-gray-900 dark:text-white mb-4">Allowed Apps</h4>
        <div className="space-y-2">
          {mockAlwaysAllowed.map((app) => {
            const Icon = app.icon;
            return (
              <div
                key={app.name}
                className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">{app.name}</span>
                </div>
                <Check className="w-5 h-5 text-green-500" />
              </div>
            );
          })}
        </div>
        <Button variant="outline" className="w-full mt-4">
          <Plus className="w-4 h-4 mr-2" />
          Add App
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">Allowed Contacts</h4>
            <p className="text-sm text-gray-500">Everyone</p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
      </div>
    </div>
  );

  const renderPrivacy = () => (
    <div className="space-y-6">
      <h3 className="font-semibold text-gray-900 dark:text-white text-lg">Content & Privacy Restrictions</h3>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-blue-500" />
            <h4 className="font-medium text-gray-900 dark:text-white">Content & Privacy Restrictions</h4>
          </div>
          <Switch
            checked={contentRestrictions.privacy}
            onCheckedChange={(v) => setContentRestrictions({ ...contentRestrictions, privacy: v })}
          />
        </div>
      </div>

      {contentRestrictions.privacy && (
        <div className="space-y-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-purple-500" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">App Store Purchases</h4>
                  <p className="text-sm text-gray-500">Require password for purchases</p>
                </div>
              </div>
              <Switch
                checked={contentRestrictions.appStore}
                onCheckedChange={(v) => setContentRestrictions({ ...contentRestrictions, appStore: v })}
              />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-orange-500" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Explicit Content</h4>
                  <p className="text-sm text-gray-500">Block music, movies & TV with explicit content</p>
                </div>
              </div>
              <Switch
                checked={contentRestrictions.explicitContent}
                onCheckedChange={(v) => setContentRestrictions({ ...contentRestrictions, explicitContent: v })}
              />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-green-500" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Web Content</h4>
                  <p className="text-sm text-gray-500">Limit adult websites</p>
                </div>
              </div>
              <Switch
                checked={contentRestrictions.webContent}
                onCheckedChange={(v) => setContentRestrictions({ ...contentRestrictions, webContent: v })}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderFamily = () => (
    <div className="space-y-6">
      <h3 className="font-semibold text-gray-900 dark:text-white text-lg">Family Sharing</h3>
      <p className="text-sm text-gray-500">View and manage Screen Time for family members.</p>

      <div className="space-y-3">
        {mockFamilyMembers.map((member) => (
          <div
            key={member.name}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                {member.avatar}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-white">{member.name}</h4>
                <p className="text-sm text-gray-500">Screen Time: {member.screenTime}</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm ${
                member.status === 'Under limit'
                  ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {member.status}
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                View Activity
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                Set Limits
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Button variant="outline" className="w-full">
        <Plus className="w-4 h-4 mr-2" />
        Add Family Member
      </Button>
    </div>
  );

  const renderContent = () => {
    const contentClass = 'bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 h-full overflow-y-auto';

    switch (activeTab) {
      case 'overview':
        return <div className={contentClass}>{renderOverview()}</div>;
      case 'appUsage':
        return <div className={contentClass}>{renderAppUsage()}</div>;
      case 'downtime':
        return <div className={contentClass}>{renderDowntime()}</div>;
      case 'limits':
        return <div className={contentClass}>{renderLimits()}</div>;
      case 'alwaysAllowed':
        return <div className={contentClass}>{renderAlwaysAllowed()}</div>;
      case 'privacy':
        return <div className={contentClass}>{renderPrivacy()}</div>;
      case 'family':
        return <div className={contentClass}>{renderFamily()}</div>;
      default:
        return null;
    }
  };

  return (
    <ZWindow
      title="Screen Time"
      onClose={onClose}
      onFocus={onFocus}
      initialPosition={{ x: 120, y: 60 }}
      initialSize={{ width: 850, height: 620 }}
      windowType="default"
      className="z-50"
    >
      <div className="flex h-full bg-gray-100 dark:bg-gray-900 overflow-hidden">
        {renderSidebar()}
        <div className="flex-1 p-4 overflow-hidden">
          {renderContent()}
        </div>
      </div>
    </ZWindow>
  );
};

export default ZScreenTimeWindow;
