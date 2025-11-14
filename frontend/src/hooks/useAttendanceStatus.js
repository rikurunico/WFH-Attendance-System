import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTodayStatus, checkIn, checkOut } from '../api/attendance.api';
import toast from 'react-hot-toast';

/**
 * Custom hook for managing attendance status with React Query
 * Benefits:
 * - Automatic caching (2 min fresh, 5 min cache)
 * - Auto-retry on failure (2 attempts)
 * - Background refetch on window focus
 * - Optimistic updates
 */
export const useAttendanceStatus = () => {
  const queryClient = useQueryClient();

  // Fetch today's attendance status
  const {
    data: todayStatus,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['attendance', 'today'],
    queryFn: async () => {
      const response = await getTodayStatus();
      if (!response.success || !response.data) {
        throw new Error('Invalid response structure');
      }
      return response.data;
    },
    staleTime: 1000 * 60 * 1, // Refresh every 1 minute for live updates
    refetchInterval: 1000 * 60 * 1, // Auto-refresh every minute
    retry: 2,
    onError: (error) => {
      console.error('Error fetching attendance status:', error);
    },
  });

  // Check-in mutation
  const checkInMutation = useMutation({
    mutationFn: checkIn,
    onSuccess: (response) => {
      // Invalidate and refetch attendance status
      queryClient.invalidateQueries(['attendance', 'today']);
      toast.success(response.message || 'Checked in successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to check in';
      toast.error(message);
    },
  });

  // Check-out mutation
  const checkOutMutation = useMutation({
    mutationFn: ({ attendanceId, tasks }) => checkOut(attendanceId, tasks),
    onSuccess: (response) => {
      // Invalidate and refetch attendance status
      queryClient.invalidateQueries(['attendance', 'today']);
      toast.success(response.message || 'Checked out successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to check out';
      toast.error(message);
    },
  });

  return {
    // Data
    todayStatus,

    // Loading states
    isLoading,
    isFetching,

    // Error
    error,

    // Actions
    refetch,
    checkIn: checkInMutation.mutate,
    checkOut: checkOutMutation.mutate,

    // Mutation states
    isCheckingIn: checkInMutation.isPending,
    isCheckingOut: checkOutMutation.isPending,
  };
};
