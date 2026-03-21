import { useEffect, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/api'
import AddApplicationModal from '../components/AddApplicationModal'
import ApplicationCard from '../components/ApplicationCard'
import Header from '../components/Header'

const STATUS_ORDER = ['Applied', 'Interview', 'Offer', 'Rejected', 'Saved']

export default function DashboardPage() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  const fetchApplications = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/applications')
      setApplications(data || [])
    } catch (err) {
      console.error(err)
      toast.error('Unable to load applications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApplications()
  }, [])

  const grouped = useMemo(() => {
    const map = STATUS_ORDER.reduce((acc, status) => ({ ...acc, [status]: [] }), {})
    applications.forEach((app) => {
      const status = app.status || 'Saved'
      if (!map[status]) map[status] = []
      map[status].push(app)
    })
    return map
  }, [applications])

  const total = applications.length
  const active = applications.filter((app) => ['Applied', 'Interview', 'Offer'].includes(app.status)).length
  const offers = applications.filter((app) => app.status === 'Offer').length

  const handleCreated = (app) => {
    setApplications((prev) => [app, ...prev])
  }

  return (
    <div className="min-h-screen bg-base-200">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Your Applications</h2>
            <div className="mt-2 flex flex-wrap gap-2 text-sm">
              <span className="badge badge-outline badge-sm">{total} Total</span>
              <span className="badge badge-outline badge-sm">{active} Active</span>
              <span className="badge badge-outline badge-sm">{offers} Offers</span>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-primary gap-2"
            onClick={() => setModalOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add Application
          </button>
        </div>

        {loading ? (
          <div className="mt-12 text-center text-base-content/70">Loading applications…</div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STATUS_ORDER.map((status) => (
              <section
                key={status}
                className="rounded-xl border border-base-200 bg-base-100 p-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">{status}</h3>
                  <span className="text-xs text-base-content/60">
                    {grouped[status]?.length ?? 0} applications
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  {(grouped[status] || []).map((application) => (
                    <ApplicationCard
                      key={application._id}
                      application={application}
                    />
                  ))}
                  {(grouped[status] || []).length === 0 && (
                    <div className="rounded-xl border border-dashed border-base-200 bg-base-100 p-4 text-sm text-base-content/70">
                      No applications yet.
                    </div>
                  )}
                </div>
              </section>
            ))}
          </div>
        )}

        <AddApplicationModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onCreated={handleCreated}
        />
      </main>
    </div>
  )
}
