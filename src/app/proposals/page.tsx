'use client';

import { useEffect, useState } from 'react';
import { useSession } from "@/lib/auth-client";
import { useRouter } from 'next/navigation';

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

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }
    if (status === 'authenticated' && session?.user) {
      fetchProposals();
    }
  }, [status, session?.user, router]);

  const fetchProposals = async () => {
    try {
      const response = await fetch('/api/bookings');
      if (!response.ok) {
        if (response.status === 401) {
          setError('Please log in to view proposals');
          router.push('/auth/login');
          return;
        }
        throw new Error(`Failed to fetch proposals: ${response.status}`);
      }
      const data = await response.json();
      const items: Proposal[] = (data.data || data.bookings || []).map((b: any) => ({
        id: b.id,
        date: b.date,
        startTime: b.start_time,
        endTime: b.end_time,
        subjectId: b.subject_id,
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

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading proposals...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to view proposals</p>
          <button 
            onClick={() => router.push('/auth/login')} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Log In
          </button>
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
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Proposals</h1>
        
        {proposals.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No proposals found</p>
            <button onClick={() => router.push('/search')} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Find a Tutor</button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {proposals.map((p: Proposal) => (
              <div key={p.id} className="bg-white rounded-lg shadow-md p-6 space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Start Date</p>
                  <p className="text-gray-900">{new Date(p.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Session Time</p>
                  <p className="text-gray-900">{p.startTime} - {p.endTime}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Subject</p>
                  <p className="text-gray-900">{p.subjectId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{session?.user?.role === 'STUDENT' ? 'Tutor' : 'Student'}</p>
                  <p className="text-gray-900">{session?.user?.role === 'STUDENT' ? p.tutor.name : p.student.name}</p>
                </div>
                <div>
                  <span className={`text-sm font-medium ${p.status === 'PENDING' ? 'text-yellow-600' : p.status === 'CONFIRMED' ? 'text-green-600' : p.status === 'COMPLETED' ? 'text-green-700' : 'text-red-600'}`}>
                    {p.status.charAt(0) + p.status.slice(1).toLowerCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
