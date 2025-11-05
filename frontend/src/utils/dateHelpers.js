import { format, parseISO, differenceInHours, differenceInMinutes } from 'date-fns';

export const formatDate = (date) => {
  if (!date) return '-';
  return format(parseISO(date), 'dd MMM yyyy');
};

export const formatDateTime = (date) => {
  if (!date) return '-';
  try {
    // Handle ISO string format
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, 'dd MMM yyyy HH:mm');
  } catch (error) {
    console.error('Error formatting date:', date, error);
    return '-';
  }
};

export const formatTime = (date) => {
  if (!date) return '-';
  return format(parseISO(date), 'HH:mm');
};

export const formatDateForInput = (date) => {
  if (!date) return '';
  return format(parseISO(date), 'yyyy-MM-dd');
};

export const calculateHours = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  const minutes = differenceInMinutes(end, start);
  return (minutes / 60).toFixed(2);
};

export const formatHours = (hours) => {
  if (!hours) return '0 jam';
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (m === 0) return `${h} jam`;
  return `${h}j ${m}m`;
};

export const getTodayDate = () => {
  return format(new Date(), 'yyyy-MM-dd');
};

export const getMonthStart = () => {
  const date = new Date();
  date.setDate(1);
  return format(date, 'yyyy-MM-dd');
};

export const getMonthEnd = () => {
  const date = new Date();
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return format(lastDay, 'yyyy-MM-dd');
};

/**
 * Format datetime for datetime-local input
 * Extracts datetime from ISO string WITHOUT timezone conversion
 * This ensures the input shows the exact same time as displayed in the table
 * 
 * Example: "2025-11-03T17:54:00+07:00" -> "2025-11-03T17:54"
 */
export const formatDateTimeForInput = (date) => {
  if (!date) return '';
  try {
    // Extract datetime part from ISO string (before timezone offset)
    // Format: "YYYY-MM-DDTHH:mm:ss+07:00" -> "YYYY-MM-DDTHH:mm"
    const match = date.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})/);
    if (match) {
      return match[1]; // Returns "YYYY-MM-DDTHH:mm"
    }
    
    // Fallback: if no timezone info, just slice
    return date.slice(0, 16);
  } catch (error) {
    console.error('Error formatting datetime for input:', date, error);
    return '';
  }
};
