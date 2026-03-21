import { useMemo } from 'react'
import { useNavigate } from 'react-router'

const STATUS_STYLES = {
  Saved: 'badge badge-outline',
  Applied: 'badge badge-primary',
  Interview: 'badge badge-info',
  Offer: 'badge badge-success',
  Rejected: 'badge badge-error'
}

export default function ApplicationCard({ application }) {
  const navigate = useNavigate()
  const statusClass = STATUS_STYLES[application.status] || STATUS_STYLES.Saved

  const appliedDate = useMemo(() => {
    if (!application.appliedDate) return null
    const date = new Date(application.appliedDate)
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }, [application.appliedDate])

  const handleSelect = () => {
    navigate(`/application/${application._id}`)
  }

  return (
    <button
      type="button"
      onClick={handleSelect}
      className="card w-full cursor-pointer border border-base-200 bg-base-100 shadow-sm transition hover:border-white"
    >
      <div className="card-body p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-base-content">
              {application.company}
            </h3>
            <p className="text-sm text-base-content/70">{application.role}</p>
          </div>
          <span className={statusClass}>{application.status}</span>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-base-content/60">
          <span>{application.location || 'No location'}</span>
          <span>{appliedDate || 'No date'}</span>
        </div>
        {application.aiAnalysis?.matchScore != null && (
          <div className="mt-3 flex items-center justify-between text-xs text-base-content/70">
            <span>AI Score</span>
            <span className="font-semibold">{application.aiAnalysis.matchScore}/100</span>
          </div>
        )}
      </div>
    </button>
  )
}
