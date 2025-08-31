import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { NavLink } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  XMarkIcon,
  HomeIcon,
  UserGroupIcon,
  TrophyIcon,
  BuildingOfficeIcon,
  UserIcon,
  PlayIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user } = useSelector((state) => state.auth)

  // Navegación para administradores
  const adminNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Administradores', href: '/dashboard/administradores', icon: UserIcon },
    { name: 'Árbitros', href: '/dashboard/arbitros', icon: UserIcon },
    { name: 'Veedores', href: '/dashboard/veedores', icon: UserIcon },
    { name: 'Torneos', href: '/dashboard/torneos', icon: TrophyIcon },
    { name: 'Estadios', href: '/dashboard/canchas', icon: BuildingOfficeIcon },
    { name: 'Equipos', href: '/dashboard/equipos', icon: UserGroupIcon },
    { name: 'Partidos', href: '/dashboard/partidos', icon: PlayIcon },
    { name: 'Posiciones', href: '/dashboard/posiciones', icon: ChartBarIcon },
  ]

  // Navegación para registradores
  const registradorNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Mis Partidos', href: '/dashboard/mis-partidos', icon: ClipboardDocumentListIcon },
    { name: 'Posiciones', href: '/dashboard/posiciones', icon: ChartBarIcon },
  ]

  const navigation = user?.role === 'admin' ? adminNavigation : registradorNavigation

  const SidebarContent = ({ isMobile = false }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center h-16 flex-shrink-0 px-4 bg-primary-600">
        <h1 className="text-white text-lg font-semibold">
          Olimpiadas V2
        </h1>
      </div>

      {/* Navegación */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <nav className="flex-1 px-2 py-4 bg-white space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={isMobile ? () => setSidebarOpen(false) : undefined}
              className={({ isActive }) =>
                `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                  isActive
                    ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-500'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <item.icon
                className={`mr-3 flex-shrink-0 h-6 w-6 ${
                  ({ isActive }) => isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'
                }`}
                aria-hidden="true"
              />
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Información del usuario */}
        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
          <div className="flex items-center w-full">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <div className="ml-3 min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-700 truncate">{user?.name}</p>
              <p className="text-xs font-medium text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Sidebar móvil */}
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 md:hidden" onClose={setSidebarOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
          </Transition.Child>

          <div className="fixed inset-0 flex z-50">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-xl">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute top-0 right-0 -mr-12 pt-2">
                    <button
                      type="button"
                      className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white hover:bg-gray-600 hover:bg-opacity-25"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span className="sr-only">Cerrar sidebar</span>
                      <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>
                <SidebarContent isMobile={true} />
              </Dialog.Panel>
            </Transition.Child>
            <div className="flex-shrink-0 w-14" aria-hidden="true">
              {/* Espacio para el botón de cerrar */}
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Sidebar desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:z-30">
        <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white shadow-sm">
          <SidebarContent isMobile={false} />
        </div>
      </div>
    </>
  )
}

export default Sidebar