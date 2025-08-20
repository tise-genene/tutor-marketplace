'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, User, BookOpen, CheckCircle, XCircle, Clock as ClockIcon, Filter } from 'lucide-react';

type Status = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

interface Proposal {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  subjectId: string;
  status: Status;
  notes?: string | null;
  student: { id: string; name: string; email?: string };
  tutor: { id: string; name: string; email?: string };
}

export default function ProposalsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status | 'ALL'>('ALL');

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login');
    if (status === 'authenticated') fetchProposals();
  }, [status]);

  const fetchProposals = async () => {
    try {
      const response = await fetch('/api/bookings');
      if (!response.ok) throw new Error('Failed to fetch proposals');
      const data = await response.json();
      // normalize shape
      const items: Proposal[] = (data.data || data.bookings || []).map((b: any) => ({
        id: b.id,
        date: b.date,
        startTime: b.startTime,
        endTime: b.endTime,
        subjectId: b.subjectId,
        status: b.status,
        notes: b.notes ?? null,
        student: b.student,
        tutor: b.tutor,
      }));
      setProposals(items);
    } catch (e) {
      setError('Failed to load proposals');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const visibleProposals = useMemo(() => {
    if (statusFilter === 'ALL') return proposals;
    return proposals.filter((p) => p.status === statusFilter);
  }, [proposals, statusFilter]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading proposals...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <button onClick={fetchProposals} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Proposals</h1>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="ALL">All statuses</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {visibleProposals.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No proposals found</p>
            <button onClick={() => router.push('/search')} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Find a Tutor</button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {visibleProposals.map((p) => (
              <div key={p.id} className="bg-white rounded-lg shadow-md p-6 space-y-4">
                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Start Date</p>
                    <p className="text-gray-900">{new Date(p.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Session Time</p>
                    <p className="text-gray-900">{p.startTime} - {p.endTime}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <BookOpen className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Subject</p>
                    <p className="text-gray-900">{p.subjectId}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <User className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">{session?.user?.role === 'STUDENT' ? 'Tutor' : 'Student'}</p>
                    <p className="text-gray-900">{session?.user?.role === 'STUDENT' ? p.tutor.name : p.student.name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {p.status === 'PENDING' && <ClockIcon className="w-5 h-5 text-yellow-500" />}
                  {p.status === 'CONFIRMED' && <CheckCircle className="w-5 h-5 text-green-500" />}
                  {p.status === 'CANCELLED' && <XCircle className="w-5 h-5 text-red-500" />}
                  <span className={`text-sm font-medium ${p.status === 'PENDING' ? 'text-yellow-600' : p.status === 'CONFIRMED' ? 'text-green-600' : p.status === 'COMPLETED' ? 'text-green-700' : 'text-red-600'}`}>{p.status.charAt(0) + p.status.slice(1).toLowerCase()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


