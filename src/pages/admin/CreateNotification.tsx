import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useNotifications } from '@/contexts/NotificationContext';
import { useToast } from '@/components/ui/use-toast';
import { BellRing } from 'lucide-react';

const CreateNotification = () => {
  const { addNotification } = useNotifications();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  const sendNotification = () => {
    if (!title || !message) {
       toast({ title: "Validation Error", description: "Title and message are required.", variant: "destructive" });
       return;
    }
    
    addNotification(title, message);
    toast({
       title: "Notification Sent",
       description: "Your notification has been broadcasted to users."
    });
    
    setTitle('');
    setMessage('');
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <BellRing className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold font-display text-gray-900">Broadcast Notifications</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Alert</CardTitle>
          <CardDescription>Send real-time alerts to students and teachers in the system.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Notification Title</label>
            <Input 
              placeholder="e.g. Server Maintenance" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Message Body</label>
            <Textarea 
              placeholder="Describe the alert here..." 
              value={message} 
              onChange={e => setMessage(e.target.value)} 
              rows={4}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={sendNotification} className="w-full sm:w-auto">Broadcast Now</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CreateNotification;
