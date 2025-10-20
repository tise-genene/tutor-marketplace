import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { supabase } from "@/lib/supabase";
import { apiSuccess, apiError, ApiErrors } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    // Get the session
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    
    if (!session?.user?.id) {
      return apiError("Unauthorized", "UNAUTHORIZED", 401);
    }

    const userId = session.user.id;
    const userRole = session.user.role;

    // Initialize stats
    const stats = {
      totalBookings: 0,
      upcomingBookings: 0,
      completedBookings: 0,
      averageRating: 0,
      totalEarnings: 0,
    };

    try {
      if (userRole === 'TUTOR') {
        // Get tutor stats
        const { data: bookings, error: bookingsError } = await supabase
          .from('bookings')
          .select('*')
          .eq('tutor_id', userId);

        if (!bookingsError && bookings) {
          stats.totalBookings = bookings.length;
          stats.upcomingBookings = bookings.filter(b => b.status === 'CONFIRMED').length;
          stats.completedBookings = bookings.filter(b => b.status === 'COMPLETED').length;
          
          // Calculate total earnings
          const completedBookings = bookings.filter(b => b.status === 'COMPLETED');
          stats.totalEarnings = completedBookings.reduce((sum, booking) => {
            const duration = new Date(booking.end_time).getTime() - new Date(booking.start_time).getTime();
            const hours = duration / (1000 * 60 * 60);
            return sum + (booking.hourly_rate * hours);
          }, 0);
        }
      } else {
        // Get student stats
        const { data: bookings, error: bookingsError } = await supabase
          .from('bookings')
          .select('*')
          .eq('student_id', userId);

        if (!bookingsError && bookings) {
          stats.totalBookings = bookings.length;
          stats.upcomingBookings = bookings.filter(b => b.status === 'CONFIRMED').length;
          stats.completedBookings = bookings.filter(b => b.status === 'COMPLETED').length;
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Return default stats if there's an error
    }

    return apiSuccess(stats);
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return ApiErrors.INTERNAL_ERROR();
  }
} 