
import React, { useState } from 'react';
import { format, addDays } from 'date-fns';
import { Calendar } from './ui/calendar';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { CalendarClock, Users } from 'lucide-react';
import ZWindow from './ZWindow';

const timeSlots = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
  '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM',
  '5:00 PM', '5:30 PM'
];

interface ZCalendarWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

const ZCalendarWindow: React.FC<ZCalendarWindowProps> = ({ onClose }) => {
  const [date, setDate] = useState<Date>(addDays(new Date(), 1));
  const [timeSlot, setTimeSlot] = useState('10:00 AM');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleScheduleMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !timeSlot || !name || !email) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setSubmitting(true);
    
    // This would typically connect to a calendar API or send a meeting request
    // For demo purposes, we'll simulate the scheduling
    setTimeout(() => {
      setSubmitting(false);
      toast.success('Meeting scheduled successfully!');
      // Meeting data: date, time, name, email, description - ready for backend integration
    }, 1500);
  };

  return (
    <ZWindow
      title="Calendar"
      onClose={onClose}
      initialPosition={{ x: 150, y: 100 }}
      initialSize={{ width: 700, height: 600 }}
      windowType="default"
      className="bg-white/95"
    >
      <div className="h-full flex flex-col">
        <div className="bg-gray-100 border-b border-gray-200 p-2 flex justify-between items-center">
          <h2 className="font-medium">Schedule a Meeting</h2>
          <Button
            size="sm"
            className="bg-blue-500 hover:bg-blue-600 text-white"
            onClick={handleScheduleMeeting}
            disabled={submitting}
          >
            <CalendarClock className="h-4 w-4 mr-1" />
            Schedule
          </Button>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <form onSubmit={handleScheduleMeeting} className="space-y-4">
            <div className="flex gap-4">
              <div className="w-1/2">
                <Label>Select Date</Label>
                <div className="mt-2 border rounded-md overflow-hidden">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => date && setDate(date)}
                    disabled={(date) => date < new Date()}
                    className="rounded-md border"
                  />
                </div>
              </div>
              
              <div className="w-1/2 space-y-4">
                <div>
                  <Label>Select Time</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {timeSlots.map((time) => (
                      <Button
                        key={time}
                        type="button"
                        variant={timeSlot === time ? "default" : "outline"}
                        className="text-xs h-8"
                        onClick={() => setTimeSlot(time)}
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="name">Your Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1"
                    placeholder="Enter your name"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Your Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Meeting Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1"
                placeholder="What would you like to discuss?"
                rows={3}
              />
            </div>
            
            <div className="bg-blue-50 p-3 rounded-md">
              <h3 className="text-sm font-medium flex items-center">
                <Users className="h-4 w-4 mr-1 text-blue-500" />
                Meeting Details
              </h3>
              <p className="text-sm mt-2">
                Your meeting with <strong>ZeeKay AI</strong> is scheduled for{' '}
                <strong>{date ? format(date, 'EEEE, MMMM d, yyyy') : 'TBD'}</strong> at{' '}
                <strong>{timeSlot}</strong>.
              </p>
              <p className="text-sm mt-1 text-gray-600">
                You'll receive a confirmation email with meeting details once scheduled.
              </p>
            </div>
          </form>
        </div>
      </div>
    </ZWindow>
  );
};

export default ZCalendarWindow;
