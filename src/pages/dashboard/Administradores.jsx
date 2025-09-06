import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchUsuarios, createUsuario, deleteUsuario } from '../../store/slices/usuariosSlice'
import { PlusIcon, TrashIcon, UserIcon } from '@heroicons/react/24/outline'

const Administradores = () => {
  const dispatch = useDispatch()
  const { usuarios, isLoading, error } = useSelector((state) => state.usuarios)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'admin'
  })

  useEffect(() => {
    dispatch(fetchUsuarios())
  }, [dispatch])

  const administradores = usuarios.filter(user => user.role === 'admin')

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await dispatch(createUsuario(formData)).unwrap()
      setShowModal(false)
      setFormData({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'admin'
      })
      dispatch(fetchUsuarios())
    } catch (error) {
      console.error('Error al crear administrador:', error)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este administrador?')) {
      try {
        await dispatch(deleteUsuario(id)).unwrap()
        dispatch(fetchUsuarios())
      } catch (error) {
        console.error('Error al eliminar administrador:', error)
      }
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Administradores</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gestión de usuarios administradores del sistema
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Nuevo Administrador
          </button>
        </div>
      </div>

      {/* Lista de administradores */}
      <div className="mt-8">
        {/* Vista móvil - Cards */}
        <div className="block md:hidden space-y-4">
          {administradores.map((admin) => (
            <div key={admin.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <div className="h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center">
                      <UserIcon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">
                      {admin.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      Administrador
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(admin.id)}
                  className="text-red-600 hover:text-red-900 p-2"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-3 space-y-2">
                <div className="text-sm">
                  <span className="font-medium text-gray-500">Email:</span>
                  <span className="ml-2 text-gray-900">{admin.email}</span>
                </div>
                <div className="text-sm">
                  <span className="font-medium text-gray-500">Registro:</span>
                  <span className="ml-2 text-gray-900">{new Date(admin.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Vista desktop - Tabla */}
        <div className="hidden md:block">
          <div className="flex flex-col">
            <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Usuario
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha de Registro
                        </th>
                        <th className="relative px-6 py-3">
                          <span className="sr-only">Acciones</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {administradores.map((admin) => (
                        <tr key={admin.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center">
                                  <UserIcon className="h-6 w-6 text-white" />
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {admin.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  Administrador
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {admin.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(admin.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleDelete(admin.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para crear administrador */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-4 sm:top-20 mx-auto p-4 sm:p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Nuevo Administrador
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    required
                    className="input-field w-full"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    className="input-field w-full"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    required
                    className="input-field w-full"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmar Contraseña
                  </label>
                  <input
                    type="password"
                    required
                    className="input-field w-full"
                    value={formData.password_confirmation}
                    onChange={(e) => setFormData({...formData, password_confirmation: e.target.value})}
                  />
                </div>
                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn-secondary w-full sm:w-auto"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary w-full sm:w-auto"
                  >
                    {isLoading ? 'Creando...' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Administradores