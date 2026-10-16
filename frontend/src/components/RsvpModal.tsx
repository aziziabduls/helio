'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Calendar as CalendarIcon,
  ArrowRight,
} from 'lucide-react';
import { EventItem, registerForEvent, Registration } from '@/lib/api';
import { toast } from '@/components/ui/sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export interface SelectedMerchItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  currency: string;
  imageUrl?: string;
}

interface RsvpModalProps {
  event: EventItem;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialTicketId?: string;
  selectedMerchandise?: SelectedMerchItem[];
}

export default function RsvpModal({
  event,
  isOpen,
  onClose,
  onSuccess,
  initialTicketId,
  selectedMerchandise = [],
}: RsvpModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedTicketId, setSelectedTicketId] = useState<string>(
    initialTicketId || event.tickets[0]?.id || ''
  );
  const [projectIdea, setProjectIdea] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedRegistration, setConfirmedRegistration] = useState<Registration | null>(null);

  React.useEffect(() => {
    if (initialTicketId) {
      setSelectedTicketId(initialTicketId);
    } else if (event.tickets[0]?.id) {
      setSelectedTicketId(event.tickets[0].id);
    }
  }, [initialTicketId, event]);

  const activeTicket = event.tickets.find((t) => t.id === selectedTicketId) || event.tickets[0];

  const merchTotal = selectedMerchandise.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const ticketPrice = activeTicket?.price || 0;
  const grandTotal = ticketPrice + merchTotal;
  const currency = activeTicket?.currency || selectedMerchandise[0]?.currency || 'IDR';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const reg = await registerForEvent(event.id, {
        name,
        email,
        ticketId: selectedTicketId,
        answers: {
          ...(projectIdea ? { projectIdea } : {}),
          ...(selectedMerchandise.length > 0 ? { merchandise: selectedMerchandise } : {}),
        },
        notes: selectedMerchandise.length > 0
          ? `Add-ons: ${selectedMerchandise.map(m => `${m.name} (x${m.quantity})`).join(', ')}`
          : undefined,
      });
      setConfirmedRegistration(reg);
      toast.success(
        reg.status === 'APPROVED'
          ? 'Registration confirmed!'
          : 'Request submitted! Awaiting host approval.'
      );
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const errMsg = err.message || 'Failed to submit registration';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getGoogleCalendarUrl = () => {
    const startIso = new Date(event.startAt).toISOString().replace(/-|:|\.\d\d\d/g, '');
    const endIso = new Date(event.endAt).toISOString().replace(/-|:|\.\d\d\d/g, '');
    const title = encodeURIComponent(event.name);
    const details = encodeURIComponent(event.description);
    const location = encodeURIComponent(event.address || event.city || '');
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${endIso}&details=${details}&location=${location}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-[#161b22] border-white/[0.1] text-white">
        {confirmedRegistration ? (
          /* Confirmation Screen */
          <div className="text-center py-4 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              {confirmedRegistration.status === 'APPROVED' ? (
                <CheckCircle2 className="w-8 h-8" />
              ) : (
                <Clock className="w-8 h-8 text-amber-400" />
              )}
            </div>

            <div>
              <DialogTitle className="text-xl font-bold text-white text-center">
                {confirmedRegistration.status === 'APPROVED'
                  ? 'Registration Confirmed!'
                  : 'Application Submitted!'}
              </DialogTitle>
              <p className="text-xs sm:text-sm text-white/60 mt-1 max-w-sm mx-auto">
                {confirmedRegistration.status === 'APPROVED'
                  ? `You are on the list for ${event.name}. Check your email for event updates.`
                  : `Your request to join ${event.name} has been sent to the host for approval.`}
              </p>
            </div>

            {/* QR Code Pass */}
            {confirmedRegistration.qrCode && (
              <div className="p-4 bg-white/[0.03] border border-white/[0.08] rounded-xl max-w-xs mx-auto text-center space-y-2">
                <div className="w-40 h-40 bg-white p-2 rounded-lg mx-auto overflow-hidden">
                  <img
                    src={confirmedRegistration.qrCode}
                    alt="Ticket QR Code"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="text-[11px] font-mono text-white/40">
                  {confirmedRegistration.ticketKey}
                </div>
                <Badge variant="brand">
                  {confirmedRegistration.ticket?.name || activeTicket?.name || 'General Admission'}
                </Badge>
              </div>
            )}

            {/* Confirmed Merchandise Add-ons Summary */}
            {selectedMerchandise.length > 0 && (
              <div className="p-3 bg-white/[0.03] border border-white/[0.08] rounded-xl max-w-xs mx-auto text-left">
                <div className="text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span>🛍️ Included Merchandise</span>
                </div>
                <div className="space-y-1.5">
                  {selectedMerchandise.map((m) => (
                    <div key={m.id} className="flex items-center justify-between text-xs">
                      <span className="text-white/80 truncate">
                        {m.name} <span className="text-white/40">× {m.quantity}</span>
                      </span>
                      <span className="font-semibold text-white/90 ml-2">
                        {m.price === 0 ? 'Free' : `${currency} ${(m.price * m.quantity).toLocaleString()}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Calendar CTA */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild variant="default" size="sm" className="gap-2">
                <a href={getGoogleCalendarUrl()} target="_blank" rel="noopener noreferrer">
                  <CalendarIcon className="w-4 h-4" />
                  Add to Google Calendar
                </a>
              </Button>
              <Button variant="secondary" size="sm" onClick={onClose}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          /* Form Screen */
          <div>
            <DialogHeader className="mb-4">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="brand">
                  {Array.isArray(event.category)
                    ? event.category.map((c) => (c.startsWith('#') ? c : `#${c}`)).join(' ')
                    : event.category?.startsWith('#')
                    ? event.category
                    : event.category
                    ? `#${event.category}`
                    : ''}
                </Badge>
              </div>
              <DialogTitle className="text-xl font-bold text-white text-left">
                {event.name}
              </DialogTitle>
              <p className="text-xs text-white/50 text-left">
                Hosted by {event.host.name}
              </p>
            </DialogHeader>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Ticket Selection if multiple tickets */}
              {event.tickets && event.tickets.length > 1 ? (
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1.5">
                    Select Ticket Type
                  </label>
                  <div className="space-y-2">
                    {event.tickets.map((t) => (
                      <label
                        key={t.id}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                          selectedTicketId === t.id
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-white/[0.08] hover:border-white/20 bg-white/[0.02]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="radio"
                            name="ticket"
                            value={t.id}
                            checked={selectedTicketId === t.id}
                            onChange={() => setSelectedTicketId(t.id)}
                            className="text-blue-500 focus:ring-0"
                          />
                          <div>
                            <div className="text-xs sm:text-sm font-semibold text-white">
                              {t.name}
                            </div>
                            {t.description && (
                              <div className="text-[11px] text-white/50">{t.description}</div>
                            )}
                          </div>
                        </div>
                        <span className="text-xs font-bold text-white/80">
                          {t.price === 0
                            ? 'Free'
                            : t.currency === 'IDR'
                            ? `Rp ${Number(t.price).toLocaleString()}`
                            : `$${Number(t.price).toLocaleString()}`}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ) : (
                activeTicket && (
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between">
                    <div>
                      <div className="text-xs text-white/40">Selected Ticket</div>
                      <div className="text-sm font-semibold text-white">{activeTicket.name}</div>
                    </div>
                    <span className="text-xs font-bold text-white/90">
                      {activeTicket.price === 0 ? 'FREE' : `${activeTicket.currency} ${Number(activeTicket.price).toLocaleString()}`}
                    </span>
                  </div>
                )
              )}

              {/* Selected Merchandise Add-ons Preview */}
              {selectedMerchandise.length > 0 && (
                <div className="p-3.5 rounded-xl bg-purple-500/[0.07] border border-purple-500/20 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                      <span>🛍️</span>
                      <span>Selected Add-ons ({selectedMerchandise.reduce((c, m) => c + m.quantity, 0)})</span>
                    </span>
                    <span className="text-xs font-semibold text-purple-200">
                      {currency} {merchTotal.toLocaleString()}
                    </span>
                  </div>

                  <div className="space-y-1.5 pt-1 border-t border-purple-500/20">
                    {selectedMerchandise.map((m) => (
                      <div key={m.id} className="flex items-center justify-between text-xs">
                        <span className="text-white/80">
                          {m.name} <span className="text-purple-300/70 font-mono">×{m.quantity}</span>
                        </span>
                        <span className="text-white/90 font-medium">
                          {m.price === 0 ? 'Free' : `${currency} ${(m.price * m.quantity).toLocaleString()}`}
                        </span>
                      </div>
                    ))}
                  </div>

                  {grandTotal > 0 && (
                    <div className="pt-2 border-t border-purple-500/20 flex items-center justify-between text-xs font-bold">
                      <span className="text-white/90">Total Payable</span>
                      <span className="text-emerald-400 font-mono">
                        {currency} {grandTotal.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. Satoshi Nakamoto"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <Input
                  type="email"
                  required
                  placeholder="you@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Optional Registration Question */}
              {event.requireApproval && (
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">
                    What are you building or hoping to work on?
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Brief description of your project or background..."
                    value={projectIdea}
                    onChange={(e) => setProjectIdea(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none"
                  />
                </div>
              )}

              {/* Submit CTA */}
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-5 text-sm font-bold flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    'Processing...'
                  ) : event.requireApproval ? (
                    <>
                      <span>Request to Join</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : grandTotal > 0 ? (
                    <>
                      <span>Register & Pay {currency} {grandTotal.toLocaleString()}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <span>Complete Registration</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
