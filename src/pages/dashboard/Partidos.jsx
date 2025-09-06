import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchPartidos,
  createPartido,
  iniciarPartido,
  finalizarPartido,
  registrarEvento,
  fetchEventosPartido,
  obtenerResumenPartido,
  marcarWalkover,
  obtenerJugadoresSuspendidos,
  obtenerTarjetasAcumuladasTorneo,
  obtenerTablaPosicionesNueva,
  clearError,
  agruparPartidosPorFases
} from '../../store/slices/partidosSlice'
import { fetchTorneos } from '../../store/slices/torneosSlice'
import { fetchEquipos } from '../../store/slices/equiposSlice'
import { fetchCanchas } from '../../store/slices/canchasSlice'
import { fetchJugadores } from '../../store/slices/jugadoresSlice'
import { fetchArbitros } from '../../store/slices/arbitrosSlice'
import { fetchVeedores } from '../../store/slices/veedoresSlice'
import api from '../../services/api'
import { formatDateTime, toLocalDateTimeInput } from '../../utils/dateUtils'
import {
  PlusIcon,
  PlayIcon,
  StopIcon,
  CalendarIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  TrophyIcon,
  UserGroupIcon,
  UserIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  MinusIcon,
  TrashIcon
} from '@heroicons/react/24/outline'

