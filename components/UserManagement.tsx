'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { X, Save, Plus, User, Mail, Phone, Shield, Edit, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { User as UserType } from '@/types'

interface UserManagementProps {
  isOpen: boolean
  onClose: () => void
}

interface UserFormData {
  name: string
  email: string
  password: string
  role: 'admin' | 'client' | 'vendor'
  partyName?: string
  transporterName?: string
  phone?: string
  isActive: boolean
}

export default function UserManagement({ isOpen, onClose }: UserManagementProps) {
  const [users, setUsers] = useState<UserType[]>([])
  const [loading, setLoading] = useState(false)
  const [showUserForm, setShowUserForm] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null)
  const [activeTab, setActiveTab] = useState<'all' | 'clients' | 'vendors'>('all')
  
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm<UserFormData>({
    defaultValues: {
      role: 'client',
      isActive: true
    }
  })

  const watchedRole = watch('role')

  useEffect(() => {
    if (isOpen) {
      fetchUsers()
    }
  }, [isOpen])

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (data.success) {
        setUsers(data.data)
      }
    } catch (error) {
      toast.error('Failed to fetch users')
    }
  }

  const onSubmit = async (data: UserFormData) => {
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const url = selectedUser ? `/api/users/${selectedUser._id}` : '/api/users'
      const method = selectedUser ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(selectedUser ? 'User updated successfully' : 'User created successfully')
        setShowUserForm(false)
        setSelectedUser(null)
        reset()
        fetchUsers()
      } else {
        toast.error(result.error || 'Failed to save user')
      }
    } catch (error) {
      toast.error('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = () => {
    setSelectedUser(null)
    reset({
      role: 'client',
      isActive: true
    })
    setShowUserForm(true)
  }

  const handleEditUser = (user: UserType) => {
    setSelectedUser(user)
    reset({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      partyName: user.partyName || '',
      transporterName: user.transporterName || '',
      phone: user.phone || '',
      isActive: user.isActive
    })
    setShowUserForm(true)
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      const data = await response.json()
      if (data.success) {
        toast.success('User deleted successfully')
        fetchUsers()
      } else {
        toast.error(data.error || 'Failed to delete user')
      }
    } catch (error) {
      toast.error('Network error')
    }
  }

  const filteredUsers = users.filter(user => {
    if (activeTab === 'clients') return user.role === 'client'
    if (activeTab === 'vendors') return user.role === 'vendor'
    return true
  })

  const getRoleBadge = (role: string) => {
    const roleClasses = {
      admin: 'bg-red-100 text-red-800',
      client: 'bg-blue-100 text-blue-800',
      vendor: 'bg-green-100 text-green-800'
    }
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${roleClasses[role as keyof typeof roleClasses]}`}>
      {role.toUpperCase()}
    </span>
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 mx-auto p-5 border w-full max-w-6xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900">User Management</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('all')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'all'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              All Users ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('clients')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'clients'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Clients ({users.filter(u => u.role === 'client').length})
            </button>
            <button
              onClick={() => setActiveTab('vendors')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'vendors'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Vendors ({users.filter(u => u.role === 'vendor').length})
            </button>
          </nav>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg border">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h4 className="text-lg font-medium text-gray-900">Users</h4>
              <button
                onClick={handleCreateUser}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Mail className="w-4 h-4 mr-1" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {user.role === 'client' && user.partyName && (
                          <div>Party: {user.partyName}</div>
                        )}
                        {user.role === 'vendor' && user.transporterName && (
                          <div>Transporter: {user.transporterName}</div>
                        )}
                        {user.phone && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Phone className="w-4 h-4 mr-1" />
                            {user.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-primary-600 hover:text-primary-900 mr-3"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <User className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first user.
              </p>
              <div className="mt-6">
                <button
                  onClick={handleCreateUser}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add User
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Form Modal */}
        {showUserForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {selectedUser ? 'Edit User' : 'Create New User'}
                </h3>
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      {...register('name', { required: 'Name is required' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter full name"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      {...register('email', { required: 'Email is required' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter email address"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password {!selectedUser && '*'}
                    </label>
                    <input
                      type="password"
                      {...register('password', { 
                        required: !selectedUser ? 'Password is required' : false,
                        minLength: selectedUser ? undefined : { value: 6, message: 'Password must be at least 6 characters' }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder={selectedUser ? 'Leave blank to keep current' : 'Enter password'}
                    />
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role *
                    </label>
                    <select
                      {...register('role', { required: 'Role is required' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="client">Client</option>
                      <option value="vendor">Vendor</option>
                      <option value="admin">Admin</option>
                    </select>
                    {errors.role && (
                      <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
                    )}
                  </div>

                  {watchedRole === 'client' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Party Name *
                      </label>
                      <input
                        type="text"
                        {...register('partyName', { required: watchedRole === 'client' ? 'Party name is required' : false })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Enter party name"
                      />
                      {errors.partyName && (
                        <p className="mt-1 text-sm text-red-600">{errors.partyName.message}</p>
                      )}
                    </div>
                  )}

                  {watchedRole === 'vendor' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Transporter Name *
                      </label>
                      <input
                        type="text"
                        {...register('transporterName', { required: watchedRole === 'vendor' ? 'Transporter name is required' : false })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Enter transporter name"
                      />
                      {errors.transporterName && (
                        <p className="mt-1 text-sm text-red-600">{errors.transporterName.message}</p>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      {...register('phone')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      {...register('isActive')}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Active Account
                    </label>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : (selectedUser ? 'Update User' : 'Create User')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowUserForm(false)}
                      className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 