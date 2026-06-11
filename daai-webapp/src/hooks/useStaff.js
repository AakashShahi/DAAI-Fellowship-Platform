import { useCallback, useEffect, useState } from 'react'
import {
  createStaff,
  getAllowedRoles,
  getStaffActivityLogs,
  getStaffDetail,
  getStaffList,
  toggleStaffStatus,
  updateStaff,
} from '../services/staffService'
import { sendPasswordSetupLink } from '../services/authService'

const getErrorMessage = (error, fallback) => {
  const detail = error?.response?.data?.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail) && detail.length > 0) return detail[0]?.msg ?? fallback
  return error?.message ?? fallback
}

export function useStaffList({ role = '', status = '', search = '', page = 1, pageSize = 10 } = {}) {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchStaff = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const result = await getStaffList({ role, status, search, page, pageSize })
      setData(result)
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load staff'))
    } finally {
      setIsLoading(false)
    }
  }, [role, status, search, page, pageSize])

  useEffect(() => {
    fetchStaff()
  }, [fetchStaff])

  return { data, isLoading, error, refetch: fetchStaff }
}

export function useStaffDetail(staffId) {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchDetail = useCallback(async () => {
    if (!staffId) return
    setIsLoading(true)
    setError('')
    try {
      const result = await getStaffDetail(staffId)
      setData(result)
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load staff details'))
    } finally {
      setIsLoading(false)
    }
  }, [staffId])

  useEffect(() => {
    fetchDetail()
  }, [fetchDetail])

  return { data, isLoading, error, refetch: fetchDetail }
}

export function useStaffMutations() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const clearMessages = () => {
    setError('')
    setSuccessMessage('')
  }

  const handleCreate = async (payload) => {
    setIsLoading(true)
    clearMessages()
    try {
      const result = await createStaff(payload)
      setSuccessMessage(result.message)
      return result
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to create staff')
      setError(msg)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdate = async (staffId, payload) => {
    setIsLoading(true)
    clearMessages()
    try {
      const result = await updateStaff(staffId, payload)
      setSuccessMessage(result.message)
      return result
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to update staff')
      setError(msg)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleStatus = async (staffId, isActive) => {
    setIsLoading(true)
    clearMessages()
    try {
      const result = await toggleStaffStatus(staffId, isActive)
      setSuccessMessage(result.message)
      return result
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to update status')
      setError(msg)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendSetupLink = async (email) => {
    setIsLoading(true)
    clearMessages()
    try {
      const result = await sendPasswordSetupLink(email)
      setSuccessMessage(result.message ?? 'Password setup link sent successfully.')
      return result
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to send setup link')
      setError(msg)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isLoading,
    error,
    successMessage,
    clearMessages,
    handleCreate,
    handleUpdate,
    handleToggleStatus,
    handleSendSetupLink,
  }
}

export function useAllowedRoles() {
  const [roles, setRoles] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    getAllowedRoles()
      .then((data) => {
        if (isMounted) setRoles(data)
      })
      .catch(() => {
        if (isMounted) setRoles([])
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })
    return () => { isMounted = false }
  }, [])

  return { roles, isLoading }
}

export function useStaffActivityLogs(staffId) {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchLogs = useCallback(async () => {
    if (!staffId) return
    setIsLoading(true)
    setError('')
    try {
      const result = await getStaffActivityLogs(staffId)
      setData(result)
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load activity logs'))
    } finally {
      setIsLoading(false)
    }
  }, [staffId])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  return { data, isLoading, error, refetch: fetchLogs }
}
