'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Truck, 
  Package, 
  CheckCircle, 
  Clock, 
  Plus, 
  Search, 
  Filter,
  Download,
  LogOut,
  User,
  Settings,
  Users
} from 'lucide-react'
import toast from 'react-hot-toast'
import { DashboardStats, Job } from '@/types'
import JobForm from '@/components/JobForm'
import UserManagement from '@/components/UserManagement'
import * as XLSX from 'xlsx'

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showJobForm, setShowJobForm] = useState(false)
  const [showUserManagement, setShowUserManagement] = useState(false)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    fetchStats()
    fetchJobs()
  }, [])

  const checkAuth = () => {
    const token = localStorage.getItem('token')
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    
    if (!token || user.role !== 'admin') {
      router.push('/')
      return
    }
  }

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      toast.error('Failed to fetch dashboard stats')
    }
  }

  const fetchJobs = async (page = 1, search = '') => {
    try {
      const token = localStorage.getItem('token')
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
      })

      const response = await fetch(`/api/jobs?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (data.success) {
        setJobs(data.data.data)
        setTotalPages(data.data.pagination.totalPages)
        setCurrentPage(data.data.pagination.page)
      }
    } catch (error) {
      toast.error('Failed to fetch jobs')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchJobs(1, searchTerm)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/')
  }

  const handleCreateJob = () => {
    setSelectedJob(null)
    setShowJobForm(true)
  }

  const handleEditJob = (job: Job) => {
    setSelectedJob(job)
    setShowJobForm(true)
  }

  const handleJobSuccess = () => {
    fetchJobs(currentPage, searchTerm)
    fetchStats()
  }

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      const data = await response.json()
      if (data.success) {
        toast.success('Job deleted successfully')
        fetchJobs(currentPage, searchTerm)
        fetchStats()
      } else {
        toast.error(data.error || 'Failed to delete job')
      }
    } catch (error) {
      toast.error('Network error')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      pending: 'status-badge status-pending',
      in_transit: 'status-badge status-in-transit',
      delivered: 'status-badge status-delivered',
      cleared: 'status-badge status-cleared',
      dispatched: 'status-badge status-dispatched',
    }
    return <span className={statusClasses[status as keyof typeof statusClasses] || 'status-badge status-pending'}>
      {status.replace('_', ' ').toUpperCase()}
    </span>
  }

  const handleExport = () => {
    // Define the columns and map jobs to rows
    const data = jobs.map(job => ({
      'INVOICE #': job.invoiceNumber,
      'DATE': job.date ? new Date(job.date).toLocaleDateString() : '',
      'PARTY NAME': job.partyName,
      'CONTAINER #': job.containerNumbers ? job.containerNumbers.join(', ') : '',
      'CONTAINER TYPE': job.containerType || '',
      'DESTINATION': job.destination || '',
      'PORT': job.port || '',
      'ETD': job.etd ? new Date(job.etd).toLocaleDateString() : '',
      'VESSEL': job.vessel || '',
      'STATUS': job.status || '',
      'TRANSPORTER': job.transporter || '',
      'REMARKS': job.remarks || '',
      'CELL #': job.cellNumber || '',
    }))
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Jobs')
    XLSX.writeFile(wb, 'jobs.xlsx')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Truck className="w-8 h-8 text-primary-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">ALS Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setShowUserManagement(true)}
                className="p-2 text-gray-400 hover:text-gray-600"
                title="User Management"
              >
                <Users className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Settings className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <User className="w-5 h-5" />
              </button>
              <button 
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6 card-hover">
              <div className="flex items-center">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Package className="w-6 h-6 text-primary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalJobs}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 card-hover">
              <div className="flex items-center">
                <div className="p-2 bg-warning-100 rounded-lg">
                  <Clock className="w-6 h-6 text-warning-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">In Transit</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.inTransit}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 card-hover">
              <div className="flex items-center">
                <div className="p-2 bg-success-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-success-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Delivered</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.delivered}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 card-hover">
              <div className="flex items-center">
                <div className="p-2 bg-secondary-100 rounded-lg">
                  <Truck className="w-6 h-6 text-secondary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.thisMonth}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Jobs Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-medium text-gray-900 mb-4 sm:mb-0">Container Jobs</h2>
              <div className="flex space-x-3">
                <button 
                  onClick={handleCreateJob}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Job
                </button>
                <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50" onClick={handleExport}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </button>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="px-6 py-4 border-b border-gray-200">
            <form onSubmit={handleSearch} className="flex space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by INV #, Container #, or Party Name..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Search
              </button>
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                <Filter className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Jobs Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Job Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Container
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Destination
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transporter
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {jobs.map((job) => (
                  <tr key={job._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {job.invoiceNumber}
                        </div>
                        <div className="text-sm text-gray-500">
                          {job.partyName}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(job.date).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {job.containerNumbers.join(', ')}
                      </div>
                      <div className="text-sm text-gray-500">
                        {job.containerType}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{job.destination}</div>
                      <div className="text-sm text-gray-500">{job.port}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(job.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {job.transporter}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => handleEditJob(job)}
                        className="text-primary-600 hover:text-primary-900 mr-3"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteJob(job._id)}
                        className="text-red-600 hover:text-red-900 mr-3"
                      >
                        Delete
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {jobs.length === 0 && !loading && (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No jobs found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first job.
              </p>
              <div className="mt-6">
                <button
                  onClick={handleCreateJob}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Job
                </button>
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => fetchJobs(currentPage - 1, searchTerm)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => fetchJobs(currentPage + 1, searchTerm)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Job Form Modal */}
      <JobForm
        isOpen={showJobForm}
        onClose={() => setShowJobForm(false)}
        job={selectedJob}
        onSuccess={handleJobSuccess}
      />

      {/* User Management Modal */}
      <UserManagement
        isOpen={showUserManagement}
        onClose={() => setShowUserManagement(false)}
      />
    </div>
  )
} 