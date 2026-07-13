import { useState } from 'react'
import { EMPTY_EMPLOYEE, DEPARTMENTS, STATUSES, validateEmployee, formatDateForInput } from '../models/Employee'

function normalizeInitial(initial) {
  if (!initial) return EMPTY_EMPLOYEE
  return {
    ...initial,
    salary: initial.salary ?? '',
    phone: initial.phone ?? '',
    hire_date: formatDateForInput(initial.hire_date),
  }
}

export default function EmployeeForm({ initial, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState(() => normalizeInitial(initial))
  const [errors, setErrors] = useState({})

  const set = (field) => (e) => {
    const val = e.target.value
    setForm((f) => ({ ...f, [field]: val }))
    if (errors[field]) setErrors((err) => ({ ...err, [field]: undefined }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validateEmployee(form)
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    await onSubmit({
      ...form,
      salary: form.salary === '' ? null : Number(form.salary),
      phone:  form.phone?.trim() || null,
    })
  }

  const field = (name, label, type = 'text', placeholder = '') => (
    <div>
      <label className="label">{label}</label>
      <input
        type={type}
        value={form[name]}
        onChange={set(name)}
        placeholder={placeholder}
        className={`input ${errors[name] ? 'input-error' : ''}`}
      />
      {errors[name] && <p className="error-msg">{errors[name]}</p>}
    </div>
  )

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {field('first_name', 'First Name *', 'text', 'John')}
        {field('last_name',  'Last Name *',  'text', 'Doe')}
        {field('email',      'Email *',      'email', 'john.doe@company.com')}
        {field('phone',      'Phone',        'tel',   '+1 (555) 000-0000')}

        <div>
          <label className="label">Department *</label>
          <select value={form.department} onChange={set('department')} className={`input ${errors.department ? 'input-error' : ''}`}>
            <option value="">Select department...</option>
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          {errors.department && <p className="error-msg">{errors.department}</p>}
        </div>

        {field('position', 'Position / Job Title *', 'text', 'Software Engineer')}
        {field('salary',   'Salary (USD)',            'number', '75000')}
        {field('hire_date','Hire Date *',             'date')}

        <div>
          <label className="label">Status</label>
          <select value={form.status} onChange={set('status')} className="input">
            {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? 'Saving...' : initial ? 'Update Employee' : 'Add Employee'}
        </button>
      </div>
    </form>
  )
}
