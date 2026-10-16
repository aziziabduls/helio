'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  Download,
  Search,
  ExternalLink,
  QrCode,
  ArrowLeft,
  Check,
} from 'lucide-react';
import { EventItem, Registration, fetchEventBySlug, fetchGuests, updateRegistrationStatus } from '@/lib/api';

export default function ManageEventPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [event, setEvent] = useState<EventItem | null>(null);
  const [guests, setGuests] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const evt = await fetchEventBySlug(slug);
      setEvent(evt);
      const guestList = await fetchGuests(evt.id);
      setGuests(guestList);
    } catch (err) {
      console.error('Failed to load manage data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) loadData();
  }, [slug]);

  const handleStatusChange = async (registrationId: string, newStatus: string) => {
    setUpdatingId(registrationId);
    try {
      await updateRegistrationStatus(registrationId, newStatus);
      await loadData();
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const exportCSV = () => {
    if (!guests.length) return;
    const headers = ['Name', 'Email', 'Ticket', 'Status', 'Date', 'TicketKey'];
    const rows = guests.map((g) => [
      `"${g.name}"`,
      `"${g.email}"`,
      `"${g.ticket?.name || 'General Admission'}"`,
      `"${g.status}"`,
      `"${new Date(g.createdAt).toLocaleDateString()}"`,
      `"${g.ticketKey}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${slug}-attendees.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="py-32 text-center space-y-4">
        <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-white/50">Loading guest management dashboard...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-md mx-auto py-32 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Event Not Found</h2>
        <Link href="/" className="inline-block luma-btn luma-btn-primary px-4 py-2 text-sm">
          Return Home
        </Link>
      </div>
    );
  }

  // Filtered guests
  const filteredGuests = guests.filter((g) => {
    const matchesSearch =
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.email.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = statusFilter === 'ALL' || g.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const totalCount = guests.length;
  const approvedCount = guests.filter((g) => g.status === 'APPROVED').length;
  const pendingCount = guests.filter((g) => g.status === 'PENDING').length;
  const checkedInCount = guests.filter((g) => g.status === 'CHECKED_IN').length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-20 space-y-8">
      {/* Top back navigation */}
      <div className="flex items-center justify-between">
        <Link
          href={`/${event.slug}`}
          className="inline-flex items-center gap-2 text-xs text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>View Public Event Page</span>
        </Link>

        <button
          onClick={exportCSV}
          className="luma-btn luma-btn-secondary px-3.5 py-1.5 text-xs font-medium flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5" />
          Export Attendees CSV
        </button>
      </div>

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
            Host Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            {event.name}
          </h1>
          <p className="text-xs text-white/50 mt-1">
            Manage registrations, review applications, and check in attendees at the door.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="luma-card p-4 space-y-1">
          <div className="text-xs text-white/50 font-medium">Total Registered</div>
          <div className="text-2xl font-extrabold text-white">{totalCount}</div>
        </div>

        <div className="luma-card p-4 space-y-1">
          <div className="text-xs text-emerald-400 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Approved
          </div>
          <div className="text-2xl font-extrabold text-emerald-300">{approvedCount}</div>
        </div>

        <div className="luma-card p-4 space-y-1">
          <div className="text-xs text-amber-400 font-medium flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Pending Review
          </div>
          <div className="text-2xl font-extrabold text-amber-300">{pendingCount}</div>
        </div>

        <div className="luma-card p-4 space-y-1">
          <div className="text-xs text-blue-400 font-medium flex items-center gap-1">
            <QrCode className="w-3.5 h-3.5" /> Checked In
          </div>
          <div className="text-2xl font-extrabold text-blue-300">{checkedInCount}</div>
        </div>
      </div>

      {/* Guest List Controls */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Status filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {['ALL', 'PENDING', 'APPROVED', 'CHECKED_IN', 'REJECTED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  statusFilter === st
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/[0.05] text-white/60 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative min-w-[200px] sm:w-64">
            <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-xs text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Table of Guests */}
        <div className="luma-card overflow-hidden">
          {filteredGuests.length === 0 ? (
            <div className="p-12 text-center text-xs text-white/40 space-y-2">
              <Users className="w-8 h-8 mx-auto text-white/20" />
              <p>No attendees found matching filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/[0.03] text-white/50 border-b border-white/[0.06] font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Attendee</th>
                    <th className="py-3 px-4">Ticket</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Registered</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filteredGuests.map((guest) => (
                    <tr key={guest.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{guest.name}</div>
                        <div className="text-[11px] text-white/40">{guest.email}</div>
                      </td>
                      <td className="py-3 px-4 text-white/70">
                        {guest.ticket?.name || 'General Admission'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            guest.status === 'APPROVED'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : guest.status === 'PENDING'
                              ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                              : guest.status === 'CHECKED_IN'
                              ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20'
                              : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}
                        >
                          {guest.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-white/50">
                        {new Date(guest.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5">
                        {guest.status === 'PENDING' && (
                          <>
                            <button
                              disabled={updatingId === guest.id}
                              onClick={() => handleStatusChange(guest.id, 'APPROVED')}
                              className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-[11px] transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              disabled={updatingId === guest.id}
                              onClick={() => handleStatusChange(guest.id, 'REJECTED')}
                              className="px-2 py-1 rounded-md bg-white/[0.08] hover:bg-red-500/20 text-white/70 hover:text-red-400 text-[11px] transition-colors"
                            >
                              Decline
                            </button>
                          </>
                        )}

                        {guest.status === 'APPROVED' && (
                          <button
                            disabled={updatingId === guest.id}
                            onClick={() => handleStatusChange(guest.id, 'CHECKED_IN')}
                            className="px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-medium text-[11px] transition-colors"
                          >
                            Check In
                          </button>
                        )}

                        {guest.status === 'CHECKED_IN' && (
                          <span className="text-[11px] text-blue-400 flex items-center justify-end gap-1 font-medium">
                            <Check className="w-3.5 h-3.5" /> Checked In
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
