'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { X, Save, Plus, Calendar, Package, MapPin, Truck, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import { Job } from '@/types'

interface JobFormProps {
  isOpen: boolean
  onClose: () => void
  job?: Job | null
  onSuccess: () => void
}

interface JobFormData {
  date: string
  jobNumber: string
  invoiceNumber: string
  partyName: string
  containerType: 'CTNS' | 'FCL' | 'LCL'
  shippingLine: string
  destination: string
  vessel: string
  truck: string
  containerNumbers: string
  port: string
  cutOffDate: string
  etd: string
  vehicleAtd?: string
  vehicleArrv?: string
  transporter: string
  remarks?: string
  cellNumber?: string
  status: 'pending' | 'in_transit' | 'delivered' | 'cleared' | 'dispatched'
}

export default function JobForm({ isOpen, onClose, job, onSuccess }: JobFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isDraft, setIsDraft] = useState(false)
  
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty }
  } = useForm<JobFormData>({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      containerType: 'FCL',
      status: 'pending'
    }
  })

  const watchedValues = watch()

  // Load job data when editing
  useEffect(() => {
    if (job) {
      reset({
        date: new Date(job.date).toISOString().split('T')[0],
        jobNumber: job.jobNumber,
        invoiceNumber: job.invoiceNumber,
        partyName: job.partyName,
        containerType: job.containerType,
        shippingLine: job.shippingLine,
        destination: job.destination,
        vessel: job.vessel,
        truck: job.truck,
        containerNumbers: job.containerNumbers.join('\n'),
        port: job.port,
        cutOffDate: new Date(job.cutOffDate).toISOString().split('T')[0],
        etd: new Date(job.etd).toISOString().split('T')[0],
        vehicleAtd: job.vehicleAtd ? new Date(job.vehicleAtd).toISOString().split('T')[0] : '',
        vehicleArrv: job.vehicleArrv ? new Date(job.vehicleArrv).toISOString().split('T')[0] : '',
        transporter: job.transporter,
        remarks: job.remarks || '',
        cellNumber: job.cellNumber || '',
        status: job.status
      })
    } else {
      reset({
        date: new Date().toISOString().split('T')[0],
        containerType: 'FCL',
        status: 'pending'
      })
    }
  }, [job, reset])

  // Auto-save draft every 30 seconds
  useEffect(() => {
    if (!isDirty || !isOpen) return

    const interval = setInterval(() => {
      if (isDirty) {
        saveDraft()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [watchedValues, isDirty, isOpen])

  const saveDraft = () => {
    const draftData = {
      ...watchedValues,
      containerNumbers: (watchedValues.containerNumbers || '').split('\n').filter(cn => cn.trim())
    }
    localStorage.setItem('jobDraft', JSON.stringify(draftData))
    setIsDraft(true)
  }

  const loadDraft = () => {
    const draft = localStorage.getItem('jobDraft')
    if (draft) {
      const draftData = JSON.parse(draft)
      reset({
        ...draftData,
        containerNumbers: draftData.containerNumbers.join('\n')
      })
      setIsDraft(true)
      toast.success('Draft loaded successfully')
    }
  }

  const clearDraft = () => {
    localStorage.removeItem('jobDraft')
    setIsDraft(false)
  }

  const onSubmit = async (data: JobFormData) => {
    setIsLoading(true)

    try {
      const token = localStorage.getItem('token')
      const jobData = {
        ...data,
        containerNumbers: data.containerNumbers.split('\n').filter(cn => cn.trim()),
        date: new Date(data.date),
        cutOffDate: new Date(data.cutOffDate),
        etd: new Date(data.etd),
        vehicleAtd: data.vehicleAtd ? new Date(data.vehicleAtd) : undefined,
        vehicleArrv: data.vehicleArrv ? new Date(data.vehicleArrv) : undefined,
      }

      const url = job ? `/api/jobs/${job._id}` : '/api/jobs'
      const method = job ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(job ? 'Job updated successfully' : 'Job created successfully')
        clearDraft()
        onSuccess()
        onClose()
      } else {
        toast.error(result.error || 'Failed to save job')
      }
    } catch (error) {
      toast.error('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900">
            {job ? 'Edit Job' : 'Create New Job'}
          </h3>
          <div className="flex items-center space-x-2">
            {isDraft && (
              <button
                onClick={clearDraft}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear Draft
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Date *
              </label>
              <input
                type="date"
                {...register('date', { required: 'Date is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Number *
              </label>
              <input
                type="text"
                {...register('jobNumber', { required: 'Job number is required' })}
                placeholder="Enter job number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {errors.jobNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.jobNumber.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invoice Number *
              </label>
              <input
                type="text"
                {...register('invoiceNumber', { required: 'Invoice number is required' })}
                placeholder="Enter invoice number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {errors.invoiceNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.invoiceNumber.message}</p>
              )}
            </div>
          </div>

          {/* Party and Container Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Party Name *
              </label>
              <input
                type="text"
                {...register('partyName', { required: 'Party name is required' })}
                placeholder="Enter party name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {errors.partyName && (
                <p className="mt-1 text-sm text-red-600">{errors.partyName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Package className="w-4 h-4 inline mr-1" />
                Container Type *
              </label>
              <select
                {...register('containerType', { required: 'Container type is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="FCL">FCL</option>
                <option value="LCL">LCL</option>
                <option value="CTNS">CTNS</option>
              </select>
              {errors.containerType && (
                <p className="mt-1 text-sm text-red-600">{errors.containerType.message}</p>
              )}
            </div>
          </div>

          {/* Shipping Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shipping Line *
              </label>
              <input
                type="text"
                {...register('shippingLine', { required: 'Shipping line is required' })}
                placeholder="Enter shipping line"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {errors.shippingLine && (
                <p className="mt-1 text-sm text-red-600">{errors.shippingLine.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Destination *
              </label>
              <input
                type="text"
                {...register('destination', { required: 'Destination is required' })}
                placeholder="Enter destination"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {errors.destination && (
                <p className="mt-1 text-sm text-red-600">{errors.destination.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Port *
              </label>
              <input
                type="text"
                {...register('port', { required: 'Port is required' })}
                placeholder="Enter port"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {errors.port && (
                <p className="mt-1 text-sm text-red-600">{errors.port.message}</p>
              )}
            </div>
          </div>

          {/* Vessel and Truck */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vessel *
              </label>
              <input
                type="text"
                {...register('vessel', { required: 'Vessel is required' })}
                placeholder="Enter vessel name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {errors.vessel && (
                <p className="mt-1 text-sm text-red-600">{errors.vessel.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Truck className="w-4 h-4 inline mr-1" />
                Truck *
              </label>
              <input
                type="text"
                {...register('truck', { required: 'Truck is required' })}
                placeholder="Enter truck information"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {errors.truck && (
                <p className="mt-1 text-sm text-red-600">{errors.truck.message}</p>
              )}
            </div>
          </div>

          {/* Container Numbers */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Container Numbers * (one per line)
            </label>
            <textarea
              {...register('containerNumbers', { required: 'Container numbers are required' })}
              rows={3}
              placeholder="Enter container numbers, one per line"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            {errors.containerNumbers && (
              <p className="mt-1 text-sm text-red-600">{errors.containerNumbers.message}</p>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cut Off Date *
              </label>
              <input
                type="date"
                {...register('cutOffDate', { required: 'Cut off date is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {errors.cutOffDate && (
                <p className="mt-1 text-sm text-red-600">{errors.cutOffDate.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ETD *
              </label>
              <input
                type="date"
                {...register('etd', { required: 'ETD is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {errors.etd && (
                <p className="mt-1 text-sm text-red-600">{errors.etd.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                {...register('status', { required: 'Status is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="pending">Pending</option>
                <option value="in_transit">In Transit</option>
                <option value="delivered">Delivered</option>
                <option value="cleared">Cleared</option>
                <option value="dispatched">Dispatched</option>
              </select>
              {errors.status && (
                <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
              )}
            </div>
          </div>

          {/* Vehicle Times */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vehicle ATD
              </label>
              <input
                type="datetime-local"
                {...register('vehicleAtd')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vehicle ARRV
              </label>
              <input
                type="datetime-local"
                {...register('vehicleArrv')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Transporter and Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Truck className="w-4 h-4 inline mr-1" />
                Transporter *
              </label>
              <input
                type="text"
                {...register('transporter', { required: 'Transporter is required' })}
                placeholder="Enter transporter name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {errors.transporter && (
                <p className="mt-1 text-sm text-red-600">{errors.transporter.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cell Number
              </label>
              <input
                type="tel"
                {...register('cellNumber')}
                placeholder="Enter contact number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              Remarks
            </label>
            <textarea
              {...register('remarks')}
              rows={3}
              placeholder="Enter any additional remarks or notes"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={loadDraft}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
              >
                Load Draft
              </button>
              <button
                type="button"
                onClick={saveDraft}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
              >
                Save Draft
              </button>
            </div>
            
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Save className="w-4 h-4 mr-2" />
                    {job ? 'Update Job' : 'Create Job'}
                  </div>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
} 