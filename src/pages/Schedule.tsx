import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Video, CheckCircle } from "lucide-react";

interface TimeSlot {
  id: string;
  date: string;
  time: string;
  interviewer: string;
  type: string;
  available: boolean;
}

const availableSlots: TimeSlot[] = [
  { id: "1", date: "2024-01-15", time: "10:00 AM", interviewer: "AI Interviewer", type: "Technical", available: true },
  { id: "2", date: "2024-01-15", time: "11:30 AM", interviewer: "AI Interviewer", type: "HR", available: true },
  { id: "3", date: "2024-01-15", time: "02:00 PM", interviewer: "AI Interviewer", type: "Coding", available: false },
  { id: "4", date: "2024-01-16", time: "09:00 AM", interviewer: "AI Interviewer", type: "Technical", available: true },
  { id: "5", date: "2024-01-16", time: "11:00 AM", interviewer: "AI Interviewer", type: "HR", available: true },
  { id: "6", date: "2024-01-16", time: "03:00 PM", interviewer: "AI Interviewer", type: "Phone Screen", available: true },
  { id: "7", date: "2024-01-17", time: "10:30 AM", interviewer: "AI Interviewer", type: "Technical", available: false },
  { id: "8", date: "2024-01-17", time: "02:30 PM", interviewer: "AI Interviewer", type: "Coding", available: true },
];

export default function Schedule() {
  const [bookedSlot, setBookedSlot] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  };

  const handleBookSlot = (slotId: string) => {
    setBookedSlot(slotId);
  };

  // Group slots by date
  const slotsByDate = availableSlots.reduce((acc, slot) => {
    if (!acc[slot.date]) {
      acc[slot.date] = [];
    }
    acc[slot.date].push(slot);
    return acc;
  }, {} as Record<string, TimeSlot[]>);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Schedule Your
              <span className="text-gradient block mt-2">Mock Interview</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Choose a convenient time slot for your personalized AI interview session
            </p>
          </div>

          {/* Booked Confirmation */}
          {bookedSlot && (
            <Card variant="elevated" className="mb-8 border-success/30">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-success">Interview Scheduled!</h3>
                    <p className="text-sm text-muted-foreground">
                      Your mock interview has been booked. You'll receive a reminder before the session.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Slots by Date */}
          <div className="space-y-8">
            {Object.entries(slotsByDate).map(([date, slots]) => (
              <div key={date}>
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-primary" />
                  <h2 className="font-display text-xl font-semibold">{formatDate(date)}</h2>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {slots.map((slot) => (
                    <Card 
                      key={slot.id} 
                      variant={slot.available ? "interactive" : "default"}
                      className={!slot.available ? "opacity-60" : bookedSlot === slot.id ? "border-success/50" : ""}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-primary" />
                              <span className="font-semibold">{slot.time}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <User className="w-4 h-4" />
                              {slot.interviewer}
                            </div>
                            <div className="flex gap-2">
                              <Badge variant="glass">{slot.type}</Badge>
                              <Badge variant={slot.available ? "success" : "secondary"}>
                                {slot.available ? "Available" : "Booked"}
                              </Badge>
                            </div>
                          </div>
                          
                          <Button 
                            variant={bookedSlot === slot.id ? "success" : slot.available ? "default" : "secondary"}
                            disabled={!slot.available || bookedSlot === slot.id}
                            onClick={() => handleBookSlot(slot.id)}
                          >
                            {bookedSlot === slot.id ? (
                              <>
                                <CheckCircle className="w-4 h-4" />
                                Booked
                              </>
                            ) : slot.available ? (
                              <>
                                <Video className="w-4 h-4" />
                                Book
                              </>
                            ) : (
                              "Unavailable"
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
