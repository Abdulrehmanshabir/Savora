import { Metadata } from 'next';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Contact Us & VIP Dining Inquiries',
  description: 'Reach out to Savora Restaurant for customer inquiries, banquet bookings, private dining events, and catering assistance.',
};

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="container mx-auto px-4 py-20 max-w-6xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Have a question, feedback, or want to make a special request? We'd love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Card className="bg-card border-border/50 shadow-sm">
                <CardContent className="p-6 flex flex-col items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Location</h3>
                    <p className="text-muted-foreground text-sm">123 Culinary Avenue<br/>Food District, NY 10001</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border/50 shadow-sm">
                <CardContent className="p-6 flex flex-col items-start gap-4">
                  <div className="p-3 bg-secondary/10 rounded-full">
                    <Phone className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Phone</h3>
                    <p className="text-muted-foreground text-sm">+1 (555) 123-4567<br/>+1 (555) 987-6543</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border/50 shadow-sm">
                <CardContent className="p-6 flex flex-col items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Email</h3>
                    <p className="text-muted-foreground text-sm">hello@savora.com<br/>reservations@savora.com</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border/50 shadow-sm">
                <CardContent className="p-6 flex flex-col items-start gap-4">
                  <div className="p-3 bg-secondary/10 rounded-full">
                    <Clock className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Hours</h3>
                    <p className="text-muted-foreground text-sm">Mon-Fri: 11AM - 10PM<br/>Sat-Sun: 10AM - 11PM</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-card border border-border/50 rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
            <form className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm font-medium">First Name</label>
                  <input 
                    type="text" 
                    id="firstName" 
                    className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="John"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm font-medium">Last Name</label>
                  <input 
                    type="text" 
                    id="lastName" 
                    className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="Doe"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">Email Address</label>
                <input 
                  type="email" 
                  id="email" 
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="john@example.com"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                <input 
                  type="text" 
                  id="subject" 
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="How can we help you?"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium">Message</label>
                <textarea 
                  id="message" 
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                  placeholder="Your message here..."
                ></textarea>
              </div>

              <Button size="lg" className="w-full rounded-xl py-6 text-lg font-semibold shadow-md">
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
