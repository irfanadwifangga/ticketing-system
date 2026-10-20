import { useState, useEffect, useMemo } from 'react'

const EMPTY_FORM = {
  title: '',
  description: '',
  category: 'other',
  priority: 'medium',
  status: 'open',
  requester_name: '',
  requester_email: '',
  assignee_name: '',
}

const STATUS_OPTIONS = ['open', 'in_progress', 'waiting_customer', 'resolved', 'closed']
const PRIORITY_OPTIONS = ['low', 'medium', 'high', 'urgent']
const CATEGORY_OPTIONS = ['hardware', 'software', 'network', 'access', 'account', 'printing', 'other']

const STATUS_STYLES = {
  open: 'bg-blue-100 text-blue-700 ring-1 ring-blue-200 dark:bg-blue-900/40 dark:text-blue-300',
  in_progress: 'bg-amber-100 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-900/40 dark:text-amber-300',
  waiting_customer: 'bg-violet-100 text-violet-700 ring-1 ring-violet-200 dark:bg-violet-900/40 dark:text-violet-300',
  resolved: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300',
  closed: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200 dark:bg-slate-700 dark:text-slate-300',
}

const PRIORITY_STYLES = {
  low: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200 dark:bg-slate-700 dark:text-slate-300',
  medium: 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300',
  high: 'bg-orange-100 text-orange-700 ring-1 ring-orange-200 dark:bg-orange-900/40 dark:text-orange-300',
  urgent: 'bg-red-100 text-red-700 ring-1 ring-red-200 dark:bg-red-900/40 dark:text-red-300',
}

function statusBadgeClass(status) {
  return STATUS_STYLES[status] || 'bg-gray-100 text-gray-700 ring-1 ring-gray-200'
}

function priorityBadgeClass(priority) {
  return PRIORITY_STYLES[priority] || 'bg-gray-100 text-gray-700 ring-1 ring-gray-200'
}

const inputClass =
  'w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-indigo-900/40'

const selectClass =
  'w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-indigo-900/40'

