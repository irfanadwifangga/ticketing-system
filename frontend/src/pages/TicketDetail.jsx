import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  EMPTY_FORM,
  statusBadgeClass,
  priorityBadgeClass,
  ticketToForm,
} from '../constants'
import TicketForm from './TicketForm'

function TicketDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionError, setActionError] = useState(null)
  const [reload, setReload] = useState(0)

  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [dark, setDark] = useState(() => {
    try {
      const stored = localStorage.getItem('theme')
      if (stored) return stored === 'dark'
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    } catch {
      return false
    }
  })

  useEffect(() => {
    const root = document.documentElement
    if (dark) root.classList.add('dark')
    else root.classList.remove('dark')
    try {
      localStorage.setItem('theme', dark ? 'dark' : 'light')
    } catch {
      // ignore
    }
  }, [dark])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    ;(async () => {
      try {
        const response = await fetch('/api/tickets/' + id + '/')
        if (cancelled) return
        if (!response.ok) throw new Error('Ticket request failed: ' + response.status)
        const data = await response.json()
        if (!cancelled) setTicket(data)
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load ticket')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id, reload])

  function startEdit() {
    if (!ticket) return
    setEditForm(ticketToForm(ticket))
    setEditing(true)
    setActionError(null)
  }

  function cancelEdit() {
    setEditing(false)
    setEditForm(EMPTY_FORM)
  }

  async function handleUpdate(event) {
    event.preventDefault()
    setSaving(true)
    setActionError(null)
    try {
      const response = await fetch('/api/tickets/' + id + '/', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })
      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error((payload && payload.detail) || ('Update failed: ' + response.status))
      }
      const updated = await response.json()
      setTicket(updated)
      cancelEdit()
    } catch (err) {
      setActionError(err.message || 'Failed to update ticket')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!window.confirm('Delete this ticket?')) return
    setDeleting(true)
    setActionError(null)
    try {
      const response = await fetch('/api/tickets/' + id + '/', { method: 'DELETE' })
      if (!response.ok && response.status !== 204) {
        throw new Error('Delete failed: ' + response.status)
      }
      navigate('/')
    } catch (err) {
      setActionError(err.message || 'Failed to delete ticket')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/40 dark:text-slate-100">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link to="/" className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400">
              Back to tickets
            </Link>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">Ticket detail</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">View and manage ticket #{id}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setDark((d) => !d)}
              aria-pressed={dark}
              aria-label="Toggle color theme"
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:ring-4 focus-visible:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {dark ? 'Light' : 'Dark'}
            </button>
          </div>
        </header>

        {actionError && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-red-500" />
            <span>{actionError}</span>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col gap-4" role="status" aria-live="polite" aria-label="Loading ticket">
            <div className="h-48 animate-pulse rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900" />
            <span className="sr-only">Loading ticket…</span>
          </div>
        ) : error ? (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            {error}
            <button onClick={() => setReload((r) => r + 1)} className="ml-3 font-semibold underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400">Retry</button>
          </div>
        ) : !ticket ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900" role="status">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Ticket not found</p>
          </div>
        ) : editing ? (
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/50">
              <h2 className="text-lg font-semibold">Edit ticket</h2>
            </div>
            <TicketForm
              value={editForm}
              onChange={setEditForm}
              onSubmit={handleUpdate}
              submitLabel={saving ? 'Saving...' : 'Save'}
              disabled={saving}
              onCancel={cancelEdit}
            />
          </section>
        ) : (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{ticket.title ?? 'Untitled'}</h2>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {ticket.description}
                </p>
              </div>
              <span
                className={'inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ' + statusBadgeClass(ticket.status)}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                {ticket.status ?? 'unknown'}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className={'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ' + priorityBadgeClass(ticket.priority)}>
                {ticket.priority ?? 'medium'}
              </span>
              {ticket.category && (
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {ticket.category}
                </span>
              )}
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 text-sm text-slate-600 dark:text-slate-300 sm:grid-cols-2">
              <div>
                <span className="font-semibold text-slate-700 dark:text-slate-300">Requester:</span>{' '}
                {ticket.requester_name || 'Unknown'}
              </div>
              {ticket.requester_email && (
                <div>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Email:</span>{' '}
                  {ticket.requester_email}
                </div>
              )}
              <div>
                <span className="font-semibold text-slate-700 dark:text-slate-300">Assignee:</span>{' '}
                {ticket.assignee_name || 'Unassigned'}
              </div>
              {ticket.created_at && (
                <div>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Created:</span>{' '}
                  {new Date(ticket.created_at).toLocaleString()}
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={startEdit}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-900/40"
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

export default TicketDetail
