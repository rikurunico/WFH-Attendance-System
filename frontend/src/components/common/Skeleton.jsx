/**
 * Base Skeleton component with shimmer animation
 * Used to show loading placeholders that match the structure of actual content
 */
export const Skeleton = ({ className = '', width, height, rounded = 'rounded' }) => {
  const baseClasses = 'animate-shimmer bg-gray-200';
  const style = {
    width: width || '100%',
    height: height || '1rem',
  };

  return (
    <div
      className={`${baseClasses} ${rounded} ${className}`}
      style={style}
    />
  );
};

/**
 * Skeleton for card content
 */
export const CardSkeleton = ({ lines = 3 }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton width="40%" height="0.875rem" />
          <Skeleton width="60%" height="2rem" />
        </div>
        <Skeleton width="3rem" height="3rem" rounded="rounded-full" />
      </div>
    </div>
  );
};

/**
 * Skeleton for table rows
 */
export const TableSkeleton = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-6 py-3">
                <Skeleton height="1rem" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex} className="px-6 py-4">
                  <Skeleton height="1rem" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/**
 * Skeleton for button
 */
export const ButtonSkeleton = ({ width = '8rem' }) => {
  return <Skeleton width={width} height="2.5rem" rounded="rounded-lg" />;
};

/**
 * Skeleton for text line
 */
export const TextSkeleton = ({ width = '100%' }) => {
  return <Skeleton width={width} height="1rem" />;
};

/**
 * Skeleton for heading
 */
export const HeadingSkeleton = ({ width = '60%' }) => {
  return <Skeleton width={width} height="2rem" />;
};
