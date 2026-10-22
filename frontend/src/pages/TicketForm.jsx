import {
  STATUS_OPTIONS,
  PRIORITY_OPTIONS,
  CATEGORY_OPTIONS,
  inputClass,
  selectClass,
  Field,
} from '../constants'

// onChange is called with the next complete form object, so both a plain state
// setter and a `(next) => setState((prev) => ({ ...prev, ...next }))` patcher work.
function TicketForm({
  value,
  onChange,
  onSubmit,
  submitLabel,
  disabled,
  onCancel,
  className = 'flex flex-col gap-4 p-6',
}) {
  const set = (field) => (event) => onChange({ ...value, [field]: event.target.value })
  const options = (list) =>
    list.map((item) => (
      <option key={item} value={item}>
        {item.charAt(0).toUpperCase() + item.slice(1)}
      </option>
    ))

  // Edit forms (with a Cancel button) use the compact button; the create form uses the large CTA.
  const submitClass = onCancel
    ? 'inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60'
    : 'inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-60'

  return (
    <form onSubmit={onSubmit} className={className}>
      <Field label="Title">
        <input
          type="text"
          required
          value={value.title}
          onChange={set('title')}
          className={inputClass}
          placeholder="Short summary"
        />
      </Field>
      <Field label="Description">
        <textarea
          required
          rows={4}
          value={value.description}
          onChange={set('description')}
          className={inputClass}
          placeholder="Describe the issue"
        />
      </Field>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Category">
          <select value={value.category} onChange={set('category')} className={selectClass}>
            {options(CATEGORY_OPTIONS)}
          </select>
        </Field>
        <Field label="Priority">
          <select value={value.priority} onChange={set('priority')} className={selectClass}>
            {options(PRIORITY_OPTIONS)}
          </select>
        </Field>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Status">
          <select value={value.status} onChange={set('status')} className={selectClass}>
            {options(STATUS_OPTIONS)}
          </select>
        </Field>
        <Field label="Requester">
          <input
            type="text"
            value={value.requester_name}
            onChange={set('requester_name')}
            className={inputClass}
            placeholder="Requester name"
          />
        </Field>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Requester email">
          <input
            type="text"
            value={value.requester_email}
            onChange={set('requester_email')}
            className={inputClass}
            placeholder="Requester email"
          />
        </Field>
        <Field label="Assignee">
          <input
            type="text"
            value={value.assignee_name}
            onChange={set('assignee_name')}
            className={inputClass}
            placeholder="Assignee name"
          />
        </Field>
      </div>
      {onCancel ? (
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            Cancel
          </button>
          <button type="submit" disabled={disabled} className={submitClass}>
            {submitLabel}
          </button>
        </div>
      ) : (
        <button type="submit" disabled={disabled} className={submitClass}>
          {submitLabel}
        </button>
      )}
    </form>
  )
}

export default TicketForm
