'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent
} from '@/components/ui/sheet';
import { toast } from '@/components/ui/sonner';
import { useMediaQuery } from '@/hooks/use-media-query';
import { EventItem, registerForEvent, Registration, Ticket } from '@/lib/api';
import { formatEventDate, formatEventTime } from '@/lib/utils';
import {
  ArrowRight,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  Info,
  MapPin,
  ShieldCheck,
  ShoppingBag,
  Ticket as TicketIcon
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

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

function getTicketSaleStatus(ticket: Ticket, isEventPast: boolean) {
  if (isEventPast) {
    return {
      status: 'ended' as const,
      badgeText: 'Event Ended',
      badgeClass: 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30',
      canPurchase: false,
    };
  }

  const now = new Date();
  const saleStart = ticket.saleStartAt ? new Date(ticket.saleStartAt) : null;
  const saleEnd = ticket.saleEndAt ? new Date(ticket.saleEndAt) : null;

  if (saleStart && !isNaN(saleStart.getTime()) && now < saleStart) {
    const formatted = saleStart.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
    return {
      status: 'upcoming' as const,
      badgeText: `Sale opens ${formatted}`,
      badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      canPurchase: false,
    };
  }

  if (saleEnd && !isNaN(saleEnd.getTime()) && now > saleEnd) {
    return {
      status: 'ended' as const,
      badgeText: 'Sale Ended',
      badgeClass: 'bg-red-500/20 text-red-300 border-red-500/30',
      canPurchase: false,
    };
  }

  if (saleEnd && !isNaN(saleEnd.getTime())) {
    const formatted = saleEnd.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    return {
      status: 'presale' as const,
      badgeText: `Presale ends ${formatted}`,
      badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      canPurchase: true,
    };
  }

  return {
    status: 'open' as const,
    badgeText: null,
    badgeClass: '',
    canPurchase: true,
  };
}

export default function RsvpModal({
  event,
  isOpen,
  onClose,
  onSuccess,
  initialTicketId,
  selectedMerchandise = [],
}: RsvpModalProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [mounted, setMounted] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const isPast = event.endAt ? new Date() > new Date(event.endAt) : false;

  const firstPurchasable =
    event.tickets?.find((t) => getTicketSaleStatus(t, isPast).canPurchase) ||
    event.tickets?.[0];

  const [selectedTicketId, setSelectedTicketId] = useState<string>(
    initialTicketId || firstPurchasable?.id || ''
  );
  const [projectIdea, setProjectIdea] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedRegistration, setConfirmedRegistration] = useState<Registration | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (initialTicketId) {
      setSelectedTicketId(initialTicketId);
    } else if (firstPurchasable?.id) {
      setSelectedTicketId(firstPurchasable.id);
    }
  }, [initialTicketId, firstPurchasable?.id]);

  const activeTicket = event.tickets?.find((t) => t.id === selectedTicketId) || firstPurchasable;
  const activeTicketSaleStatus = activeTicket ? getTicketSaleStatus(activeTicket, isPast) : null;

  const merchTotal = selectedMerchandise.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const ticketPrice = activeTicket?.price || 0;
  const grandTotal = ticketPrice + merchTotal;
  const currency = activeTicket?.currency || selectedMerchandise[0]?.currency || 'IDR';

  const timeFormatted = formatEventTime(event.startAt, event.endAt);
  const dateFormatted = formatEventDate(event.startAt);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPast) {
      toast.error('This event has ended. Registrations are closed.');
      return;
    }
    if (activeTicketSaleStatus && !activeTicketSaleStatus.canPurchase) {
      toast.error(activeTicketSaleStatus.badgeText || 'This ticket is currently unavailable for purchase.');
      return;
    }
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
        notes:
          selectedMerchandise.length > 0
            ? `Add-ons: ${selectedMerchandise.map((m) => `${m.name} (x${m.quantity})`).join(', ')}`
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

  // Body content shared between Desktop Sheet (right drawer) and Mobile Drawer (bottom sheet)
  const renderContent = () => {
    if (confirmedRegistration) {
      return (
        <div className="flex flex-col h-full min-h-0 overflow-hidden">
          {/* <div className="flex justify-end p-3 border-b border-white/[0.08] flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div> */}
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain text-center py-6 px-6 space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              {confirmedRegistration.status === 'APPROVED' ? (
                <CheckCircle2 className="w-8 h-8" />
              ) : (
                <Clock className="w-8 h-8 text-amber-400" />
              )}
            </div>

            <div>
              <h2 className="text-2xl font-extrabold text-white">
                {confirmedRegistration.status === 'APPROVED'
                  ? 'Registration Confirmed!'
                  : 'Application Submitted!'}
              </h2>
              <p className="text-xs sm:text-sm text-white/60 mt-2 max-w-sm mx-auto leading-relaxed">
                {confirmedRegistration.status === 'APPROVED'
                  ? `You are on the list for ${event.name}. Check your email for event updates and entry details.`
                  : `Your request to join ${event.name} has been sent to the host for approval.`}
              </p>
            </div>

            {/* QR Code Pass */}
            {confirmedRegistration.qrCode && (
              <div className="p-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl max-w-xs mx-auto text-center space-y-2.5 shadow-xl">
                <div className="w-44 h-44 bg-white p-2.5 rounded-xl mx-auto overflow-hidden">
                  <img
                    src={confirmedRegistration.qrCode}
                    alt="Ticket QR Code"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="text-[11px] font-mono text-white/50 tracking-wider">
                  {confirmedRegistration.ticketKey}
                </div>
                <Badge variant="brand" className="text-xs font-semibold">
                  {confirmedRegistration.ticket?.name || activeTicket?.name || 'General Admission'}
                </Badge>
              </div>
            )}

            {/* Confirmed Merchandise Add-ons Summary */}
            {selectedMerchandise.length > 0 && (
              <div className="p-3.5 bg-white/[0.03] border border-white/[0.08] rounded-xl max-w-sm mx-auto text-left">
                <div className="text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-purple-400" />
                  <span>Included Merchandise</span>
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
            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center pb-6">
              <Button asChild variant="default" size="sm" className="gap-2 font-semibold">
                <a href={getGoogleCalendarUrl()} target="_blank" rel="noopener noreferrer">
                  <CalendarIcon className="w-4 h-4" />
                  Add to Google Calendar
                </a>
              </Button>
              <Button variant="secondary" size="sm" onClick={onClose} className="font-semibold">
                Done
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <form
        onSubmit={handleSubmit}
        className="flex flex-col h-full min-h-0 overflow-hidden"
      >
        {/* Header Summary with Close button */}
        <div className="px-5 sm:px-6 pt-3 sm:pt-4 pb-3 border-b border-white/[0.08] space-y-1.5 flex-shrink-0 relative">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="brand">
                {Array.isArray(event.category)
                  ? event.category.map((c) => (c.startsWith('#') ? c : `#${c}`)).join(' ')
                  : event.category?.startsWith('#')
                    ? event.category
                    : event.category
                      ? `#${event.category}`
                      : 'Event'}
              </Badge>

              <span className="text-xs text-white/40 font-mono">
                {dateFormatted} · {timeFormatted}
              </span>
            </div>

            {/* <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button> */}
          </div>

          <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight leading-snug">
            {event.name}
          </h2>

          <div className="flex items-center gap-3 text-xs text-white/60">
            <span>Hosted by <strong className="text-white/90">{event.host?.name || 'Community Host'}</strong></span>
            {event.city && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-white/40" />
                {event.city}
              </span>
            )}
          </div>
        </div>

        {error && (
          <div className="mx-5 sm:mx-6 mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex-shrink-0">
            {error}
          </div>
        )}

        {/* Scrollable Form Body - min-h-0 enables flex child scrolling */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 sm:px-6 py-4 space-y-5 scrollbar-thin">
          {/* Detailed Ticket Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white/80 uppercase tracking-wider flex items-center gap-1.5">
                <TicketIcon className="w-3.5 h-3.5 text-blue-400" />
                <span>Select Ticket Tier</span>
              </label>
              <span className="text-[11px] text-white/40">
                {event.tickets?.length || 1} tier{(event.tickets?.length || 1) > 1 ? 's' : ''} available
              </span>
            </div>

            <div className="space-y-3">
              {event.tickets && event.tickets.length > 0 ? (
                event.tickets.map((t) => {
                  const saleStatus = getTicketSaleStatus(t, isPast);
                  const isSelected = selectedTicketId === t.id;
                  const isFree = t.price === 0 || t.type === 'free';
                  const remaining = t.capacity
                    ? Math.max(0, t.capacity - (event._count?.registrations || 0))
                    : null;

                  return (
                    <div
                      key={t.id}
                      onClick={() => {
                        if (saleStatus.canPurchase) {
                          setSelectedTicketId(t.id);
                        } else {
                          toast.info(saleStatus.badgeText || 'This ticket is not currently available');
                        }
                      }}
                      className={`p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer ${!saleStatus.canPurchase
                        ? 'opacity-60 border-white/[0.06] bg-black/40 cursor-not-allowed'
                        : isSelected
                          ? 'border-blue-500/80 bg-blue-500/[0.08] ring-1 ring-blue-500/40 shadow-lg'
                          : 'border-white/[0.08] hover:border-white/20 bg-white/[0.02]'
                        }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${isSelected && saleStatus.canPurchase
                              ? 'border-blue-400 bg-blue-400 text-black'
                              : 'border-white/30 bg-transparent'
                              }`}
                          >
                            {isSelected && saleStatus.canPurchase && (
                              <div className="w-1.5 h-1.5 rounded-full bg-black" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm sm:text-base font-bold text-white">
                                {t.name}
                              </span>

                              {saleStatus.badgeText && (
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${saleStatus.badgeClass}`}
                                >
                                  {saleStatus.badgeText}
                                </span>
                              )}

                              {(t.requireApproval || event.requireApproval) && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-center gap-1">
                                  <ShieldCheck className="w-3 h-3" />
                                  Approval Required
                                </span>
                              )}
                            </div>

                            {/* Spots remaining */}
                            {remaining !== null && (
                              <div className="text-[11px] text-amber-400/90 font-medium mt-0.5">
                                🔥 {remaining} spot{remaining !== 1 ? 's' : ''} left
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <span className="text-sm sm:text-base font-extrabold text-white">
                            {isFree
                              ? 'FREE'
                              : `${t.currency || 'IDR'} ${Number(t.price).toLocaleString()}`}
                          </span>
                        </div>
                      </div>

                      {/* Detail Description Ticket (Always shown clearly with full content) */}
                      {t.description && (
                        <div className="mt-3 pt-2.5 border-t border-white/[0.08]">
                          <div className="text-[10px] font-bold text-white/50 uppercase tracking-wider mb-1 flex items-center gap-1">
                            <Info className="w-3 h-3 text-blue-400" />
                            <span>Ticket Details & Inclusions</span>
                          </div>
                          <p className="text-xs text-white/70 leading-relaxed whitespace-pre-line bg-white/[0.03] p-2.5 rounded-lg border border-white/[0.05]">
                            {t.description}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : activeTicket ? (
                <div className="p-4 rounded-xl border border-white/[0.08] bg-white/[0.02] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">{activeTicket.name}</span>
                    <span className="text-sm font-bold text-white">
                      {activeTicket.price === 0
                        ? 'FREE'
                        : `${activeTicket.currency} ${Number(activeTicket.price).toLocaleString()}`}
                    </span>
                  </div>
                  {activeTicket.description && (
                    <p className="text-xs text-white/70 leading-relaxed whitespace-pre-line pt-2 border-t border-white/[0.08]">
                      {activeTicket.description}
                    </p>
                  )}
                </div>
              ) : null}
            </div>
          </div>

          {/* Selected Merchandise Add-ons Preview */}
          {selectedMerchandise.length > 0 && (
            <div className="p-4 rounded-xl bg-purple-500/[0.08] border border-purple-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-purple-400" />
                  <span>Selected Merchandise Add-ons ({selectedMerchandise.reduce((c, m) => c + m.quantity, 0)})</span>
                </span>
                <span className="text-xs font-bold text-purple-200">
                  {currency} {merchTotal.toLocaleString()}
                </span>
              </div>

              <div className="space-y-2 pt-2 border-t border-purple-500/20">
                {selectedMerchandise.map((m) => (
                  <div key={m.id} className="flex items-center justify-between text-xs">
                    <span className="text-white/90">
                      {m.name} <span className="text-purple-300/80 font-mono font-bold">×{m.quantity}</span>
                    </span>
                    <span className="font-semibold text-white/90">
                      {m.price === 0 ? 'Free' : `${currency} ${(m.price * m.quantity).toLocaleString()}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Order Summary Breakdown */}
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08] text-xs space-y-2">
            <div className="flex justify-between text-white/70">
              <span>{activeTicket?.name || 'Selected Ticket'}</span>
              <span className="font-semibold text-white">
                {ticketPrice === 0 ? 'FREE' : `${currency} ${ticketPrice.toLocaleString()}`}
              </span>
            </div>

            {selectedMerchandise.length > 0 && (
              <div className="flex justify-between text-white/70">
                <span>Merchandise Add-ons</span>
                <span className="font-semibold text-purple-300">
                  +{currency} {merchTotal.toLocaleString()}
                </span>
              </div>
            )}

            <div className="border-t border-white/[0.08] pt-2 flex justify-between font-bold text-white text-sm">
              <span>Total Amount</span>
              <span className="text-emerald-400 font-mono text-base">
                {grandTotal === 0 ? 'FREE' : `${currency} ${grandTotal.toLocaleString()}`}
              </span>
            </div>
          </div>

          {/* Registrant Contact Information */}
          <div className="space-y-4 pt-1 border-t border-white/[0.08]">
            <h3 className="text-xs font-bold text-white/80 uppercase tracking-wider">
              Registrant Details
            </h3>

            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1.5">
                Full Name <span className="text-red-400">*</span>
              </label>
              <Input
                type="text"
                required
                placeholder="e.g. Satoshi Nakamoto"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-white/[0.04] border-white/10 text-white placeholder:text-white/30 h-10"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1.5">
                Email Address <span className="text-red-400">*</span>
              </label>
              <Input
                type="email"
                required
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/[0.04] border-white/10 text-white placeholder:text-white/30 h-10"
              />
              <p className="text-[11px] text-white/40 mt-1">
                Tickets, approvals, and location notifications will be sent to this email.
              </p>
            </div>

            {/* Optional Registration Question */}
            {event.requireApproval && (
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1.5">
                  Why do you want to join? / Project Idea
                </label>
                <textarea
                  rows={3}
                  placeholder="Tell the host a bit about yourself or why you'd like to attend..."
                  value={projectIdea}
                  onChange={(e) => setProjectIdea(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none placeholder:text-white/30 leading-relaxed"
                />
              </div>
            )}
          </div>
        </div>

        {/* Sticky Drawer Footer - Fixed at bottom of drawer, ALWAYS visible */}
        <div className="p-4 sm:p-5 border-t border-white/[0.08] bg-[#161b22] flex-shrink-0 z-20 pb-7 sm:pb-5 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
          <Button
            type="submit"
            disabled={
              isSubmitting ||
              isPast ||
              (activeTicketSaleStatus ? !activeTicketSaleStatus.canPurchase : false)
            }
            className="w-full py-5 sm:py-6 text-sm sm:text-base font-extrabold flex items-center justify-center gap-2 bg-white text-black hover:bg-white/90 shadow-xl transition-all active:scale-[0.99] disabled:opacity-40 cursor-pointer"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>Processing RSVP...</span>
              </div>
            ) : isPast ? (
              <span>Event Ended</span>
            ) : activeTicketSaleStatus && !activeTicketSaleStatus.canPurchase ? (
              <span>{activeTicketSaleStatus.badgeText || 'Ticket Unavailable'}</span>
            ) : activeTicket?.requireApproval || event.requireApproval ? (
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

          <p className="text-[10px] text-white/40 text-center mt-2">
            🔒 By continuing, you agree to event terms and organizer updates.
          </p>
        </div>
      </form>
    );
  };

  // Until mounted, do not render client-specific drawer to avoid hydration mismatch
  if (!mounted) return null;

  // Desktop View: Drawer slides in from the RIGHT with scrollable content
  if (isDesktop) {
    return (
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-lg md:max-w-xl h-full p-0 flex flex-col bg-[#161b22] border-l border-white/10 text-white shadow-2xl focus:outline-none overflow-hidden"
        >
          {renderContent()}
        </SheetContent>
      </Sheet>
    );
  }

  // Mobile View: Drawer slides up from the BOTTOM with drag handle
  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="p-0 flex flex-col h-[88vh] max-h-[90dvh] bg-[#161b22] border-t border-white/10 text-white rounded-t-2xl focus:outline-none overflow-hidden">
        {renderContent()}
      </DrawerContent>
    </Drawer>
  );
}
