export default function SkeletonCard({ lines = 3, className = '' }) {
  return (
    <div className={`card animate-pulse ${className}`}>
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-3 bg-white/5 rounded-full"
            style={{ width: `${70 + (i % 3) * 10}%` }}
          />
        ))}
      </div>
    </div>
  )
}
