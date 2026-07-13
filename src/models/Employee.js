/**
 * Employee model — defines shape, constants, validation, and formatters.
 */

export const DEPARTMENTS = [
  'Engineering', 'Marketing', 'Sales', 'Human Resources', 'Finance',
  'Operations', 'Design', 'Legal', 'Customer Support', 'Product',
]

export const STATUSES = ['active', 'inactive']

export const EMPTY_EMPLOYEE = {
  first_name: '', last_name: '', email: '', phone: '',
  department: '', position: '', salary: '', hire_date: '', status: 'active',
}

export function validateEmployee(data) {
  const errors = {}

  if (!data.first_name?.trim()) errors.first_name = 'First name is required'
  if (!data.last_name?.trim())  errors.last_name  = 'Last name is required'

  if (!data.email?.trim()) {
    errors.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Invalid email address'
  }

  if (data.phone && !/^[\d\s+\-()]{7,20}$/.test(data.phone)) {
    errors.phone = 'Invalid phone number'
  }

  if (!data.department) errors.department = 'Department is required'
  if (!data.position?.trim()) errors.position = 'Position is required'

  if (data.salary !== '' && data.salary !== null && data.salary !== undefined) {
    const sal = Number(data.salary)
    if (isNaN(sal) || sal < 0) errors.salary = 'Salary must be a positive number'
  }

  if (!data.hire_date) errors.hire_date = 'Hire date is required'

  return errors
}

export function formatSalary(value) {
  if (value === null || value === undefined || value === '') return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', maximumFractionDigits: 0,
  }).format(value)
}

export function formatDate(value) {
  if (!value) return '—'
  const d = new Date(value)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC',
  })
}

// Returns "YYYY-MM-DD" for <input type="date">
export function formatDateForInput(value) {
  if (!value) return ''
  const d = new Date(value)
  if (isNaN(d.getTime())) return ''
  return d.toISOString().split('T')[0]
}