function StatCard({ label, value, accent }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${accent}`}>{value}</p>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
      {children}
    </div>
  )
}

function App() {
  const [health, setHealth] = useState(null)
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [form, setForm] = useState(EMPTY_FORM)
  const [creating, setCreating] = useState(false)
  const [actionError, setActionError] = useState(null)

  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState(EMPTY_FORM)
  const [savingId, setSavingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const [query, setQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [filterCategory, setFilterCategory] = useState('')

  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')

    useEffect(() => {
      if (dark) document.documentElement.classList.add('dark')
      else document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', dark ? 'dark' : 'light')
    }, [dark])

  async function loadTickets() {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/tickets/')
      if (!response.ok) throw new Error('Tickets request failed: ' + response.status)
      const data = await response.json()
      const list = Array.isArray(data) ? data : data?.results ?? []
      setTickets(list)
    } catch (err) {
      setError(err.message || 'Failed to load tickets')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    async function bootstrap() {
      try {
        const healthResponse = await fetch('/health/')
        if (!healthResponse.ok) throw new Error('Health check failed: ' + healthResponse.status)
        const healthData = await healthResponse.json()
        if (!cancelled) setHealth(healthData?.status ?? 'ok')
      } catch (err) {
        if (!cancelled) setHealth('unavailable')
      }
      if (!cancelled) await loadTickets()
    }
    bootstrap()
    return () => {
      cancelled = true
    }
  }, [])

  async function handleCreate(event) {
    event.preventDefault()
    setCreating(true)
    setActionError(null)
    try {
      const response = await fetch('/api/tickets/', {
              method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error((payload && payload.detail) || ('Create failed: ' + response.status))
      }
      const created = await response.json()
      setTickets((previous) => [created, ...previous])
      setForm(EMPTY_FORM)
    } catch (err) {
      setActionError(err.message || 'Failed to create ticket')
    } finally {
      setCreating(false)
    }
  }

  function startEdit(ticket) {
    setEditingId(ticket.id)
    setEditForm({
      title: ticket.title ?? '',
      description: ticket.description ?? '',
      category: ticket.category ?? 'general',
      priority: ticket.priority ?? 'medium',
      status: ticket.status ?? 'open',
      requester_name: ticket.requester_name ?? '',
      requester_email: ticket.requester_email ?? '',
      assignee_name: ticket.assignee_name ?? '',
    })
    setActionError(null)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditForm(EMPTY_FORM)
  }

  async function handleUpdate(event, id) {
    event.preventDefault()
    setSavingId(id)
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
      setTickets((previous) =>
        previous.map((ticket) => (ticket.id === id ? updated : ticket))
      )
      cancelEdit()
    } catch (err) {
      setActionError(err.message || 'Failed to update ticket')
    } finally {
      setSavingId(null)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this ticket?')) return
    setDeletingId(id)
    setActionError(null)
    try {
      const response = await fetch('/api/tickets/' + id + '/', { method: 'DELETE' })
      if (!response.ok && response.status !== 204) {
        throw new Error('Delete failed: ' + response.status)
      }
      setTickets((previous) => previous.filter((ticket) => ticket.id !== id))
      if (editingId === id) cancelEdit()
    } catch (err) {
      setActionError(err.message || 'Failed to delete ticket')
    } finally {
      setDeletingId(null)
    }
  }

  const filteredTickets = useMemo(() => {
    const q = query.trim().toLowerCase()
    return tickets.filter((t) => {
      if (filterStatus && t.status !== filterStatus) return false
      if (filterPriority && t.priority !== filterPriority) return false
      if (filterCategory && (t.category ?? 'general') !== filterCategory) return false
      if (q) {
        const haystack = [t.title, t.description, t.requester_name, t.requester_email, t.assignee_name, t.category]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [tickets, query, filterStatus, filterPriority, filterCategory])

  const stats = useMemo(() => {
    return {
      open: tickets.filter((t) => t.status === 'open').length,
      inProgress: tickets.filter((t) => t.status === 'in_progress' || t.status === 'waiting_customer').length,
      resolved: tickets.filter((t) => t.status === 'resolved' || t.status === 'closed').length,
    }
  }, [tickets])

  const availableCategories = useMemo(() => {
    const set = new Set(CATEGORY_OPTIONS)
    tickets.forEach((t) => t.category && set.add(t.category))
    return Array.from(set)
  }, [tickets])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/40 dark:text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">IT Helpdesk</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage and track support tickets</p>
          </div>
          <div className="flex items-center gap-3">
            {health === null ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-1.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-300">
                <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />
                Checking health...
              </span>
            ) : health === 'unavailable' || error ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-1.5 text-xs font-semibold text-red-700 ring-1 ring-red-200 dark:bg-red-900/30 dark:text-red-300">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                Backend unavailable
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Health: {health}
              </span>
            )}
            <button
              type="button"
              onClick={() => setDark((d) => !d)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {dark ? 'Light' : 'Dark'}
            </button>
            <button
              type="button"
              onClick={loadTickets}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Refresh
            </button>
          </div>
        </header>

        {actionError && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-red-500" />
            <span>{actionError}</span>
          </div>
        )}

        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Open" value={stats.open} accent="text-blue-600 dark:text-blue-400" />
          <StatCard label="In progress" value={stats.inProgress} accent="text-amber-600 dark:text-amber-400" />
          <StatCard label="Resolved" value={stats.resolved} accent="text-emerald-600 dark:text-emerald-400" />
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <aside className="lg:col-span-4 space-y-6">
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/50">
                <h2 className="text-lg font-semibold">Create ticket</h2>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Add a new support ticket to the queue.</p>
              </div>
              <form onSubmit={handleCreate} className="flex flex-col gap-4 p-6">
                <Field label="Title">
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                    className={inputClass}
                    placeholder="Short summary"
                  />
                </Field>
                <Field label="Description">
                  <textarea
                    required
                    rows={4}
                    value={form.description}
                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    className={inputClass}
                    placeholder="Describe the issue"
                  />
                </Field>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Category">
                    <select
                      value={form.category}
                      onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                      className={selectClass}
                    >
                      {CATEGORY_OPTIONS.map((c) => (
                        <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Priority">
                    <select
                      value={form.priority}
                      onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}
                      className={selectClass}
                    >
                      {PRIORITY_OPTIONS.map((p) => (
                        <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                      ))}
                    </select>
                  </Field>
                </div>
                <Field label="Status">
                  <select
                    value={form.status}
                    onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                    className={selectClass}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </Field>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Requester">
                    <input
                      type="text"
                      value={form.requester_name}
                      onChange={(e) => setForm((p) => ({ ...p, requester_name: e.target.value }))}
                      className={inputClass}
                      placeholder="Requester name"
                    />
                  </Field>
                  <Field label="Assignee">
                    <input
                      type="text"
                      value={form.assignee_name}
                      onChange={(e) => setForm((p) => ({ ...p, assignee_name: e.target.value }))}
                      className={inputClass}
                      placeholder="Assignee name"
                    />
                  </Field>
                </div>
                <button
                  type="submit"
                  disabled={creating}
                  className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {creating ? 'Creating...' : 'Create ticket'}
                </button>
              </form>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Filters</h2>
              <div className="mt-4 flex flex-col gap-3">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className={inputClass}
                  placeholder="Search title, requester, assignee..."
                />
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={selectClass}>
                  <option value="">All statuses</option>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
                <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className={selectClass}>
                  <option value="">All priorities</option>
                  {PRIORITY_OPTIONS.map((p) => (
                    <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                  ))}
                </select>
                <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className={selectClass}>
                  <option value="">All categories</option>
                  {availableCategories.map((c) => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
              </div>
            </section>
          </aside>

          <main className="lg:col-span-8">
            {loading ? (
              <div className="flex flex-col gap-4">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="h-36 animate-pulse rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900" />
                ))}
              </div>
            ) : error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                {error}
                <button onClick={loadTickets} className="ml-3 font-semibold underline">Retry</button>
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  {tickets.length === 0 ? 'No tickets yet' : 'No tickets match your filters'}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {tickets.length === 0 ? 'Create one to get started.' : 'Try adjusting filters or search.'}
                </p>
              </div>
            ) : (
              <ul className="flex flex-col gap-4">
                {filteredTickets.map((ticket) => {
                  const isEditing = editingId === ticket.id
                  return (
                    <li
                      key={ticket.id}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                    >
                      {isEditing ? (
                        <form onSubmit={(event) => handleUpdate(event, ticket.id)} className="flex flex-col gap-4">
                          <input
                            type="text"
                            required
                            value={editForm.title}
                            onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
                            className={inputClass}
                            placeholder="Title"
                          />
                          <textarea
                            required
                            rows={3}
                            value={editForm.description}
                            onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
                            className={inputClass}
                            placeholder="Description"
                          />
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <select
                              value={editForm.category}
                              onChange={(e) => setEditForm((p) => ({ ...p, category: e.target.value }))}
                              className={selectClass}
                            >
                              {CATEGORY_OPTIONS.map((c) => (
                                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                              ))}
                            </select>
                            <select
                              value={editForm.priority}
                              onChange={(e) => setEditForm((p) => ({ ...p, priority: e.target.value }))}
                              className={selectClass}
                            >
                              {PRIORITY_OPTIONS.map((p) => (
                                <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                              ))}
                            </select>
                          </div>
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <select
                              value={editForm.status}
                              onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value }))}
                              className={selectClass}
                            >
                              {STATUS_OPTIONS.map((s) => (
                                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                              ))}
                            </select>
                            <input
                              type="text"
                              value={editForm.requester_name}
                              onChange={(e) => setEditForm((p) => ({ ...p, requester_name: e.target.value }))}
                              className={inputClass}
                              placeholder="Requester"
                            />
                            <input
                              type="text"
                              value={editForm.assignee_name}
                              onChange={(e) => setEditForm((p) => ({ ...p, assignee_name: e.target.value }))}
                              className={inputClass}
                              placeholder="Assignee"
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={cancelEdit}
                              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={savingId === ticket.id}
                              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {savingId === ticket.id ? 'Saving...' : 'Save'}
                            </button>
                          </div>
                        </form>
                      ) : (
                        <>
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <h3 className="truncate text-base font-semibold text-slate-900 dark:text-slate-100">
                                {ticket.title ?? 'Untitled'}
                              </h3>
                              <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-slate-600 dark:text-slate-300">
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
                          <div className="mt-4 grid grid-cols-1 gap-2 text-xs text-slate-500 dark:text-slate-400 sm:grid-cols-2">
                            <div>
                              <span className="font-semibold text-slate-700 dark:text-slate-300">Requester:</span>{' '}
                              {ticket.requester_name || 'Unknown'}
                            </div>
                            <div>
                              <span className="font-semibold text-slate-700 dark:text-slate-300">Assignee:</span>{' '}
                              {ticket.assignee_name || 'Unassigned'}
                            </div>
                          </div>
                          <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                            <span className="text-xs text-slate-400">
                              {ticket.created_at ? new Date(ticket.created_at).toLocaleString() : ''}
                            </span>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => startEdit(ticket)}
                                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(ticket.id)}
                                disabled={deletingId === ticket.id}
                                className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-900/40"
                              >
                                {deletingId === ticket.id ? 'Deleting...' : 'Delete'}
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default App
