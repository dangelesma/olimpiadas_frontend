/**
 * Utilidades para el manejo correcto de fechas y zonas horarias
 * Zona horaria del proyecto: America/Lima (UTC-5)
 */

// Zona horaria del proyecto
export const PROJECT_TIMEZONE = 'America/Lima';

/**
 * Formatea una fecha para mostrar en el frontend
 * @param {string|Date} dateString - Fecha en formato ISO o objeto Date
 * @param {Object} options - Opciones de formateo
 * @returns {string} Fecha formateada
 */
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return '';
  
  const defaultOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: PROJECT_TIMEZONE,
    ...options
  };
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PE', defaultOptions);
  } catch (error) {
    console.error('Error formateando fecha:', error);
    return dateString;
  }
};

/**
 * Formatea una fecha y hora para mostrar en el frontend
 * @param {string|Date} dateString - Fecha en formato ISO o objeto Date
 * @param {Object} options - Opciones de formateo
 * @returns {string} Fecha y hora formateada
 */
export const formatDateTime = (dateString, options = {}) => {
  if (!dateString) return '';
  
  const defaultOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: PROJECT_TIMEZONE,
    ...options
  };
  
  try {
    const date = new Date(dateString);
    return date.toLocaleString('es-PE', defaultOptions);
  } catch (error) {
    console.error('Error formateando fecha y hora:', error);
    return dateString;
  }
};

/**
 * Formatea solo la hora para mostrar en el frontend
 * @param {string|Date} dateString - Fecha en formato ISO o objeto Date
 * @param {Object} options - Opciones de formateo
 * @returns {string} Hora formateada
 */
export const formatTime = (dateString, options = {}) => {
  if (!dateString) return '';
  
  const defaultOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: PROJECT_TIMEZONE,
    ...options
  };
  
  try {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-PE', defaultOptions);
  } catch (error) {
    console.error('Error formateando hora:', error);
    return dateString;
  }
};

/**
 * Convierte una fecha local a formato ISO para enviar al backend
 * @param {string|Date} dateString - Fecha local
 * @returns {string} Fecha en formato ISO
 */
export const toISOString = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toISOString();
  } catch (error) {
    console.error('Error convirtiendo a ISO:', error);
    return dateString;
  }
};

/**
 * Convierte una fecha del backend a fecha local para mostrar en inputs
 * @param {string} isoString - Fecha en formato ISO del backend
 * @returns {string} Fecha en formato local para inputs (YYYY-MM-DD)
 */
export const toLocalDateInput = (isoString) => {
  if (!isoString) return '';
  
  try {
    const date = new Date(isoString);
    // Ajustar a la zona horaria local para evitar cambios de día
    const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
    return localDate.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error convirtiendo a fecha local:', error);
    return isoString;
  }
};

/**
 * Convierte una fecha del backend a datetime local para mostrar en inputs
 * @param {string} isoString - Fecha en formato ISO del backend
 * @returns {string} Fecha y hora en formato local para inputs (YYYY-MM-DDTHH:mm)
 */
export const toLocalDateTimeInput = (isoString) => {
  if (!isoString) return '';
  
  try {
    const date = new Date(isoString);
    // Ajustar a la zona horaria local
    const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
    return localDate.toISOString().slice(0, 16);
  } catch (error) {
    console.error('Error convirtiendo a datetime local:', error);
    return isoString;
  }
};

/**
 * Obtiene la fecha actual en la zona horaria del proyecto
 * @returns {Date} Fecha actual
 */
export const getCurrentDate = () => {
  return new Date();
};

/**
 * Obtiene la fecha actual formateada para inputs de fecha
 * @returns {string} Fecha actual en formato YYYY-MM-DD
 */
export const getCurrentDateInput = () => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

/**
 * Obtiene la fecha y hora actual formateada para inputs de datetime
 * @returns {string} Fecha y hora actual en formato YYYY-MM-DDTHH:mm
 */
export const getCurrentDateTimeInput = () => {
  const now = new Date();
  return now.toISOString().slice(0, 16);
};

/**
 * Verifica si una fecha es válida
 * @param {string|Date} dateString - Fecha a validar
 * @returns {boolean} True si es válida
 */
export const isValidDate = (dateString) => {
  if (!dateString) return false;
  
  try {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  } catch (error) {
    return false;
  }
};

/**
 * Calcula la diferencia en días entre dos fechas
 * @param {string|Date} date1 - Primera fecha
 * @param {string|Date} date2 - Segunda fecha
 * @returns {number} Diferencia en días
 */
export const daysDifference = (date1, date2) => {
  try {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2 - d1);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch (error) {
    console.error('Error calculando diferencia de días:', error);
    return 0;
  }
};

/**
 * Formatea una fecha relativa (hace X tiempo)
 * @param {string|Date} dateString - Fecha a formatear
 * @returns {string} Fecha relativa
 */
export const formatRelativeDate = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Ahora mismo';
    if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    
    return formatDate(dateString);
  } catch (error) {
    console.error('Error formateando fecha relativa:', error);
    return dateString;
  }
};

/**
 * Formatos predefinidos comunes
 */
export const DATE_FORMATS = {
  SHORT: { day: '2-digit', month: '2-digit', year: 'numeric' },
  LONG: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
  MEDIUM: { year: 'numeric', month: 'short', day: 'numeric' },
  TIME_12: { hour: '2-digit', minute: '2-digit', hour12: true },
  TIME_24: { hour: '2-digit', minute: '2-digit', hour12: false },
  DATETIME_SHORT: { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit', 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: true 
  }
};