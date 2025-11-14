import { Skeleton, CardSkeleton, ButtonSkeleton, HeadingSkeleton } from './Skeleton';

/**
 * Loading skeleton for Employee Dashboard
 * Matches the exact structure of the actual dashboard for seamless loading experience
 */
export const EmployeeDashboardSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <HeadingSkeleton width="200px" />
          <Skeleton width="300px" height="1.25rem" />
        </div>
        <ButtonSkeleton width="140px" />
      </div>

      {/* Status Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>

      {/* Progress Bar Card Skeleton */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <Skeleton width="150px" height="1.5rem" />
        <div className="space-y-2">
          <div className="flex justify-between">
            <Skeleton width="120px" height="0.875rem" />
            <Skeleton width="80px" height="0.875rem" />
          </div>
          <Skeleton height="1rem" rounded="rounded-full" />
          <Skeleton width="150px" height="0.875rem" className="mx-auto" />
        </div>
      </div>

      {/* Current Session Card Skeleton (optional, shown when checked in) */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <Skeleton width="120px" height="1.5rem" />
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton width="100px" height="0.875rem" />
            <Skeleton width="80px" height="1.25rem" />
          </div>
          <div className="space-y-2">
            <Skeleton width="100px" height="0.875rem" />
            <Skeleton width="80px" height="1.25rem" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton width="120px" height="0.875rem" />
          <Skeleton width="100%" height="1rem" />
          <Skeleton width="90%" height="1rem" />
          <Skeleton width="85%" height="1rem" />
        </div>
      </div>
    </div>
  );
};

/**
 * Loading skeleton for Manager Dashboard
 */
export const ManagerDashboardSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <HeadingSkeleton width="250px" />
          <Skeleton width="200px" height="1.25rem" />
        </div>
        <Skeleton width="180px" height="2.5rem" rounded="rounded-lg" />
      </div>

      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>

      {/* Employee Table Card Skeleton */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <Skeleton width="180px" height="1.5rem" />
        <div className="space-y-3">
          {/* Table Header */}
          <div className="flex gap-4 border-b pb-3">
            <Skeleton width="25%" height="1rem" />
            <Skeleton width="15%" height="1rem" />
            <Skeleton width="15%" height="1rem" />
            <Skeleton width="15%" height="1rem" />
            <Skeleton width="15%" height="1rem" />
          </div>
          {/* Table Rows */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4 py-3 border-b">
              <div className="w-1/4 space-y-1">
                <Skeleton width="80%" height="1rem" />
                <Skeleton width="60%" height="0.75rem" />
              </div>
              <Skeleton width="15%" height="1.5rem" rounded="rounded-full" />
              <Skeleton width="15%" height="1rem" />
              <Skeleton width="15%" height="1rem" />
              <Skeleton width="15%" height="1rem" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Loading skeleton for Report pages
 */
export const ReportSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <HeadingSkeleton width="150px" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton height="2.5rem" rounded="rounded-lg" />
          <Skeleton height="2.5rem" rounded="rounded-lg" />
          <ButtonSkeleton />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex justify-between items-center py-3 border-b">
            <div className="space-y-2">
              <Skeleton width="200px" height="1rem" />
              <Skeleton width="150px" height="0.75rem" />
            </div>
            <Skeleton width="80px" height="1.5rem" rounded="rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
};
