import { format, parseISO, differenceInHours, differenceInMinutes } from 'date-fns';

export const formatDate = (date) => {
  if (!date) return '-';
  return format(parseISO(date), 'dd MMM yyyy');
};

export const formatDateTime = (date) => {
  if (!date) return '-';
  return format(parseISO(date), 'dd MMM yyyy HH:mm');
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
  if (!hours) return '0 hours';
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (m === 0) return `${h} hours`;
  return `${h}h ${m}m`;
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
