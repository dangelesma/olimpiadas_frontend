import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../store/slices/authSlice'
import { 
  Bars3Icon,
  BellIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'

const Header = ({ setSidebarOpen }) => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)

  const handleLogout = () => {
    dispatch(logout())
  }

  return (
    <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
      {/* Botón para abrir sidebar en móvil */}
      <button
        type="button"
        className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center"
        onClick={() => setSidebarOpen(true)}
      >
        <span className="sr-only">Abrir sidebar</span>
        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
      </button>

      <div className="flex-1 px-2 sm:px-4 flex justify-between items-center">
        {/* Título de la página */}
        <div className="flex-1 flex items-center min-w-0">
          <h1 className="text-base sm:text-lg font-medium text-gray-900 truncate">
            Panel de Control
          </h1>
        </div>

        {/* Menú de usuario */}
        <div className="ml-2 sm:ml-4 flex items-center space-x-2 sm:space-x-4">
          {/* Botón de notificaciones */}
          <button
            type="button"
            className="bg-white p-2 sm:p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center"
          >
            <span className="sr-only">Ver notificaciones</span>
            <BellIcon className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
          </button>

          {/* Menú desplegable del perfil */}
          <Menu as="div" className="relative">
            <div>
              <Menu.Button className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 p-1 min-h-[44px]">
                <span className="sr-only">Abrir menú de usuario</span>
                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-primary-500 flex items-center justify-center">
                  <span className="text-xs sm:text-sm font-medium text-white">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="hidden lg:block ml-2 sm:ml-3 text-gray-700 text-sm font-medium max-w-32 truncate">
                  {user?.name}
                </span>
              </Menu.Button>
            </div>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 sm:w-56 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                <div className="px-4 py-3 text-sm text-gray-700 border-b border-gray-100">
                  <p className="font-medium truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
                
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } flex w-full items-center px-4 py-2 text-sm text-gray-700`}
                    >
                      <UserCircleIcon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                      Mi Perfil
                    </button>
                  )}
                </Menu.Item>

                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleLogout}
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } flex w-full items-center px-4 py-2 text-sm text-gray-700`}
                    >
                      <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                      Cerrar Sesión
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </div>
  )
}

export default Header