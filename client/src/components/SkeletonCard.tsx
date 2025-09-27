export default function SkeletonCard() {
  return (
    <div className="card-article shimmer">
      {/* Image Skeleton */}
      <div className="skeleton h-48 w-full mb-4 rounded-xl" />
      
      {/* Header Skeleton */}
      <div className="flex items-center gap-2 mb-3">
        <div className="skeleton h-4 w-20 rounded" />
        <div className="skeleton h-3 w-3 rounded-full" />
        <div className="skeleton h-4 w-16 rounded" />
      </div>
      
      {/* Title Skeleton */}
      <div className="mb-3 space-y-2">
        <div className="skeleton h-6 w-full rounded" />
        <div className="skeleton h-6 w-3/4 rounded" />
      </div>
      
      {/* Excerpt Skeleton */}
      <div className="mb-4 space-y-2">
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-2/3 rounded" />
      </div>
      
      {/* Actions Skeleton */}
      <div className="flex items-center justify-between">
        <div className="skeleton h-9 w-24 rounded-lg" />
        <div className="skeleton h-9 w-20 rounded-lg" />
      </div>
    </div>
  );
}