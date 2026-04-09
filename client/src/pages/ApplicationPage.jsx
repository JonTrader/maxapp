import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import toast from 'react-hot-toast'
import { ChevronLeft, ExternalLink, Trash2 } from 'lucide-react'
import api from '../api/api'
import Header from '../components/Header'
import AIAnalysisPanel from '../components/AIAnalysisPanel'

const STATUS_OPTIONS = ['Saved', 'Applied', 'Interview', 'Offer', 'Rejected']

export default function ApplicationPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [application, setApplication] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [analysisLoading, setAnalysisLoading] = useState(false)

  const fetchApplication = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/applications/${id}`)
      if (!res.data) {
        toast.error('Application not found')
        navigate('/dashboard')
        return
      }
      setApplication(res.data)
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Unable to load application')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApplication()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const appliedDate = useMemo(() => {
    if (!application?.appliedDate) return null
    const date = new Date(application.appliedDate)
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }, [application?.appliedDate])

  const handleStatusChange = async (newStatus) => {
    if (!application) return
    setSaving(true)
    try {
      const { data } = await api.put(`/applications/${application._id}`, {
        status: newStatus
      })
      setApplication(data)
      toast.success('Status updated')
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Failed to update status')
    } finally {
      setSaving(false)
    }
  }

  const runAnalysis = async () => {
    if (!application) return
    setAnalysisLoading(true)

    try {
      const { data: analysis } = await api.post('/ai/analyze', {
        jobDescription: application.jobDescription || '',
        resume: application.resumeSnapshot || '',
        applicationId: application._id || ''
      })
      const { data: updated } = await api.put(`/applications/${application._id}`, {
        aiAnalysis: analysis
      })
      setApplication(updated)
      toast.success('AI analysis updated')
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || 'AI analysis failed')
    } finally {
      setAnalysisLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!application || deleting) return

    setDeleting(true)

    try {
      await api.delete(`/applications/${application._id}`)
      toast.success('Application deleted')
      navigate('/dashboard')
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Failed to delete application')
    } finally {
      setDeleting(false)
      setShowDeleteModal(false)
    }
  }

  const openDeleteModal = () => {
    if (deleting) return
    setShowDeleteModal(true)
  }

  const closeDeleteModal = () => {
    if (deleting) return
    setShowDeleteModal(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200">
        <Header />
        <main className="mx-auto max-w-5xl px-4 py-12">
          <p className="text-center text-base-content/70">Loading…</p>
        </main>
      </div>
    )
  }

  if (!application) {
    return null
  }

  return (
    <div className="min-h-screen bg-base-200">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <button
              type="button"
              className="btn gap-2 btn-primary hover:border-white"
              onClick={() => navigate('/dashboard')}
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Dashboard
            </button>
            <div className='mt-6'>
              <h1 className='text-xl'>{application.company}</h1>
              <p className="text-sm text-base-content/60">{application.role}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {application.location && (
                  <span className="badge badge-outline">{application.location}</span>
                )}
                {appliedDate && (
                  <span className="badge badge-outline">Applied {appliedDate}</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:justify-end">
            {application.jobUrl && (
              <a
                href={application.jobUrl.startsWith('http') ? application.jobUrl : `https://${application.jobUrl}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline btn-sm gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                View Job Posting
              </a>
            )}
            <button
              type="button"
              className="btn btn-error btn-sm gap-2 hover:border-white"
              onClick={openDeleteModal}
              disabled={deleting}
            >
              <Trash2 className="h-4 w-4" />
              {deleting ? 'Deleting...' : 'Delete Application'}
            </button>
          </div>
        </div>

        <section className="mt-6 rounded-xl border border-base-200 bg-base-100 p-6">
          <h2 className="text-lg font-semibold">Update Status</h2>
          <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
            <select
              value={application.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="select select-bordered max-w-xs"
              disabled={saving}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <span className="text-sm text-base-content/60">
              {saving ? 'Saving...' : 'Status updates are saved automatically.'}
            </span>
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-base-200 bg-base-100 p-6">
          <h2 className="text-lg font-semibold">Notes</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm text-base-content/80">
            {application.notes || 'No notes are available'}
          </p>
        </section>

        <section className="mt-6 rounded-xl border border-base-200 bg-base-100 p-6">
          <h2 className="text-lg font-semibold">Job Description</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm text-base-content/80">
            {application.jobDescription || 'No job description available.'}
          </p>
        </section>

        <section className="mt-6 rounded-xl border border-base-200 bg-base-100 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">AI Analysis</h2>
            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={runAnalysis}
              disabled={analysisLoading}
            >
              {analysisLoading ? 'Running…' : application.aiAnalysis?.matchScore != null ? 'Re-run Analysis' : 'Run Analysis'}
            </button>
          </div>
          <div className="mt-4">
            <AIAnalysisPanel analysis={application.aiAnalysis} />
          </div>
        </section>
      </main>

      {showDeleteModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md">
            <h2 className="text-xl font-semibold">Delete application?</h2>
            <p className="mt-3 text-sm text-base-content/70">
              This will permanently remove the {application.company} job application.
            </p>
            <p className="mt-2 text-sm text-base-content/70">
              This action cannot be undone.
            </p>
            <div className="modal-action">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={closeDeleteModal}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-error gap-2"
                onClick={handleDelete}
                disabled={deleting}
              >
                <Trash2 className="h-4 w-4" />
                {deleting ? 'Deleting...' : 'Delete Application'}
              </button>
            </div>
          </div>
          <button
            type="button"
            className="modal-backdrop"
            onClick={closeDeleteModal}
            aria-label="Close delete confirmation"
          >
            Close
          </button>
        </div>
      )}
    </div>
  )
}
