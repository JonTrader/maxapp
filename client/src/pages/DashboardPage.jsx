import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/api'
import AddApplicationModal from '../components/AddApplicationModal'
import ApplicationCard from '../components/ApplicationCard'
import Header from '../components/Header'

const STATUS_ORDER = ['Applied', 'Interview', 'Offer', 'Rejected', 'Saved']

const createEmptyStatuses = () =>
  STATUS_ORDER.reduce((acc, status) => ({ ...acc, [status]: { total: 0, items: [] } }), {})

export default function DashboardPage() {
  const [statuses, setStatuses] = useState(createEmptyStatuses())
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  const fetchApplications = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/applications/summary/by-status')
      setStatuses({ ...createEmptyStatuses(), ...(data?.statuses || {}) })
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

  const total = STATUS_ORDER.reduce((sum, s) => sum + (statuses[s]?.total ?? 0), 0)
  const active = ['Applied', 'Interview', 'Offer'].reduce((sum, s) => sum + (statuses[s]?.total ?? 0), 0)
  const offers = statuses['Offer']?.total ?? 0

  const handleCreated = (app) => {
    const safeApp = { ...(app || {}) }
    delete safeApp.resumeSnapshot
    const status = STATUS_ORDER.includes(safeApp.status) ? safeApp.status : 'Saved'
    setStatuses((prev) => {
      const bucket = prev[status]
      const newItems = [safeApp, ...bucket.items].slice(0, 5)
      return { ...prev, [status]: { total: bucket.total + 1, items: newItems } }
    })
  }

  return (
    <div className="min-h-screen bg-base-200">
      <Header />

      <main className="mx-auto w-full px-4 py-8">
        <div className="flex gap-5 flex-row md:items-end justify-between lg:w-4/5 lg:mx-auto">
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
          <div className="mt-8 grid gap-4 sm:grid-cols-3 xl:grid-cols-5">
            {STATUS_ORDER.map((status) => {
              const bucket = statuses[status] ?? { total: 0, items: [] }
              const hasMore = bucket.total > bucket.items.length
              return (
                <section
                  key={status}
                  className="rounded-xl border border-base-200 bg-base-100 p-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">{status}</h3>
                    <span className="text-xs text-base-content/60">
                      {bucket.total} applications
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">
                    {bucket.items.map((application) => (
                      <ApplicationCard
                        key={application._id}
                        application={application}
                      />
                    ))}
                    {bucket.items.length === 0 && (
                      <div className="rounded-xl border border-dashed border-base-200 bg-base-100 p-4 text-sm text-base-content/70">
                        No applications yet.
                      </div>
                    )}
                    {hasMore && (
                      <Link
                        to={`/status/${status}`}
                        className="block text-center text-xs text-primary hover:underline"
                      >
                        View all {bucket.total} →
                      </Link>
                    )}
                  </div>
                </section>
              )
            })}
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
