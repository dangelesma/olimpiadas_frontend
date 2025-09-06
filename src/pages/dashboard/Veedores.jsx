import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchUsuarios, createUsuario, deleteUsuario } from '../../store/slices/usuariosSlice'
import {
  PlusIcon,
  TrashIcon,
  UserIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  PhoneIcon,
  EyeIcon,
  PencilIcon
} from '@heroicons/react/24/outline'
import { validateDNI, validatePhone, formatDNI, formatPhone, getValidationMessage } from '../../utils/validation'

const Veedores = () => {
  const dispatch = useDispatch()
  const { usuarios, isLoading, error } = useSelector((state) => state.usuarios)
  const [showModal, setShowModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingVeedor, setEditingVeedor] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    dni: '',
    telefono: '',
    role: 'veedor'
  })
  const [validationErrors, setValidationErrors] = useState({})

  useEffect(() => {
    dispatch(fetchUsuarios())
  }, [dispatch])

  const veedores = usuarios.filter(user => user.role === 'veedor')

  // Filtrar veedores
  const filteredVeedores = veedores.filter(veedor =>
    veedor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    veedor.dni?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validar campos
    const errors = {}
    
    if (!formData.name.trim()) {
      errors.name = getValidationMessage('name', 'required')
    }
    
    if (formData.dni.trim() && !validateDNI(formData.dni)) {
      errors.dni = getValidationMessage('dni', 'invalid')
    }
    
    if (formData.telefono && !validatePhone(formData.telefono)) {
      errors.telefono = getValidationMessage('phone', 'invalid')
    }
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return
    }
    
    try {
      const url = editingVeedor
        ? `${import.meta.env.VITE_API_BASE_URL || 'https://backend.olimpiadas.bonelektroniks.com/api'}/veedores/${editingVeedor.id}`
        : `${import.meta.env.VITE_API_BASE_URL || 'https://backend.olimpiadas.bonelektroniks.com/api'}/veedores`
      
      const method = editingVeedor ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      
      if (!response.ok) {
        if (result.errors) {
          setValidationErrors(result.errors);
          return;
        }
        throw new Error(result.message || `Error al ${editingVeedor ? 'actualizar' : 'crear'} veedor`);
      }

      handleCloseModal()
      dispatch(fetchUsuarios())
    } catch (error) {
      console.error(`Error al ${editingVeedor ? 'actualizar' : 'crear'} veedor:`, error)
    }
  }

  const handleEdit = (veedor) => {
    setEditingVeedor(veedor)
    setFormData({
      name: veedor.name,
      dni: veedor.dni || '',
      telefono: veedor.telefono || '',
      role: 'veedor'
    })
    setShowModal(true)
  }

  const handleInputChange = (field, value) => {
    let formattedValue = value
    
    // Formatear según el tipo de campo
    if (field === 'dni') {
      formattedValue = formatDNI(value)
    } else if (field === 'telefono') {
      formattedValue = formatPhone(value)
    }
    
    setFormData({...formData, [field]: formattedValue})
    
    // Limpiar error de validación si existe
    if (validationErrors[field]) {
      setValidationErrors({...validationErrors, [field]: null})
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este veedor?')) {
      try {
        await dispatch(deleteUsuario(id)).unwrap()
        dispatch(fetchUsuarios())
      } catch (error) {
        console.error('Error al eliminar veedor:', error)
      }
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingVeedor(null)
    setFormData({
      name: '',
      dni: '',
      telefono: '',
      role: 'veedor'
    })
    setValidationErrors({})
  }

  return (
    <div>
      {/* Header */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Veedores</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gestión de veedores deportivos del sistema
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Nuevo Veedor
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* Filtro de búsqueda */}
      <div className="mt-6">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="input-field pl-10"
            placeholder="Buscar veedores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Lista de veedores */}
      <div className="mt-8">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredVeedores.map((veedor) => (
              <div key={veedor.id} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center">
                          <EyeIcon className="h-8 w-8 text-white" />
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(veedor)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Editar veedor"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(veedor.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Eliminar veedor"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {veedor.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Veedor
                    </p>
                  </div>

                  <div className="mt-4 space-y-2">
                    {veedor.dni && (
                      <div className="text-sm text-gray-500">
                        <span className="font-medium">DNI:</span>
                        <span className="ml-1">{veedor.dni}</span>
                      </div>
                    )}
                    {veedor.telefono && (
                      <div className="flex items-center text-sm text-gray-500">
                        <PhoneIcon className="h-4 w-4 mr-2" />
                        <span>{veedor.telefono}</span>
                      </div>
                    )}
                    <div className="text-sm text-gray-500">
                      <span className="font-medium">Registrado:</span>
                      <span className="ml-1">
                        {new Date(veedor.created_at || Date.now()).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && filteredVeedores.length === 0 && (
          <div className="text-center py-12">
            <EyeIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {searchTerm ? 'No se encontraron veedores' : 'No hay veedores'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm 
                ? 'Intenta ajustar el término de búsqueda.'
                : 'Comienza registrando un nuevo veedor.'
              }
            </p>
            {!searchTerm && (
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(true)}
                  className="btn-primary"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Nuevo Veedor
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal para crear veedor */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingVeedor ? 'Editar Veedor' : 'Nuevo Veedor'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  className={`input-field ${validationErrors.name ? 'border-red-500' : ''}`}
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Nombre del veedor"
                />
                {validationErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  DNI
                </label>
                <input
                  type="text"
                  className={`input-field ${validationErrors.dni ? 'border-red-500' : ''}`}
                  value={formData.dni}
                  onChange={(e) => handleInputChange('dni', e.target.value)}
                  placeholder="12345678"
                  maxLength="8"
                />
                {validationErrors.dni && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.dni}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Teléfono
                </label>
                <input
                  type="tel"
                  className={`input-field ${validationErrors.telefono ? 'border-red-500' : ''}`}
                  value={formData.telefono}
                  onChange={(e) => handleInputChange('telefono', e.target.value)}
                  placeholder="987654321"
                  maxLength="9"
                />
                {validationErrors.telefono && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.telefono}</p>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary"
                >
                  {isLoading ? (editingVeedor ? 'Actualizando...' : 'Creando...') : (editingVeedor ? 'Actualizar Veedor' : 'Crear Veedor')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Veedores