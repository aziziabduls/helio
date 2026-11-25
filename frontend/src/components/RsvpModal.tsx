'use client';

import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { toast } from '@/components/ui/sonner';
import { useMediaQuery } from '@/hooks/use-media-query';
import { EventItem, registerForEvent, Registration, Ticket } from '@/lib/api';
import { formatEventDate, formatEventTime } from '@/lib/utils';
import {
  AlertCircle,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldCheck,
  ShoppingBag,
  Ticket as TicketIcon,
  X,
} from 'lucide-react';
import React, { useEffect, useId, useState } from 'react';

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

interface SaleStatus {
  status: 'ended' | 'upcoming' | 'presale' | 'open';
  badgeText: string | null;
  badgeClass: string;
  canPurchase: boolean;
}

function getTicketSaleStatus(ticket: Ticket, isEventPast: boolean): SaleStatus {
  if (isEventPast) {
    return {
      status: 'ended',
      badgeText: 'Event Ended',
      badgeClass: 'bg-[#1A202C] text-[#CBD5E1] border-[#64748B]',
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
      status: 'upcoming',
      badgeText: `Opens ${formatted}`,
      badgeClass: 'bg-amber-950/60 text-[#FCD34D] border-[#FCD34D]/50',
      canPurchase: false,
    };
  }

  if (saleEnd && !isNaN(saleEnd.getTime()) && now > saleEnd) {
    return {
      status: 'ended',
      badgeText: 'Sale Ended',
      badgeClass: 'bg-red-950/60 text-[#FCA5A5] border-[#FCA5A5]/50',
      canPurchase: false,
    };
  }

  if (saleEnd && !isNaN(saleEnd.getTime())) {
    const formatted = saleEnd.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    return {
      status: 'presale',
      badgeText: `Presale ends ${formatted}`,
      badgeClass: 'bg-sky-950/60 text-[#38BDF8] border-[#38BDF8]/60',
      canPurchase: true,
    };
  }

  return {
    status: 'open',
    badgeText: null,
    badgeClass: '',
    canPurchase: true,
  };
}

