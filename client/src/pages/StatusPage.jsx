import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router'
import toast from 'react-hot-toast'
import api from '../api/api'
import ApplicationCard from '../components/ApplicationCard'
import Header from '../components/Header'

const VALID_STATUSES = ['Applied', 'Interview', 'Offer', 'Rejected', 'Saved']
const PAGE_SIZE = 20

export default function StatusPage() {
    const { status } = useParams()
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [pagination, setPagination] = useState({
        page: 1,
        limit: PAGE_SIZE,
        total: 0,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
    })

    const canonicalStatus = useMemo(() => {
        if (typeof status !== 'string') return null
        const normalized = status.trim().toLowerCase()
        return VALID_STATUSES.find((value) => value.toLowerCase() === normalized) || null
    }, [status])

    const isValidStatus = canonicalStatus !== null

    useEffect(() => {
        setPage(1)
    }, [canonicalStatus])

    useEffect(() => {
        if (!isValidStatus) {
            setLoading(false)
            setItems([])
            setPagination({
                page: 1,
                limit: PAGE_SIZE,
                total: 0,
                totalPages: 1,
                hasNext: false,
                hasPrev: false
            })
            return
        }

        const fetchByStatus = async () => {
            setLoading(true)
            try {
                const { data } = await api.get(`/applications/status/${canonicalStatus}`, {
                    params: {
                        page,
                        limit: PAGE_SIZE
                    }
                })

                setItems(data.items || [])
                setPagination(data.pagination || {
                    page,
                    limit: PAGE_SIZE,
                    total: 0,
                    totalPages: 1,
                    hasNext: false,
                    hasPrev: page > 1
                })
            } catch (err) {
                console.error(err)
                toast.error('Unable to load applications for this status')
                setItems([])
                setPage(1)
                setPagination({
                    page: 1,
                    limit: PAGE_SIZE,
                    total: 0,
                    totalPages: 1,
                    hasNext: false,
                    hasPrev: false
                })
            } finally {
                setLoading(false)
            }
        }

        fetchByStatus()
    }, [canonicalStatus, page, isValidStatus])

    return (
        <div className="min-h-screen bg-base-200">
            <Header />

            <main className="mx-auto max-w-7xl px-4 py-8">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold">{canonicalStatus || 'Status'} Applications</h2>
                        <p className="mt-1 text-sm text-base-content/70">
                            Page {pagination.page} of {pagination.totalPages} · {pagination.total} total
                        </p>
                    </div>
                    <Link to="/dashboard" className="btn btn-ghost btn-sm">
                        Back to Dashboard
                    </Link>
                </div>

                {!isValidStatus ? (
                    <div className="rounded-xl border border-dashed border-base-200 bg-base-100 p-6 text-sm text-base-content/70">
                        Invalid status. Please return to your dashboard and select a valid status.
                    </div>
                ) : loading ? (
                    <div className="mt-12 text-center text-base-content/70">Loading applications...</div>
                ) : (
                    <>
                        <div className="space-y-3">
                            {items.map((application) => (
                                <ApplicationCard key={application._id} application={application} />
                            ))}
                            {items.length === 0 && (
                                <div className="rounded-xl border border-dashed border-base-200 bg-base-100 p-6 text-sm text-base-content/70">
                                    No applications found for {canonicalStatus}.
                                </div>
                            )}
                        </div>

                        <div className="mt-6 flex items-center justify-between">
                            <button
                                type="button"
                                className="btn btn-outline btn-sm"
                                disabled={!pagination.hasPrev || loading}
                                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                            >
                                Previous
                            </button>

                            <span className="text-sm text-base-content/70">
                                {pagination.total === 0
                                    ? 'Showing 0 of 0'
                                    : `Showing ${(pagination.page - 1) * pagination.limit + 1}-${(pagination.page - 1) * pagination.limit + items.length} of ${pagination.total}`}
                            </span>

                            <button
                                type="button"
                                className="btn btn-outline btn-sm"
                                disabled={!pagination.hasNext || loading}
                                onClick={() => setPage((prev) => prev + 1)}
                            >
                                Next
                            </button>
                        </div>
                    </>
                )}
            </main>
        </div>
    )
}
