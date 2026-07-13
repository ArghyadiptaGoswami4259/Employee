import { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import toast from 'react-hot-toast'
import { useEmployeeController } from './controllers/useEmployeeController'
import SearchFilterBar from './views/SearchFilterBar'
import EmployeeTable from './views/EmployeeTable'
import Pagination from './views/Pagination'
import { EmployeeModal } from './views/Modal'

function ConnectionErrorBanner({ message }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-6">
      <div className="rounded-xl border border-red-200 bg-red-50 p-5">
        <div className="flex gap-3">
          <div className="shrink-0 mt-0.5">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-red-800 mb-1">MongoDB connection failed</h3>
            <p className="text-sm text-red-700">{message}</p>
            <p className="text-xs text-red-600 mt-2">
              To fix: go to your Supabase project &rarr; <strong>Settings &rarr; Edge Functions &rarr; Secrets</strong>{' '}
              and add <code className="bg-red-100 px-1 rounded font-mono">MONGODB_URI</code> with your Atlas connection string.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const ctrl = useEmployeeController()
  const [modal, setModal] = useState(null)

  const handleAdd = async (data) => {
    await ctrl.createEmployee(data)
  }

  const handleEdit = async (data) => {
    await ctrl.updateEmployee(modal.id, data)
  }

  const handleDelete = async (id) => {
    try {
      await ctrl.deleteEmployee(id)
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 leading-tight">Employee Management</h1>
              <p className="text-xs text-gray-500 hidden sm:block">MVC Architecture · React + MongoDB Atlas</p>
            </div>
          </div>
          <button
            onClick={() => setModal('add')}
            disabled={!!ctrl.connectionError}
            className="btn-primary"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Employee
          </button>
        </div>
      </header>

      {/* Stats bar */}
      {!ctrl.connectionError && (
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 text-sm text-gray-500">
            <span className="font-semibold text-gray-800">{ctrl.total}</span> total employees
          </div>
        </div>
      )}

      {/* Connection error */}
      {ctrl.connectionError && <ConnectionErrorBanner message={ctrl.connectionError} />}

      {/* Main content */}
      {!ctrl.connectionError && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-4">
          <div className="card p-4">
            <SearchFilterBar
              search={ctrl.search}           setSearch={ctrl.setSearch}
              filterDept={ctrl.filterDept}   setFilterDept={ctrl.setFilterDept}
              filterStatus={ctrl.filterStatus} setFilterStatus={ctrl.setFilterStatus}
            />
          </div>

          <div className="card">
            <EmployeeTable
              employees={ctrl.employees}
              loading={ctrl.loading}
              sortField={ctrl.sortField}
              sortDir={ctrl.sortDir}
              toggleSort={ctrl.toggleSort}
              onEdit={(emp) => setModal(emp)}
              onDelete={handleDelete}
            />
            {!ctrl.loading && ctrl.employees.length > 0 && (
              <div className="px-4 sm:px-6 py-3">
                <Pagination
                  page={ctrl.page}
                  totalPages={ctrl.totalPages}
                  total={ctrl.total}
                  pageSize={ctrl.PAGE_SIZE}
                  onPage={ctrl.setPage}
                />
              </div>
            )}
          </div>
        </main>
      )}

      {/* Modals */}
      {modal === 'add' && (
        <EmployeeModal onSubmit={handleAdd} onClose={() => setModal(null)} />
      )}
      {modal && modal !== 'add' && (
        <EmployeeModal initial={modal} onSubmit={handleEdit} onClose={() => setModal(null)} />
      )}
    </div>
  )
}