function formatPrice(amount: number, currency: string) {
  return amount === 0 ? 'FREE' : `${currency} ${Number(amount).toLocaleString()}`;
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

  const formId = useId();
  const nameInputId = `${formId}-name`;
  const emailInputId = `${formId}-email`;
  const notesInputId = `${formId}-notes`;
  const tierGroupLabelId = `${formId}-tier-label`;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [projectIdea, setProjectIdea] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedRegistration, setConfirmedRegistration] = useState<Registration | null>(null);

  const isPast = event.endAt ? new Date() > new Date(event.endAt) : false;
  const tickets = event.tickets ?? [];
  const firstPurchasable =
    tickets.find((t) => getTicketSaleStatus(t, isPast).canPurchase) || tickets[0];

  const [selectedTicketId, setSelectedTicketId] = useState<string>(
    initialTicketId || firstPurchasable?.id || ''
  );

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

  // Reset transient errors when switching events or reopening the modal
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setFieldErrors({});
    }
  }, [isOpen, event.id]);

  const activeTicket = tickets.find((t) => t.id === selectedTicketId) || firstPurchasable;
  const activeTicketSaleStatus = activeTicket ? getTicketSaleStatus(activeTicket, isPast) : null;

  const merchTotal = selectedMerchandise.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const ticketPrice = activeTicket?.price || 0;
  const grandTotal = ticketPrice + merchTotal;
  const currency = activeTicket?.currency || selectedMerchandise[0]?.currency || 'IDR';

  const timeFormatted = formatEventTime(event.startAt, event.endAt);
  const dateFormatted = formatEventDate(event.startAt);
  const needsApproval = Boolean(activeTicket?.requireApproval || event.requireApproval);

  const validateForm = () => {
    const nextErrors: { name?: string; email?: string } = {};
    if (!name.trim()) {
      nextErrors.name = 'Enter your full name to issue your pass.';
    }
    if (!email.trim()) {
      nextErrors.email = 'Enter an email address for ticket delivery.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = 'Enter a valid email address (for example, name@domain.com).';
    }
    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPast) {
      const msg = 'This event has ended. Registrations are closed.';
      setError(msg);
      toast.error(msg);
      return;
    }
    if (!activeTicket) {
      const msg = 'No ticket tier is available for this event.';
      setError(msg);
      toast.error(msg);
      return;
    }
    if (activeTicketSaleStatus && !activeTicketSaleStatus.canPurchase) {
      const msg = activeTicketSaleStatus.badgeText || 'This ticket is currently unavailable.';
      setError(msg);
      toast.error(msg);
      return;
    }
    if (!validateForm()) {
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const reg = await registerForEvent(event.id, {
        name: name.trim(),
        email: email.trim(),
        ticketId: activeTicket.id,
        answers: {
          ...(projectIdea.trim() ? { projectIdea: projectIdea.trim() } : {}),
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
          ? 'Registration confirmed.'
          : 'Request submitted for host approval.'
      );
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to submit registration';
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

  const focusRingClass =
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8] focus-visible:ring-offset-2 focus-visible:ring-offset-[#12161F]';

  const renderMobileCloseButton = () => {
    if (isDesktop) return null;
    return (
      <button
        type="button"
        onClick={onClose}
        aria-label="Close registration drawer"
        className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg border border-[#64748B] bg-[#1A202C] text-[#CBD5E1] hover:bg-[#232B3A] hover:text-[#F8FAFC] active:bg-[#2B3548] transition-colors motion-reduce:transition-none cursor-pointer ${focusRingClass}`}
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    );
  };

  const renderConfirmationView = () => {
    if (!confirmedRegistration) return null;
    const isApproved = confirmedRegistration.status === 'APPROVED';

    return (
      <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[#12161F]">
        <div className="flex items-start justify-between gap-3 border-b border-[#64748B]/60 px-4 py-4 sm:px-6">
          <div className={`min-w-0 ${isDesktop ? 'pr-10' : ''}`}>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#38BDF8]">
              {isApproved ? 'Pass Issued' : 'Request Received'}
            </p>
            <h2 className="mt-1 text-lg font-bold leading-snug text-[#F8FAFC] break-words sm:text-xl">
              {isApproved ? 'You are on the guest list' : 'Awaiting host approval'}
            </h2>
          </div>
          {renderMobileCloseButton()}
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6">
          <div className="mx-auto max-w-md space-y-5 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-200 motion-reduce:animate-none">
            <div className="flex items-start gap-3 rounded-xl border border-[#64748B]/70 bg-[#1A202C] p-4">
              {isApproved ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#6EE7B7]" aria-hidden="true" />
              ) : (
                <Clock className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#FCD34D]" aria-hidden="true" />
              )}
              <p className="text-sm leading-relaxed text-[#CBD5E1]">
                {isApproved
                  ? `Your pass for ${event.name} is ready. Check ${confirmedRegistration.email || email} for event updates.`
                  : `Your request for ${event.name} has been sent to the host. You will receive an email at ${confirmedRegistration.email || email} once reviewed.`}
              </p>
            </div>

            {/* Ticket-stub digital pass card */}
            <div className="relative rounded-2xl border border-[#64748B] bg-[#1A202C] text-left">
              <div className="space-y-2 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-[#94A3B8]">
                      {dateFormatted} · {timeFormatted}
                    </p>
                    <h3 className="mt-1 text-base font-bold text-[#F8FAFC] break-words">
                      {event.name}
                    </h3>
                  </div>
                  <span className="flex-shrink-0 rounded-md border border-[#38BDF8]/60 bg-[#12161F] px-2.5 py-1 text-xs font-semibold text-[#38BDF8]">
                    {confirmedRegistration.ticket?.name || activeTicket?.name || 'General Admission'}
                  </span>
                </div>

                {(event.address || event.city) && (
                  <p className="flex items-center gap-1.5 text-xs text-[#CBD5E1]">
                    <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-[#94A3B8]" aria-hidden="true" />
                    <span className="truncate">{event.address || event.city}</span>
                  </p>
                )}

                <div className="pt-2 text-xs text-[#CBD5E1]">
                  Attendee:{' '}
                  <span className="font-semibold text-[#F8FAFC]">
                    {confirmedRegistration.name || name}
                  </span>
                </div>
              </div>

              {/* Perforated stub divider */}
              <div className="relative flex items-center px-4" aria-hidden="true">
                <div className="-ml-6 h-4 w-4 rounded-full border-r border-[#64748B] bg-[#12161F]" />
                <div className="mx-2 flex-1 border-t border-dashed border-[#64748B]" />
                <div className="-mr-6 h-4 w-4 rounded-full border-l border-[#64748B] bg-[#12161F]" />
              </div>

              <div className="flex flex-col items-center p-5 text-center">
                {confirmedRegistration.qrCode ? (
                  <div className="rounded-xl bg-white p-3">
                    <img
                      src={confirmedRegistration.qrCode}
                      alt={`Entry QR code for ${event.name}`}
                      width={176}
                      height={176}
                      className="h-44 w-44 object-contain"
                    />
                  </div>
                ) : (
                  <p className="rounded-lg border border-[#64748B]/60 bg-[#12161F] px-4 py-3 text-xs text-[#CBD5E1]">
                    {isApproved
                      ? 'Pass code issued below. Present your ticket key at check-in.'
                      : 'QR code will be issued after host approval.'}
                  </p>
                )}

                {confirmedRegistration.ticketKey && (
                  <p className="mt-3 break-all font-mono text-xs tracking-wider text-[#94A3B8]">
                    {confirmedRegistration.ticketKey}
                  </p>
                )}
              </div>
            </div>

            {selectedMerchandise.length > 0 && (
              <div className="rounded-xl border border-[#64748B]/70 bg-[#1A202C] p-4">
                <div className="mb-2.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#CBD5E1]">
                  <ShoppingBag className="h-3.5 w-3.5 text-[#38BDF8]" aria-hidden="true" />
                  <span>Included Add-ons</span>
                </div>
                <div className="space-y-1.5">
                  {selectedMerchandise.map((m) => (
                    <div key={m.id} className="flex items-center justify-between gap-2 text-xs">
                      <span className="min-w-0 truncate text-[#CBD5E1]">
                        {m.name} x{m.quantity}
                      </span>
                      <span className="flex-shrink-0 font-semibold tabular-nums text-[#F8FAFC]">
                        {m.price === 0 ? 'FREE' : `${currency} ${(m.price * m.quantity).toLocaleString()}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2.5 border-t border-[#64748B]/60 bg-[#12161F] px-4 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:flex-row sm:px-6">
          <Button
            asChild
            variant="default"
            className={`min-h-[44px] flex-1 gap-2 rounded-xl bg-[#F8FAFC] font-bold text-[#0F172A] hover:bg-[#E2E8F0] active:bg-[#CBD5E1] cursor-pointer ${focusRingClass}`}
          >
            <a href={getGoogleCalendarUrl()} target="_blank" rel="noopener noreferrer">
              <CalendarIcon className="h-4 w-4" aria-hidden="true" />
              Add to Google Calendar
            </a>
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className={`min-h-[44px] rounded-xl border border-[#64748B] bg-[#1A202C] px-6 font-semibold text-[#F8FAFC] hover:bg-[#232B3A] active:bg-[#2B3548] cursor-pointer ${focusRingClass}`}
          >
            Done
          </Button>
        </div>
      </div>
    );
  };

  const renderFormView = () => {
    const submitDisabled =
      isSubmitting ||
      isPast ||
      !activeTicket ||
      (activeTicketSaleStatus ? !activeTicketSaleStatus.canPurchase : false);

    return (
      <form
        onSubmit={handleSubmit}
        noValidate
        aria-busy={isSubmitting}
        className="flex h-full min-h-0 flex-col overflow-hidden bg-[#12161F]"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-[#64748B]/60 px-4 pt-4 pb-3.5 sm:px-6">
          <div className={`min-w-0 space-y-1.5 ${isDesktop ? 'pr-10' : ''}`}>
            <p className="text-xs font-medium text-[#CBD5E1]">
              {dateFormatted} · {timeFormatted}
            </p>
            <h2 className="text-lg font-extrabold leading-snug tracking-tight text-[#F8FAFC] break-words sm:text-xl">
              {event.name}
            </h2>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#94A3B8]">
              <span>
                Hosted by <strong className="font-semibold text-[#CBD5E1]">{event.host?.name || 'Community Host'}</strong>
              </span>
              {event.city && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-[#94A3B8]" aria-hidden="true" />
                  <span>{event.city}</span>
                </span>
              )}
            </div>
          </div>
          {renderMobileCloseButton()}
        </div>

        {/* Submission / Availability Error Banner */}
        {error && (
          <div
            role="alert"
            className="mx-4 mt-3 flex items-start gap-2.5 rounded-xl border border-[#FCA5A5]/60 bg-red-950/50 px-3.5 py-2.5 text-xs text-[#FCA5A5] sm:mx-6"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Scrollable Body */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-4 pb-8 space-y-6 sm:px-6">
          {/* Ticket Selection */}
          <fieldset className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <legend
                id={tierGroupLabelId}
                className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#CBD5E1]"
              >
                <TicketIcon className="h-3.5 w-3.5 text-[#38BDF8]" aria-hidden="true" />
                <span>Select Ticket</span>
              </legend>
              {tickets.length > 0 && (
                <span className="text-xs text-[#94A3B8]">
                  {tickets.length} {tickets.length === 1 ? 'tier' : 'tiers'}
                </span>
              )}
            </div>

            {tickets.length > 0 ? (
              <div
                role="radiogroup"
                aria-labelledby={tierGroupLabelId}
                className="space-y-2.5"
              >
                {tickets.map((t) => {
                  const saleStatus = getTicketSaleStatus(t, isPast);
                  const isSelected = selectedTicketId === t.id;
                  const isFree = t.price === 0 || t.type === 'free';
                  const remaining = t.capacity
                    ? Math.max(0, t.capacity - (event._count?.registrations || 0))
                    : null;

                  return (
                    <button
                      key={t.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      aria-disabled={!saleStatus.canPurchase}
                      onClick={() => {
                        if (saleStatus.canPurchase) {
                          setSelectedTicketId(t.id);
                          setError(null);
                        } else {
                          toast.info(saleStatus.badgeText || 'This ticket is currently unavailable');
                        }
                      }}
                      className={`w-full rounded-xl border p-3.5 text-left transition-colors motion-reduce:transition-none sm:p-4 ${focusRingClass} ${
                        !saleStatus.canPurchase
                          ? 'cursor-not-allowed border-[#64748B]/40 bg-[#1A202C]/60 opacity-65'
                          : isSelected
                            ? 'cursor-pointer border-[#38BDF8] bg-[#1A202C] ring-1 ring-[#38BDF8]'
                            : 'cursor-pointer border-[#64748B] bg-[#1A202C] hover:border-[#94A3B8] hover:bg-[#202736] active:bg-[#252D3D]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-3">
                          <span
                            aria-hidden="true"
                            className={`mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border ${
                              isSelected && saleStatus.canPurchase
                                ? 'border-[#38BDF8] bg-[#38BDF8]'
                                : 'border-[#94A3B8] bg-transparent'
                            }`}
                          >
                            {isSelected && saleStatus.canPurchase && (
                              <span className="h-1.5 w-1.5 rounded-full bg-[#12161F]" />
                            )}
                          </span>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-bold text-[#F8FAFC] sm:text-base">
                                {t.name}
                              </span>

                              {saleStatus.badgeText && (
                                <span
                                  className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold ${saleStatus.badgeClass}`}
                                >
                                  {saleStatus.badgeText}
                                </span>
                              )}

                              {(t.requireApproval || event.requireApproval) && (
                                <span className="inline-flex items-center gap-1 rounded-md border border-[#FCD34D]/50 bg-amber-950/50 px-2 py-0.5 text-[11px] font-semibold text-[#FCD34D]">
                                  <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                                  Approval required
                                </span>
                              )}
                            </div>

                            {remaining !== null && (
                              <p className="mt-1 text-xs font-medium text-[#CBD5E1]">
                                {remaining === 0
                                  ? 'No spots left'
                                  : `${remaining} ${remaining === 1 ? 'spot' : 'spots'} left`}
                              </p>
                            )}
                          </div>
                        </div>

                        <span className="flex-shrink-0 text-sm font-extrabold tabular-nums text-[#F8FAFC] sm:text-base">
                          {isFree ? 'FREE' : formatPrice(t.price, t.currency || 'IDR')}
                        </span>
                      </div>

                      {t.description && (
                        <p className="mt-3 border-t border-[#64748B]/50 pt-2.5 text-xs leading-relaxed whitespace-pre-line text-[#CBD5E1]">
                          {t.description}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-[#64748B]/70 bg-[#1A202C] p-4 text-xs leading-relaxed text-[#CBD5E1]">
                No ticket tiers are configured for this event yet. Registration will open once the host adds a ticket tier.
              </div>
            )}
          </fieldset>

          {/* Order Summary */}
          {activeTicket && (
            <section
              aria-label="Order summary"
              className="rounded-xl border border-[#64748B] bg-[#1A202C] p-4 text-xs"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2 text-[#CBD5E1]">
                  <span className="truncate">{activeTicket.name}</span>
                  <span className="flex-shrink-0 font-semibold tabular-nums text-[#F8FAFC]">
                    {formatPrice(ticketPrice, currency)}
                  </span>
                </div>

                {selectedMerchandise.map((m) => (
                  <div key={m.id} className="flex items-center justify-between gap-2 text-[#CBD5E1]">
                    <span className="truncate">
                      {m.name} x{m.quantity}
                    </span>
                    <span className="flex-shrink-0 font-semibold tabular-nums text-[#F8FAFC]">
                      {m.price === 0 ? 'FREE' : `${currency} ${(m.price * m.quantity).toLocaleString()}`}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-dashed border-[#64748B] pt-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#CBD5E1]">
                  Total
                </span>
                <span className="font-mono text-base font-bold tabular-nums text-[#F8FAFC]">
                  {formatPrice(grandTotal, currency)}
                </span>
              </div>
            </section>
          )}

          {/* Registrant Details */}
          <section aria-label="Registrant details" className="space-y-4 border-t border-[#64748B]/60 pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#CBD5E1]">
              Your Details
            </h3>

            <div className="space-y-1.5">
              <label htmlFor={nameInputId} className="block text-xs font-semibold text-[#CBD5E1]">
                Full Name <span className="text-[#FCA5A5]" aria-hidden="true">*</span>
              </label>
              <Input
                id={nameInputId}
                type="text"
                required
                autoComplete="name"
                placeholder="Your full name"
                value={name}
                aria-invalid={Boolean(fieldErrors.name)}
                aria-describedby={fieldErrors.name ? `${nameInputId}-error` : undefined}
                onChange={(e) => {
                  setName(e.target.value);
                  if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: undefined }));
                }}
                className={`h-11 rounded-xl border-[#64748B] bg-[#1A202C] text-sm text-[#F8FAFC] placeholder:text-[#94A3B8] scroll-mb-24 ${focusRingClass}`}
              />
              {fieldErrors.name && (
                <p id={`${nameInputId}-error`} role="alert" className="flex items-center gap-1.5 text-xs text-[#FCA5A5]">
                  <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                  <span>{fieldErrors.name}</span>
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor={emailInputId} className="block text-xs font-semibold text-[#CBD5E1]">
                Email Address <span className="text-[#FCA5A5]" aria-hidden="true">*</span>
              </label>
              <Input
                id={emailInputId}
                type="email"
                required
                autoComplete="email"
                placeholder="email@example.com"
                value={email}
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={`${emailInputId}-hint${fieldErrors.email ? ` ${emailInputId}-error` : ''}`}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
                }}
                className={`h-11 rounded-xl border-[#64748B] bg-[#1A202C] text-sm text-[#F8FAFC] placeholder:text-[#94A3B8] scroll-mb-24 ${focusRingClass}`}
              />
              {fieldErrors.email && (
                <p id={`${emailInputId}-error`} role="alert" className="flex items-center gap-1.5 text-xs text-[#FCA5A5]">
                  <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                  <span>{fieldErrors.email}</span>
                </p>
              )}
              <p id={`${emailInputId}-hint`} className="text-xs text-[#94A3B8]">
                Tickets, approval updates, and venue details will be sent here.
              </p>
            </div>

            {needsApproval && (
              <div className="space-y-1.5">
                <label htmlFor={notesInputId} className="block text-xs font-semibold text-[#CBD5E1]">
                  Why do you want to join? (Optional)
                </label>
                <textarea
                  id={notesInputId}
                  rows={3}
                  placeholder="Share a quick note or project you are working on"
                  value={projectIdea}
                  onChange={(e) => setProjectIdea(e.target.value)}
                  className={`w-full resize-none rounded-xl border border-[#64748B] bg-[#1A202C] px-3.5 py-2.5 text-sm leading-relaxed text-[#F8FAFC] placeholder:text-[#94A3B8] scroll-mb-24 ${focusRingClass}`}
                />
              </div>
            )}
          </section>
        </div>

        {/* Sticky Footer */}
        <div className="flex-shrink-0 border-t border-[#64748B]/60 bg-[#12161F] px-4 pt-3.5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-6">
          <Button
            type="submit"
            disabled={submitDisabled}
            className={`min-h-[48px] w-full rounded-xl bg-[#F8FAFC] px-4 py-3 text-sm font-extrabold text-[#0F172A] hover:bg-[#E2E8F0] active:bg-[#CBD5E1] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer transition-colors motion-reduce:transition-none sm:text-base ${focusRingClass}`}
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2" role="status">
                <span
                  aria-hidden="true"
                  className="h-4 w-4 rounded-full border-2 border-[#0F172A] border-t-transparent motion-safe:animate-spin"
                />
                <span>Submitting registration...</span>
              </span>
            ) : isPast ? (
              'Event Ended'
            ) : !activeTicket ? (
              'Registration Unavailable'
            ) : activeTicketSaleStatus && !activeTicketSaleStatus.canPurchase ? (
              activeTicketSaleStatus.badgeText || 'Ticket Unavailable'
            ) : needsApproval ? (
              'Request to Join'
            ) : grandTotal > 0 ? (
              `Register & Pay ${currency} ${grandTotal.toLocaleString()}`
            ) : (
              'Complete Registration'
            )}
          </Button>

          <p className="mt-2 text-center text-xs text-[#94A3B8]">
            By registering, you agree to receive event updates from the host.
          </p>
        </div>
      </form>
    );
  };

  if (!mounted) return null;

  if (isDesktop) {
    return (
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent
          side="right"
          aria-label={`Register for ${event.name}`}
          className="flex h-full w-full flex-col overflow-hidden border-l border-[#64748B]/60 bg-[#12161F] p-0 text-[#F8FAFC] shadow-2xl sm:max-w-lg md:max-w-xl"
        >
          {confirmedRegistration ? renderConfirmationView() : renderFormView()}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent
        aria-label={`Register for ${event.name}`}
        className="flex h-[88dvh] max-h-[92dvh] flex-col overflow-hidden rounded-t-2xl border-t border-[#64748B]/60 bg-[#12161F] p-0 text-[#F8FAFC]"
      >
        {confirmedRegistration ? renderConfirmationView() : renderFormView()}
      </DrawerContent>
    </Drawer>
  );
}
