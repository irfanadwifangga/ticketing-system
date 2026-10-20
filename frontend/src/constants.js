export const EMPTY_FORM = {
  title: '',
  description: '',
  category: 'other',
  priority: 'medium',
  status: 'open',
  requester_name: '',
  requester_email: '',
  assignee_name: '',
}

export const STATUS_OPTIONS = ['open', 'in_progress', 'waiting_customer', 'resolved', 'closed']
export const PRIORITY_OPTIONS = ['low', 'medium', 'high', 'urgent']
export const CATEGORY_OPTIONS = ['hardware', 'software', 'network', 'access', 'account', 'printing', 'other']

export const STATUS_STYLES = {
  open: 'bg-blue-100 text-blue-700 ring-1 ring-blue-200 dark:bg-blue-900/40 dark:text-blue-300',
  in_progress: 'bg-amber-100 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-900/40 dark:text-amber-300',
  waiting_customer: 'bg-violet-100 text-violet-700 ring-1 ring-violet-200 dark:bg-violet-900/40 dark:text-violet-300',
  resolved: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300',
  closed: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200 dark:bg-slate-700 dark:text-slate-300',
}

export const PRIORITY_STYLES = {
  low: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200 dark:bg-slate-700 dark:text-slate-300',
  medium: 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300',
  high: 'bg-orange-100 text-orange-700 ring-1 ring-orange-200 dark:bg-orange-900/40 dark:text-orange-300',
  urgent: 'bg-red-100 text-red-700 ring-1 ring-red-200 dark:bg-red-900/40 dark:text-red-300',
}

export function statusBadgeClass(status) {
  return STATUS_STYLES[status] || 'bg-gray-100 text-gray-700 ring-1 ring-gray-200'
}

export function priorityBadgeClass(priority) {
  return PRIORITY_STYLES[priority] || 'bg-gray-100 text-gray-700 ring-1 ring-gray-200'
}

export const inputClass =
  'w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-indigo-900/40'

export const selectClass =
  'w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-indigo-900/40'

export function ticketToForm(ticket) {
  return {
    title: ticket.title ?? '',
    description: ticket.description ?? '',
    category: ticket.category ?? 'other',
    priority: ticket.priority ?? 'medium',
    status: ticket.status ?? 'open',
    requester_name: ticket.requester_name ?? '',
    requester_email: ticket.requester_email ?? '',
    assignee_name: ticket.assignee_name ?? '',
  }
}

import { createElement } from 'react'

export function Field({ label, children }) {
  return createElement(
    'div',
    { className: 'space-y-1.5' },
    createElement(
      'label',
      { className: 'block text-sm font-medium text-slate-700 dark:text-slate-300' },
      createElement('span', { className: 'mb-1.5 block' }, label),
      children,
    ),
  )
}

export function StatCard({ label, value, accent }) {
  return createElement(
    'div',
    { className: 'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900' },
    createElement('p', { className: 'text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400' }, label),
    createElement('p', { className: `mt-2 text-3xl font-bold ${accent}` }, value),
  )
}
