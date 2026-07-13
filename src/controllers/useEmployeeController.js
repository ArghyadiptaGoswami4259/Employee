import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { employeeApi, MongoDBConnectionError } from '../lib/mongodb'

const PAGE_SIZE = 10

/**
 * Controller: manages all employee data operations and UI state.
 * Data is stored in MongoDB Atlas via the Supabase Edge Function.
 */
export function useEmployeeController() {
  const [employees, setEmployees] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [connectionError, setConnectionError] = useState(null)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [filterDept, setFilterDept] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [sortField, setSortField] = useState('createdAt')
  const [sortDir, setSortDir] = useState('desc')

  const fetchEmployees = useCallback(async () => {
    setLoading(true)
    try {
      const result = await employeeApi.list({
        page,
        limit: PAGE_SIZE,
        search: search.trim(),
        department: filterDept,
        status: filterStatus,
        sortField,
        sortDir,
      })
      setEmployees(result.employees ?? [])
      setTotal(result.total ?? 0)
      setConnectionError(null)
    } catch (err) {
      if (err instanceof MongoDBConnectionError) {
        setConnectionError(err.message)
        setEmployees([])
        setTotal(0)
      } else {
        toast.error('Failed to load employees')
      }
    } finally {
      setLoading(false)
    }
  }, [search, filterDept, filterStatus, sortField, sortDir, page])

  useEffect(() => {
    setPage(1)
  }, [search, filterDept, filterStatus, sortField, sortDir])

  useEffect(() => {
    fetchEmployees()
  }, [fetchEmployees])

  const createEmployee = async (data) => {
    const { error } = await employeeApi.create(data).then(
      (d) => ({ data: d, error: null }),
      (e) => ({ data: null, error: e })
    )
    if (error) throw error
    toast.success('Employee added successfully')
    await fetchEmployees()
  }

  const updateEmployee = async (id, data) => {
    const { error } = await employeeApi.update(id, data).then(
      (d) => ({ data: d, error: null }),
      (e) => ({ data: null, error: e })
    )
    if (error) throw error
    toast.success('Employee updated successfully')
    await fetchEmployees()
  }

  const deleteEmployee = async (id) => {
    await employeeApi.remove(id)
    toast.success('Employee deleted')
    await fetchEmployees()
  }

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  return {
    employees,
    total,
    loading,
    connectionError,
    page,
    totalPages: Math.ceil(total / PAGE_SIZE),
    search,       setSearch,
    filterDept,   setFilterDept,
    filterStatus, setFilterStatus,
    sortField,
    sortDir,
    toggleSort,
    setPage,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    PAGE_SIZE,
  }
}
