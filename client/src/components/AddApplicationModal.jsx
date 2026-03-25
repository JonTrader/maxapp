import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import toast from 'react-hot-toast'
import api from '../api/api'

const defaultState = {
  company: '',
  role: '',
  status: 'Applied',
  appliedDate: '',
  location: '',
  notes: '',
  jobDescription: '',
  jobUrl: '',
  resume: undefined,
  runAnalysis: false
}

export default function AddApplicationModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState(defaultState)
  const [saving, setSaving] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (open) {
      setForm(defaultState)
      setSaving(false)
    }
  }, [open])

  const canSubmit = useMemo(() => {
    return form.company.trim() && form.role.trim() && form.jobDescription && form.resume
  }, [form.company, form.role, form.jobDescription, form.resume])

  const handleChange = (key) => (event) => {
    const value = event.target.value
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null
    setForm((prev) => ({ ...prev, resume: file }))
  }

  const handleToggle = () => {
    setForm((prev) => ({ ...prev, runAnalysis: !prev.runAnalysis }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!canSubmit) return

    setSaving(true)

    try {
      const appliedDate = form.appliedDate ? new Date(form.appliedDate).toISOString() : 'undefined'

      const formData = new FormData()
      formData.append('company', form.company)
      formData.append('role', form.role)
      formData.append('status', form.status)
      if (form.appliedDate) formData.append('appliedDate', appliedDate)
      formData.append('notes', form.notes)
      formData.append('location', form.location)
      formData.append('jobDescription', form.jobDescription)
      formData.append('jobUrl', form.jobUrl)
      formData.append('resume', form.resume)

      const { data: created } = await api.post('/applications', formData)
      setSaving(false)
      if (form.runAnalysis) {
        setAnalyzing(true)
        formData.append('applicationId', created._id)

        const { data: analysis } = await api.post('/ai/analyze', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })

        await api.put(`/applications/${created._id}`, {
          aiAnalysis: analysis
        })

        created.aiAnalysis = analysis
        setAnalyzing(false)
      }

      toast.success('Application added')
      onCreated(created)
      onClose()
      navigate(`/application/${created._id}`)
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Failed to add application')
    } finally {
      setSaving(false)
      setAnalyzing(false)
    }
  }

  if (!open) return null

  return (
    <div className="modal modal-open">
      <div className="modal-box relative max-w-2xl">
        <button
          type="button"
          className="btn btn-sm btn-ghost btn-circle absolute right-3 top-3"
          onClick={onClose}
        >
          ✕
        </button>
        <h2 className="text-xl font-semibold">Add New Application</h2>
        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="input-group">
              <span className="w-32">Company *</span>
              <input
                value={form.company}
                onChange={handleChange('company')}
                type="text"
                placeholder="e.g. Acme Corp"
                className="input input-bordered w-full"
                required
              />
            </label>
            <label className="input-group">
              <span className="w-32">Role *</span>
              <input
                value={form.role}
                onChange={handleChange('role')}
                type="text"
                placeholder="e.g. Product Designer"
                className="input input-bordered w-full"
                required
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="input-group">
              <span className="w-32">Status</span>
              <select
                value={form.status}
                onChange={handleChange('status')}
                className="select select-bordered w-full"
              >
                <option>Saved</option>
                <option>Applied</option>
                <option>Interview</option>
                <option>Offer</option>
                <option>Rejected</option>
              </select>
            </label>
            <label className="input-group">
              <span className="w-32">Date Applied</span>
              <input
                value={form.appliedDate}
                onChange={handleChange('appliedDate')}
                type="date"
                className="input input-bordered w-full"
              />
            </label>
          </div>

          <label className="input-group">
            <span className="w-32">Location</span>
            <input
              value={form.location}
              onChange={handleChange('location')}
              type="text"
              placeholder="e.g. San Francisco, CA"
              className="input input-bordered w-full"
            />
          </label>

          <div className='mt-4'>
            <label className="input-group">
              <span className="w-32">Notes</span>
              <textarea
                value={form.notes}
                onChange={handleChange('notes')}
                className="textarea textarea-bordered w-full"
                placeholder="Optional notes about this role"
                rows={3}
              />
            </label>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2 grid-flow-col">
            <label className="row-span-3 input-group">
              <span className="w-32">Job description *</span>
              <textarea
                value={form.jobDescription}
                onChange={handleChange('jobDescription')}
                className="textarea textarea-bordered w-full"
                placeholder="Paste the job description here..."
                rows={4}
              />
            </label>
            <label className="input-group">
              <span className="w-32">Job Application URL</span>
              <input
                value={form.jobUrl}
                onChange={handleChange('jobUrl')}
                type="text"
                placeholder="https://joburl.com"
                className="input input-bordered w-full"
                required
              />
            </label>
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text text-sm">Resume (PDF) *</span>
              </div>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="file-input file-input-bordered w-full"
              />
              {form.resume && (
                <div className="label">
                  <span className="label-text-alt text-xs text-success">✓ {form.resume.name}</span>
                </div>
              )}
            </label>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.runAnalysis}
              onChange={handleToggle}
              className="checkbox"
            />
            Run AI analysis after saving
          </label>

          <div className="mt-4 flex flex-col items-end gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={!canSubmit || saving || analyzing}>
              {saving ? 'Saving…' : analyzing ? 'Analyzing Resume...' : 'Add Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
