import { useState } from 'react'
import { formatSalary, formatDate } from '../models/Employee'

const SORTABLE = [
  { field: 'last_name', label: 'Name' },
  { field: 'department', label: 'Department' },
  { field: 'position', label: 'Position' },
  { field: 'salary', label: 'Salary' },
  { field: 'hire_date', label: 'Hire Date' },
  { field: 'status', label: 'Status' },
]

function SortIcon({ active, dir }) {
  if (!active) return <span className="ml-1 text-gray-300">↕</span>
  return <span className="ml-1 text-primary-600">{dir === 'asc' ? '↑' : '↓'}</span>
}

function ConfirmDelete({ employee, onConfirm, onCancel, submitting }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="card p-6 w-full max-w-sm">
        <h3 className="text-base font-semibold text-gray-900 mb-2">Delete Employee</h3>
        <p className="text-sm text-gray-600 mb-5">
          Are you sure you want to delete{' '}
          <strong>{employee.first_name} {employee.last_name}</strong>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="btn-secondary btn-sm">Cancel</button>
          <button onClick={onConfirm} disabled={submitting} className="btn-danger btn-sm">
            {submitting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function EmployeeTable({ employees, loading, sortField, sortDir, toggleSort, onEdit, onDelete }) {
  const [deleting, setDeleting] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const handleDeleteConfirm = async () => {
    setDeletingId(deleting.id)
    try {
      await onDelete(deleting.id)
    } finally {
      setDeletingId(null)
      setDeleting(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (!employees.length) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-gray-400">
        <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <p className="text-sm">No employees found</p>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {SORTABLE.map(({ field, label }) => (
                <th
                  key={field}
                  onClick={() => toggleSort(field)}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer select-none hover:text-gray-800 transition-colors whitespace-nowrap"
                >
                  {label}
                  <SortIcon active={sortField === field} dir={sortDir} />
                </th>
              ))}
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {employees.map((emp) => (
              <tr key={emp.id} className="hover:bg-gray-50 transition-colors group">
                <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                  {emp.first_name} {emp.last_name}
                </td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{emp.department}</td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{emp.position}</td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatSalary(emp.salary)}</td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(emp.hire_date)}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={emp.status === 'active' ? 'badge-active' : 'badge-inactive'}>
                    {emp.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 max-w-[180px] truncate">{emp.email}</td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <button
                    onClick={() => onEdit(emp)}
                    className="btn-secondary btn-sm mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleting(emp)}
                    disabled={deletingId === emp.id}
                    className="btn btn-sm bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 focus:ring-red-400"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {deleting && (
        <ConfirmDelete
          employee={deleting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleting(null)}
          submitting={deletingId === deleting?.id}
        />
      )}
    </>
  )
}
