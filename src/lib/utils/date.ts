import { format, formatDistance, formatDistanceToNow, parseISO, isValid } from 'date-fns';

/**
 * Standard date/time utility functions for consistent formatting across the app
 * 
 * Storage/API: Always use ISO 8601 strings
 * Display: Use these utility functions for consistent formatting
 */

/**
 * Parse a date string or Date object to Date
 * Handles ISO strings, date strings, and Date objects
 */
export function parseDate(date: string | Date | null | undefined): Date | null {
  if (!date) return null;
  if (date instanceof Date) return isValid(date) ? date : null;
  if (typeof date === 'string') {
    const parsed = parseISO(date);
    return isValid(parsed) ? parsed : null;
  }
  return null;
}

/**
 * Convert a date to ISO string for API/storage
 * Always use this when sending dates to the backend
 */
export function toISOString(date: Date | string | null | undefined): string | null {
  const parsed = parseDate(date);
  return parsed ? parsed.toISOString() : null;
}

/**
 * Format date for display (e.g., "Jan 15, 2024")
 */
export function formatDate(date: Date | string | null | undefined, formatStr: string = 'MMM dd, yyyy'): string {
  const parsed = parseDate(date);
  return parsed ? format(parsed, formatStr) : '';
}

/**
 * Format time for display (e.g., "2:30 PM")
 */
export function formatTime(date: Date | string | null | undefined, formatStr: string = 'h:mm a'): string {
  const parsed = parseDate(date);
  return parsed ? format(parsed, formatStr) : '';
}

/**
 * Format date and time for display (e.g., "Jan 15, 2024 at 2:30 PM")
 */
export function formatDateTime(date: Date | string | null | undefined): string {
  const parsed = parseDate(date);
  return parsed ? format(parsed, 'MMM dd, yyyy \'at\' h:mm a') : '';
}

/**
 * Format relative time (e.g., "2 hours ago", "in 3 days")
 */
export function formatRelative(date: Date | string | null | undefined): string {
  const parsed = parseDate(date);
  if (!parsed) return '';
  
  return formatDistanceToNow(parsed, { addSuffix: true });
}

/**
 * Format duration between two dates (e.g., "2 hours", "30 minutes")
 */
export function formatDuration(start: Date | string | null | undefined, end: Date | string | null | undefined): string {
  const startParsed = parseDate(start);
  const endParsed = parseDate(end);
  
  if (!startParsed || !endParsed) return '';
  
  return formatDistance(endParsed, startParsed);
}

/**
 * Format booking date (e.g., "Monday, January 15, 2024")
 */
export function formatBookingDate(date: Date | string | null | undefined): string {
  const parsed = parseDate(date);
  return parsed ? format(parsed, 'EEEE, MMMM dd, yyyy') : '';
}

/**
 * Format booking time range (e.g., "2:30 PM - 4:00 PM")
 */
export function formatTimeRange(start: Date | string | null | undefined, end: Date | string | null | undefined): string {
  const startParsed = parseDate(start);
  const endParsed = parseDate(end);
  
  if (!startParsed || !endParsed) return '';
  
  return `${format(startParsed, 'h:mm a')} - ${format(endParsed, 'h:mm a')}`;
}

/**
 * Combine date string and time string into ISO datetime string
 * Useful for booking dates which come as separate date and time strings
 */
export function combineDateTime(dateStr: string, timeStr: string): string | null {
  if (!dateStr || !timeStr) return null;
  
  try {
    // Parse date (YYYY-MM-DD) and time (HH:MM)
    const date = parseISO(dateStr);
    const [hours, minutes] = timeStr.split(':').map(Number);
    
    if (isNaN(hours) || isNaN(minutes)) return null;
    
    date.setHours(hours, minutes, 0, 0);
    
    return isValid(date) ? date.toISOString() : null;
  } catch {
    return null;
  }
}

/**
 * Extract date portion from ISO string (YYYY-MM-DD)
 */
export function extractDate(isoString: string | Date | null | undefined): string {
  const parsed = parseDate(isoString);
  return parsed ? format(parsed, 'yyyy-MM-dd') : '';
}

/**
 * Extract time portion from ISO string (HH:MM)
 */
export function extractTime(isoString: string | Date | null | undefined): string {
  const parsed = parseDate(isoString);
  return parsed ? format(parsed, 'HH:mm') : '';
}

/**
 * Check if a date is in the past
 */
export function isPast(date: Date | string | null | undefined): boolean {
  const parsed = parseDate(date);
  if (!parsed) return false;
  return parsed < new Date();
}

/**
 * Check if a date is in the future
 */
export function isFuture(date: Date | string | null | undefined): boolean {
  const parsed = parseDate(date);
  if (!parsed) return false;
  return parsed > new Date();
}

/**
 * Check if a date is today
 */
export function isToday(date: Date | string | null | undefined): boolean {
  const parsed = parseDate(date);
  if (!parsed) return false;
  const today = new Date();
  return (
    parsed.getDate() === today.getDate() &&
    parsed.getMonth() === today.getMonth() &&
    parsed.getFullYear() === today.getFullYear()
  );
}

/**
 * Get start of day in ISO string
 */
export function startOfDay(date: Date | string | null | undefined): string | null {
  const parsed = parseDate(date);
  if (!parsed) return null;
  
  parsed.setHours(0, 0, 0, 0);
  return parsed.toISOString();
}

/**
 * Get end of day in ISO string
 */
export function endOfDay(date: Date | string | null | undefined): string | null {
  const parsed = parseDate(date);
  if (!parsed) return null;
  
  parsed.setHours(23, 59, 59, 999);
  return parsed.toISOString();
}

