import { Fragment } from 'react'

const Loading = ({ 
  size = 'md', 
  text = 'Cargando...', 
  overlay = false, 
  color = 'primary' 
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-4 w-4'
      case 'lg':
        return 'h-12 w-12'
      case 'xl':
        return 'h-16 w-16'
      default:
        return 'h-8 w-8'
    }
  }

  const getColorClasses = () => {
    switch (color) {
      case 'white':
        return 'border-white'
      case 'gray':
        return 'border-gray-600'
      default:
        return 'border-primary-600'
    }
  }

  const spinner = (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div 
        className={`animate-spin rounded-full ${getSizeClasses()} border-b-2 ${getColorClasses()}`}
      />
      {text && (
        <p className={`text-sm ${color === 'white' ? 'text-white' : 'text-gray-600'}`}>
          {text}
        </p>
      )}
    </div>
  )

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow-xl">
          {spinner}
        </div>
      </div>
    )
  }

  return spinner
}

// Componente específico para botones
export const ButtonLoading = ({ size = 'sm', color = 'white' }) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'xs':
        return 'h-3 w-3'
      case 'sm':
        return 'h-4 w-4'
      case 'md':
        return 'h-5 w-5'
      default:
        return 'h-4 w-4'
    }
  }

  return (
    <div 
      className={`animate-spin rounded-full ${getSizeClasses()} border-b-2 ${color === 'white' ? 'border-white' : 'border-primary-600'}`}
    />
  )
}

// Componente para páginas completas
export const PageLoading = ({ text = 'Cargando página...' }) => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loading size="lg" text={text} />
    </div>
  )
}

// Componente para secciones
export const SectionLoading = ({ text = 'Cargando...', className = '' }) => {
  return (
    <div className={`flex justify-center py-8 ${className}`}>
      <Loading size="md" text={text} />
    </div>
  )
}

export default Loading