const Partidos = () => {
  const dispatch = useDispatch()
  const {
    partidos,
    isLoading,
    error,
    eventosPartido,
    resumenPartido,
    jugadoresSuspendidos,
    tarjetasAcumuladasTorneo,
    tablaPosicionesNueva
  } = useSelector((state) => state.partidos)
  const { torneos } = useSelector((state) => state.torneos)
  const { equipos } = useSelector((state) => state.equipos)
  const { canchas } = useSelector((state) => state.canchas)
  const { jugadores } = useSelector((state) => state.jugadores)
  const { arbitros } = useSelector((state) => state.arbitros)
  const { veedores } = useSelector((state) => state.veedores)
  const [showModal, setShowModal] = useState(false)
  const [showMatchModal, setShowMatchModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [partidoToStart, setPartidoToStart] = useState(null)
  const [partidoToEdit, setPartidoToEdit] = useState(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedTorneos, setExpandedTorneos] = useState({})
  const [expandedFases, setExpandedFases] = useState({})
  const [expandedGrupos, setExpandedGrupos] = useState({})
  const [expandedSubgrupos, setExpandedSubgrupos] = useState({})
  // Estado persistente para partidos en vivo que sobrevive a actualizaciones de página
  const [liveMatchStates, setLiveMatchStates] = useState(() => {
    try {
      const saved = localStorage.getItem('liveMatchStates')
      return saved ? JSON.parse(saved) : {}
    } catch (error) {
      console.error('Error loading live match states from localStorage:', error)
      return {}
    }
  });
  
  // Estados para el modal avanzado de partido
  const [matchStarted, setMatchStarted] = useState(false)
  const [currentTab, setCurrentTab] = useState('lineup')
  const [scoreLocal, setScoreLocal] = useState(0)
  const [scoreVisitante, setScoreVisitante] = useState(0)
  const [goals, setGoals] = useState([])
  const [cardsHistory, setCardsHistory] = useState([]) // Historial de tarjetas
  
  // Estados para control de tiempo del partido
  const [matchTime, setMatchTime] = useState(0) // Tiempo total en segundos
  const [currentHalfTime, setCurrentHalfTime] = useState(0) // Tiempo del tiempo actual en segundos
  const [isMatchRunning, setIsMatchRunning] = useState(false)
  const [currentHalf, setCurrentHalf] = useState(1) // 1 = primer tiempo, 2 = segundo tiempo
  const [halfTimeBreak, setHalfTimeBreak] = useState(false)
  const [matchPhase, setMatchPhase] = useState('not_started') // 'not_started', 'first_half', 'half_time', 'second_half', 'finished'
  
  // Estados específicos para vóley
  const [currentSet, setCurrentSet] = useState(1)
  const [setsLocal, setSetsLocal] = useState(0)
  const [setsVisitante, setSetsVisitante] = useState(0)
  const [puntosSetLocal, setPuntosSetLocal] = useState(0)
  const [puntosSetVisitante, setPuntosSetVisitante] = useState(0)
  const [equipoConSaque, setEquipoConSaque] = useState('local') // 'local' o 'visitante'
  const [historialSets, setHistorialSets] = useState([]) // [{set: 1, puntosLocal: 25, puntosVisitante: 23}]
  const [teamLocalPlayers, setTeamLocalPlayers] = useState([])
  const [teamVisitantePlayers, setTeamVisitantePlayers] = useState([])
  const [searchJugador1, setSearchJugador1] = useState('')
  const [searchJugador2, setSearchJugador2] = useState('')
  const [searchJugadorLocalCambios, setSearchJugadorLocalCambios] = useState('')
  const [searchJugadorVisitanteCambios, setSearchJugadorVisitanteCambios] = useState('')
  const [searchJugadorLocalSale, setSearchJugadorLocalSale] = useState('')
  const [searchJugadorLocalEntra, setSearchJugadorLocalEntra] = useState('')
  const [searchJugadorVisitanteSale, setSearchJugadorVisitanteSale] = useState('')
  const [searchJugadorVisitanteEntra, setSearchJugadorVisitanteEntra] = useState('')
  const [selectedArbitro, setSelectedArbitro] = useState('')
  const [selectedVeedor, setSelectedVeedor] = useState('')
  const [showStartConfirmation, setShowStartConfirmation] = useState(false)
  
  // Estados para cambios
  const [playerOutLocal, setPlayerOutLocal] = useState('')
  const [playerInLocal, setPlayerInLocal] = useState('')
  const [playerOutVisitante, setPlayerOutVisitante] = useState('')
  const [playerInVisitante, setPlayerInVisitante] = useState('')
  const [jugadoresCambiados, setJugadoresCambiados] = useState([])
  
  // Estados para modales de selección de jugadores
  const [showPlayerSelectionModal, setShowPlayerSelectionModal] = useState(false)
  const [playerSelectionType, setPlayerSelectionType] = useState('') // 'local_out', 'local_in', 'visitante_out', 'visitante_in'
  const [playerSelectionTeam, setPlayerSelectionTeam] = useState('') // 'local' o 'visitante'
  
  // Estados para modales de confirmación
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [confirmationData, setConfirmationData] = useState(null)
  const [confirmationType, setConfirmationType] = useState('') // 'goal', 'card', 'substitution'
  
  // Estados para resumen del partido
  const [showResumenModal, setShowResumenModal] = useState(false)
  
  // Estados para asignar números de camiseta
  const [showNumberModal, setShowNumberModal] = useState(false)
  const [playerNeedingNumber, setPlayerNeedingNumber] = useState(null)
  const [newPlayerNumber, setNewPlayerNumber] = useState('')
  
  // Estados para W.O. (walkover)
  const [showWalkoverModal, setShowWalkoverModal] = useState(false)
  const [partidoWalkover, setPartidoWalkover] = useState(null)
  const [equipoGanadorWO, setEquipoGanadorWO] = useState('')
  const [motivoWO, setMotivoWO] = useState('')
  
  const [formData, setFormData] = useState({
    torneo_id: '',
    equipo_local_id: '',
    equipo_visitante_id: '',
    cancha_id: '',
    fecha_hora: '',
    arbitro_id: '',
    fase: '',
    grupo: '',
    subgrupo: '',
    num_clasificados: 2,
    observaciones: ''
  })

  useEffect(() => {
    dispatch(fetchPartidos())
    dispatch(fetchTorneos())
    dispatch(fetchEquipos())
    dispatch(fetchCanchas())
    dispatch(fetchJugadores()) // Cargar todos los jugadores al inicio
    dispatch(fetchArbitros())
    dispatch(fetchVeedores())
  }, [dispatch])

  // Efecto para guardar estados de partidos en vivo en localStorage
  useEffect(() => {
    try {
      localStorage.setItem('liveMatchStates', JSON.stringify(liveMatchStates))
    } catch (error) {
      console.error('Error saving live match states to localStorage:', error)
    }
  }, [liveMatchStates])

  // Efecto para limpiar estados de partidos finalizados del localStorage
  useEffect(() => {
    if (partidos.length > 0) {
      const partidosFinalizados = partidos.filter(p => p.estado === 'finalizado').map(p => p.id)
      const estadosActualizados = { ...liveMatchStates }
      let huboLimpieza = false
      
      partidosFinalizados.forEach(partidoId => {
        if (estadosActualizados[partidoId]) {
          delete estadosActualizados[partidoId]
          huboLimpieza = true
        }
      })
      
      if (huboLimpieza) {
        console.log('Limpiando estados de partidos finalizados del localStorage')
        setLiveMatchStates(estadosActualizados)
      }
    }
  }, [partidos, liveMatchStates])

  // Efecto para el cronómetro del partido
  useEffect(() => {
    let interval = null
    if (isMatchRunning && matchStarted) {
      interval = setInterval(() => {
        setMatchTime(prevTime => prevTime + 1) // Tiempo total
        setCurrentHalfTime(prevTime => prevTime + 1) // Tiempo del tiempo actual
      }, 1000)
    } else if (!isMatchRunning) {
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [isMatchRunning, matchStarted])

  // Estados para almacenar todos los jugadores cargados
  const [allLoadedPlayers, setAllLoadedPlayers] = useState([])
  const [estadoCargado, setEstadoCargado] = useState(false)

  // Cargar jugadores cuando se selecciona un partido para iniciar o editar
  useEffect(() => {
    const loadPlayersForMatch = async () => {
      const partido = partidoToStart || partidoToEdit
      if (partido) {
        // Limpiar jugadores anteriores
        setTeamLocalPlayers([])
        setTeamVisitantePlayers([])
        setAllLoadedPlayers([])
        
        try {
          let allPlayers = []
          
          // Cargar jugadores del equipo local
          if (partido.equipo_local_id) {
            console.log('Cargando jugadores del equipo local:', partido.equipo_local_id)
            const localPlayers = await dispatch(fetchJugadores(partido.equipo_local_id)).unwrap()
            console.log('Jugadores locales cargados:', localPlayers)
            allPlayers = [...allPlayers, ...localPlayers]
          }
          
          // Cargar jugadores del equipo visitante
          if (partido.equipo_visitante_id) {
            console.log('Cargando jugadores del equipo visitante:', partido.equipo_visitante_id)
            const visitantePlayers = await dispatch(fetchJugadores(partido.equipo_visitante_id)).unwrap()
            console.log('Jugadores visitantes cargados:', visitantePlayers)
            allPlayers = [...allPlayers, ...visitantePlayers]
          }
          
          // Guardar todos los jugadores cargados
          console.log('Todos los jugadores cargados:', allPlayers)
          setAllLoadedPlayers(allPlayers)
          
          // Cargar datos adicionales del torneo
          if (partido.torneo_id) {
            dispatch(obtenerJugadoresSuspendidos(partido.torneo_id))
            dispatch(obtenerTarjetasAcumuladasTorneo(partido.torneo_id))
          }
          
        } catch (error) {
          console.error('Error cargando jugadores:', error)
        }
      }
    }

    loadPlayersForMatch()
  }, [dispatch, partidoToStart, partidoToEdit])

  // Inicializar jugadores cuando se cargan - SOLO para configuración inicial, no para partidos en curso
  useEffect(() => {
    if (partidoToStart && allLoadedPlayers.length > 0 && partidoToStart.estado === 'programado' && teamLocalPlayers.length === 0 && teamVisitantePlayers.length === 0) {
      console.log('Inicializando jugadores para partido programado:', partidoToStart.id)
      console.log('Equipo local ID:', partidoToStart.equipo_local_id)
      console.log('Equipo visitante ID:', partidoToStart.equipo_visitante_id)
      console.log('Total jugadores cargados:', allLoadedPlayers.length)
      console.log('Jugadores por equipo:', allLoadedPlayers.map(j => ({ id: j.id, nombre: j.nombre, equipo_id: j.equipo_id })))
      
      // Para partidos programados, cargar TODOS los jugadores del equipo
      const jugadoresLocal = allLoadedPlayers
        .filter(j => j.equipo_id == partidoToStart.equipo_local_id) // Usar == para comparación flexible
        .map(j => ({
          id: j.id,
          name: `${j.nombre} ${j.apellido}`,
          isStarter: false,
          isOnField: false,
          yellowCards: 0,
          redCard: false,
          isSuspended: jugadoresSuspendidos.includes(j.id), // Verificar si está suspendido
          tarjetasAcumuladas: tarjetasAcumuladasTorneo[j.id] || 0 // Tarjetas acumuladas en el torneo
        }))
      
      const jugadoresVisitante = allLoadedPlayers
        .filter(j => j.equipo_id == partidoToStart.equipo_visitante_id) // Usar == para comparación flexible
        .map(j => ({
          id: j.id,
          name: `${j.nombre} ${j.apellido}`,
          isStarter: false,
          isOnField: false,
          yellowCards: 0,
          redCard: false,
          isSuspended: jugadoresSuspendidos.includes(j.id), // Verificar si está suspendido
          tarjetasAcumuladas: tarjetasAcumuladasTorneo[j.id] || 0 // Tarjetas acumuladas en el torneo
        }))
      
      console.log('Jugadores locales filtrados:', jugadoresLocal.length, jugadoresLocal)
      console.log('Jugadores visitantes filtrados:', jugadoresVisitante.length, jugadoresVisitante)
      
      setTeamLocalPlayers(jugadoresLocal)
      setTeamVisitantePlayers(jugadoresVisitante)
    } else if (partidoToStart && allLoadedPlayers.length > 0 && partidoToStart.estado === 'en_curso') {
      console.log('Partido en curso - verificando si ya hay jugadores restaurados del estado guardado')
      
      // Solo resetear si no hay jugadores ya cargados (evitar resetear jugadores restaurados del estado guardado)
      if (teamLocalPlayers.length === 0 && teamVisitantePlayers.length === 0) {
        console.log('No hay jugadores cargados, inicializando vacío para cargar desde titulares guardados')
        setTeamLocalPlayers([])
        setTeamVisitantePlayers([])
      } else {
        console.log('Jugadores ya están cargados del estado guardado, no resetear')
      }
    } else {
      console.log('Debug - Condiciones no cumplidas para inicializar jugadores:', {
        partidoToStart: !!partidoToStart,
        allLoadedPlayersLength: allLoadedPlayers.length,
        estado: partidoToStart?.estado,
        teamLocalPlayersLength: teamLocalPlayers.length,
        teamVisitantePlayersLength: teamVisitantePlayers.length
      })
    }
  }, [partidoToStart, allLoadedPlayers, jugadoresSuspendidos, tarjetasAcumuladasTorneo])

  // Cargar estado completo cuando los jugadores están listos y es un partido en curso
  useEffect(() => {
    if (partidoToStart &&
        allLoadedPlayers.length > 0 &&
        partidoToStart.estado === 'en_curso' &&
        matchStarted &&
        !estadoCargado &&
        teamLocalPlayers.length === 0 &&
        teamVisitantePlayers.length === 0) {
      console.log('Condiciones cumplidas para cargar estado completo:', {
        partidoId: partidoToStart.id,
        jugadoresCargados: allLoadedPlayers.length,
        estadoPartido: partidoToStart.estado,
        matchStarted,
        estadoCargado,
        jugadoresYaCargados: teamLocalPlayers.length > 0 || teamVisitantePlayers.length > 0
      })
      cargarEstadoCompleto(partidoToStart.id)
    } else if (partidoToStart && teamLocalPlayers.length > 0 && teamVisitantePlayers.length > 0) {
      console.log('Jugadores ya están cargados del estado guardado, omitiendo carga del backend')
    }
  }, [partidoToStart, allLoadedPlayers, matchStarted, estadoCargado, teamLocalPlayers.length, teamVisitantePlayers.length])

  useEffect(() => {
    if (error) {
      console.error('Error en partidos:', error)
    }
  }, [error])

  // Agrupar partidos por torneo y fases
  const partidosPorTorneo = agruparPartidosPorFases(partidos, torneos).filter(torneo => {
    // Filtrar por búsqueda
    if (searchTerm) {
      const matchesTorneo = torneo.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesFases = torneo.fases.some(fase => {
        if (fase.fase === 'grupos' && fase.grupos) {
          return fase.grupos.some(grupo =>
            grupo.partidos.some(partido =>
              partido.equipo_local?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
              partido.equipo_visitante?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
              partido.cancha?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
              grupo.nombre.toLowerCase().includes(searchTerm.toLowerCase())
            )
          )
        } else {
          return fase.partidos.some(partido =>
            partido.equipo_local?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            partido.equipo_visitante?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            partido.cancha?.nombre.toLowerCase().includes(searchTerm.toLowerCase())
          )
        }
      })
      return matchesTorneo || matchesFases
    }
    return true
  })

  const toggleTorneo = (torneoId) => {
    setExpandedTorneos(prev => ({
      ...prev,
      [torneoId]: !prev[torneoId]
    }))
  }

  const toggleFase = (torneoId, faseIndex) => {
    const key = `${torneoId}-${faseIndex}`
    setExpandedFases(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const toggleGrupo = (torneoId, faseIndex, grupoIndex) => {
    const key = `${torneoId}-${faseIndex}-${grupoIndex}`
    setExpandedGrupos(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const toggleSubgrupo = (torneoId, faseIndex, grupoIndex, subgrupoIndex) => {
    const key = `${torneoId}-${faseIndex}-${grupoIndex}-${subgrupoIndex}`
    setExpandedSubgrupos(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validaciones adicionales
    if (formData.fase === 'grupos' && !formData.grupo) {
      alert('Debe seleccionar un grupo para la fase de grupos')
      return
    }

    if (formData.equipo_local_id === formData.equipo_visitante_id) {
      alert('Los equipos local y visitante deben ser diferentes')
      return
    }

    try {
      // Preparar datos para enviar (solo incluir campos relevantes)
      const datosPartido = {
        ...formData,
        // Remover campos que no se envían al backend si no son necesarios
        num_clasificados: undefined
      }

      await dispatch(createPartido(datosPartido)).unwrap()
      handleCloseModal()
      dispatch(fetchPartidos())
    } catch (error) {
      console.error('Error al crear partido:', error)
      // El error ya se maneja en el slice y se muestra en la UI
    }
  }

  const handleIniciarPartido = (partido) => {
    console.log('Iniciando partido:', partido.id, 'Estado:', partido.estado)
    setPartidoToStart(partido)

    // Resetear estado de carga para permitir nueva carga
    setEstadoCargado(false)

    // Verificar si hay un estado guardado del partido
    const savedState = liveMatchStates[partido.id]

    // Si el partido está en curso, cargar desde el backend o estado guardado
    if (partido.estado === 'en_curso') {
      console.log('Partido en curso - cargando estado')
      
      if (savedState) {
        console.log('Restaurando estado guardado del partido')
        // Restaurar desde el estado guardado
        setMatchStarted(savedState.matchStarted)
        setCurrentTab(savedState.currentTab)
        setScoreLocal(savedState.scoreLocal)
        setScoreVisitante(savedState.scoreVisitante)
        setGoals(savedState.goals)
        setCardsHistory(savedState.cardsHistory)
        setSelectedArbitro(savedState.selectedArbitro)
        setSelectedVeedor(savedState.selectedVeedor)
        setCurrentSet(savedState.currentSet)
        setSetsLocal(savedState.setsLocal)
        setSetsVisitante(savedState.setsVisitante)
        setPuntosSetLocal(savedState.puntosSetLocal)
        setPuntosSetVisitante(savedState.puntosSetVisitante)
        setEquipoConSaque(savedState.equipoConSaque)
        setHistorialSets(savedState.historialSets)
        
        // Restaurar jugadores del estado guardado si existen
        if (savedState.teamLocalPlayers && savedState.teamLocalPlayers.length > 0) {
          console.log('Restaurando jugadores locales del estado guardado:', savedState.teamLocalPlayers)
          setTeamLocalPlayers(savedState.teamLocalPlayers)
        }
        if (savedState.teamVisitantePlayers && savedState.teamVisitantePlayers.length > 0) {
          console.log('Restaurando jugadores visitantes del estado guardado:', savedState.teamVisitantePlayers)
          setTeamVisitantePlayers(savedState.teamVisitantePlayers)
        }
        
        // Calcular tiempo real transcurrido desde que se guardó el estado
        const tiempoGuardado = savedState.matchTime || 0
        const tiempoActualGuardado = savedState.currentHalfTime || 0
        const tiempoGuardadoTimestamp = savedState.lastSavedTime || Date.now()
        const tiempoInicioPartido = savedState.matchStartTime || Date.now()
        const tiempoInicioTiempo = savedState.halfStartTime || Date.now()
        
        // Calcular tiempo transcurrido en tiempo real
        let tiempoRealTranscurrido = 0
        let tiempoRealTiempoActual = tiempoActualGuardado
        
        if (savedState.isMatchRunning && savedState.matchPhase !== 'half_time' && savedState.matchPhase !== 'not_started') {
          const ahora = Date.now()
          tiempoRealTranscurrido = Math.floor((ahora - tiempoGuardadoTimestamp) / 1000)
          tiempoRealTiempoActual = tiempoActualGuardado + tiempoRealTranscurrido
        }
        
        console.log('Calculando tiempo real:', {
          tiempoGuardado,
          tiempoActualGuardado,
          tiempoRealTranscurrido,
          tiempoFinalTotal: tiempoGuardado + tiempoRealTranscurrido,
          tiempoFinalActual: tiempoRealTiempoActual,
          matchPhase: savedState.matchPhase,
          isRunning: savedState.isMatchRunning
        })
        
        setMatchTime(tiempoGuardado + tiempoRealTranscurrido)
        setCurrentHalfTime(tiempoRealTiempoActual)
        setIsMatchRunning(savedState.isMatchRunning)
        setCurrentHalf(savedState.currentHalf)
        setMatchPhase(savedState.matchPhase)
        setHalfTimeBreak(savedState.halfTimeBreak || false)
      } else {
        console.log('Cargando estado inicial para partido en curso')
        setMatchStarted(true)
        setCurrentTab('live')
        setSelectedArbitro(partido.arbitro_id || '')
        setSelectedVeedor(partido.veedor_id || '')
        setShowStartConfirmation(false)
        setMatchPhase('first_half')
        setIsMatchRunning(true) // Asumir que está corriendo
        setMatchTime(0) // Se actualizará al cargar eventos
        setCurrentHalfTime(0)
        setCurrentHalf(1)
        setHalfTimeBreak(false)
        setCurrentSet(1)
        setSetsLocal(partido.sets_local || 0)
        setSetsVisitante(partido.sets_visitante || 0)
        setPuntosSetLocal(0)
        setPuntosSetVisitante(0)
        setEquipoConSaque('local')
        setHistorialSets([])
        setScoreLocal(partido.goles_local || 0)
        setScoreVisitante(partido.goles_visitante || 0)
        setGoals([])
        setCardsHistory([])
      }
    } else {
      // Partido programado - configuración inicial
      console.log('Partido programado - configuración inicial')
      setMatchStarted(false)
      setCurrentTab('lineup')
      setScoreLocal(0)
      setScoreVisitante(0)
      setGoals([])
      setCardsHistory([])
      setSelectedArbitro(partido.arbitro_id || '')
      setSelectedVeedor(partido.veedor_id || '')
      setShowStartConfirmation(false)
      setMatchPhase('not_started')
      setIsMatchRunning(false)
      setMatchTime(0)
      setCurrentHalfTime(0)
      setCurrentHalf(1)
      setHalfTimeBreak(false)
      setCurrentSet(1)
      setSetsLocal(0)
      setSetsVisitante(0)
      setPuntosSetLocal(0)
      setPuntosSetVisitante(0)
      setEquipoConSaque('local')
      setHistorialSets([])
    }
    
    setShowMatchModal(true)
  }

  const handleReingresarPartido = (partido) => {
    // This function now just calls the main handler
    handleIniciarPartido(partido);
  }

  // Función para cargar el estado completo del partido desde el backend
  const cargarEstadoCompleto = async (partidoId) => {
    try {
      console.log('Cargando estado completo del partido:', partidoId)
      setEstadoCargado(true) // Marcar como cargado para evitar repeticiones
      
      // Cargar eventos del partido
      const eventos = await dispatch(fetchEventosPartido(partidoId)).unwrap()
      console.log('Eventos cargados:', eventos)
      
      // Procesar eventos para reconstruir el estado
      await procesarEventosPartido(eventos)
      
      console.log('Estado del partido cargado completamente')
      
    } catch (error) {
      console.error('Error al cargar estado del partido:', error)
      setEstadoCargado(false) // Resetear en caso de error
    }
  }

  // Función para procesar eventos y reconstruir el estado del partido
  const procesarEventosPartido = async (eventos) => {
    console.log('Procesando eventos del partido:', eventos)
    
    const golesPartido = []
    const tarjetasPartido = []
    let golesLocal = 0
    let golesVisitante = 0
    
    // Esperar a que los jugadores estén cargados
    if (allLoadedPlayers.length === 0) {
      console.log('Esperando a que se carguen los jugadores...')
      return
    }

    // Primero, cargar jugadores titulares desde el backend si están disponibles
    if (partidoToStart.titulares_local) {
      try {
        const titularesLocal = typeof partidoToStart.titulares_local === 'string'
          ? JSON.parse(partidoToStart.titulares_local)
          : partidoToStart.titulares_local

        console.log('Titulares locales desde backend:', titularesLocal)
        
        // Crear jugadores titulares para el equipo local
        const jugadoresTitularesLocal = titularesLocal.map(titular => {
          const jugadorCompleto = allLoadedPlayers.find(j => j.id === titular.jugador_id)
          if (jugadorCompleto) {
            return {
              id: jugadorCompleto.id,
              name: `${jugadorCompleto.nombre} ${jugadorCompleto.apellido}`,
              isStarter: true,
              isOnField: true,
              yellowCards: 0,
              redCard: false,
              isSuspended: jugadoresSuspendidos.includes(jugadorCompleto.id),
              tarjetasAcumuladas: tarjetasAcumuladasTorneo[jugadorCompleto.id] || 0
            }
          }
          return null
        }).filter(Boolean)

        setTeamLocalPlayers(jugadoresTitularesLocal)
      } catch (e) {
        console.error('Error parsing titulares_local:', e)
      }
    }
    
    if (partidoToStart.titulares_visitante) {
      try {
        const titularesVisitante = typeof partidoToStart.titulares_visitante === 'string'
          ? JSON.parse(partidoToStart.titulares_visitante)
          : partidoToStart.titulares_visitante

        console.log('Titulares visitantes desde backend:', titularesVisitante)
        
        // Crear jugadores titulares para el equipo visitante
        const jugadoresTitularesVisitante = titularesVisitante.map(titular => {
          const jugadorCompleto = allLoadedPlayers.find(j => j.id === titular.jugador_id)
          if (jugadorCompleto) {
            return {
              id: jugadorCompleto.id,
              name: `${jugadorCompleto.nombre} ${jugadorCompleto.apellido}`,
              isStarter: true,
              isOnField: true,
              yellowCards: 0,
              redCard: false,
              isSuspended: jugadoresSuspendidos.includes(jugadorCompleto.id),
              tarjetasAcumuladas: tarjetasAcumuladasTorneo[jugadorCompleto.id] || 0
            }
          }
          return null
        }).filter(Boolean)

        setTeamVisitantePlayers(jugadoresTitularesVisitante)
      } catch (e) {
        console.error('Error parsing titulares_visitante:', e)
      }
    }
    
    // Procesar cada evento en orden cronológico (crear copia para evitar error de solo lectura)
    const eventosOrdenados = [...eventos].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    
    eventosOrdenados.forEach(evento => {
      console.log('Procesando evento:', evento.tipo_evento, evento)
      
      switch (evento.tipo_evento) {
        case 'gol':
        case 'punto_voley':
          const jugadorGol = allLoadedPlayers.find(j => j.id === evento.jugador_id)
          if (jugadorGol) {
            const equipoGol = jugadorGol.equipo_id === partidoToStart?.equipo_local_id ? 'local' : 'visitante'
            
            golesPartido.push({
              id: evento.id,
              playerId: evento.jugador_id,
              playerName: `${jugadorGol.nombre} ${jugadorGol.apellido}`,
              team: equipoGol,
              minute: evento.minuto || 0,
              timeFormatted: `${evento.minuto || 0}'${(evento.segundo || 0).toString().padStart(2, '0')}"`,
              timeWithHalf: `${evento.tiempo === 1 ? '1er' : '2do'} tiempo ${evento.minuto || 0}'${(evento.segundo || 0).toString().padStart(2, '0')}"`,
              half: evento.tiempo || 1,
              timestamp: new Date(evento.created_at).toLocaleTimeString()
            })
            
            if (equipoGol === 'local') {
              golesLocal++
            } else {
              golesVisitante++
            }
          }
          break
          
        case 'tarjeta_amarilla':
        case 'tarjeta_roja':
          const jugadorTarjeta = allLoadedPlayers.find(j => j.id === evento.jugador_id)
          if (jugadorTarjeta) {
            const equipoTarjeta = jugadorTarjeta.equipo_id === partidoToStart?.equipo_local_id ? 'local' : 'visitante'
            const tipoTarjeta = evento.tipo_evento === 'tarjeta_amarilla' ? 'yellow' : 'red'
            
            // Agregar al historial de tarjetas
            tarjetasPartido.push({
              id: evento.id,
              playerId: evento.jugador_id,
              playerName: `${jugadorTarjeta.nombre} ${jugadorTarjeta.apellido}`,
              team: equipoTarjeta,
              cardType: tipoTarjeta,
              isAccumulation: evento.es_tarjeta_roja_directa === false,
              minute: evento.minuto || 0,
              timeFormatted: `${evento.minuto || 0}'${(evento.segundo || 0).toString().padStart(2, '0')}"`,
              timeWithHalf: `${evento.tiempo === 1 ? '1er' : '2do'} tiempo ${evento.minuto || 0}'${(evento.segundo || 0).toString().padStart(2, '0')}"`,
              half: evento.tiempo || 1,
              timestamp: new Date(evento.created_at).toLocaleTimeString()
            })
            
            // Aplicar tarjeta al jugador
            aplicarTarjetaAJugadorDesdeEvento(evento.jugador_id, evento.tipo_evento, evento.es_tarjeta_roja_directa)
          }
          break
          
        case 'sustitucion':
          // Aplicar cambio de jugadores
          aplicarCambioJugadorDesdeEvento(evento.jugador_sale_id, evento.jugador_entra_id)
          break
          
        case 'set_voley':
          // Para vóley, procesar sets
          console.log('Procesando set de vóley:', evento)
          break
      }
    })
    
    // Actualizar estados finales
    console.log('Actualizando estados finales:', {
      goles: golesPartido,
      tarjetas: tarjetasPartido,
      golesLocal,
      golesVisitante
    })
    
    setGoals(golesPartido)
    setCardsHistory(tarjetasPartido)
    setScoreLocal(golesLocal)
    setScoreVisitante(golesVisitante)
  }

  // Función para aplicar tarjeta a un jugador desde eventos del backend
  const aplicarTarjetaAJugadorDesdeEvento = (jugadorId, tipoTarjeta, esDirecta = true) => {
    const jugador = allLoadedPlayers.find(j => j.id == jugadorId)
    if (!jugador) return
    
    const esLocal = jugador.equipo_id === partidoToStart?.equipo_local_id
    const setTeam = esLocal ? setTeamLocalPlayers : setTeamVisitantePlayers
    
    setTeam(prevTeam =>
      prevTeam.map(player => {
        if (player.id == jugadorId) {
          let newYellowCards = player.yellowCards
          let newRedCard = player.redCard
          let newIsOnField = player.isOnField
          
          if (tipoTarjeta === 'tarjeta_amarilla') {
            newYellowCards = player.yellowCards + 1
            // Si llega a 2 amarillas, automáticamente es roja
            if (newYellowCards >= 2) {
              newRedCard = true
              newIsOnField = false
            }
          } else if (tipoTarjeta === 'tarjeta_roja') {
            newRedCard = true
            newIsOnField = false
            // Si es roja por acumulación, también incrementar amarillas
            if (!esDirecta) {
              newYellowCards = 2
            }
          }
          
          return {
            ...player,
            yellowCards: newYellowCards,
            redCard: newRedCard,
            isOnField: newIsOnField
          }
        }
        return player
      })
    )
  }

  // Función para aplicar tarjeta a un jugador (solo para reconstruir estado, no para eventos nuevos)
  const aplicarTarjetaAJugador = (jugadorId, tipoTarjeta) => {
    aplicarTarjetaAJugadorDesdeEvento(jugadorId, tipoTarjeta, true)
  }

  // Función para aplicar cambio de jugador desde eventos del backend
  const aplicarCambioJugadorDesdeEvento = (jugadorSaleId, jugadorEntraId) => {
    const jugadorSale = allLoadedPlayers.find(j => j.id === jugadorSaleId)
    const jugadorEntra = allLoadedPlayers.find(j => j.id === jugadorEntraId)
    
    if (!jugadorSale || !jugadorEntra) {
      console.log('No se encontraron jugadores para el cambio:', { jugadorSaleId, jugadorEntraId })
      return
    }
    
    const esLocal = jugadorSale.equipo_id === partidoToStart?.equipo_local_id
    const setTeam = esLocal ? setTeamLocalPlayers : setTeamVisitantePlayers
    
    setTeam(prevTeam => {
      // Verificar si el jugador que entra ya está en la lista
      const jugadorEntraExiste = prevTeam.some(p => p.id === jugadorEntraId)
      
      let newTeam = prevTeam.map(player => {
        if (player.id === jugadorSaleId) {
          return { ...player, isOnField: false, isStarter: false }
        }
        if (player.id === jugadorEntraId) {
          return { ...player, isOnField: true, isStarter: false }
        }
        return player
      })
      
      // Si el jugador que entra no está en la lista, agregarlo
      if (!jugadorEntraExiste) {
        const nuevoJugador = {
          id: jugadorEntra.id,
          name: `${jugadorEntra.nombre} ${jugadorEntra.apellido}`,
          isStarter: false,
          isOnField: true,
          yellowCards: 0,
          redCard: false,
          isSuspended: jugadoresSuspendidos.includes(jugadorEntra.id),
          tarjetasAcumuladas: tarjetasAcumuladasTorneo[jugadorEntra.id] || 0
        }
        newTeam.push(nuevoJugador)
      }
      
      return newTeam
    })
  }

  // Función para aplicar cambio de jugador (mantener compatibilidad)
  const aplicarCambioJugador = (jugadorSaleId, jugadorEntraId) => {
    aplicarCambioJugadorDesdeEvento(jugadorSaleId, jugadorEntraId)
  }

  // Funciones para el modal avanzado
  const togglePlayerStarter = (team, playerId) => {
    const setTeam = team === 'local' ? setTeamLocalPlayers : setTeamVisitantePlayers
    const currentTeam = team === 'local' ? teamLocalPlayers : teamVisitantePlayers
    const player = currentTeam.find(p => p.id === playerId)
    const playerData = allLoadedPlayers.find(p => p.id === playerId)

    // Verificar si el jugador está suspendido
    if (player.isSuspended) {
      alert('Este jugador está suspendido y no puede jugar en este partido.')
      return
    }

    // Si el jugador no tiene número y se está marcando como titular, mostrar modal para asignar número
    if (!player.isStarter && (!playerData?.numero_camiseta)) {
      setPlayerNeedingNumber({ ...player, team, playerData })
      setNewPlayerNumber('')
      setShowNumberModal(true)
      return
    }

    setTeam(
      currentTeam.map((p) =>
        p.id === playerId
          ? { ...p, isStarter: !p.isStarter, isOnField: !p.isStarter ? true : p.isOnField }
          : p,
      ),
    )
  }

  // Función para asignar número de camiseta
  const handleAssignNumber = async () => {
    if (!newPlayerNumber || !playerNeedingNumber) return

    try {
      // Actualizar el número en el backend usando api centralizada
      await api.put(`/jugadores/${playerNeedingNumber.id}`, {
        numero_camiseta: parseInt(newPlayerNumber)
      })

      // Actualizar el jugador en allLoadedPlayers
      setAllLoadedPlayers(prev =>
        prev.map(p =>
          p.id === playerNeedingNumber.id
            ? { ...p, numero_camiseta: parseInt(newPlayerNumber) }
            : p
        )
      )

      // Marcar como titular
      const setTeam = playerNeedingNumber.team === 'local' ? setTeamLocalPlayers : setTeamVisitantePlayers
      const currentTeam = playerNeedingNumber.team === 'local' ? teamLocalPlayers : teamVisitantePlayers
      
      setTeam(
        currentTeam.map((p) =>
          p.id === playerNeedingNumber.id
            ? { ...p, isStarter: true, isOnField: true }
            : p,
        ),
      )

      // Cerrar modal
      setShowNumberModal(false)

      // Ejecutar la acción pendiente
      if (playerNeedingNumber.afterAssign) {
        playerNeedingNumber.afterAssign()
      }
      
      setPlayerNeedingNumber(null)
      setNewPlayerNumber('')
    } catch (error) {
      console.error('Error al asignar número:', error)
      alert('Error al asignar número de camiseta')
    }
  }


  const addGoal = async (team, playerId, playerName) => {
    // Mostrar modal de confirmación
    showConfirmation('goal', { team, playerId, playerName })
  }

  // Función para mostrar modal de confirmación
  const showConfirmation = (type, data) => {
    setConfirmationType(type)
    setConfirmationData(data)
    setShowConfirmationModal(true)
  }

  // Función para ejecutar la acción confirmada
  const executeConfirmedAction = () => {
    if (!confirmationData || !confirmationType) return

    switch (confirmationType) {
      case 'goal':
        addGoalConfirmed(confirmationData.team, confirmationData.playerId, confirmationData.playerName)
        break
      case 'card':
        addCardConfirmed(confirmationData.team, confirmationData.playerId, confirmationData.cardType)
        break
      case 'substitution':
        makeSubstitutionConfirmed(confirmationData.team, confirmationData.playerOutId, confirmationData.playerInId)
        break
    }

    // Cerrar modal
    setShowConfirmationModal(false)
    setConfirmationType('')
    setConfirmationData(null)
  }

  const addGoalConfirmed = async (team, playerId, playerName) => {
    const torneo = torneos.find(t => t.id === partidoToStart.torneo_id)
    const isVoley = torneo?.deporte === 'voley'
    
    if (isVoley) {
      // Para vóley, agregar punto al set actual
      addPuntoVoley(team, playerId, playerName)
    } else {
      // Para fútbol, agregar gol
      const currentMinute = getCurrentMinute()
      const timeFormatted = `${Math.floor(currentHalfTime / 60)}'${(currentHalfTime % 60).toString().padStart(2, '0')}"`
      const timeWithHalf = getCurrentTimeFormatted()
      const newGoal = {
        id: goals.length + 1,
        playerId,
        playerName,
        team,
        minute: currentMinute,
        timeFormatted: timeFormatted, // Solo tiempo del tiempo actual
        timeWithHalf: timeWithHalf, // Tiempo completo con tiempo específico
        half: currentHalf,
        timestamp: new Date().toLocaleTimeString()
      }
      setGoals([...goals, newGoal])

      if (team === 'local') {
        setScoreLocal(scoreLocal + 1)
      } else {
        setScoreVisitante(scoreVisitante + 1)
      }

      // Guardar gol en la base de datos
      try {
        const jugador = allLoadedPlayers.find(j => j.id === playerId)
        const equipo_id = jugador ? jugador.equipo_id :
          (team === 'local' ? partidoToStart.equipo_local_id : partidoToStart.equipo_visitante_id)

        const currentTimeFormatted = getCurrentTimeFormatted()

        await dispatch(registrarEvento({
          partidoId: partidoToStart.id,
          eventoData: {
            tipo_evento: 'gol',
            jugador_id: playerId,
            equipo_id: equipo_id,
            minuto: currentMinute,
            segundo: currentHalfTime % 60,
            tiempo: currentHalf,
            descripcion: `Gol de ${playerName} - ${currentTimeFormatted} (${currentHalf}° tiempo)`
          }
        })).unwrap()
      } catch (error) {
        console.error('Error al registrar gol:', error)
      }
    }
  }

  // Función para eliminar un gol
  const removeGoal = async (goalId) => {
    if (window.confirm('¿Estás seguro de eliminar este gol?')) {
      try {
        // Encontrar el gol a eliminar
        const goalToRemove = goals.find(g => g.id === goalId)
        if (!goalToRemove) return

        // Actualizar el marcador local
        if (goalToRemove.team === 'local') {
          setScoreLocal(scoreLocal - 1)
        } else {
          setScoreVisitante(scoreVisitante - 1)
        }

        // Eliminar del estado local
        setGoals(goals.filter(g => g.id !== goalId))

        // Aquí deberías llamar al backend para eliminar el evento
        // await dispatch(eliminarEvento(goalToRemove.eventoId)).unwrap()
        
        console.log('Gol eliminado:', goalToRemove)
      } catch (error) {
        console.error('Error al eliminar gol:', error)
      }
    }
  }

  // Función específica para agregar puntos en vóley
  const addPuntoVoley = async (team, playerId, playerName) => {
    // Incrementar puntos del set actual
    if (team === 'local') {
      setPuntosSetLocal(puntosSetLocal + 1)
    } else {
      setPuntosSetVisitante(puntosSetVisitante + 1)
    }

    // Cambiar saque al equipo que anotó
    setEquipoConSaque(team)

    // Registrar punto en la base de datos
    try {
      const jugador = allLoadedPlayers.find(j => j.id === playerId)
      const equipo_id = jugador ? jugador.equipo_id :
        (team === 'local' ? partidoToStart.equipo_local_id : partidoToStart.equipo_visitante_id)

      await dispatch(registrarEvento({
        partidoId: partidoToStart.id,
        eventoData: {
          tipo_evento: 'punto_voley',
          jugador_id: playerId,
          equipo_id: equipo_id,
          set_numero: currentSet,
          punto_numero: (team === 'local' ? puntosSetLocal + 1 : puntosSetVisitante + 1),
          descripcion: `Punto para ${playerName} en set ${currentSet}`
        }
      })).unwrap()
    } catch (error) {
      console.error('Error al registrar punto:', error)
    }
  }

  // Función para cerrar set manualmente
  const cerrarSet = async (equipoGanador) => {
    const puntosLocal = puntosSetLocal
    const puntosVisitante = puntosSetVisitante
    
    // Agregar set al historial
    const nuevoSet = {
      set: currentSet,
      puntosLocal,
      puntosVisitante,
      ganador: equipoGanador
    }
    setHistorialSets([...historialSets, nuevoSet])

    // Incrementar sets ganados
    if (equipoGanador === 'local') {
      setSetsLocal(setsLocal + 1)
    } else {
      setSetsVisitante(setsVisitante + 1)
    }

    // Registrar set ganado en la base de datos
    try {
      const equipo_id = equipoGanador === 'local' ? partidoToStart.equipo_local_id : partidoToStart.equipo_visitante_id

      await dispatch(registrarEvento({
        partidoId: partidoToStart.id,
        eventoData: {
          tipo_evento: 'set_voley',
          equipo_id: equipo_id,
          set_numero: currentSet,
          descripcion: `Set ${currentSet} ganado por ${equipoGanador === 'local' ? partidoToStart.equipo_local?.nombre : partidoToStart.equipo_visitante?.nombre} (${puntosLocal}-${puntosVisitante})`
        }
      })).unwrap()
    } catch (error) {
      console.error('Error al registrar set:', error)
    }

    // Preparar siguiente set
    setCurrentSet(currentSet + 1)
    setPuntosSetLocal(0)
    setPuntosSetVisitante(0)
    setEquipoConSaque('local') // Resetear saque
  }

  const addCard = async (team, playerId, cardType) => {
    // Mostrar modal de confirmación
    showConfirmation('card', { team, playerId, cardType })
  }

  const addCardConfirmed = async (team, playerId, cardType) => {
    const setTeam = team === 'local' ? setTeamLocalPlayers : setTeamVisitantePlayers
    const currentTeam = team === 'local' ? teamLocalPlayers : teamVisitantePlayers
    const player = currentTeam.find(p => p.id == playerId)

    if (!player) {
      console.error('Jugador no encontrado:', playerId)
      return
    }

    // Si ya tiene tarjeta roja, no puede recibir más tarjetas
    if (player.redCard) {
      console.log('El jugador ya tiene tarjeta roja')
      return
    }

    let finalCardType = cardType
    let newYellowCards = player.yellowCards
    let newRedCard = player.redCard
    let isDirectRed = cardType === 'red'
    let shouldRegisterAsRed = false

    // Lógica de tarjetas
    if (cardType === 'yellow') {
      newYellowCards = player.yellowCards + 1
      // Si llega a 2 amarillas en el partido, automáticamente es roja por acumulación
      if (newYellowCards >= 2) {
        finalCardType = 'red'
        newRedCard = true
        isDirectRed = false // Es por acumulación
        shouldRegisterAsRed = true // Registrar como roja en el backend
      }
    } else if (cardType === 'red') {
      newRedCard = true
      isDirectRed = true // Es directa
    }

    // Actualizar estado local
    setTeam(
      currentTeam.map((p) =>
        p.id == playerId
          ? {
              ...p,
              yellowCards: newYellowCards,
              redCard: newRedCard,
              isOnField: newRedCard ? false : p.isOnField,
            }
          : p,
      ),
    )

    const currentMinute = getCurrentMinute()

    // Guardar tarjeta en la base de datos
    try {
      // Determinar el equipo_id basado en el team
      const jugador = allLoadedPlayers.find(j => j.id == playerId)
      const equipo_id = jugador ? jugador.equipo_id :
        (team === 'local' ? partidoToStart.equipo_local_id : partidoToStart.equipo_visitante_id)

      // Obtener el tiempo formateado antes de usarlo
      const currentTimeFormatted = getCurrentTimeFormatted()
      
      // Registrar eventos según la lógica de acumulación
      if (cardType === 'yellow' && newYellowCards >= 2) {
        // Si es la segunda amarilla, registrar AMBOS eventos: la amarilla y la roja por acumulación
        
        // Primero registrar la tarjeta amarilla
        await dispatch(registrarEvento({
          partidoId: partidoToStart.id,
          eventoData: {
            tipo_evento: 'tarjeta_amarilla',
            jugador_id: parseInt(playerId),
            equipo_id: equipo_id,
            minuto: currentMinute,
            segundo: currentHalfTime % 60,
            tiempo: currentHalf,
            descripcion: `Tarjeta amarilla para ${player?.name} - ${currentTimeFormatted} (${currentHalf}° tiempo)`
          }
        })).unwrap()
        
        // Luego registrar la tarjeta roja por acumulación
        await dispatch(registrarEvento({
          partidoId: partidoToStart.id,
          eventoData: {
            tipo_evento: 'tarjeta_roja',
            jugador_id: parseInt(playerId),
            equipo_id: equipo_id,
            minuto: currentMinute,
            segundo: currentHalfTime % 60,
            tiempo: currentHalf,
            es_tarjeta_roja_directa: false,
            descripcion: `Tarjeta roja por segunda amarilla para ${player?.name} - ${currentTimeFormatted} (${currentHalf}° tiempo)`
          }
        })).unwrap()
      } else {
        // Registrar evento normal (primera amarilla o roja directa)
        await dispatch(registrarEvento({
          partidoId: partidoToStart.id,
          eventoData: {
            tipo_evento: cardType === 'yellow' ? 'tarjeta_amarilla' : 'tarjeta_roja',
            jugador_id: parseInt(playerId),
            equipo_id: equipo_id,
            minuto: currentMinute,
            segundo: currentHalfTime % 60,
            tiempo: currentHalf,
            es_tarjeta_roja_directa: cardType === 'red' ? isDirectRed : undefined,
            descripcion: `Tarjeta ${cardType === 'yellow' ? 'amarilla' : (isDirectRed ? 'roja directa' : 'roja')} para ${player?.name} - ${currentTimeFormatted} (${currentHalf}° tiempo)`
          }
        })).unwrap()
      }

    } catch (error) {
      console.error('Error al registrar tarjeta:', error)
    }

    // Agregar al historial de tarjetas - mostrar en 2 filas cuando es por acumulación
    const timeFormatted = `${Math.floor(currentHalfTime / 60)}'${(currentHalfTime % 60).toString().padStart(2, '0')}"`
    const timeWithHalf = getCurrentTimeFormatted()
    
    if (cardType === 'yellow') {
      if (newYellowCards >= 2) {
        // Si es la segunda amarilla, agregar AMBAS: la segunda amarilla Y la roja por acumulación
        const yellowCardEntry = {
          id: Date.now(),
          playerId: parseInt(playerId),
          playerName: player?.name,
          team: team,
          cardType: 'yellow',
          minute: currentMinute,
          timeFormatted: timeFormatted,
          timeWithHalf: timeWithHalf,
          half: currentHalf,
          timestamp: new Date().toLocaleTimeString()
        }
        
        const redCardEntry = {
          id: Date.now() + 1, // ID diferente para evitar conflictos
          playerId: parseInt(playerId),
          playerName: player?.name,
          team: team,
          cardType: 'red',
          isAccumulation: true, // Marcar como por acumulación
          minute: currentMinute,
          timeFormatted: timeFormatted,
          timeWithHalf: timeWithHalf,
          half: currentHalf,
          timestamp: new Date().toLocaleTimeString()
        }
        
        setCardsHistory(prev => [...prev, yellowCardEntry, redCardEntry])
      } else {
        // Primera amarilla normal
        const yellowCardEntry = {
          id: Date.now(),
          playerId: parseInt(playerId),
          playerName: player?.name,
          team: team,
          cardType: 'yellow',
          minute: currentMinute,
          timeFormatted: timeFormatted,
          timeWithHalf: timeWithHalf,
          half: currentHalf,
          timestamp: new Date().toLocaleTimeString()
        }
        setCardsHistory(prev => [...prev, yellowCardEntry])
      }
    } else if (cardType === 'red') {
      // Tarjeta roja directa
      const redCardEntry = {
        id: Date.now(),
        playerId: parseInt(playerId),
        playerName: player?.name,
        team: team,
        cardType: 'red',
        isAccumulation: false, // Es directa
        minute: currentMinute,
        timeFormatted: timeFormatted,
        timeWithHalf: timeWithHalf,
        half: currentHalf,
        timestamp: new Date().toLocaleTimeString()
      }
      setCardsHistory(prev => [...prev, redCardEntry])
    }
  }

  // Función para eliminar una tarjeta del historial
  const removeCard = async (cardId, playerId, cardType) => {
    if (window.confirm('¿Estás seguro de eliminar esta tarjeta?')) {
      try {
        // Encontrar la tarjeta en el historial
        const cardToRemove = cardsHistory.find(card => card.id === cardId)
        if (!cardToRemove) return

        // Encontrar el jugador y actualizar su estado
        const jugador = allLoadedPlayers.find(j => j.id == playerId)
        if (!jugador) return

        const esLocal = jugador.equipo_id === partidoToStart?.equipo_local_id
        const setTeam = esLocal ? setTeamLocalPlayers : setTeamVisitantePlayers

        setTeam(prevTeam =>
          prevTeam.map(player => {
            if (player.id == playerId) {
              let newYellowCards = player.yellowCards
              let newRedCard = player.redCard
              let newIsOnField = player.isOnField

              if (cardType === 'yellow') {
                newYellowCards = Math.max(0, player.yellowCards - 1)
                // Si tenía roja por acumulación y quitamos una amarilla, quitar también la roja
                if (player.redCard && newYellowCards < 2) {
                  newRedCard = false
                  newIsOnField = true
                  // También eliminar la tarjeta roja por acumulación del historial
                  setCardsHistory(prev => prev.filter(card =>
                    !(card.playerId === playerId && card.cardType === 'red' && card.isAccumulation)
                  ))
                }
              } else if (cardType === 'red') {
                if (cardToRemove.isAccumulation) {
                  // Si es roja por acumulación, quitar la roja pero mantener una amarilla
                  newYellowCards = 1
                  newRedCard = false
                  newIsOnField = true
                } else {
                  // Si es roja directa, solo quitar la roja
                  newRedCard = false
                  newIsOnField = true
                }
              }

              return {
                ...player,
                yellowCards: newYellowCards,
                redCard: newRedCard,
                isOnField: newIsOnField
              }
            }
            return player
          })
        )

        // Eliminar del historial
        setCardsHistory(prev => prev.filter(card => card.id !== cardId))

        // Aquí deberías llamar al backend para eliminar el evento
        // await dispatch(eliminarEvento(cardId)).unwrap()
        
        console.log('Tarjeta eliminada del historial')
      } catch (error) {
        console.error('Error al eliminar tarjeta:', error)
      }
    }
  }

  const handleShowStartConfirmation = () => {
    // Validar que hay jugadores titulares en ambos equipos
    const titularesLocal = teamLocalPlayers.filter(player => player.isStarter)
    const titularesVisitante = teamVisitantePlayers.filter(player => player.isStarter)
    
    if (titularesLocal.length === 0) {
      alert('Debe seleccionar al menos un jugador titular para el equipo local antes de iniciar el partido.')
      return
    }
    
    if (titularesVisitante.length === 0) {
      alert('Debe seleccionar al menos un jugador titular para el equipo visitante antes de iniciar el partido.')
      return
    }
    
    setShowStartConfirmation(true)
  }

  const startMatch = async () => {
    if (partidoToStart && selectedArbitro && selectedVeedor) {
      try {
        // Preparar jugadores titulares
        const titularesLocal = teamLocalPlayers
          .filter(player => player.isStarter)
          .map(player => ({
            jugador_id: player.id,
            numero_camiseta: allLoadedPlayers.find(p => p.id === player.id)?.numero_camiseta || null
          }))

        const titularesVisitante = teamVisitantePlayers
          .filter(player => player.isStarter)
          .map(player => ({
            jugador_id: player.id,
            numero_camiseta: allLoadedPlayers.find(p => p.id === player.id)?.numero_camiseta || null
          }))

        await dispatch(iniciarPartido({
          id: partidoToStart.id,
          arbitro_id: selectedArbitro,
          veedor_id: selectedVeedor,
          titulares: {
            local: titularesLocal,
            visitante: titularesVisitante
          }
        })).unwrap()
        
        // CAMBIO IMPORTANTE: Solo mantener jugadores titulares en el partido
        const jugadoresTitularesLocal = teamLocalPlayers.filter(player => player.isStarter)
        const jugadoresTitularesVisitante = teamVisitantePlayers.filter(player => player.isStarter)
        
        // Marcar jugadores titulares como en campo
        setTeamLocalPlayers(
          jugadoresTitularesLocal.map(player => ({
            ...player,
            isOnField: true
          }))
        )
        
        setTeamVisitantePlayers(
          jugadoresTitularesVisitante.map(player => ({
            ...player,
            isOnField: true
          }))
        )
        
        console.log('Partido iniciado - Solo jugadores titulares en el partido:', {
          local: jugadoresTitularesLocal,
          visitante: jugadoresTitularesVisitante
        })
        
        // Inicializar y guardar el estado inicial del partido en vivo
        const initialMatchPhase = 'not_started'
        const initialCurrentTab = 'live'
        
        setMatchStarted(true)
        setCurrentTab(initialCurrentTab)
        setShowStartConfirmation(false)
        setMatchPhase(initialMatchPhase)
        setIsMatchRunning(false)
        setMatchTime(0)
        setCurrentHalf(1)

        // Guardar estado inicial para persistencia
        const ahora = Date.now()
        const initialState = {
          matchStarted: true,
          currentTab: initialCurrentTab,
          scoreLocal: 0,
          scoreVisitante: 0,
          goals: [],
          cardsHistory: [],
          matchTime: 0,
          currentHalfTime: 0,
          isMatchRunning: false,
          currentHalf: 1,
          matchPhase: initialMatchPhase,
          teamLocalPlayers: jugadoresTitularesLocal.map(p => ({ ...p, isOnField: true })),
          teamVisitantePlayers: jugadoresTitularesVisitante.map(p => ({ ...p, isOnField: true })),
          selectedArbitro,
          selectedVeedor,
          currentSet: 1,
          setsLocal: 0,
          setsVisitante: 0,
          puntosSetLocal: 0,
          puntosSetVisitante: 0,
          equipoConSaque: 'local',
          historialSets: [],
          // Timestamps para tiempo real
          matchStartTime: ahora,
          halfStartTime: ahora,
          lastSavedTime: ahora
        }
        setLiveMatchStates(prev => ({ ...prev, [partidoToStart.id]: initialState }))
        
        dispatch(fetchPartidos())
      } catch (error) {
        console.error('Error al iniciar partido:', error)
      }
    }
  }

  // Función para realizar cambio de jugadores
  const makeSubstitution = async (team, playerOutId, playerInId) => {
    // Mostrar modal de confirmación
    showConfirmation('substitution', { team, playerOutId, playerInId })
  }

  const makeSubstitutionConfirmed = async (team, playerOutId, playerInId) => {
    console.log('makeSubstitution called:', { team, playerOutId, playerInId })
    
    const setTeam = team === 'local' ? setTeamLocalPlayers : setTeamVisitantePlayers
    const currentTeam = team === 'local' ? teamLocalPlayers : teamVisitantePlayers
    const playerOut = currentTeam.find(p => p.id == playerOutId) // Usar == para comparación flexible
    let playerIn = currentTeam.find(p => p.id == playerInId)   // Usar == para comparación flexible

    // Si el jugador que entra no está en el equipo actual, buscarlo en allLoadedPlayers y agregarlo
    if (!playerIn) {
      const newPlayer = allLoadedPlayers.find(p => p.id == playerInId)
      if (newPlayer) {
        playerIn = {
          id: newPlayer.id,
          name: `${newPlayer.nombre} ${newPlayer.apellido}`,
          isStarter: false,
          isOnField: false,
          yellowCards: 0,
          redCard: false,
          isSuspended: jugadoresSuspendidos.includes(newPlayer.id),
          tarjetasAcumuladas: tarjetasAcumuladasTorneo[newPlayer.id] || 0
        }
        
        // Agregar el nuevo jugador al equipo
        setTeam(prevTeam => [...prevTeam, playerIn])
      }
    }

    console.log('Players found:', { playerOut, playerIn })

    if (!playerOut || !playerIn) {
      console.error('No se encontraron los jugadores:', { playerOut, playerIn })
      return
    }

    // Actualizar estado local
    setTeam(prevTeam =>
      prevTeam.map((player) => {
        if (player.id == playerOutId) {
          return { ...player, isOnField: false, isStarter: false }
        }
        if (player.id == playerInId) {
          return { ...player, isOnField: true, isStarter: false }
        }
        return player
      })
    )

    // YA NO agregamos jugador que sale a la lista de cambiados para permitir re-entrada
    // setJugadoresCambiados(prev => [...prev, parseInt(playerOutId)])

    const currentMinute = getCurrentMinute()
    const currentTimeFormatted = getCurrentTimeFormatted()

    // Guardar cambio en la base de datos
    try {
      // Determinar el equipo_id basado en el team
      const jugadorSale = allLoadedPlayers.find(j => j.id == playerOutId)
      const equipo_id = jugadorSale ? jugadorSale.equipo_id :
        (team === 'local' ? partidoToStart.equipo_local_id : partidoToStart.equipo_visitante_id)

      console.log('Enviando evento de sustitución:', {
        tipo_evento: 'sustitucion',
        jugador_id: parseInt(playerOutId),
        jugador_sale_id: parseInt(playerOutId),
        jugador_entra_id: parseInt(playerInId),
        equipo_id: equipo_id,
        minuto: currentMinute,
        tiempo: currentHalf,
        descripcion: `Cambio: Sale ${playerOut.name}, Entra ${playerIn.name} - ${currentTimeFormatted} (${currentHalf}° tiempo)`
      })

      await dispatch(registrarEvento({
        partidoId: partidoToStart.id,
        eventoData: {
          tipo_evento: 'sustitucion',
          jugador_id: parseInt(playerOutId),
          jugador_sale_id: parseInt(playerOutId),
          jugador_entra_id: parseInt(playerInId),
          equipo_id: equipo_id,
          minuto: currentMinute,
          segundo: currentHalfTime % 60,
          tiempo: currentHalf,
          descripcion: `Cambio: Sale ${playerOut.name}, Entra ${playerIn.name} - ${currentTimeFormatted} (${currentHalf}° tiempo)`
        }
      })).unwrap()

      console.log('Cambio registrado exitosamente')

      // Limpiar selecciones
      if (team === 'local') {
        setPlayerOutLocal('')
        setPlayerInLocal('')
      } else {
        setPlayerOutVisitante('')
        setPlayerInVisitante('')
      }
    } catch (error) {
      console.error('Error al registrar cambio:', error)
    }
  }

  // Función para abrir modal de selección de jugadores
  const openPlayerSelectionModal = (type, team) => {
    setPlayerSelectionType(type)
    setPlayerSelectionTeam(team)
    setShowPlayerSelectionModal(true)
  }

  // Función para seleccionar jugador desde el modal
  const selectPlayerFromModal = (playerId) => {
    const { type, team } = { type: playerSelectionType, team: playerSelectionTeam }
    
    if (type === 'out') {
      if (team === 'local') {
        setPlayerOutLocal(playerId)
      } else {
        setPlayerOutVisitante(playerId)
      }
    } else if (type === 'in') {
      // Para jugadores que entran, verificar si ya están en el partido
      const currentTeam = team === 'local' ? teamLocalPlayers : teamVisitantePlayers
      const setTeam = team === 'local' ? setTeamLocalPlayers : setTeamVisitantePlayers
      const jugadorEnEquipo = currentTeam.find(p => p.id == playerId)
      const jugadorData = allLoadedPlayers.find(p => p.id == playerId)

      const handlePlayerSelection = () => {
        if (!jugadorEnEquipo) {
          const jugadorParaAgregar = {
            id: jugadorData.id,
            name: `${jugadorData.nombre} ${jugadorData.apellido}`,
            isStarter: false,
            isOnField: false,
            yellowCards: 0,
            redCard: false,
            isSuspended: jugadoresSuspendidos.includes(jugadorData.id),
            tarjetasAcumuladas: tarjetasAcumuladasTorneo[jugadorData.id] || 0
          }
          setTeam(prev => [...prev, jugadorParaAgregar])
        }
        if (team === 'local') {
          setPlayerInLocal(playerId)
        } else {
          setPlayerInVisitante(playerId)
        }
      }

      if (!jugadorData?.numero_camiseta) {
        setPlayerNeedingNumber({ id: playerId, name: `${jugadorData.nombre} ${jugadorData.apellido}`, team, playerData: jugadorData, afterAssign: handlePlayerSelection })
        setNewPlayerNumber('')
        setShowNumberModal(true)
      } else {
        handlePlayerSelection()
      }
    } else if (type === 'add') {
      const jugadorData = allLoadedPlayers.find(p => p.id == playerId)
      const handlePlayerAddition = () => {
        const jugadorParaAgregar = {
          id: jugadorData.id,
          name: `${jugadorData.nombre} ${jugadorData.apellido}`,
          isStarter: false,
          isOnField: true,
          yellowCards: 0,
          redCard: false,
          isSuspended: jugadoresSuspendidos.includes(jugadorData.id),
          tarjetasAcumuladas: tarjetasAcumuladasTorneo[jugadorData.id] || 0
        }
        if (playerSelectionTeam === 'local') {
          setTeamLocalPlayers(prev => [...prev, jugadorParaAgregar])
        } else {
          setTeamVisitantePlayers(prev => [...prev, jugadorParaAgregar])
        }
      }

      if (!jugadorData?.numero_camiseta) {
        setPlayerNeedingNumber({ id: playerId, name: `${jugadorData.nombre} ${jugadorData.apellido}`, team, playerData: jugadorData, afterAssign: handlePlayerAddition })
        setNewPlayerNumber('')
        setShowNumberModal(true)
      } else {
        handlePlayerAddition()
      }
    }
    
    setShowPlayerSelectionModal(false)
    setPlayerSelectionType('')
    setPlayerSelectionTeam('')
  }

  // Funciones para control de tiempo del partido
  const formatMatchTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getCurrentMinute = () => {
    return Math.floor(matchTime / 60)
  }

  const getCurrentTimeFormatted = () => {
    const minutes = Math.floor(currentHalfTime / 60)
    const seconds = currentHalfTime % 60
    const timeStr = `${minutes}'${seconds.toString().padStart(2, '0')}"`
    const halfStr = currentHalf === 1 ? '1er tiempo' : '2do tiempo'
    return `${halfStr} ${timeStr}`
  }

  const startFirstHalf = () => {
    setMatchPhase('first_half')
    setCurrentHalf(1)
    setIsMatchRunning(true)
    setMatchTime(0)
    setCurrentHalfTime(0)
    
    // Actualizar timestamps de inicio
    const ahora = Date.now()
    if (partidoToStart) {
      setLiveMatchStates(prev => ({
        ...prev,
        [partidoToStart.id]: {
          ...prev[partidoToStart.id],
          matchStartTime: prev[partidoToStart.id]?.matchStartTime || ahora,
          halfStartTime: ahora, // Timestamp de inicio del primer tiempo
          lastSavedTime: ahora
        }
      }))
    }
  }

  const endFirstHalf = () => {
    setIsMatchRunning(false)
    setMatchPhase('half_time')
    setHalfTimeBreak(true)
    
    // Actualizar timestamp cuando termina el primer tiempo
    if (partidoToStart) {
      const ahora = Date.now()
      setLiveMatchStates(prev => ({
        ...prev,
        [partidoToStart.id]: {
          ...prev[partidoToStart.id],
          lastSavedTime: ahora
        }
      }))
    }
  }

  const startSecondHalf = () => {
    setMatchPhase('second_half')
    setCurrentHalf(2)
    setHalfTimeBreak(false)
    setIsMatchRunning(true)
    setCurrentHalfTime(0) // Reiniciar el tiempo del segundo tiempo a 00:00
    
    // Actualizar timestamp de inicio del segundo tiempo
    const ahora = Date.now()
    if (partidoToStart) {
      setLiveMatchStates(prev => ({
        ...prev,
        [partidoToStart.id]: {
          ...prev[partidoToStart.id],
          halfStartTime: ahora, // Nuevo timestamp para el segundo tiempo
          lastSavedTime: ahora
        }
      }))
    }
  }

  const endMatch = async () => {
    setIsMatchRunning(false)
    setMatchPhase('finished')
    // Finalizar el partido automáticamente sin confirmación
    await handleFinalizarPartidoDirecto(partidoToStart.id)
  }

  const pauseMatch = () => {
    setIsMatchRunning(false)
    // Actualizar timestamp cuando se pausa
    if (partidoToStart) {
      const ahora = Date.now()
      setLiveMatchStates(prev => ({
        ...prev,
        [partidoToStart.id]: {
          ...prev[partidoToStart.id],
          lastSavedTime: ahora
        }
      }))
    }
  }

  const resumeMatch = () => {
    setIsMatchRunning(true)
    // Actualizar timestamp cuando se reanuda
    if (partidoToStart) {
      const ahora = Date.now()
      setLiveMatchStates(prev => ({
        ...prev,
        [partidoToStart.id]: {
          ...prev[partidoToStart.id],
          halfStartTime: ahora - (currentHalfTime * 1000), // Ajustar para mantener continuidad
          lastSavedTime: ahora
        }
      }))
    }
  }

  const getPlayersOnField = (team) => team.filter((p) => p.isOnField && !p.redCard)
  const getPlayersOnBench = (team) => team.filter((p) => !p.isOnField && !p.redCard)

  const handleFinalizarPartido = async (id) => {
    if (window.confirm('¿Estás seguro de finalizar este partido?')) {
      await handleFinalizarPartidoDirecto(id)
    }
  }

  const handleFinalizarPartidoDirecto = async (id) => {
    try {
      // Finalizar partido directamente - el backend calculará el marcador basándose en los eventos
      await dispatch(finalizarPartido(id)).unwrap()
      
      // Obtener resumen del partido
      await dispatch(obtenerResumenPartido(id)).unwrap()
      
      // Cerrar modal de partido automáticamente y mostrar resumen
      handleCloseMatchModal();
      setShowResumenModal(true);
      
      // Limpiar el estado guardado del partido finalizado
      setLiveMatchStates(prev => {
          const newStates = { ...prev };
          delete newStates[id];
          return newStates;
      });
      
      dispatch(fetchPartidos());
    } catch (error) {
      console.error('Error al finalizar partido:', error)
      alert('Error al finalizar el partido')
    }
  }

  const handleVerResumen = async (partido) => {
    try {
      // Obtener resumen del partido finalizado
      await dispatch(obtenerResumenPartido(partido.id)).unwrap()
      setShowResumenModal(true)
    } catch (error) {
      console.error('Error al obtener resumen del partido:', error)
    }
  }

  const handleMarcarWalkover = (partido) => {
    setPartidoWalkover(partido)
    setShowWalkoverModal(true)
    setEquipoGanadorWO('')
    setMotivoWO('')
  }

  const confirmarWalkover = async () => {
    if (!partidoWalkover || !equipoGanadorWO) return

    try {
      await dispatch(marcarWalkover({
        id: partidoWalkover.id,
        equipo_ganador: equipoGanadorWO,
        motivo: motivoWO
      })).unwrap()

      setShowWalkoverModal(false)
      setPartidoWalkover(null)
      setEquipoGanadorWO('')
      setMotivoWO('')
      
      dispatch(fetchPartidos())
      alert('Partido marcado como W.O. exitosamente')
    } catch (error) {
      console.error('Error al marcar W.O.:', error)
      alert('Error al marcar el partido como W.O.')
    }
  }

  const handleEditarPartido = (partido) => {
    // Abrir el modal específico para edición
    setPartidoToEdit(partido)
    setIsEditMode(true)
    setShowEditModal(true)
    setCurrentTab('lineup')
    setScoreLocal(partido.goles_local || 0)
    setScoreVisitante(partido.goles_visitante || 0)
    setSelectedArbitro(partido.arbitro_id || '')
    setSelectedVeedor(partido.veedor_id || '')
    setSetsLocal(partido.sets_local || 0)
    setSetsVisitante(partido.sets_visitante || 0)
    
    // Cargar historial de sets si es vóley
    if (partido.sets_detalle) {
      try {
        const setsDetalle = typeof partido.sets_detalle === 'string'
          ? JSON.parse(partido.sets_detalle)
          : partido.sets_detalle
        setHistorialSets(setsDetalle || [])
      } catch (e) {
        console.error('Error parsing sets_detalle:', e)
        setHistorialSets([])
      }
    }
  }

  const handleGuardarEdicion = async () => {
    if (!partidoToEdit) return
    
    try {
      // Preparar datos para actualizar
      const datosActualizacion = {
        id: partidoToEdit.id,
        arbitro_id: selectedArbitro,
        veedor_id: selectedVeedor,
      }

      // Agregar marcador según el deporte
      const torneo = torneos.find(t => t.id === partidoToEdit.torneo_id)
      if (torneo?.deporte === 'voley') {
        datosActualizacion.sets_local = setsLocal
        datosActualizacion.sets_visitante = setsVisitante
        if (historialSets.length > 0) {
          datosActualizacion.sets_detalle = JSON.stringify(historialSets)
        }
      } else {
        datosActualizacion.goles_local = scoreLocal
        datosActualizacion.goles_visitante = scoreVisitante
      }

      console.log('Guardando cambios del partido:', datosActualizacion)
      
      // Aquí deberías llamar a una acción de Redux para actualizar el partido
      // await dispatch(updatePartido(datosActualizacion)).unwrap()
      
      // Por ahora solo mostramos un mensaje de éxito
      alert('Cambios guardados exitosamente')
      
      // Cerrar modal de edición
      handleCloseEditModal()
      
      // Refrescar lista de partidos
      dispatch(fetchPartidos())
      
    } catch (error) {
      console.error('Error al guardar cambios:', error)
      alert('Error al guardar los cambios')
    }
  }

  const handleCloseEditModal = () => {
    setShowEditModal(false)
    setPartidoToEdit(null)
    setIsEditMode(false)
    setCurrentTab('lineup')
    setScoreLocal(0)
    setScoreVisitante(0)
    setSelectedArbitro('')
    setSelectedVeedor('')
    setSetsLocal(0)
    setSetsVisitante(0)
    setHistorialSets([])
    setTeamLocalPlayers([])
    setTeamVisitantePlayers([])
    setAllLoadedPlayers([])
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setFormData({
      torneo_id: '',
      equipo_local_id: '',
      equipo_visitante_id: '',
      cancha_id: '',
      fecha_hora: '',
      arbitro_id: '',
      fase: '',
      grupo: '',
      subgrupo: '',
      num_clasificados: 2,
      observaciones: ''
    })
    dispatch(clearError())
  }

  const handleCloseMatchModal = () => {
    // Si el partido ha comenzado y no ha finalizado, guarda su estado.
    if (partidoToStart && matchStarted && matchPhase !== 'finished') {
      const ahora = Date.now()
      const currentState = {
        matchStarted,
        currentTab,
        scoreLocal,
        scoreVisitante,
        goals,
        cardsHistory,
        matchTime,
        currentHalfTime,
        isMatchRunning,
        currentHalf,
        matchPhase,
        halfTimeBreak,
        teamLocalPlayers,
        teamVisitantePlayers,
        selectedArbitro,
        selectedVeedor,
        // Estados de Vóley
        currentSet,
        setsLocal,
        setsVisitante,
        puntosSetLocal,
        puntosSetVisitante,
        equipoConSaque,
        historialSets,
        // Timestamps para tiempo real
        lastSavedTime: ahora,
        matchStartTime: liveMatchStates[partidoToStart.id]?.matchStartTime || ahora,
        halfStartTime: liveMatchStates[partidoToStart.id]?.halfStartTime || ahora
      }
      console.log('Guardando estado del partido con timestamps para tiempo real:', {
        partidoId: partidoToStart.id,
        matchTime,
        currentHalfTime,
        isMatchRunning,
        matchPhase,
        lastSavedTime: ahora,
        halfStartTime: currentState.halfStartTime
      })
      setLiveMatchStates(prev => ({ ...prev, [partidoToStart.id]: currentState }))
      setShowMatchModal(false)
    } else {
      // Reseteo completo para partidos que no están en curso o ya finalizaron.
      setShowMatchModal(false)
      setPartidoToStart(null)
      setMatchStarted(false)
      setCurrentTab('lineup')
      setScoreLocal(0)
      setScoreVisitante(0)
      setGoals([])
      setTeamLocalPlayers([])
      setTeamVisitantePlayers([])
      setAllLoadedPlayers([])
      setSelectedArbitro('')
      setSelectedVeedor('')
      setShowStartConfirmation(false)
      setSearchJugador1('')
      setSearchJugador2('')
      setPlayerOutLocal('')
      setPlayerInLocal('')
      setPlayerOutVisitante('')
      setPlayerInVisitante('')
      setEstadoCargado(false)
      setCurrentSet(1)
      setSetsLocal(0)
      setSetsVisitante(0)
      setPuntosSetLocal(0)
      setPuntosSetVisitante(0)
      setEquipoConSaque('local')
      setHistorialSets([])
      setCardsHistory([])
      setShowNumberModal(false)
      setPlayerNeedingNumber(null)
      setNewPlayerNumber('')
      setJugadoresCambiados([])
    }
  }

  const getEstadoBadge = (estado) => {
    const badges = {
      programado: 'bg-blue-100 text-blue-800',
      en_curso: 'bg-green-100 text-green-800',
      finalizado: 'bg-gray-100 text-gray-800',
      cancelado: 'bg-red-100 text-red-800',
      suspendido: 'bg-yellow-100 text-yellow-800'
    }
    return badges[estado] || 'bg-gray-100 text-gray-800'
  }

  // Función formatDateTime removida - ahora se usa la importada de dateUtils

  const getEquiposByTorneo = (torneoId) => {
    if (!torneoId) return equipos
    return equipos.filter(equipo => equipo.torneo_id?.toString() === torneoId)
  }

  // Función para obtener grupos disponibles de un torneo
  const getGruposByTorneo = (torneoId) => {
    if (!torneoId) return []
    const equiposTorneo = getEquiposByTorneo(torneoId)
    const grupos = [...new Set(equiposTorneo.map(equipo => equipo.grupo).filter(grupo => grupo))]
    return grupos.sort()
  }

  // Función para obtener subgrupos disponibles de un grupo específico
  const getSubgruposByGrupo = (torneoId, grupo) => {
    if (!torneoId || !grupo) return []
    const equiposTorneo = getEquiposByTorneo(torneoId)
    const subgrupos = [...new Set(
      equiposTorneo
        .filter(equipo => equipo.grupo === grupo && equipo.subgrupo)
        .map(equipo => equipo.subgrupo)
    )]
    return subgrupos.sort()
  }

  // Función para filtrar equipos por grupo y subgrupo
  const getEquiposByGrupo = (torneoId, grupo, subgrupo = null) => {
    if (!torneoId || !grupo) return getEquiposByTorneo(torneoId)
    return getEquiposByTorneo(torneoId).filter(equipo => {
      const matchGrupo = equipo.grupo === grupo
      if (subgrupo) {
        return matchGrupo && equipo.subgrupo === subgrupo
      }
      return matchGrupo && !equipo.subgrupo // Solo equipos sin subgrupo si no se especifica subgrupo
    })
  }

  // Función para calcular equipos clasificados de fase de grupos
  const getEquiposClasificados = (torneoId, numClasificados = 2) => {
    if (!torneoId) return []

    // Obtener todos los partidos de fase de grupos del torneo
    const partidosGrupos = partidos.filter(p =>
      p.torneo_id?.toString() === torneoId &&
      p.fase === 'grupos' &&
      p.estado === 'finalizado'
    )

    if (partidosGrupos.length === 0) {
      // Si no hay partidos finalizados, devolver todos los equipos
      return getEquiposByTorneo(torneoId)
    }

    // Calcular tabla de posiciones por grupo
    const equiposTorneo = getEquiposByTorneo(torneoId)
    const grupos = [...new Set(equiposTorneo.map(e => e.grupo).filter(g => g))]

    const equiposClasificados = []

    grupos.forEach(grupo => {
      const equiposGrupo = equiposTorneo.filter(e => e.grupo === grupo)
      const posicionesGrupo = equiposGrupo.map(equipo => {
        const partidosEquipo = partidosGrupos.filter(p =>
          (p.equipo_local_id?.toString() === equipo.id?.toString() ||
           p.equipo_visitante_id?.toString() === equipo.id?.toString()) &&
          p.grupo === grupo
        )

        let puntos = 0
        let golesFavor = 0
        let golesContra = 0

        partidosEquipo.forEach(partido => {
          const esLocal = partido.equipo_local_id?.toString() === equipo.id?.toString()
          const golesEquipo = esLocal ? (partido.goles_local || 0) : (partido.goles_visitante || 0)
          const golesRival = esLocal ? (partido.goles_visitante || 0) : (partido.goles_local || 0)

          golesFavor += golesEquipo
          golesContra += golesRival

          if (golesEquipo > golesRival) puntos += 3
          else if (golesEquipo === golesRival) puntos += 1
        })

        return {
          ...equipo,
          puntos,
          golesFavor,
          golesContra,
          diferenciaGoles: golesFavor - golesContra,
          partidosJugados: partidosEquipo.length
        }
      })

      // Ordenar por puntos, diferencia de goles, goles a favor
      posicionesGrupo.sort((a, b) => {
        if (a.puntos !== b.puntos) return b.puntos - a.puntos
        if (a.diferenciaGoles !== b.diferenciaGoles) return b.diferenciaGoles - a.diferenciaGoles
        return b.golesFavor - a.golesFavor
      })

      // Tomar los primeros N clasificados
      equiposClasificados.push(...posicionesGrupo.slice(0, numClasificados))
    })

    return equiposClasificados
  }

  // Función para obtener equipos disponibles según la fase
  const getEquiposDisponibles = (torneoId, fase, grupo, numClasificados = 2, subgrupo = null) => {
    if (!torneoId) return []

    switch (fase) {
      case 'grupos':
        return grupo ? getEquiposByGrupo(torneoId, grupo, subgrupo) : getEquiposByTorneo(torneoId)

      case 'octavos':
      case 'cuartos':
      case 'semifinal':
      case 'final':
        // Verificar si hay partidos en la fase anterior
        const faseAnterior = getFaseAnterior(fase)
        const partidosFaseAnterior = partidos.filter(p =>
          p.torneo_id?.toString() === torneoId &&
          p.fase === faseAnterior &&
          p.estado === 'finalizado'
        )

        if (partidosFaseAnterior.length > 0) {
          // Si hay partidos en fase anterior, obtener ganadores
          return getGanadoresFase(torneoId, faseAnterior)
        } else if (faseAnterior === 'grupos') {
          // Si no hay partidos en grupos, calcular clasificados
          return getEquiposClasificados(torneoId, numClasificados)
        } else {
          // Para otras fases, devolver equipos del torneo
          return getEquiposByTorneo(torneoId)
        }

      default:
        return getEquiposByTorneo(torneoId)
    }
  }

  // Función auxiliar para obtener la fase anterior
  const getFaseAnterior = (fase) => {
    const fases = ['grupos', 'octavos', 'cuartos', 'semifinal', 'final']
    const index = fases.indexOf(fase)
    return index > 0 ? fases[index - 1] : null
  }

  // Función para obtener ganadores de una fase
  const getGanadoresFase = (torneoId, fase) => {
    const partidosFase = partidos.filter(p =>
      p.torneo_id?.toString() === torneoId &&
      p.fase === fase &&
      p.estado === 'finalizado'
    )

    const ganadores = []
    partidosFase.forEach(partido => {
      const golesLocal = partido.goles_local || 0
      const golesVisitante = partido.goles_visitante || 0

      if (golesLocal > golesVisitante) {
        ganadores.push(partido.equipo_local)
      } else if (golesVisitante > golesLocal) {
        ganadores.push(partido.equipo_visitante)
      }
      // En caso de empate, no agregar ninguno (se resolvería por penales u otros criterios)
    })

    return ganadores
  }

  const getEstadisticasTorneo = (fases) => {
    let total = 0
    let programados = 0
    let en_curso = 0
    let finalizados = 0

    fases.forEach(fase => {
      if (fase.fase === 'grupos' && fase.grupos) {
        fase.grupos.forEach(grupo => {
          // Contar partidos sin subgrupo
          if (grupo.partidosSinSubgrupo) {
            total += grupo.partidosSinSubgrupo.length
            programados += grupo.partidosSinSubgrupo.filter(p => p.estado === 'programado').length
            en_curso += grupo.partidosSinSubgrupo.filter(p => p.estado === 'en_curso').length
            finalizados += grupo.partidosSinSubgrupo.filter(p => p.estado === 'finalizado').length
          }
          
          // Contar partidos de subgrupos
          if (grupo.subgrupos) {
            grupo.subgrupos.forEach(subgrupo => {
              if (subgrupo.partidos) {
                total += subgrupo.partidos.length
                programados += subgrupo.partidos.filter(p => p.estado === 'programado').length
                en_curso += subgrupo.partidos.filter(p => p.estado === 'en_curso').length
                finalizados += subgrupo.partidos.filter(p => p.estado === 'finalizado').length
              }
            })
          }
          
          // Fallback para estructura antigua
          if (grupo.partidos && !grupo.partidosSinSubgrupo) {
            total += grupo.partidos.length
            programados += grupo.partidos.filter(p => p.estado === 'programado').length
            en_curso += grupo.partidos.filter(p => p.estado === 'en_curso').length
            finalizados += grupo.partidos.filter(p => p.estado === 'finalizado').length
          }
        })
      } else if (fase.partidos) {
        total += fase.partidos.length
        programados += fase.partidos.filter(p => p.estado === 'programado').length
        en_curso += fase.partidos.filter(p => p.estado === 'en_curso').length
        finalizados += fase.partidos.filter(p => p.estado === 'finalizado').length
      }
    })

    return { total, programados, en_curso, finalizados }
  }

  // Función para obtener estadísticas de un grupo específico
  const getEstadisticasGrupo = (partidos) => {
    return {
      total: partidos.length,
      programados: partidos.filter(p => p.estado === 'programado').length,
      en_curso: partidos.filter(p => p.estado === 'en_curso').length,
      finalizados: partidos.filter(p => p.estado === 'finalizado').length
    }
  }

  // Componente para renderizar un partido individual
  const PartidoItem = ({ partido }) => (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
            <PlayIcon className="h-4 w-4 text-primary-600" />
          </div>
        </div>
        <div className="ml-3">
          <div className="flex items-center">
            <p className="text-sm font-medium text-gray-900">
              {partido.equipo_local?.nombre || 'Equipo Local'}
              <span className="mx-2 text-gray-500">vs</span>
              {partido.equipo_visitante?.nombre || 'Equipo Visitante'}
            </p>
          </div>
          <div className="mt-1 flex items-center text-xs text-gray-500">
            <CalendarIcon className="h-3 w-3 mr-1" />
            <span>{formatDateTime(partido.fecha_hora)}</span>
            {partido.cancha && (
              <>
                <span className="mx-2">•</span>
                <span>{partido.cancha.nombre}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {partido.estado === 'en_curso' && (
          <div className="flex items-center text-xs text-green-600">
            <ClockIcon className="h-3 w-3 mr-1" />
            <span>
              {partido.goles_local || 0} - {partido.goles_visitante || 0}
            </span>
          </div>
        )}

        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getEstadoBadge(partido.estado)}`}>
          {partido.estado.replace('_', ' ')}
        </span>

        <div className="flex space-x-1">
          {partido.estado === 'programado' && (
            <button
              onClick={() => handleIniciarPartido(partido)}
              className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              title="Iniciar partido"
            >
              <PlayIcon className="h-2 w-2" />
            </button>
          )}
          {partido.estado === 'en_curso' && (
            <>
              <button
                onClick={() => handleReingresarPartido(partido)}
                className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                title="Reingresar al partido"
              >
                <PlayIcon className="h-2 w-2" />
              </button>
            </>
          )}
          {partido.estado === 'programado' && (
            <button
              onClick={() => handleMarcarWalkover(partido)}
              className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              title="Marcar como W.O."
            >
              <ExclamationTriangleIcon className="h-2 w-2" />
            </button>
          )}
          {partido.estado === 'finalizado' && (
            <>
              <button
                onClick={() => handleVerResumen(partido)}
                className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                title="Ver resumen del partido"
              >
                <TrophyIcon className="h-2 w-2" />
              </button>
              <button
                onClick={() => handleEditarPartido(partido)}
                className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                title="Editar partido"
              >
                <UserIcon className="h-2 w-2" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div>
      {/* Header */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Partidos por Torneo</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gestión y programación de partidos organizados por torneo
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Nuevo Partido
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
            placeholder="Buscar torneos o partidos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Lista de torneos con partidos */}
      <div className="mt-8">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {partidosPorTorneo.map((torneo) => {
              const stats = getEstadisticasTorneo(torneo.fases)
              const isExpanded = expandedTorneos[torneo.id]
              
              return (
                <div key={torneo.id} className="bg-white shadow rounded-lg overflow-hidden">
                  {/* Header del torneo */}
                  <div 
                    className="px-6 py-4 bg-gray-50 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => toggleTorneo(torneo.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <TrophyIcon className="h-8 w-8 text-primary-600" />
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-gray-900">
                            {torneo.nombre}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {torneo.descripcion || 'Sin descripción'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        {/* Estadísticas del torneo */}
                        <div className="flex space-x-2 text-sm">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            {stats.programados} Programados
                          </span>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            {stats.en_curso} En Curso
                          </span>
                          <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                            {stats.finalizados} Finalizados
                          </span>
                        </div>
                        
                        {/* Icono de expandir/contraer */}
                        {isExpanded ? (
                          <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Lista de fases y partidos (expandible) */}
                  {isExpanded && (
                    <div className="divide-y divide-gray-200">
                      {torneo.fases.length > 0 ? (
                        torneo.fases.map((fase, faseIndex) => {
                          const faseKey = `${torneo.id}-${faseIndex}`
                          const isFaseExpanded = expandedFases[faseKey]

                          return (
                            <div key={faseIndex} className="px-6 py-4">
                              {/* Header de la fase */}
                              <div
                                className="flex items-center justify-between cursor-pointer hover:bg-gray-50 -mx-6 px-6 py-2 rounded transition-colors"
                                onClick={() => toggleFase(torneo.id, faseIndex)}
                              >
                                <div className="flex items-center">
                                  <div className="flex-shrink-0">
                                    <TrophyIcon className="h-6 w-6 text-blue-600" />
                                  </div>
                                  <div className="ml-3">
                                    <h4 className="text-sm font-medium text-gray-900 capitalize">
                                      {fase.fase === 'grupos' ? 'Fase de Grupos' :
                                       fase.fase === 'eliminatorias' ? 'Eliminatorias' :
                                       fase.fase === 'octavos' ? 'Octavos de Final' :
                                       fase.fase === 'cuartos' ? 'Cuartos de Final' :
                                       fase.fase === 'semifinal' ? 'Semifinal' :
                                       fase.fase === 'final' ? 'Final' :
                                       fase.fase}
                                    </h4>
                                    <p className="text-xs text-gray-500">
                                      {fase.fase === 'grupos' && fase.grupos ?
                                        `${fase.grupos.length} grupo${fase.grupos.length !== 1 ? 's' : ''}` :
                                        `${fase.partidos ? fase.partidos.length : 0} partido${fase.partidos && fase.partidos.length !== 1 ? 's' : ''}`}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center">
                                  {isFaseExpanded ? (
                                    <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                                  ) : (
                                    <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                                  )}
                                </div>
                              </div>

                              {/* Contenido de la fase */}
                              {isFaseExpanded && (
                                <div className="mt-4 ml-6">
                                  {fase.fase === 'grupos' && fase.grupos ? (
                                    // Mostrar grupos para fase de grupos
                                    <div className="space-y-3">
                                      {fase.grupos.map((grupo, grupoIndex) => {
                                        const grupoKey = `${torneo.id}-${faseIndex}-${grupoIndex}`
                                        const isGrupoExpanded = expandedGrupos[grupoKey]
                                        const totalPartidos = grupo.partidosSinSubgrupo.length +
                                          grupo.subgrupos.reduce((total, sub) => total + sub.partidos.length, 0)

                                        return (
                                          <div key={grupoIndex} className="border border-gray-200 rounded-lg">
                                            {/* Header del grupo */}
                                            <div
                                              className="flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors rounded-t-lg"
                                              onClick={() => toggleGrupo(torneo.id, faseIndex, grupoIndex)}
                                            >
                                              <div className="flex items-center">
                                                <div className="flex-shrink-0">
                                                  <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                                                    <span className="text-xs font-medium text-blue-600">{grupo.grupo}</span>
                                                  </div>
                                                </div>
                                                <div className="ml-3">
                                                  <h5 className="text-sm font-medium text-gray-900">
                                                    Grupo {grupo.grupo}
                                                  </h5>
                                                  <p className="text-xs text-gray-500">
                                                    {totalPartidos} partido{totalPartidos !== 1 ? 's' : ''}
                                                  </p>
                                                </div>
                                              </div>
                                              <div className="flex items-center">
                                                {isGrupoExpanded ? (
                                                  <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                                                ) : (
                                                  <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                                                )}
                                              </div>
                                            </div>

                                            {/* Contenido del grupo */}
                                            {isGrupoExpanded && (
                                              <div className="p-4 space-y-4">
                                                {/* Partidos sin subgrupo */}
                                                {grupo.partidosSinSubgrupo.length > 0 && (
                                                  <div>
                                                    <h6 className="text-sm font-medium text-gray-700 mb-2">
                                                      Partidos del Grupo {grupo.grupo}
                                                    </h6>
                                                    <div className="divide-y divide-gray-200 border border-gray-200 rounded">
                                                      {grupo.partidosSinSubgrupo.map((partido) => (
                                                        <div key={partido.id} className="px-4 py-3">
                                                          <PartidoItem partido={partido} />
                                                        </div>
                                                      ))}
                                                    </div>
                                                  </div>
                                                )}

                                                {/* Subgrupos */}
                                                {grupo.subgrupos.map((subgrupo, subgrupoIndex) => {
                                                  const subgrupoKey = `${torneo.id}-${faseIndex}-${grupoIndex}-${subgrupoIndex}`
                                                  const isSubgrupoExpanded = expandedSubgrupos[subgrupoKey]

                                                  return (
                                                    <div key={subgrupoIndex} className="border border-blue-200 rounded-lg">
                                                      {/* Header del subgrupo */}
                                                      <div
                                                        className="flex items-center justify-between px-4 py-3 bg-blue-50 cursor-pointer hover:bg-blue-100 transition-colors rounded-t-lg"
                                                        onClick={() => toggleSubgrupo(torneo.id, faseIndex, grupoIndex, subgrupoIndex)}
                                                      >
                                                        <div className="flex items-center">
                                                          <div className="flex-shrink-0">
                                                            <div className="h-5 w-5 rounded-full bg-blue-200 flex items-center justify-center">
                                                              <span className="text-xs font-medium text-blue-700">
                                                                {grupo.grupo}-{subgrupo.subgrupo}
                                                              </span>
                                                            </div>
                                                          </div>
                                                          <div className="ml-3">
                                                            <h6 className="text-sm font-medium text-gray-900">
                                                              Subgrupo {grupo.grupo}-{subgrupo.subgrupo}
                                                            </h6>
                                                            <p className="text-xs text-gray-500">
                                                              {subgrupo.partidos.length} partido{subgrupo.partidos.length !== 1 ? 's' : ''}
                                                            </p>
                                                          </div>
                                                        </div>
                                                        <div className="flex items-center">
                                                          {isSubgrupoExpanded ? (
                                                            <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                                                          ) : (
                                                            <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                                                          )}
                                                        </div>
                                                      </div>

                                                      {/* Partidos del subgrupo */}
                                                      {isSubgrupoExpanded && (
                                                        <div className="divide-y divide-gray-200">
                                                          {subgrupo.partidos.map((partido) => (
                                                            <div key={partido.id} className="px-4 py-3">
                                                              <PartidoItem partido={partido} />
                                                            </div>
                                                          ))}
                                                        </div>
                                                      )}
                                                    </div>
                                                  )
                                                })}
                                              </div>
                                            )}
                                          </div>
                                        )
                                      })}
                                    </div>
                                  ) : (
                                    // Mostrar partidos directamente para otras fases
                                    <div className="divide-y divide-gray-200">
                                      {fase.partidos && fase.partidos.map((partido) => (
                                        <div key={partido.id} className="px-4 py-3">
                                          <PartidoItem partido={partido} />
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )
                        })
                      ) : (
                        <div className="px-6 py-8 text-center">
                          <PlayIcon className="mx-auto h-12 w-12 text-gray-400" />
                          <h3 className="mt-2 text-sm font-medium text-gray-900">
                            No hay fases en este torneo
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            Comienza programando partidos con fases definidas.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {!isLoading && partidosPorTorneo.length === 0 && (
          <div className="text-center py-12">
            <TrophyIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {searchTerm ? 'No se encontraron torneos' : 'No hay torneos'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm 
                ? 'Intenta ajustar el término de búsqueda.'
                : 'Primero debes crear torneos para poder programar partidos.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Modal para crear partido */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Nuevo Partido
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 1. Torneo */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Torneo *
                </label>
                <select
                  required
                  className="input-field"
                  value={formData.torneo_id}
                  onChange={(e) => setFormData({...formData, torneo_id: e.target.value})}
                >
                  <option value="">Seleccionar torneo</option>
                  {torneos.map((torneo) => (
                    <option key={torneo.id} value={torneo.id}>
                      {torneo.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Fase del Torneo */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Fase del Torneo *
                </label>
                <select
                  required
                  className="input-field"
                  value={formData.fase}
                  onChange={(e) => setFormData({...formData, fase: e.target.value, grupo: '', subgrupo: '', equipo_local_id: '', equipo_visitante_id: ''})}
                >
                  <option value="">Seleccionar fase</option>
                  <option value="grupos">Fase de Grupos</option>
                  <option value="semifinal">Semifinal</option>
                  <option value="final">Final</option>
                </select>
              </div>

              {/* 3. Grupo (solo para fase de grupos) */}
              {formData.fase === 'grupos' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Grupo *
                  </label>
                  <select
                    required
                    className="input-field"
                    value={formData.grupo}
                    onChange={(e) => setFormData({...formData, grupo: e.target.value, subgrupo: '', equipo_local_id: '', equipo_visitante_id: ''})}
                  >
                    <option value="">Seleccionar grupo</option>
                    {getGruposByTorneo(formData.torneo_id).map((grupo) => (
                      <option key={grupo} value={grupo}>
                        Grupo {grupo}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* 3.1. Subgrupo (solo si hay grupo seleccionado y existen subgrupos) */}
              {formData.fase === 'grupos' && formData.grupo && getSubgruposByGrupo(formData.torneo_id, formData.grupo).length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Subgrupo (Opcional)
                  </label>
                  <select
                    className="input-field"
                    value={formData.subgrupo}
                    onChange={(e) => setFormData({...formData, subgrupo: e.target.value, equipo_local_id: '', equipo_visitante_id: ''})}
                  >
                    <option value="">Todo el grupo {formData.grupo}</option>
                    {getSubgruposByGrupo(formData.torneo_id, formData.grupo).map((subgrupo) => (
                      <option key={subgrupo} value={subgrupo}>
                        {formData.grupo}-{subgrupo}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* 4. Equipos */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Equipo Local *
                  </label>
                  <select
                    required
                    className="input-field"
                    value={formData.equipo_local_id}
                    onChange={(e) => setFormData({...formData, equipo_local_id: e.target.value})}
                  >
                    <option value="">Seleccionar equipo</option>
                    {getEquiposDisponibles(formData.torneo_id, formData.fase, formData.grupo, formData.num_clasificados, formData.subgrupo).map((equipo) => (
                      <option key={equipo.id} value={equipo.id}>
                        {equipo.nombre}
                        {equipo.grupo && ` (Grupo ${equipo.grupo}${equipo.subgrupo ? `-${equipo.subgrupo}` : ''})`}
                        {equipo.puntos !== undefined && ` - ${equipo.puntos} pts`}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Equipo Visitante *
                  </label>
                  <select
                    required
                    className="input-field"
                    value={formData.equipo_visitante_id}
                    onChange={(e) => setFormData({...formData, equipo_visitante_id: e.target.value})}
                  >
                    <option value="">Seleccionar equipo</option>
                    {getEquiposDisponibles(formData.torneo_id, formData.fase, formData.grupo, formData.num_clasificados, formData.subgrupo)
                      .filter(equipo => equipo.id.toString() !== formData.equipo_local_id)
                      .map((equipo) => (
                        <option key={equipo.id} value={equipo.id}>
                          {equipo.nombre}
                          {equipo.grupo && ` (Grupo ${equipo.grupo}${equipo.subgrupo ? `-${equipo.subgrupo}` : ''})`}
                          {equipo.puntos !== undefined && ` - ${equipo.puntos} pts`}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* 5. Cancha */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Cancha *
                </label>
                <select
                  required
                  className="input-field"
                  value={formData.cancha_id}
                  onChange={(e) => setFormData({...formData, cancha_id: e.target.value})}
                >
                  <option value="">Seleccionar cancha</option>
                  {canchas.map((cancha) => (
                    <option key={cancha.id} value={cancha.id}>
                      {cancha.nombre} - {cancha.ubicacion}
                    </option>
                  ))}
                </select>
              </div>

              {/* 6. Fecha y Hora */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Fecha y Hora *
                </label>
                <input
                  type="datetime-local"
                  required
                  className="input-field"
                  value={formData.fecha_hora ? toLocalDateTimeInput(formData.fecha_hora) : ''}
                  onChange={(e) => setFormData({...formData, fecha_hora: e.target.value})}
                />
              </div>

              {/* 7. Observaciones */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Observaciones
                </label>
                <textarea
                  className="input-field"
                  rows={3}
                  value={formData.observaciones}
                  onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                  placeholder="Observaciones adicionales del partido..."
                />
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
                  {isLoading ? 'Creando...' : 'Crear Partido'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal avanzado para gestionar partido */}
      {showMatchModal && partidoToStart && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-4 mx-auto p-5 border w-full max-w-6xl shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-center text-primary-600">
                {matchStarted ? "Partido en Vivo" : "Configuración del Partido"}
              </h3>
              <button
                onClick={handleCloseMatchModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Pestañas */}
            <div className="w-full">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setCurrentTab('lineup')}
                    disabled={matchStarted}
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                      currentTab === 'lineup'
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } ${matchStarted ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <UserGroupIcon className="w-4 h-4 mr-2" />
                    Alineación
                  </button>
                  <button
                    onClick={() => setCurrentTab('live')}
                    disabled={!matchStarted}
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                      currentTab === 'live'
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } ${!matchStarted ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <TrophyIcon className="w-4 h-4 mr-2" />
                    En Vivo
                  </button>
                  <button
                    onClick={() => setCurrentTab('substitutions')}
                    disabled={!matchStarted}
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                      currentTab === 'substitutions'
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } ${!matchStarted ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <ArrowPathIcon className="w-4 h-4 mr-2" />
                    Cambios
                  </button>
                </nav>
              </div>

              {/* Contenido de las pestañas */}
              <div className="mt-6">
                {/* Pestaña de Alineación */}
                {currentTab === 'lineup' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      {/* Equipo Local */}
                      <div className="bg-white border rounded-lg">
                        <div className="bg-primary-50 px-4 py-3 border-b">
                          <h4 className="text-lg font-medium text-primary-900">
                            {partidoToStart.equipo_local?.nombre || 'Equipo Local'}
                          </h4>
                        </div>
                        <div className="p-4 space-y-3">
                          {/* Campo de búsqueda */}
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                              type="text"
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm"
                              placeholder="Buscar por nombre o número..."
                              value={searchJugador1}
                              onChange={(e) => setSearchJugador1(e.target.value)}
                            />
                          </div>
                          {teamLocalPlayers
                            .filter(player =>
                              player.name.toLowerCase().includes(searchJugador1.toLowerCase()) ||
                              (allLoadedPlayers.find(p => p.id === player.id)?.numero_camiseta?.toString() || '').includes(searchJugador1)
                            )
                            .map((player) => (
                            <div key={player.id} className="p-3 border rounded-lg">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <span className="bg-primary-100 text-primary-800 text-xs font-medium px-2 py-1 rounded-full mr-3">
                                    #{allLoadedPlayers.find(p => p.id === player.id)?.numero_camiseta || 'S/N'}
                                  </span>
                                  <p className="font-medium">{player.name}</p>
                                </div>
                                <button
                                  onClick={() => togglePlayerStarter('local', player.id)}
                                  className={`px-3 py-1 rounded text-sm font-medium ${
                                    player.isStarter
                                      ? 'bg-primary-600 text-white'
                                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                  }`}
                                >
                                  {player.isStarter ? 'Titular' : 'Suplente'}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Equipo Visitante */}
                      <div className="bg-white border rounded-lg">
                        <div className="bg-primary-50 px-4 py-3 border-b">
                          <h4 className="text-lg font-medium text-primary-900">
                            {partidoToStart.equipo_visitante?.nombre || 'Equipo Visitante'}
                          </h4>
                        </div>
                        <div className="p-4 space-y-3">
                          {/* Campo de búsqueda */}
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                              type="text"
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm"
                              placeholder="Buscar por nombre o número..."
                              value={searchJugador2}
                              onChange={(e) => setSearchJugador2(e.target.value)}
                            />
                          </div>
                          {teamVisitantePlayers
                            .filter(player =>
                              player.name.toLowerCase().includes(searchJugador2.toLowerCase()) ||
                              (allLoadedPlayers.find(p => p.id === player.id)?.numero_camiseta?.toString() || '').includes(searchJugador2)
                            )
                            .map((player) => (
                            <div key={player.id} className="p-3 border rounded-lg">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <span className="bg-primary-100 text-primary-800 text-xs font-medium px-2 py-1 rounded-full mr-3">
                                    #{allLoadedPlayers.find(p => p.id === player.id)?.numero_camiseta || 'S/N'}
                                  </span>
                                  <p className="font-medium">{player.name}</p>
                                </div>
                                <button
                                  onClick={() => togglePlayerStarter('visitante', player.id)}
                                  className={`px-3 py-1 rounded text-sm font-medium ${
                                    player.isStarter
                                      ? 'bg-primary-600 text-white'
                                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                  }`}
                                >
                                  {player.isStarter ? 'Titular' : 'Suplente'}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Selección de Árbitro y Veedor */}
                    <div className="bg-white border rounded-lg p-6 mb-6">
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Asignación de Oficiales</h4>
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Árbitro *
                          </label>
                          <select
                            className="input-field"
                            value={selectedArbitro}
                            onChange={(e) => setSelectedArbitro(e.target.value)}
                            required
                          >
                            <option value="">Seleccionar árbitro</option>
                            {arbitros.map((arbitro) => (
                              <option key={arbitro.id} value={arbitro.id}>
                                {arbitro.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Veedor *
                          </label>
                          <select
                            className="input-field"
                            value={selectedVeedor}
                            onChange={(e) => setSelectedVeedor(e.target.value)}
                            required
                          >
                            <option value="">Seleccionar veedor</option>
                            {veedores.map((veedor) => (
                              <option key={veedor.id} value={veedor.id}>
                                {veedor.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="text-center">
                      <button
                        onClick={handleShowStartConfirmation}
                        disabled={!selectedArbitro || !selectedVeedor}
                        className="btn-primary bg-green-600 hover:bg-green-700 text-lg px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Iniciar Partido
                      </button>
                    </div>
                  </div>
                )}

                {/* Pestaña En Vivo */}
                {currentTab === 'live' && (
                  <div className="space-y-6">
                    {torneos.find(t => t.id === partidoToStart.torneo_id)?.deporte === 'voley' ? (
                      /* Interfaz específica para Vóley */
                      <div className="space-y-6">
                        {/* Marcador de Sets */}
                        <div className="bg-white border rounded-lg p-6">
                          <div className="text-center mb-6">
                            <h3 className="text-xl font-semibold mb-4">Sets Ganados</h3>
                            <div className="flex items-center justify-center gap-8">
                              <div className="text-center">
                                <p className="text-lg font-medium">{partidoToStart.equipo_local?.nombre}</p>
                                <p className="text-4xl font-bold text-primary-600">{setsLocal}</p>
                              </div>
                              <span className="text-2xl font-bold">-</span>
                              <div className="text-center">
                                <p className="text-lg font-medium">{partidoToStart.equipo_visitante?.nombre}</p>
                                <p className="text-4xl font-bold text-primary-600">{setsVisitante}</p>
                              </div>
                            </div>
                          </div>

                          {/* Set Actual */}
                          <div className="bg-gray-50 p-4 rounded-lg mb-6">
                            <h4 className="text-lg font-semibold text-center mb-4">Set {currentSet}</h4>
                            <div className="flex items-center justify-center gap-8 mb-4">
                              <div className="text-center">
                                <p className="text-lg font-medium">{partidoToStart.equipo_local?.nombre}</p>
                                <p className="text-3xl font-bold text-blue-600">{puntosSetLocal}</p>
                              </div>
                              <span className="text-xl font-bold">-</span>
                              <div className="text-center">
                                <p className="text-lg font-medium">{partidoToStart.equipo_visitante?.nombre}</p>
                                <p className="text-3xl font-bold text-blue-600">{puntosSetVisitante}</p>
                              </div>
                            </div>
                            
                            {/* Indicador de saque */}
                            <div className="text-center mb-4">
                              <p className="text-sm text-gray-600">
                                Saque: <span className="font-semibold">
                                  {equipoConSaque === 'local' ? partidoToStart.equipo_local?.nombre : partidoToStart.equipo_visitante?.nombre}
                                </span>
                              </p>
                            </div>

                            {/* Botones para agregar puntos */}
                            <div className="grid grid-cols-2 gap-4">
                              <button
                                onClick={() => addGoal('local', null, partidoToStart.equipo_local?.nombre)}
                                className="btn-primary bg-blue-600 hover:bg-blue-700"
                              >
                                +1 Punto {partidoToStart.equipo_local?.nombre}
                              </button>
                              <button
                                onClick={() => addGoal('visitante', null, partidoToStart.equipo_visitante?.nombre)}
                                className="btn-primary bg-blue-600 hover:bg-blue-700"
                              >
                                +1 Punto {partidoToStart.equipo_visitante?.nombre}
                              </button>
                            </div>

                            {/* Botones para cerrar set */}
                            <div className="grid grid-cols-2 gap-4 mt-4">
                              <button
                                onClick={() => cerrarSet('local')}
                                className="btn-primary bg-green-600 hover:bg-green-700"
                              >
                                Cerrar Set - Gana {partidoToStart.equipo_local?.nombre}
                              </button>
                              <button
                                onClick={() => cerrarSet('visitante')}
                                className="btn-primary bg-green-600 hover:bg-green-700"
                              >
                                Cerrar Set - Gana {partidoToStart.equipo_visitante?.nombre}
                              </button>
                            </div>

                            {/* Control de saque */}
                            <div className="mt-4 text-center">
                              <p className="text-sm text-gray-600 mb-2">Cambiar saque a:</p>
                              <div className="flex justify-center gap-2">
                                <button
                                  onClick={() => setEquipoConSaque('local')}
                                  className={`px-3 py-1 rounded text-sm ${
                                    equipoConSaque === 'local'
                                      ? 'bg-primary-600 text-white'
                                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                  }`}
                                >
                                  {partidoToStart.equipo_local?.nombre}
                                </button>
                                <button
                                  onClick={() => setEquipoConSaque('visitante')}
                                  className={`px-3 py-1 rounded text-sm ${
                                    equipoConSaque === 'visitante'
                                      ? 'bg-primary-600 text-white'
                                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                  }`}
                                >
                                  {partidoToStart.equipo_visitante?.nombre}
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Historial de Sets */}
                          {historialSets.length > 0 && (
                            <div className="mb-6">
                              <h4 className="text-lg font-semibold mb-3">Historial de Sets</h4>
                              <div className="space-y-2">
                                {historialSets.map((set, index) => (
                                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                    <span className="font-medium">Set {set.set}</span>
                                    <div className="flex items-center gap-4">
                                      <span>{partidoToStart.equipo_local?.nombre}: {set.puntosLocal}</span>
                                      <span>{partidoToStart.equipo_visitante?.nombre}: {set.puntosVisitante}</span>
                                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                                        Ganador: {set.ganador === 'local' ? partidoToStart.equipo_local?.nombre : partidoToStart.equipo_visitante?.nombre}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Botón para finalizar partido */}
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="text-center">
                              <button
                                onClick={() => handleFinalizarPartidoDirecto(partidoToStart.id)}
                                className="btn-primary bg-red-600 hover:bg-red-700 flex items-center mx-auto"
                              >
                                <StopIcon className="h-4 w-4 mr-2" />
                                Finalizar Partido
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Interfaz para Fútbol */
                      <div className="space-y-6">
                        {/* Control de Tiempo del Partido */}
                        <div className="bg-white border rounded-lg p-6">
                          <div className="text-center mb-6">
                            <div className="flex items-center justify-center gap-8 mb-4">
                              <span className="text-lg font-medium">{partidoToStart.equipo_local?.nombre}</span>
                              <div className="text-4xl font-bold text-primary-600">
                                {scoreLocal} - {scoreVisitante}
                              </div>
                              <span className="text-lg font-medium">{partidoToStart.equipo_visitante?.nombre}</span>
                            </div>
                            
                            {/* Cronómetro y controles */}
                            <div className="bg-gray-50 p-4 rounded-lg mb-4">
                              <div className="text-3xl font-bold text-green-600 mb-2">
                                {formatMatchTime(currentHalfTime)}
                              </div>
                              <div className="text-sm text-gray-600 mb-4">
                                {matchPhase === 'not_started' && 'Partido no iniciado'}
                                {matchPhase === 'first_half' && '1er Tiempo'}
                                {matchPhase === 'half_time' && 'Descanso'}
                                {matchPhase === 'second_half' && '2do Tiempo'}
                                {matchPhase === 'finished' && 'Partido Finalizado'}
                              </div>
                              
                              {/* Botones de control */}
                              <div className="flex justify-center gap-2">
                                {matchPhase === 'not_started' && (
                                  <button
                                    onClick={startFirstHalf}
                                    className="btn-primary bg-green-600 hover:bg-green-700"
                                  >
                                    Iniciar 1er Tiempo
                                  </button>
                                )}
                                
                                {matchPhase === 'first_half' && (
                                  <button
                                    onClick={endFirstHalf}
                                    className="btn-primary bg-orange-600 hover:bg-orange-700"
                                  >
                                    Terminar 1er Tiempo
                                  </button>
                                )}
                                {matchPhase === 'half_time' && (
                                  <button
                                    onClick={startSecondHalf}
                                    className="btn-primary bg-green-600 hover:bg-green-700"
                                  >
                                    Iniciar 2do Tiempo
                                  </button>
                                )}
                                {matchPhase === 'second_half' && (
                                  <button
                                    onClick={endMatch}
                                    className="btn-primary bg-red-600 hover:bg-red-700"
                                  >
                                    Finalizar Partido
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Jugadores en Campo con Acciones Rápidas */}
                          <div className="grid grid-cols-2 gap-6">
                            {/* Equipo Local */}
                            <div className="space-y-4">
                              <h3 className="font-semibold text-center text-primary-600">
                                {partidoToStart.equipo_local?.nombre}
                              </h3>
                              
                              {/* Goles del equipo local */}
                              <div className="bg-green-50 p-3 rounded-lg">
                                <h4 className="font-medium text-green-800 mb-2">Goles</h4>
                                <div className="space-y-1">
                                  {goals.filter(goal => goal.team === 'local').map((goal) => (
                                    <div key={goal.id} className="flex items-center justify-between text-sm">
                                      <span>#{allLoadedPlayers.find(p => p.id === goal.playerId)?.numero_camiseta || 'S/N'} {goal.playerName} - ({goal.timeWithHalf || `${goal.half === 1 ? '1er' : '2do'} tiempo ${goal.timeFormatted || goal.minute + "'"}`})</span>
                                      <button
                                        onClick={() => removeGoal(goal.id)}
                                        className="text-red-600 hover:text-red-900 p-1"
                                        title="Eliminar gol"
                                      >
                                        <TrashIcon className="h-3 w-3" />
                                      </button>
                                    </div>
                                  ))}
                                  {goals.filter(goal => goal.team === 'local').length === 0 && (
                                    <p className="text-gray-500 text-sm">Sin goles</p>
                                  )}
                                </div>
                              </div>

                              {/* Tarjetas del equipo local */}
                              <div className="bg-yellow-50 p-3 rounded-lg">
                                <h4 className="font-medium text-yellow-800 mb-2">Tarjetas</h4>
                                <div className="space-y-1">
                                  {cardsHistory.filter(card => card.team === 'local').map((card, index) => (
                                    <div key={`local-${card.playerId}-${card.cardType}-${index}-${card.timestamp}`} className="flex items-center justify-between text-sm">
                                      <span>
                                        #{allLoadedPlayers.find(p => p.id === card.playerId)?.numero_camiseta || 'S/N'} {card.playerName} - ({card.timeWithHalf || `${card.half === 1 ? '1er' : '2do'} tiempo ${card.timeFormatted || card.minute + "'"}`})
                                        <span className={`ml-1 px-1 rounded text-xs ${
                                          card.cardType === 'yellow' ? 'bg-yellow-200' : 'bg-red-200'
                                        }`}>
                                          {card.cardType === 'yellow' ? '🟨' :
                                           (card.isAccumulation ? '🟨🟥' : '🟥')}
                                        </span>
                                        {card.cardType === 'red' && (
                                          <span className="ml-1 text-xs text-gray-600">
                                            {card.isAccumulation ? '(2da amarilla)' : '(directa)'}
                                          </span>
                                        )}
                                      </span>
                                      <button
                                        onClick={() => removeCard(card.id, card.playerId, card.cardType)}
                                        className="text-red-600 hover:text-red-900 p-1"
                                        title="Eliminar tarjeta"
                                      >
                                        <TrashIcon className="h-3 w-3" />
                                      </button>
                                    </div>
                                  ))}
                                  {cardsHistory.filter(card => card.team === 'local').length === 0 && (
                                    <p className="text-gray-500 text-sm">Sin tarjetas</p>
                                  )}
                                </div>
                              </div>

                              {/* Jugadores en campo con acciones rápidas - equipo local */}
                              <div>
                                <h4 className="font-medium mb-2">Jugadores en Campo ({getPlayersOnField(teamLocalPlayers).length})</h4>
                                <div className="relative mb-2">
                                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                                  </div>
                                  <input
                                    type="text"
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm"
                                    placeholder="Buscar jugador..."
                                    value={searchJugador1}
                                    onChange={(e) => setSearchJugador1(e.target.value)}
                                  />
                                </div>
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                  {getPlayersOnField(teamLocalPlayers)
                                    .filter(player =>
                                      player.name.toLowerCase().includes(searchJugador1.toLowerCase()) ||
                                      (allLoadedPlayers.find(p => p.id === player.id)?.numero_camiseta?.toString() || '').includes(searchJugador1)
                                    )
                                    .map((player) => (
                                    <div key={player.id} className="border rounded-lg p-3 bg-white">
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                          <span className="bg-primary-100 text-primary-800 text-xs font-medium px-2 py-1 rounded">
                                            #{allLoadedPlayers.find(p => p.id === player.id)?.numero_camiseta || 'S/N'}
                                          </span>
                                          <span className="font-medium text-sm">{player.name}</span>
                                          <div className="flex gap-1">
                                            {Array.from({ length: player.yellowCards }).map((_, i) => (
                                              <span key={i} className="text-yellow-500">🟨</span>
                                            ))}
                                            {player.redCard && <span className="text-red-500">🟥</span>}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex gap-1">
                                        <button
                                          onClick={() => addGoal('local', player.id, player.name)}
                                          disabled={matchPhase === 'not_started' || matchPhase === 'half_time'}
                                          className="flex-1 px-2 py-1 bg-green-100 hover:bg-green-200 text-green-800 rounded text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                          title={matchPhase === 'not_started' ? 'Debe iniciar el partido para registrar goles' : matchPhase === 'half_time' ? 'No se pueden registrar goles durante el descanso' : 'Agregar gol'}
                                        >
                                          ⚽ Gol
                                        </button>
                                        <button
                                          onClick={() => addCard('local', player.id, 'yellow')}
                                          disabled={player.redCard || matchPhase === 'not_started' || matchPhase === 'half_time'}
                                          className="flex-1 px-2 py-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                          title={matchPhase === 'not_started' ? 'Debe iniciar el partido para registrar tarjetas' : matchPhase === 'half_time' ? 'No se pueden registrar tarjetas durante el descanso' : 'Tarjeta amarilla'}
                                        >
                                          🟨 Amarilla
                                        </button>
                                        <button
                                          onClick={() => addCard('local', player.id, 'red')}
                                          disabled={player.redCard || matchPhase === 'not_started' || matchPhase === 'half_time'}
                                          className="flex-1 px-2 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                          title={matchPhase === 'not_started' ? 'Debe iniciar el partido para registrar tarjetas' : matchPhase === 'half_time' ? 'No se pueden registrar tarjetas durante el descanso' : 'Tarjeta roja'}
                                        >
                                          🟥 Roja
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Equipo Visitante */}
                            <div className="space-y-4">
                              <h3 className="font-semibold text-center text-primary-600">
                                {partidoToStart.equipo_visitante?.nombre}
                              </h3>
                              
                              {/* Goles del equipo visitante */}
                              <div className="bg-green-50 p-3 rounded-lg">
                                <h4 className="font-medium text-green-800 mb-2">Goles</h4>
                                <div className="space-y-1">
                                  {goals.filter(goal => goal.team === 'visitante').map((goal) => (
                                    <div key={goal.id} className="flex items-center justify-between text-sm">
                                      <span>#{allLoadedPlayers.find(p => p.id === goal.playerId)?.numero_camiseta || 'S/N'} {goal.playerName} - ({goal.timeWithHalf || `${goal.half === 1 ? '1er' : '2do'} tiempo ${goal.timeFormatted || goal.minute + "'"}`})</span>
                                      <button
                                        onClick={() => removeGoal(goal.id)}
                                        className="text-red-600 hover:text-red-900 p-1"
                                        title="Eliminar gol"
                                      >
                                        <TrashIcon className="h-3 w-3" />
                                      </button>
                                    </div>
                                  ))}
                                  {goals.filter(goal => goal.team === 'visitante').length === 0 && (
                                    <p className="text-gray-500 text-sm">Sin goles</p>
                                  )}
                                </div>
                              </div>

                              {/* Tarjetas del equipo visitante */}
                              <div className="bg-yellow-50 p-3 rounded-lg">
                                <h4 className="font-medium text-yellow-800 mb-2">Tarjetas</h4>
                                <div className="space-y-1">
                                  {cardsHistory.filter(card => card.team === 'visitante').map((card, index) => (
                                    <div key={`visitante-${card.playerId}-${card.cardType}-${index}-${card.timestamp}`} className="flex items-center justify-between text-sm">
                                      <span>
                                        #{allLoadedPlayers.find(p => p.id === card.playerId)?.numero_camiseta || 'S/N'} {card.playerName} - ({card.timeWithHalf || `${card.half === 1 ? '1er' : '2do'} tiempo ${card.timeFormatted || card.minute + "'"}`})
                                        <span className={`ml-1 px-1 rounded text-xs ${
                                          card.cardType === 'yellow' ? 'bg-yellow-200' : 'bg-red-200'
                                        }`}>
                                          {card.cardType === 'yellow' ? '🟨' :
                                           (card.isAccumulation ? '🟨🟥' : '🟥')}
                                        </span>
                                        {card.cardType === 'red' && (
                                          <span className="ml-1 text-xs text-gray-600">
                                            {card.isAccumulation ? '(2da amarilla)' : '(directa)'}
                                          </span>
                                        )}
                                      </span>
                                      <button
                                        onClick={() => removeCard(card.id, card.playerId, card.cardType)}
                                        className="text-red-600 hover:text-red-900 p-1"
                                        title="Eliminar tarjeta"
                                      >
                                        <TrashIcon className="h-3 w-3" />
                                      </button>
                                    </div>
                                  ))}
                                  {cardsHistory.filter(card => card.team === 'visitante').length === 0 && (
                                    <p className="text-gray-500 text-sm">Sin tarjetas</p>
                                  )}
                                </div>
                              </div>

                              {/* Jugadores en campo con acciones rápidas - equipo visitante */}
                              <div>
                                <h4 className="font-medium mb-2">Jugadores en Campo ({getPlayersOnField(teamVisitantePlayers).length})</h4>
                                <div className="relative mb-2">
                                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                                  </div>
                                  <input
                                    type="text"
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm"
                                    placeholder="Buscar jugador..."
                                    value={searchJugador2}
                                    onChange={(e) => setSearchJugador2(e.target.value)}
                                  />
                                </div>
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                  {getPlayersOnField(teamVisitantePlayers)
                                    .filter(player =>
                                      player.name.toLowerCase().includes(searchJugador2.toLowerCase()) ||
                                      (allLoadedPlayers.find(p => p.id === player.id)?.numero_camiseta?.toString() || '').includes(searchJugador2)
                                    )
                                    .map((player) => (
                                    <div key={player.id} className="border rounded-lg p-3 bg-white">
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                          <span className="bg-primary-100 text-primary-800 text-xs font-medium px-2 py-1 rounded">
                                            #{allLoadedPlayers.find(p => p.id === player.id)?.numero_camiseta || 'S/N'}
                                          </span>
                                          <span className="font-medium text-sm">{player.name}</span>
                                          <div className="flex gap-1">
                                            {Array.from({ length: player.yellowCards }).map((_, i) => (
                                              <span key={i} className="text-yellow-500">🟨</span>
                                            ))}
                                            {player.redCard && <span className="text-red-500">🟥</span>}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex gap-1">
                                        <button
                                          onClick={() => addGoal('visitante', player.id, player.name)}
                                          disabled={matchPhase === 'not_started' || matchPhase === 'half_time'}
                                          className="flex-1 px-2 py-1 bg-green-100 hover:bg-green-200 text-green-800 rounded text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                          title={matchPhase === 'not_started' ? 'Debe iniciar el partido para registrar goles' : matchPhase === 'half_time' ? 'No se pueden registrar goles durante el descanso' : 'Agregar gol'}
                                        >
                                          ⚽ Gol
                                        </button>
                                        <button
                                          onClick={() => addCard('visitante', player.id, 'yellow')}
                                          disabled={player.redCard || matchPhase === 'not_started' || matchPhase === 'half_time'}
                                          className="flex-1 px-2 py-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                          title={matchPhase === 'not_started' ? 'Debe iniciar el partido para registrar tarjetas' : matchPhase === 'half_time' ? 'No se pueden registrar tarjetas durante el descanso' : 'Tarjeta amarilla'}
                                        >
                                          🟨 Amarilla
                                        </button>
                                        <button
                                          onClick={() => addCard('visitante', player.id, 'red')}
                                          disabled={player.redCard || matchPhase === 'not_started' || matchPhase === 'half_time'}
                                          className="flex-1 px-2 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                          title={matchPhase === 'not_started' ? 'Debe iniciar el partido para registrar tarjetas' : matchPhase === 'half_time' ? 'No se pueden registrar tarjetas durante el descanso' : 'Tarjeta roja'}
                                        >
                                          🟥 Roja
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}


                {/* Pestaña de Cambios */}
                {currentTab === 'substitutions' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      {/* Cambios Equipo Local */}
                      <div className="bg-white border rounded-lg">
                        <div className="bg-blue-50 px-4 py-3 border-b">
                          <div className="flex items-center justify-between">
                            <h4 className="text-lg font-medium">Cambios - {partidoToStart.equipo_local?.nombre}</h4>
                            <button
                              onClick={() => openPlayerSelectionModal('add', 'local')}
                              className="btn-primary bg-green-600 hover:bg-green-700 text-sm px-3 py-1"
                              title="Añadir jugadores"
                            >
                              <PlusIcon className="h-4 w-4 mr-1" />
                              Añadir jugadores
                            </button>
                          </div>
                        </div>
                        <div className="p-4 space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Jugador que sale:</label>
                            <button
                              onClick={() => openPlayerSelectionModal('out', 'local')}
                              className="w-full btn-secondary text-left flex items-center justify-between"
                            >
                              <span>
                                {playerOutLocal ?
                                  `#${allLoadedPlayers.find(p => p.id == playerOutLocal)?.numero_camiseta || 'S/N'} - ${teamLocalPlayers.find(p => p.id == playerOutLocal)?.name}` :
                                  'Seleccionar jugador que sale'
                                }
                              </span>
                              <ChevronDownIcon className="h-4 w-4" />
                            </button>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Jugador que entra:</label>
                            <button
                              onClick={() => openPlayerSelectionModal('in', 'local')}
                              className="w-full btn-secondary text-left flex items-center justify-between"
                            >
                              <span>
                                {playerInLocal ?
                                  `#${allLoadedPlayers.find(p => p.id == playerInLocal)?.numero_camiseta || 'S/N'} - ${allLoadedPlayers.find(p => p.id == playerInLocal)?.nombre} ${allLoadedPlayers.find(p => p.id == playerInLocal)?.apellido}` :
                                  'Seleccionar jugador que entra'
                                }
                              </span>
                              <ChevronDownIcon className="h-4 w-4" />
                            </button>
                          </div>

                          <button
                            className="btn-primary w-full"
                            onClick={() => makeSubstitution('local', playerOutLocal, playerInLocal)}
                            disabled={!playerOutLocal || !playerInLocal}
                          >
                            Realizar Cambio
                          </button>
                        </div>
                      </div>

                      {/* Cambios Equipo Visitante */}
                      <div className="bg-white border rounded-lg">
                        <div className="bg-blue-50 px-4 py-3 border-b">
                          <div className="flex items-center justify-between">
                            <h4 className="text-lg font-medium">Cambios - {partidoToStart.equipo_visitante?.nombre}</h4>
                            <button
                              onClick={() => openPlayerSelectionModal('add', 'visitante')}
                              className="btn-primary bg-green-600 hover:bg-green-700 text-sm px-3 py-1"
                              title="Añadir jugadores"
                            >
                              <PlusIcon className="h-4 w-4 mr-1" />
                              Añadir jugadores
                            </button>
                          </div>
                        </div>
                        <div className="p-4 space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Jugador que sale:</label>
                            <button
                              onClick={() => openPlayerSelectionModal('out', 'visitante')}
                              className="w-full btn-secondary text-left flex items-center justify-between"
                            >
                              <span>
                                {playerOutVisitante ?
                                  `#${allLoadedPlayers.find(p => p.id == playerOutVisitante)?.numero_camiseta || 'S/N'} - ${teamVisitantePlayers.find(p => p.id == playerOutVisitante)?.name}` :
                                  'Seleccionar jugador que sale'
                                }
                              </span>
                              <ChevronDownIcon className="h-4 w-4" />
                            </button>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Jugador que entra:</label>
                            <button
                              onClick={() => openPlayerSelectionModal('in', 'visitante')}
                              className="w-full btn-secondary text-left flex items-center justify-between"
                            >
                              <span>
                                {playerInVisitante ?
                                  `#${allLoadedPlayers.find(p => p.id == playerInVisitante)?.numero_camiseta || 'S/N'} - ${allLoadedPlayers.find(p => p.id == playerInVisitante)?.nombre} ${allLoadedPlayers.find(p => p.id == playerInVisitante)?.apellido}` :
                                  'Seleccionar jugador que entra'
                                }
                              </span>
                              <ChevronDownIcon className="h-4 w-4" />
                            </button>
                          </div>

                          <button
                            className="btn-primary w-full"
                            onClick={() => makeSubstitution('visitante', playerOutVisitante, playerInVisitante)}
                            disabled={!playerOutVisitante || !playerInVisitante}
                          >
                            Realizar Cambio
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de selección de jugadores */}
      {showPlayerSelectionModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Seleccionar Jugador - {playerSelectionTeam === 'local' ? partidoToStart.equipo_local?.nombre : partidoToStart.equipo_visitante?.nombre}
              </h3>
              <button
                onClick={() => {
                  setShowPlayerSelectionModal(false)
                  setPlayerSelectionType('')
                  setPlayerSelectionTeam('')
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  {playerSelectionType === 'out' ?
                    'Selecciona el jugador que sale del campo:' :
                    playerSelectionType === 'add' ?
                    'Selecciona jugadores del equipo para añadir al partido (jugadores que llegaron tarde):' :
                    'Selecciona el jugador que entra al campo (incluye jugadores que salieron anteriormente):'}
                </p>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {(() => {
                  const currentTeam = playerSelectionTeam === 'local' ? teamLocalPlayers : teamVisitantePlayers
                  const equipoId = playerSelectionTeam === 'local' ? partidoToStart.equipo_local_id : partidoToStart.equipo_visitante_id
                  
                  if (playerSelectionType === 'out') {
                    // Mostrar jugadores en campo
                    return getPlayersOnField(currentTeam).map((player) => (
                      <div key={player.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <span className="bg-primary-100 text-primary-800 text-xs font-medium px-2 py-1 rounded">
                            #{allLoadedPlayers.find(p => p.id === player.id)?.numero_camiseta || 'S/N'}
                          </span>
                          <span className="font-medium">{player.name}</span>
                          <div className="flex gap-1">
                            {Array.from({ length: player.yellowCards }).map((_, i) => (
                              <span key={i} className="text-yellow-500">🟨</span>
                            ))}
                            {player.redCard && <span className="text-red-500">🟥</span>}
                          </div>
                        </div>
                        <button
                          onClick={() => selectPlayerFromModal(player.id)}
                          className="btn-primary bg-blue-600 hover:bg-blue-700 text-sm px-3 py-1"
                        >
                          Seleccionar
                        </button>
                      </div>
                    ))
                  } else if (playerSelectionType === 'add') {
                    // Mostrar solo jugadores que no están en el equipo actual
                    const jugadoresDisponibles = allLoadedPlayers.filter(p =>
                      p.equipo_id === equipoId &&
                      !currentTeam.some(tp => tp.id === p.id) // Excluir los que ya están en la lista del equipo
                    )
                    
                    if (jugadoresDisponibles.length === 0) {
                      return (
                        <div className="text-center py-8">
                          <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                          <h3 className="mt-2 text-sm font-medium text-gray-900">
                            No hay jugadores disponibles
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            Todos los jugadores de este equipo ya están agregados al partido.
                          </p>
                        </div>
                      )
                    }
                    
                    return jugadoresDisponibles.map((jugador) => (
                      <div key={jugador.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                            #{jugador.numero_camiseta || 'S/N'}
                          </span>
                          <span className="font-medium">{jugador.nombre} {jugador.apellido}</span>
                          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                            Suplente
                          </span>
                        </div>
                        <button
                          onClick={() => selectPlayerFromModal(jugador.id)}
                          className="btn-primary bg-green-600 hover:bg-green-700 text-sm px-3 py-1"
                        >
                          <PlusIcon className="h-3 w-3 mr-1" />
                          Añadir
                        </button>
                      </div>
                    ))
                  } else {
                    // Para cambios: mostrar suplentes del partido + jugadores del equipo que no están en el partido
                    const suplentesDelPartido = currentTeam.filter(p => !p.isOnField && !p.redCard)
                    const jugadoresDelEquipoNoEnPartido = allLoadedPlayers.filter(p =>
                      p.equipo_id === equipoId &&
                      !currentTeam.some(tp => tp.id === p.id)
                    )
                    
                    const todosJugadoresDisponibles = [
                      ...suplentesDelPartido.map(p => {
                        const jugadorCompleto = allLoadedPlayers.find(ap => ap.id === p.id)
                        return {
                          ...jugadorCompleto,
                          enPartido: true,
                          estado: 'Suplente'
                        }
                      }),
                      ...jugadoresDelEquipoNoEnPartido.map(p => ({
                        ...p,
                        enPartido: false,
                        estado: 'No en partido'
                      }))
                    ]
                    
                    console.log('Debug jugadores para entrar:', {
                      equipoId,
                      currentTeam,
                      suplentesDelPartido,
                      jugadoresDelEquipoNoEnPartido,
                      todosJugadoresDisponibles
                    })
                    
                    if (todosJugadoresDisponibles.length === 0) {
                      return (
                        <div className="text-center py-8">
                          <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                          <h3 className="mt-2 text-sm font-medium text-gray-900">
                            No hay jugadores disponibles
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            No hay jugadores disponibles para entrar al campo.
                          </p>
                        </div>
                      )
                    }
                    
                    return todosJugadoresDisponibles.map((jugador) => (
                      <div key={jugador.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                            #{jugador.numero_camiseta || 'S/N'}
                          </span>
                          <span className="font-medium">{jugador.nombre} {jugador.apellido}</span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            jugador.enPartido
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {jugador.estado}
                          </span>
                        </div>
                        <button
                          onClick={() => selectPlayerFromModal(jugador.id)}
                          className="btn-primary bg-green-600 hover:bg-green-700 text-sm px-3 py-1"
                        >
                          Seleccionar
                        </button>
                      </div>
                    ))
                  }
                })()}
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => {
                    setShowPlayerSelectionModal(false)
                    setPlayerSelectionType('')
                    setPlayerSelectionTeam('')
                  }}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal de confirmación para iniciar partido */}
      {showStartConfirmation && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Confirmar Inicio de Partido
              </h3>
              <button
                onClick={() => setShowStartConfirmation(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                  <PlayIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="mt-3">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {partidoToStart?.equipo_local?.nombre} vs {partidoToStart?.equipo_visitante?.nombre}
                  </h3>
                  <div className="mt-2 text-sm text-gray-500">
                    <p><strong>Cancha:</strong> {partidoToStart?.cancha?.nombre}</p>
                    <p><strong>Árbitro:</strong> {arbitros.find(a => a.id.toString() === selectedArbitro)?.name}</p>
                    <p><strong>Veedor:</strong> {veedores.find(v => v.id.toString() === selectedVeedor)?.name}</p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Importante
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>Una vez iniciado el partido, no podrás modificar la alineación inicial ni los oficiales asignados.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowStartConfirmation(false)}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={startMatch}
                  disabled={isLoading}
                  className="btn-primary bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? 'Iniciando...' : 'Confirmar Inicio'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para asignar número de camiseta */}
      {showNumberModal && playerNeedingNumber && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Asignar Número de Camiseta
              </h3>
              <button
                onClick={() => {
                  setShowNumberModal(false)
                  setPlayerNeedingNumber(null)
                  setNewPlayerNumber('')
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                  <UserIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="mt-3">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {playerNeedingNumber.name}
                  </h3>
                  <div className="mt-2 text-sm text-gray-500">
                    <p>Este jugador no tiene número de camiseta asignado.</p>
                    <p>Asigna un número para marcarlo como titular.</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Camiseta *
                </label>
                <input
                  type="number"
                  min="1"
                  max="99"
                  required
                  className="input-field"
                  value={newPlayerNumber}
                  onChange={(e) => setNewPlayerNumber(e.target.value)}
                  placeholder="Ej: 10"
                  autoFocus
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowNumberModal(false)
                    setPlayerNeedingNumber(null)
                    setNewPlayerNumber('')
                  }}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleAssignNumber}
                  disabled={!newPlayerNumber}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Asignar y Marcar como Titular
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Resumen del Partido */}
      {showResumenModal && resumenPartido && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-center text-primary-600">
                Resumen del Partido
              </h3>
              <button
                onClick={() => setShowResumenModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Marcador Final */}
              <div className="text-center bg-primary-50 p-6 rounded-lg">
                <h4 className="text-xl font-semibold mb-4">Resultado Final</h4>
                <div className="flex items-center justify-center gap-8">
                  <div className="text-center">
                    <p className="text-lg font-medium">{resumenPartido.equipo_local}</p>
                    <p className="text-4xl font-bold text-primary-600">
                      {resumenPartido.deporte === 'voley' ? resumenPartido.sets_local : resumenPartido.goles_local}
                    </p>
                    {resumenPartido.deporte === 'voley' && (
                      <p className="text-sm text-gray-600">Sets ganados</p>
                    )}
                  </div>
                  <span className="text-2xl font-bold">-</span>
                  <div className="text-center">
                    <p className="text-lg font-medium">{resumenPartido.equipo_visitante}</p>
                    <p className="text-4xl font-bold text-primary-600">
                      {resumenPartido.deporte === 'voley' ? resumenPartido.sets_visitante : resumenPartido.goles_visitante}
                    </p>
                    {resumenPartido.deporte === 'voley' && (
                      <p className="text-sm text-gray-600">Sets ganados</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Resumen específico para Vóley - Resultado por Sets */}
              {resumenPartido.sets_detalle && resumenPartido.sets_detalle.length > 0 && (
                <div className="bg-white border rounded-lg p-4">
                  <h4 className="text-lg font-semibold mb-3">Resultado por Sets</h4>
                  <div className="space-y-2">
                    {resumenPartido.sets_detalle.map((set, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <span className="font-medium">Set {set.set}</span>
                        <div className="flex items-center gap-4">
                          <span>{resumenPartido.equipo_local}: {set.puntos_local}</span>
                          <span>{resumenPartido.equipo_visitante}: {set.puntos_visitante}</span>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-bold">
                            Ganador: {set.ganador}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 text-center bg-blue-50 p-3 rounded">
                    <p className="text-sm text-gray-700">
                      <strong>Puntos Totales:</strong> {resumenPartido.equipo_local} {resumenPartido.puntos_totales_local} - {resumenPartido.puntos_totales_visitante} {resumenPartido.equipo_visitante}
                    </p>
                  </div>
                </div>
              )}

              {/* Goles por Columnas */}
              {resumenPartido.goles && resumenPartido.goles.length > 0 && (
                <div className="bg-white border rounded-lg p-4">
                  <h4 className="text-lg font-semibold mb-4">Goles del Partido</h4>
                  <div className="grid grid-cols-2 gap-6">
                    {/* Goles Equipo Local */}
                    <div>
                      <h5 className="font-medium mb-3 text-blue-600">{resumenPartido.equipo_local}</h5>
                      <div className="space-y-2">
                        {resumenPartido.goles.filter(g => g.equipo === resumenPartido.equipo_local).map((gol, index) => (
                          <div key={`goal-local-${index}`} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                            <div>
                              <span className="font-medium">#{gol.numero_camiseta || 'S/N'} {gol.jugador}</span>
                              {gol.eventos && gol.eventos.length > 0 && (
                                <div className="text-xs text-gray-600">
                                  {gol.eventos[0].tiempo}° tiempo - {gol.eventos[0].minuto}'{gol.eventos[0].segundo}"
                                </div>
                              )}
                            </div>
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-bold">
                              ⚽ {gol.cantidad} {gol.cantidad === 1 ? 'gol' : 'goles'}
                            </span>
                          </div>
                        ))}
                        {resumenPartido.goles.filter(g => g.equipo === resumenPartido.equipo_local).length === 0 && (
                          <p className="text-gray-500 text-sm italic">Sin goles</p>
                        )}
                      </div>
                    </div>

                    {/* Goles Equipo Visitante */}
                    <div>
                      <h5 className="font-medium mb-3 text-green-600">{resumenPartido.equipo_visitante}</h5>
                      <div className="space-y-2">
                        {resumenPartido.goles.filter(g => g.equipo === resumenPartido.equipo_visitante).map((gol, index) => (
                          <div key={`goal-visit-${index}`} className="flex items-center justify-between p-2 bg-green-50 rounded">
                            <div>
                              <span className="font-medium">#{gol.numero_camiseta || 'S/N'} {gol.jugador}</span>
                              {gol.eventos && gol.eventos.length > 0 && (
                                <div className="text-xs text-gray-600">
                                  {gol.eventos[0].tiempo}° tiempo - {gol.eventos[0].minuto}'{gol.eventos[0].segundo}"
                                </div>
                              )}
                            </div>
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-bold">
                              ⚽ {gol.cantidad} {gol.cantidad === 1 ? 'gol' : 'goles'}
                            </span>
                          </div>
                        ))}
                        {resumenPartido.goles.filter(g => g.equipo === resumenPartido.equipo_visitante).length === 0 && (
                          <p className="text-gray-500 text-sm italic">Sin goles</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Alineación Inicial */}
              {(resumenPartido.titulares_local || resumenPartido.titulares_visitante) && (
                <div className="bg-white border rounded-lg p-4">
                  <h4 className="text-lg font-semibold mb-3">Alineación Inicial</h4>
                  <div className="grid grid-cols-2 gap-6">
                    {/* Titulares Equipo Local */}
                    {resumenPartido.titulares_local && (
                      <div>
                        <h5 className="font-medium mb-2 text-primary-600">{resumenPartido.equipo_local}</h5>
                        <div className="space-y-1">
                          {(typeof resumenPartido.titulares_local === 'string'
                            ? JSON.parse(resumenPartido.titulares_local)
                            : resumenPartido.titulares_local
                          ).map((titular, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded text-sm">
                              <span>{titular.nombre || titular.jugador_nombre}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Titulares Equipo Visitante */}
                    {resumenPartido.titulares_visitante && (
                      <div>
                        <h5 className="font-medium mb-2 text-primary-600">{resumenPartido.equipo_visitante}</h5>
                        <div className="space-y-1">
                          {(typeof resumenPartido.titulares_visitante === 'string'
                            ? JSON.parse(resumenPartido.titulares_visitante)
                            : resumenPartido.titulares_visitante
                          ).map((titular, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded text-sm">
                              <span>{titular.nombre || titular.jugador_nombre}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tarjetas por Columnas */}
              {(resumenPartido.tarjetas_amarillas?.length > 0 || resumenPartido.tarjetas_rojas?.length > 0) && (
                <div className="bg-white border rounded-lg p-4">
                  <h4 className="text-lg font-semibold mb-4">Tarjetas del Partido</h4>
                  <div className="grid grid-cols-2 gap-6">
                    {/* Tarjetas Equipo Local */}
                    <div>
                      <h5 className="font-medium mb-3 text-blue-600">{resumenPartido.equipo_local}</h5>
                      <div className="space-y-2">
                        {/* Tarjetas amarillas del equipo local */}
                        {resumenPartido.tarjetas_amarillas?.filter(t => t.equipo === resumenPartido.equipo_local).map((tarjeta, index) => (
                          <div key={`yellow-local-${index}`} className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                              <div>
                                <span className="font-medium">#{tarjeta.numero_camiseta || 'S/N'} {tarjeta.jugador}</span>
                                {((tarjeta.eventos && tarjeta.eventos.length > 0) || tarjeta.tiempo) && (
                                  <div className="text-xs text-gray-600">
                                    {tarjeta.eventos && tarjeta.eventos.length > 0 ? (
                                      tarjeta.eventos.map((e, i) => (
                                        <div key={i}>{e.tiempo}° tiempo - {e.minuto}'{e.segundo}"</div>
                                      ))
                                    ) : tarjeta.tiempo && (
                                      <div>{tarjeta.tiempo}° tiempo - {tarjeta.minuto}'{tarjeta.segundo}"</div>
                                    )}
                                  </div>
                                )}
                              </div>
                              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">
                                🟨 {tarjeta.cantidad} {tarjeta.cantidad === 1 ? 'amarilla' : 'amarillas'}
                              </span>
                            </div>
                        ))}
                        {/* Tarjetas rojas del equipo local */}
                        {resumenPartido.tarjetas_rojas?.filter(t => t.equipo === resumenPartido.equipo_local).map((tarjeta, index) => (
                          <div key={`red-local-${index}`} className="flex items-center justify-between p-2 bg-red-50 rounded">
                            <div>
                              <span className="font-medium">#{tarjeta.numero_camiseta || 'S/N'} {tarjeta.jugador}</span>
                              {tarjeta.tiempo && (
                                <div className="text-xs text-gray-600">
                                  {tarjeta.tiempo}° tiempo - {tarjeta.minuto}'{tarjeta.segundo}"
                                </div>
                              )}
                            </div>
                            <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
                              🟥 {tarjeta.cantidad} {tarjeta.cantidad === 1 ? 'roja' : 'rojas'}
                            </span>
                          </div>
                        ))}
                        {/* Sin tarjetas */}
                        {!resumenPartido.tarjetas_amarillas?.some(t => t.equipo === resumenPartido.equipo_local) &&
                         !resumenPartido.tarjetas_rojas?.some(t => t.equipo === resumenPartido.equipo_local) && (
                          <p className="text-gray-500 text-sm italic">Sin tarjetas</p>
                        )}
                      </div>
                    </div>

                    {/* Tarjetas Equipo Visitante */}
                    <div>
                      <h5 className="font-medium mb-3 text-green-600">{resumenPartido.equipo_visitante}</h5>
                      <div className="space-y-2">
                        {/* Tarjetas amarillas del equipo visitante */}
                        {resumenPartido.tarjetas_amarillas?.filter(t => t.equipo === resumenPartido.equipo_visitante).map((tarjeta, index) => (
                          <div key={`yellow-visit-${index}`} className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                              <div>
                                <span className="font-medium">#{tarjeta.numero_camiseta || 'S/N'} {tarjeta.jugador}</span>
                                {((tarjeta.eventos && tarjeta.eventos.length > 0) || tarjeta.tiempo) && (
                                  <div className="text-xs text-gray-600">
                                    {tarjeta.eventos && tarjeta.eventos.length > 0 ? (
                                      tarjeta.eventos.map((e, i) => (
                                        <div key={i}>{e.tiempo}° tiempo - {e.minuto}'{e.segundo}"</div>
                                      ))
                                    ) : tarjeta.tiempo && (
                                      <div>{tarjeta.tiempo}° tiempo - {tarjeta.minuto}'{tarjeta.segundo}"</div>
                                    )}
                                  </div>
                                )}
                              </div>
                              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">
                                🟨 {tarjeta.cantidad} {tarjeta.cantidad === 1 ? 'amarilla' : 'amarillas'}
                              </span>
                            </div>
                        ))}
                        {/* Tarjetas rojas del equipo visitante */}
                        {resumenPartido.tarjetas_rojas?.filter(t => t.equipo === resumenPartido.equipo_visitante).map((tarjeta, index) => (
                          <div key={`red-visit-${index}`} className="flex items-center justify-between p-2 bg-red-50 rounded">
                            <div>
                              <span className="font-medium">#{tarjeta.numero_camiseta || 'S/N'} {tarjeta.jugador}</span>
                              {tarjeta.tiempo && (
                                <div className="text-xs text-gray-600">
                                  {tarjeta.tiempo}° tiempo - {tarjeta.minuto}'{tarjeta.segundo}"
                                </div>
                              )}
                            </div>
                            <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
                              {tarjeta.es_directa ? '🟥' : '🟨🟥'} {tarjeta.cantidad} {tarjeta.cantidad === 1 ? 'roja' : 'rojas'}
                              {!tarjeta.es_directa && <span className="text-xs ml-1">(2da amarilla)</span>}
                            </span>
                          </div>
                        ))}
                        {/* Sin tarjetas */}
                        {!resumenPartido.tarjetas_amarillas?.some(t => t.equipo === resumenPartido.equipo_visitante) &&
                         !resumenPartido.tarjetas_rojas?.some(t => t.equipo === resumenPartido.equipo_visitante) && (
                          <p className="text-gray-500 text-sm italic">Sin tarjetas</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Cambios por Columnas */}
              {resumenPartido.cambios && resumenPartido.cambios.length > 0 && (
                <div className="bg-white border rounded-lg p-4">
                  <h4 className="text-lg font-semibold mb-4">Cambios Realizados</h4>
                  <div className="grid grid-cols-2 gap-6">
                    {/* Cambios Equipo Local */}
                    <div>
                      <h5 className="font-medium mb-3 text-blue-600">{resumenPartido.equipo_local}</h5>
                      <div className="space-y-2">
                        {resumenPartido.cambios.filter(c => c.equipo === resumenPartido.equipo_local).map((cambio, index) => (
                          <div key={`change-local-${index}`} className="p-2 bg-blue-50 rounded">
                            <div className="text-sm">
                              <span className="text-red-600">Sale: #{cambio.jugador_sale_numero || 'S/N'} {cambio.jugador_sale}</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-green-600">Entra: #{cambio.jugador_entra_numero || 'S/N'} {cambio.jugador_entra}</span>
                            </div>
                            {cambio.tiempo && (
                              <div className="text-xs text-gray-600 mt-1">
                                {cambio.tiempo}° tiempo - {cambio.minuto}'{cambio.segundo}"
                              </div>
                            )}
                          </div>
                        ))}
                        {resumenPartido.cambios.filter(c => c.equipo === resumenPartido.equipo_local).length === 0 && (
                          <p className="text-gray-500 text-sm italic">Sin cambios</p>
                        )}
                      </div>
                    </div>

                    {/* Cambios Equipo Visitante */}
                    <div>
                      <h5 className="font-medium mb-3 text-green-600">{resumenPartido.equipo_visitante}</h5>
                      <div className="space-y-2">
                        {resumenPartido.cambios.filter(c => c.equipo === resumenPartido.equipo_visitante).map((cambio, index) => (
                          <div key={`change-visit-${index}`} className="p-2 bg-green-50 rounded">
                            <div className="text-sm">
                              <span className="text-red-600">Sale: #{cambio.jugador_sale_numero || 'S/N'} {cambio.jugador_sale}</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-green-600">Entra: #{cambio.jugador_entra_numero || 'S/N'} {cambio.jugador_entra}</span>
                            </div>
                            {cambio.tiempo && (
                              <div className="text-xs text-gray-600 mt-1">
                                {cambio.tiempo}° tiempo - {cambio.minuto}'{cambio.segundo}"
                              </div>
                            )}
                          </div>
                        ))}
                        {resumenPartido.cambios.filter(c => c.equipo === resumenPartido.equipo_visitante).length === 0 && (
                          <p className="text-gray-500 text-sm italic">Sin cambios</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-center pt-4">
                <button
                  onClick={() => setShowResumenModal(false)}
                  className="btn-primary"
                >
                  Cerrar Resumen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal específico para editar partidos */}
      {showEditModal && partidoToEdit && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-4 mx-auto p-5 border w-full max-w-6xl shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-center text-primary-600">
                Editar Partido - {partidoToEdit.equipo_local?.nombre} vs {partidoToEdit.equipo_visitante?.nombre}
              </h3>
              <button
                onClick={handleCloseEditModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Información del partido */}
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>Fecha:</strong> {formatDateTime(partidoToEdit.fecha_hora)}</p>
                  <p><strong>Cancha:</strong> {partidoToEdit.cancha?.nombre}</p>
                </div>
                <div>
                  <p><strong>Árbitro:</strong> {arbitros.find(a => a.id === partidoToEdit.arbitro_id)?.name}</p>
                  <p><strong>Veedor:</strong> {veedores.find(v => v.id === partidoToEdit.veedor_id)?.name}</p>
                </div>
              </div>
            </div>

            {/* Pestañas para edición */}
            <div className="w-full">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setCurrentTab('lineup')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                      currentTab === 'lineup'
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <UserGroupIcon className="w-4 h-4 mr-2" />
                    Alineación
                  </button>
                  <button
                    onClick={() => setCurrentTab('score')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                      currentTab === 'score'
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <TrophyIcon className="w-4 h-4 mr-2" />
                    Marcador
                  </button>
                  <button
                    onClick={() => setCurrentTab('officials')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                      currentTab === 'officials'
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <UserIcon className="w-4 h-4 mr-2" />
                    Oficiales
                  </button>
                </nav>
              </div>

              {/* Contenido de las pestañas de edición */}
              <div className="mt-6">
                {/* Pestaña de Alineación */}
                {currentTab === 'lineup' && (
                  <div className="space-y-6">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-yellow-800">
                            Modo de Edición
                          </h3>
                          <div className="mt-2 text-sm text-yellow-700">
                            <p>Puedes modificar la alineación inicial y los cambios realizados durante el partido.</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-center">
                      <p className="text-gray-600">Funcionalidad de edición de alineación en desarrollo...</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Esta sección permitirá editar la alineación inicial y los cambios realizados.
                      </p>
                    </div>
                  </div>
                )}

                {/* Pestaña de Marcador */}
                {currentTab === 'score' && (
                  <div className="space-y-6">
                    {torneos.find(t => t.id === partidoToEdit.torneo_id)?.deporte === 'voley' ? (
                      /* Edición de marcador para Vóley */
                      <div className="space-y-6">
                        <div className="bg-white border rounded-lg p-6">
                          <h4 className="text-lg font-semibold mb-4">Marcador Final</h4>
                          <div className="grid grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Sets ganados - {partidoToEdit.equipo_local?.nombre}
                              </label>
                              <input
                                type="number"
                                min="0"
                                className="input-field"
                                value={setsLocal}
                                onChange={(e) => setSetsLocal(parseInt(e.target.value) || 0)}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Sets ganados - {partidoToEdit.equipo_visitante?.nombre}
                              </label>
                              <input
                                type="number"
                                min="0"
                                className="input-field"
                                value={setsVisitante}
                                onChange={(e) => setSetsVisitante(parseInt(e.target.value) || 0)}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Historial de Sets */}
                        {historialSets.length > 0 && (
                          <div className="bg-white border rounded-lg p-6">
                            <h4 className="text-lg font-semibold mb-4">Detalle por Sets</h4>
                            <div className="space-y-3">
                              {historialSets.map((set, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                  <span className="font-medium">Set {set.set}</span>
                                  <div className="flex items-center gap-4">
                                    <span>{partidoToEdit.equipo_local?.nombre}: {set.puntosLocal}</span>
                                    <span>{partidoToEdit.equipo_visitante?.nombre}: {set.puntosVisitante}</span>
                                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                                      Ganador: {set.ganador === 'local' ? partidoToEdit.equipo_local?.nombre : partidoToEdit.equipo_visitante?.nombre}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Edición de marcador para Fútbol */
                      <div className="bg-white border rounded-lg p-6">
                        <h4 className="text-lg font-semibold mb-4">Marcador Final</h4>
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Goles - {partidoToEdit.equipo_local?.nombre}
                            </label>
                            <input
                              type="number"
                              min="0"
                              className="input-field"
                              value={scoreLocal}
                              onChange={(e) => setScoreLocal(parseInt(e.target.value) || 0)}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Goles - {partidoToEdit.equipo_visitante?.nombre}
                            </label>
                            <input
                              type="number"
                              min="0"
                              className="input-field"
                              value={scoreVisitante}
                              onChange={(e) => setScoreVisitante(parseInt(e.target.value) || 0)}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Pestaña de Oficiales */}
                {currentTab === 'officials' && (
                  <div className="space-y-6">
                    <div className="bg-white border rounded-lg p-6">
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Asignación de Oficiales</h4>
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Árbitro *
                          </label>
                          <select
                            className="input-field"
                            value={selectedArbitro}
                            onChange={(e) => setSelectedArbitro(e.target.value)}
                            required
                          >
                            <option value="">Seleccionar árbitro</option>
                            {arbitros.map((arbitro) => (
                              <option key={arbitro.id} value={arbitro.id}>
                                {arbitro.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Veedor *
                          </label>
                          <select
                            className="input-field"
                            value={selectedVeedor}
                            onChange={(e) => setSelectedVeedor(e.target.value)}
                            required
                          >
                            <option value="">Seleccionar veedor</option>
                            {veedores.map((veedor) => (
                              <option key={veedor.id} value={veedor.id}>
                                {veedor.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <button
                type="button"
                onClick={handleCloseEditModal}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleGuardarEdicion}
                className="btn-primary bg-green-600 hover:bg-green-700"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para marcar W.O. */}
      {showWalkoverModal && partidoWalkover && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Marcar como W.O. (Walkover)
              </h3>
              <button
                onClick={() => setShowWalkoverModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-orange-100">
                  <ExclamationTriangleIcon className="h-6 w-6 text-orange-600" />
                </div>
                <div className="mt-3">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {partidoWalkover.equipo_local?.nombre} vs {partidoWalkover.equipo_visitante?.nombre}
                  </h3>
                  <div className="mt-2 text-sm text-gray-500">
                    <p>Selecciona el equipo ganador por W.O.</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Equipo Ganador *
                </label>
                <select
                  className="input-field"
                  value={equipoGanadorWO}
                  onChange={(e) => setEquipoGanadorWO(e.target.value)}
                  required
                >
                  <option value="">Seleccionar equipo ganador</option>
                  <option value="local">{partidoWalkover.equipo_local?.nombre}</option>
                  <option value="visitante">{partidoWalkover.equipo_visitante?.nombre}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo (Opcional)
                </label>
                <textarea
                  className="input-field"
                  rows={3}
                  value={motivoWO}
                  onChange={(e) => setMotivoWO(e.target.value)}
                  placeholder="Motivo del W.O..."
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Importante
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>El equipo ganador recibirá 3 puntos y el perdedor -1 punto.</p>
                      <p>Esta acción no se puede deshacer.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowWalkoverModal(false)}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmarWalkover}
                  disabled={!equipoGanadorWO}
                  className="btn-primary bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirmar W.O.
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación para acciones */}
      {showConfirmationModal && confirmationData && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Confirmar {confirmationType === 'goal' ? 'Gol' : confirmationType === 'card' ? 'Tarjeta' : 'Cambio'}
              </h3>
              <button
                onClick={() => {
                  setShowConfirmationModal(false)
                  setConfirmationType('')
                  setConfirmationData(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                  {confirmationType === 'goal' && <TrophyIcon className="h-6 w-6 text-blue-600" />}
                  {confirmationType === 'card' && <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />}
                  {confirmationType === 'substitution' && <ArrowPathIcon className="h-6 w-6 text-green-600" />}
                </div>
                <div className="mt-3">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {confirmationType === 'goal' && `Registrar Gol`}
                    {confirmationType === 'card' && `Aplicar Tarjeta ${confirmationData.cardType === 'yellow' ? 'Amarilla' : 'Roja'}`}
                    {confirmationType === 'substitution' && `Realizar Cambio`}
                  </h3>
                  <div className="mt-2 text-sm text-gray-500">
                    {confirmationType === 'goal' && (
                      <p>
                        <strong>Jugador:</strong> {confirmationData.playerName}<br/>
                        <strong>Equipo:</strong> {confirmationData.team === 'local' ? partidoToStart.equipo_local?.nombre : partidoToStart.equipo_visitante?.nombre}<br/>
                        <strong>Tiempo:</strong> {getCurrentTimeFormatted()}
                      </p>
                    )}
                    {confirmationType === 'card' && (
                      <p>
                        <strong>Jugador:</strong> {allLoadedPlayers.find(p => p.id == confirmationData.playerId)?.nombre} {allLoadedPlayers.find(p => p.id == confirmationData.playerId)?.apellido}<br/>
                        <strong>Equipo:</strong> {confirmationData.team === 'local' ? partidoToStart.equipo_local?.nombre : partidoToStart.equipo_visitante?.nombre}<br/>
                        <strong>Tipo:</strong> Tarjeta {confirmationData.cardType === 'yellow' ? 'Amarilla' : 'Roja'}<br/>
                        <strong>Tiempo:</strong> {getCurrentTimeFormatted()}
                      </p>
                    )}
                    {confirmationType === 'substitution' && (
                      <p>
                        <strong>Sale:</strong> {teamLocalPlayers.find(p => p.id == confirmationData.playerOutId)?.name || teamVisitantePlayers.find(p => p.id == confirmationData.playerOutId)?.name}<br/>
                        <strong>Entra:</strong> {allLoadedPlayers.find(p => p.id == confirmationData.playerInId)?.nombre} {allLoadedPlayers.find(p => p.id == confirmationData.playerInId)?.apellido}<br/>
                        <strong>Equipo:</strong> {confirmationData.team === 'local' ? partidoToStart.equipo_local?.nombre : partidoToStart.equipo_visitante?.nombre}<br/>
                        <strong>Tiempo:</strong> {getCurrentTimeFormatted()}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowConfirmationModal(false)
                    setConfirmationType('')
                    setConfirmationData(null)
                  }}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={executeConfirmedAction}
                  className="btn-primary bg-blue-600 hover:bg-blue-700"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Partidos