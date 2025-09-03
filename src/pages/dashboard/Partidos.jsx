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
  clearError,
  agruparPartidosPorFases
} from '../../store/slices/partidosSlice'
import { fetchTorneos } from '../../store/slices/torneosSlice'
import { fetchEquipos } from '../../store/slices/equiposSlice'
import { fetchCanchas } from '../../store/slices/canchasSlice'
import { fetchJugadores } from '../../store/slices/jugadoresSlice'
import { fetchArbitros } from '../../store/slices/arbitrosSlice'
import { fetchVeedores } from '../../store/slices/veedoresSlice'
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
  const { partidos, isLoading, error, eventosPartido, resumenPartido } = useSelector((state) => state.partidos)
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
  
  // Estados para el modal avanzado de partido
  const [matchStarted, setMatchStarted] = useState(false)
  const [currentTab, setCurrentTab] = useState('lineup')
  const [scoreLocal, setScoreLocal] = useState(0)
  const [scoreVisitante, setScoreVisitante] = useState(0)
  const [goals, setGoals] = useState([])
  const [cardsHistory, setCardsHistory] = useState([]) // Historial de tarjetas
  
  // Estados para control de tiempo del partido
  const [matchTime, setMatchTime] = useState(0) // Tiempo en segundos
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
  const [selectedArbitro, setSelectedArbitro] = useState('')
  const [selectedVeedor, setSelectedVeedor] = useState('')
  const [showStartConfirmation, setShowStartConfirmation] = useState(false)
  
  // Estados para cambios
  const [playerOutLocal, setPlayerOutLocal] = useState('')
  const [playerInLocal, setPlayerInLocal] = useState('')
  const [playerOutVisitante, setPlayerOutVisitante] = useState('')
  const [playerInVisitante, setPlayerInVisitante] = useState('')
  
  // Estados para resumen del partido
  const [showResumenModal, setShowResumenModal] = useState(false)
  
  const [formData, setFormData] = useState({
    torneo_id: '',
    equipo_local_id: '',
    equipo_visitante_id: '',
    cancha_id: '',
    fecha_hora: '',
    arbitro_id: '',
    fase: '',
    grupo: '',
    num_clasificados: 2,
    observaciones: ''
  })

  useEffect(() => {
    dispatch(fetchPartidos())
    dispatch(fetchTorneos())
    dispatch(fetchEquipos())
    dispatch(fetchCanchas())
    dispatch(fetchArbitros())
    dispatch(fetchVeedores())
  }, [dispatch])

  // Efecto para el cronómetro del partido
  useEffect(() => {
    let interval = null
    if (isMatchRunning && matchStarted) {
      interval = setInterval(() => {
        setMatchTime(prevTime => prevTime + 1)
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
            const localPlayers = await dispatch(fetchJugadores(partido.equipo_local_id)).unwrap()
            allPlayers = [...allPlayers, ...localPlayers]
          }
          
          // Cargar jugadores del equipo visitante
          if (partido.equipo_visitante_id) {
            const visitantePlayers = await dispatch(fetchJugadores(partido.equipo_visitante_id)).unwrap()
            allPlayers = [...allPlayers, ...visitantePlayers]
          }
          
          // Guardar todos los jugadores cargados
          setAllLoadedPlayers(allPlayers)
          
        } catch (error) {
          console.error('Error cargando jugadores:', error)
        }
      }
    }

    loadPlayersForMatch()
  }, [dispatch, partidoToStart, partidoToEdit])

  // Inicializar jugadores cuando se cargan
  useEffect(() => {
    if (partidoToStart && allLoadedPlayers.length > 0) {
      const jugadoresLocal = allLoadedPlayers
        .filter(j => j.equipo_id === partidoToStart.equipo_local_id)
        .map(j => ({
          id: j.id,
          name: `${j.nombre} ${j.apellido}`,
          isStarter: false,
          isOnField: false,
          yellowCards: 0,
          redCard: false
        }))
      
      const jugadoresVisitante = allLoadedPlayers
        .filter(j => j.equipo_id === partidoToStart.equipo_visitante_id)
        .map(j => ({
          id: j.id,
          name: `${j.nombre} ${j.apellido}`,
          isStarter: false,
          isOnField: false,
          yellowCards: 0,
          redCard: false
        }))
      
      setTeamLocalPlayers(jugadoresLocal)
      setTeamVisitantePlayers(jugadoresVisitante)
    }
  }, [partidoToStart, allLoadedPlayers])

  // Cargar estado completo cuando los jugadores están listos y es un partido en curso
  useEffect(() => {
    if (partidoToStart &&
        allLoadedPlayers.length > 0 &&
        teamLocalPlayers.length > 0 &&
        teamVisitantePlayers.length > 0 &&
        partidoToStart.estado === 'en_curso' &&
        matchStarted &&
        !estadoCargado) {
      cargarEstadoCompleto(partidoToStart.id)
    }
  }, [partidoToStart, allLoadedPlayers, teamLocalPlayers, teamVisitantePlayers, matchStarted, estadoCargado])

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
    }
  }

  const handleIniciarPartido = (partido) => {
    setPartidoToStart(partido)
    setShowMatchModal(true)
    setMatchStarted(false)
    setCurrentTab('lineup')
    setScoreLocal(0)
    setScoreVisitante(0)
    setGoals([])
    setSelectedArbitro('')
    setSelectedVeedor('')
    setShowStartConfirmation(false)
    
    // Limpiar estados de vóley
    setCurrentSet(1)
    setSetsLocal(0)
    setSetsVisitante(0)
    setPuntosSetLocal(0)
    setPuntosSetVisitante(0)
    setEquipoConSaque('local')
    setHistorialSets([])
    setCardsHistory([])
  }

  const handleReingresarPartido = async (partido) => {
    setPartidoToStart(partido)
    setShowMatchModal(true)
    setMatchStarted(true)
    setCurrentTab('live')
    // Cargar datos existentes del partido
    setScoreLocal(partido.goles_local || 0)
    setScoreVisitante(partido.goles_visitante || 0)
    setSelectedArbitro(partido.arbitro_id || '')
    setSelectedVeedor(partido.veedor_id || '')
    setShowStartConfirmation(false)
    
    // Cargar datos de vóley si aplica
    setSetsLocal(partido.sets_local || 0)
    setSetsVisitante(partido.sets_visitante || 0)
    
    // Los jugadores se cargarán automáticamente por el useEffect
    // y luego se cargará el estado completo
  }

  // Función para cargar el estado completo del partido desde el backend
  const cargarEstadoCompleto = async (partidoId) => {
    try {
      console.log('Cargando estado completo del partido:', partidoId)
      setEstadoCargado(true) // Marcar como cargado para evitar repeticiones
      
      // Cargar eventos del partido
      const eventos = await dispatch(fetchEventosPartido(partidoId)).unwrap()
      
      // Procesar eventos para reconstruir el estado
      procesarEventosPartido(eventos)
      
    } catch (error) {
      console.error('Error al cargar estado del partido:', error)
      setEstadoCargado(false) // Resetear en caso de error
    }
  }

  // Función para procesar eventos y reconstruir el estado del partido
  const procesarEventosPartido = (eventos) => {
    const golesPartido = []
    let golesLocal = 0
    let golesVisitante = 0
    
    // Primero, marcar jugadores titulares como en campo si hay titulares guardados
    if (partidoToStart.titulares_local) {
      try {
        const titularesLocal = JSON.parse(partidoToStart.titulares_local)
        setTeamLocalPlayers(prevTeam =>
          prevTeam.map(player => ({
            ...player,
            isStarter: titularesLocal.some(t => t.jugador_id === player.id),
            isOnField: titularesLocal.some(t => t.jugador_id === player.id)
          }))
        )
      } catch (e) {
        console.error('Error parsing titulares_local:', e)
      }
    }
    
    if (partidoToStart.titulares_visitante) {
      try {
        const titularesVisitante = JSON.parse(partidoToStart.titulares_visitante)
        setTeamVisitantePlayers(prevTeam =>
          prevTeam.map(player => ({
            ...player,
            isStarter: titularesVisitante.some(t => t.jugador_id === player.id),
            isOnField: titularesVisitante.some(t => t.jugador_id === player.id)
          }))
        )
      } catch (e) {
        console.error('Error parsing titulares_visitante:', e)
      }
    }
    
    // Procesar cada evento
    eventos.forEach(evento => {
      switch (evento.tipo_evento) {
        case 'gol':
        case 'punto_voley':
          const jugador = allLoadedPlayers.find(j => j.id === evento.jugador_id)
          if (jugador) {
            const equipo = jugador.equipo_id === partidoToStart?.equipo_local_id ? 'local' : 'visitante'
            golesPartido.push({
              id: evento.id,
              playerId: evento.jugador_id,
              playerName: `${jugador.nombre} ${jugador.apellido}`,
              team: equipo,
            })
            
            if (equipo === 'local') {
              golesLocal++
            } else {
              golesVisitante++
            }
          }
          break
          
        case 'tarjeta_amarilla':
        case 'tarjeta_roja':
          // Aplicar tarjetas a los jugadores (solo para fútbol)
          const torneo = torneos.find(t => t.id === partidoToStart.torneo_id)
          if (torneo?.deporte === 'futbol') {
            aplicarTarjetaAJugador(evento.jugador_id, evento.tipo_evento)
          }
          break
          
        case 'sustitucion':
          // Aplicar cambio de jugadores
          aplicarCambioJugador(evento.jugador_sale_id, evento.jugador_entra_id)
          break
          
        case 'set_voley':
          // Para vóley, no necesitamos procesar sets aquí ya que se manejan en el backend
          break
      }
    })
    
    // Actualizar estados
    setGoals(golesPartido)
    setScoreLocal(golesLocal)
    setScoreVisitante(golesVisitante)
  }

  // Función para aplicar tarjeta a un jugador (solo para reconstruir estado, no para eventos nuevos)
  const aplicarTarjetaAJugador = (jugadorId, tipoTarjeta) => {
    const jugador = allLoadedPlayers.find(j => j.id == jugadorId)
    if (!jugador) return
    
    const esLocal = jugador.equipo_id === partidoToStart?.equipo_local_id
    const setTeam = esLocal ? setTeamLocalPlayers : setTeamVisitantePlayers
    
    setTeam(prevTeam =>
      prevTeam.map(player =>
        player.id == jugadorId
          ? {
              ...player,
              yellowCards: tipoTarjeta === 'tarjeta_amarilla' ? player.yellowCards + 1 : player.yellowCards,
              redCard: tipoTarjeta === 'tarjeta_roja' ? true : player.redCard,
              isOnField: tipoTarjeta === 'tarjeta_roja' ? false : player.isOnField
            }
          : player
      )
    )
  }

  // Función para aplicar cambio de jugador
  const aplicarCambioJugador = (jugadorSaleId, jugadorEntraId) => {
    const jugadorSale = allLoadedPlayers.find(j => j.id === jugadorSaleId)
    const jugadorEntra = allLoadedPlayers.find(j => j.id === jugadorEntraId)
    
    if (!jugadorSale || !jugadorEntra) return
    
    const esLocal = jugadorSale.equipo_id === partidoToStart?.equipo_local_id
    const setTeam = esLocal ? setTeamLocalPlayers : setTeamVisitantePlayers
    
    setTeam(prevTeam =>
      prevTeam.map(player => {
        if (player.id === jugadorSaleId) {
          return { ...player, isOnField: false, isStarter: false }
        }
        if (player.id === jugadorEntraId) {
          return { ...player, isOnField: true, isStarter: false }
        }
        return player
      })
    )
  }

  // Funciones para el modal avanzado
  const togglePlayerStarter = (team, playerId) => {
    const setTeam = team === 'local' ? setTeamLocalPlayers : setTeamVisitantePlayers
    const currentTeam = team === 'local' ? teamLocalPlayers : teamVisitantePlayers

    setTeam(
      currentTeam.map((player) =>
        player.id === playerId
          ? { ...player, isStarter: !player.isStarter, isOnField: !player.isStarter ? true : player.isOnField }
          : player,
      ),
    )
  }


  const addGoal = async (team, playerId, playerName) => {
    const torneo = torneos.find(t => t.id === partidoToStart.torneo_id)
    const isVoley = torneo?.deporte === 'voley'
    
    if (isVoley) {
      // Para vóley, agregar punto al set actual
      addPuntoVoley(team, playerId, playerName)
    } else {
      // Para fútbol, agregar gol
      const currentMinute = getCurrentMinute()
      const newGoal = {
        id: goals.length + 1,
        playerId,
        playerName,
        team,
        minute: currentMinute,
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

        await dispatch(registrarEvento({
          partidoId: partidoToStart.id,
          eventoData: {
            tipo_evento: 'gol',
            jugador_id: playerId,
            equipo_id: equipo_id,
            minuto: currentMinute,
            tiempo: currentHalf,
            descripcion: `Gol de ${playerName} - ${currentMinute}' (${currentHalf}° tiempo)`
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

    // Lógica de tarjetas
    if (cardType === 'yellow') {
      newYellowCards = player.yellowCards + 1
      // Si llega a 2 amarillas, automáticamente es roja
      if (newYellowCards >= 2) {
        finalCardType = 'red'
        newRedCard = true
      }
    } else if (cardType === 'red') {
      newRedCard = true
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

      // Registrar la tarjeta original (amarilla o roja)
      await dispatch(registrarEvento({
        partidoId: partidoToStart.id,
        eventoData: {
          tipo_evento: cardType === 'yellow' ? 'tarjeta_amarilla' : 'tarjeta_roja',
          jugador_id: parseInt(playerId),
          equipo_id: equipo_id,
          minuto: currentMinute,
          tiempo: currentHalf,
          descripcion: `Tarjeta ${cardType === 'yellow' ? 'amarilla' : 'roja'} para ${player?.name} - ${currentMinute}' (${currentHalf}° tiempo)`
        }
      })).unwrap()

      // Si fue la segunda amarilla, registrar también la roja automática
      if (cardType === 'yellow' && newYellowCards >= 2) {
        await dispatch(registrarEvento({
          partidoId: partidoToStart.id,
          eventoData: {
            tipo_evento: 'tarjeta_roja',
            jugador_id: parseInt(playerId),
            equipo_id: equipo_id,
            minuto: currentMinute,
            tiempo: currentHalf,
            descripcion: `Tarjeta roja automática por segunda amarilla para ${player?.name} - ${currentMinute}' (${currentHalf}° tiempo)`
          }
        })).unwrap()
      }

    } catch (error) {
      console.error('Error al registrar tarjeta:', error)
    }

    // Agregar al historial de tarjetas
    const newCardEntry = {
      id: Date.now(), // ID temporal
      playerId: parseInt(playerId),
      playerName: player?.name,
      team: team,
      cardType: finalCardType,
      minute: currentMinute,
      half: currentHalf,
      timestamp: new Date().toLocaleTimeString()
    }
    setCardsHistory(prev => [...prev, newCardEntry])
  }

  // Función para eliminar una tarjeta del historial
  const removeCard = async (cardId, playerId, cardType) => {
    if (window.confirm('¿Estás seguro de eliminar esta tarjeta?')) {
      try {
        // Encontrar el jugador y actualizar su estado
        const jugador = allLoadedPlayers.find(j => j.id == playerId)
        if (!jugador) return

        const esLocal = jugador.equipo_id === partidoToStart?.equipo_local_id
        const setTeam = esLocal ? setTeamLocalPlayers : setTeamVisitantePlayers

        setTeam(prevTeam =>
          prevTeam.map(player =>
            player.id == playerId
              ? {
                  ...player,
                  yellowCards: cardType === 'yellow' ? Math.max(0, player.yellowCards - 1) : player.yellowCards,
                  redCard: cardType === 'red' ? false : player.redCard,
                  isOnField: cardType === 'red' ? true : player.isOnField // Si se quita roja, puede volver al campo
                }
              : player
          )
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
        
        // Marcar jugadores titulares como en campo
        setTeamLocalPlayers(prevTeam =>
          prevTeam.map(player => ({
            ...player,
            isOnField: player.isStarter
          }))
        )
        
        setTeamVisitantePlayers(prevTeam =>
          prevTeam.map(player => ({
            ...player,
            isOnField: player.isStarter
          }))
        )
        
        setMatchStarted(true)
        setCurrentTab('live')
        setShowStartConfirmation(false)
        dispatch(fetchPartidos())
      } catch (error) {
        console.error('Error al iniciar partido:', error)
      }
    }
  }

  // Función para realizar cambio de jugadores
  const makeSubstitution = async (team, playerOutId, playerInId) => {
    console.log('makeSubstitution called:', { team, playerOutId, playerInId })
    
    const setTeam = team === 'local' ? setTeamLocalPlayers : setTeamVisitantePlayers
    const currentTeam = team === 'local' ? teamLocalPlayers : teamVisitantePlayers
    const playerOut = currentTeam.find(p => p.id == playerOutId) // Usar == para comparación flexible
    const playerIn = currentTeam.find(p => p.id == playerInId)   // Usar == para comparación flexible

    console.log('Players found:', { playerOut, playerIn })

    if (!playerOut || !playerIn) {
      console.error('No se encontraron los jugadores:', { playerOut, playerIn })
      return
    }

    // Actualizar estado local
    setTeam(
      currentTeam.map((player) => {
        if (player.id == playerOutId) {
          return { ...player, isOnField: false, isStarter: false }
        }
        if (player.id == playerInId) {
          return { ...player, isOnField: true, isStarter: false }
        }
        return player
      })
    )

    const currentMinute = getCurrentMinute()

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
        descripcion: `Cambio: Sale ${playerOut.name}, Entra ${playerIn.name} - ${currentMinute}' (${currentHalf}° tiempo)`
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
          tiempo: currentHalf,
          descripcion: `Cambio: Sale ${playerOut.name}, Entra ${playerIn.name} - ${currentMinute}' (${currentHalf}° tiempo)`
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

  // Funciones para control de tiempo del partido
  const formatMatchTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getCurrentMinute = () => {
    return Math.floor(matchTime / 60)
  }

  const startFirstHalf = () => {
    setMatchPhase('first_half')
    setCurrentHalf(1)
    setIsMatchRunning(true)
    setMatchTime(0)
  }

  const endFirstHalf = () => {
    setIsMatchRunning(false)
    setMatchPhase('half_time')
    setHalfTimeBreak(true)
  }

  const startSecondHalf = () => {
    setMatchPhase('second_half')
    setCurrentHalf(2)
    setHalfTimeBreak(false)
    setIsMatchRunning(true)
    // El tiempo continúa desde donde se quedó en el primer tiempo
    // No se reinicia, mantiene el valor actual de matchTime
  }

  const endMatch = () => {
    setIsMatchRunning(false)
    setMatchPhase('finished')
  }

  const pauseMatch = () => {
    setIsMatchRunning(false)
  }

  const resumeMatch = () => {
    setIsMatchRunning(true)
  }

  const getPlayersOnField = (team) => team.filter((p) => p.isOnField && !p.redCard)
  const getPlayersOnBench = (team) => team.filter((p) => !p.isOnField && !p.redCard)

  const handleFinalizarPartido = async (id) => {
    if (window.confirm('¿Estás seguro de finalizar este partido?')) {
      try {
        await dispatch(finalizarPartido(id)).unwrap()
        
        // Obtener resumen del partido
        await dispatch(obtenerResumenPartido(id)).unwrap()
        
        // Cerrar modal de partido y mostrar resumen
        handleCloseMatchModal()
        setShowResumenModal(true)
        
        dispatch(fetchPartidos())
      } catch (error) {
        console.error('Error al finalizar partido:', error)
      }
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
      num_clasificados: 2,
      observaciones: ''
    })
    dispatch(clearError())
  }

  const handleCloseMatchModal = () => {
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
    setEstadoCargado(false) // Resetear bandera de estado cargado
    
    // Limpiar estados de vóley
    setCurrentSet(1)
    setSetsLocal(0)
    setSetsVisitante(0)
    setPuntosSetLocal(0)
    setPuntosSetVisitante(0)
    setEquipoConSaque('local')
    setHistorialSets([])
    setCardsHistory([])
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

  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'No programado'
    const date = new Date(dateTime)
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

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

  // Función para filtrar equipos por grupo
  const getEquiposByGrupo = (torneoId, grupo) => {
    if (!torneoId || !grupo) return getEquiposByTorneo(torneoId)
    return getEquiposByTorneo(torneoId).filter(equipo => equipo.grupo === grupo)
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
  const getEquiposDisponibles = (torneoId, fase, grupo, numClasificados = 2) => {
    if (!torneoId) return []

    switch (fase) {
      case 'grupos':
        return grupo ? getEquiposByGrupo(torneoId, grupo) : getEquiposByTorneo(torneoId)

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
          total += grupo.partidos.length
          programados += grupo.partidos.filter(p => p.estado === 'programado').length
          en_curso += grupo.partidos.filter(p => p.estado === 'en_curso').length
          finalizados += grupo.partidos.filter(p => p.estado === 'finalizado').length
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
              <button
                onClick={() => handleFinalizarPartido(partido.id)}
                className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                title="Finalizar partido"
              >
                <StopIcon className="h-2 w-2" />
              </button>
            </>
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
                                                    {grupo.partidos.length} partido{grupo.partidos.length !== 1 ? 's' : ''}
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

                                            {/* Partidos del grupo */}
                                            {isGrupoExpanded && (
                                              <div className="divide-y divide-gray-200">
                                                {grupo.partidos.map((partido) => (
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
                    {getEquiposDisponibles(formData.torneo_id, formData.fase, formData.grupo, formData.num_clasificados).map((equipo) => (
                      <option key={equipo.id} value={equipo.id}>
                        {equipo.nombre}
                        {equipo.grupo && ` (Grupo ${equipo.grupo})`}
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
                    {getEquiposDisponibles(formData.torneo_id, formData.fase, formData.grupo, formData.num_clasificados)
                      .filter(equipo => equipo.id.toString() !== formData.equipo_local_id)
                      .map((equipo) => (
                        <option key={equipo.id} value={equipo.id}>
                          {equipo.nombre}
                          {equipo.grupo && ` (Grupo ${equipo.grupo})`}
                          {equipo.puntos !== undefined && ` - ${equipo.puntos} pts`}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

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

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Fecha y Hora *
                </label>
                <input
                  type="datetime-local"
                  required
                  className="input-field"
                  value={formData.fecha_hora}
                  onChange={(e) => setFormData({...formData, fecha_hora: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Fase del Torneo *
                </label>
                <select
                  required
                  className="input-field"
                  value={formData.fase}
                  onChange={(e) => setFormData({...formData, fase: e.target.value, grupo: '', equipo_local_id: '', equipo_visitante_id: ''})}
                >
                  <option value="">Seleccionar fase</option>
                  <option value="grupos">Fase de Grupos</option>
                  <option value="eliminatorias">Eliminatorias</option>
                  <option value="octavos">Octavos de Final</option>
                  <option value="cuartos">Cuartos de Final</option>
                  <option value="semifinal">Semifinal</option>
                  <option value="final">Final</option>
                </select>
              </div>

              {/* Campo dinámico para Grupo (solo para fase de grupos) */}
              {formData.fase === 'grupos' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Grupo *
                  </label>
                  <select
                    required
                    className="input-field"
                    value={formData.grupo}
                    onChange={(e) => setFormData({...formData, grupo: e.target.value, equipo_local_id: '', equipo_visitante_id: ''})}
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

              {/* Campo dinámico para número de clasificados (solo para fases eliminatorias sin partidos previos) */}
              {(formData.fase === 'octavos' || formData.fase === 'cuartos' || formData.fase === 'semifinal' || formData.fase === 'final') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    N° de equipos que clasifican por grupo
                  </label>
                  <select
                    className="input-field"
                    value={formData.num_clasificados}
                    onChange={(e) => setFormData({...formData, num_clasificados: parseInt(e.target.value), equipo_local_id: '', equipo_visitante_id: ''})}
                  >
                    <option value={1}>1 equipo por grupo</option>
                    <option value={2}>2 equipos por grupo</option>
                    <option value={3}>3 equipos por grupo</option>
                    <option value={4}>4 equipos por grupo</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Solo aplica si no existen partidos en la fase anterior
                  </p>
                </div>
              )}

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
                  {/* Pestaña de tarjetas solo para fútbol */}
                  {torneos.find(t => t.id === partidoToStart.torneo_id)?.deporte === 'futbol' && (
                    <button
                      onClick={() => setCurrentTab('cards')}
                      disabled={!matchStarted}
                      className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                        currentTab === 'cards'
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } ${!matchStarted ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
                      Tarjetas
                    </button>
                  )}
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
                                onClick={() => handleFinalizarPartido(partidoToStart.id)}
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
                                {formatMatchTime(matchTime)}
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
                                  <>
                                    {isMatchRunning ? (
                                      <button
                                        onClick={pauseMatch}
                                        className="btn-primary bg-yellow-600 hover:bg-yellow-700"
                                      >
                                        Pausar
                                      </button>
                                    ) : (
                                      <button
                                        onClick={resumeMatch}
                                        className="btn-primary bg-green-600 hover:bg-green-700"
                                      >
                                        Reanudar
                                      </button>
                                    )}
                                    <button
                                      onClick={endFirstHalf}
                                      className="btn-primary bg-orange-600 hover:bg-orange-700"
                                    >
                                      Terminar 1er Tiempo
                                    </button>
                                  </>
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
                                  <>
                                    {isMatchRunning ? (
                                      <button
                                        onClick={pauseMatch}
                                        className="btn-primary bg-yellow-600 hover:bg-yellow-700"
                                      >
                                        Pausar
                                      </button>
                                    ) : (
                                      <button
                                        onClick={resumeMatch}
                                        className="btn-primary bg-green-600 hover:bg-green-700"
                                      >
                                        Reanudar
                                      </button>
                                    )}
                                    <button
                                      onClick={endMatch}
                                      className="btn-primary bg-red-600 hover:bg-red-700"
                                    >
                                      Finalizar Partido
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Goles y Tarjetas por Equipo - Reorganizado */}
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
                                      <span>{goal.playerName} - {goal.minute}'</span>
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
                                  {cardsHistory.filter(card => card.team === 'local').map((card) => (
                                    <div key={card.id} className="flex items-center justify-between text-sm">
                                      <span>
                                        {card.playerName} - {card.minute}'
                                        <span className={`ml-1 px-1 rounded text-xs ${
                                          card.cardType === 'yellow' ? 'bg-yellow-200' : 'bg-red-200'
                                        }`}>
                                          {card.cardType === 'yellow' ? '🟨' : '🟥'}
                                        </span>
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

                              {/* Agregar gol - equipo local */}
                              <div>
                                <h4 className="font-medium mb-2">Agregar Gol</h4>
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
                                <div className="space-y-1 max-h-32 overflow-y-auto">
                                  {getPlayersOnField(teamLocalPlayers)
                                    .filter(player =>
                                      player.name.toLowerCase().includes(searchJugador1.toLowerCase()) ||
                                      (allLoadedPlayers.find(p => p.id === player.id)?.numero_camiseta?.toString() || '').includes(searchJugador1)
                                    )
                                    .map((player) => (
                                    <button
                                      key={player.id}
                                      onClick={() => addGoal('local', player.id, player.name)}
                                      className="w-full text-left p-2 border rounded hover:bg-gray-50 flex items-center text-sm"
                                    >
                                      <PlusIcon className="w-3 h-3 mr-2 text-green-600" />
                                      <span className="bg-primary-100 text-primary-800 text-xs font-medium px-1 py-0.5 rounded mr-2">
                                        #{allLoadedPlayers.find(p => p.id === player.id)?.numero_camiseta || 'S/N'}
                                      </span>
                                      {player.name}
                                    </button>
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
                                      <span>{goal.playerName} - {goal.minute}'</span>
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
                                  {cardsHistory.filter(card => card.team === 'visitante').map((card) => (
                                    <div key={card.id} className="flex items-center justify-between text-sm">
                                      <span>
                                        {card.playerName} - {card.minute}'
                                        <span className={`ml-1 px-1 rounded text-xs ${
                                          card.cardType === 'yellow' ? 'bg-yellow-200' : 'bg-red-200'
                                        }`}>
                                          {card.cardType === 'yellow' ? '🟨' : '🟥'}
                                        </span>
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

                              {/* Agregar gol - equipo visitante */}
                              <div>
                                <h4 className="font-medium mb-2">Agregar Gol</h4>
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
                                <div className="space-y-1 max-h-32 overflow-y-auto">
                                  {getPlayersOnField(teamVisitantePlayers)
                                    .filter(player =>
                                      player.name.toLowerCase().includes(searchJugador2.toLowerCase()) ||
                                      (allLoadedPlayers.find(p => p.id === player.id)?.numero_camiseta?.toString() || '').includes(searchJugador2)
                                    )
                                    .map((player) => (
                                    <button
                                      key={player.id}
                                      onClick={() => addGoal('visitante', player.id, player.name)}
                                      className="w-full text-left p-2 border rounded hover:bg-gray-50 flex items-center text-sm"
                                    >
                                      <PlusIcon className="w-3 h-3 mr-2 text-green-600" />
                                      <span className="bg-primary-100 text-primary-800 text-xs font-medium px-1 py-0.5 rounded mr-2">
                                        #{allLoadedPlayers.find(p => p.id === player.id)?.numero_camiseta || 'S/N'}
                                      </span>
                                      {player.name}
                                    </button>
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

                {/* Pestaña de Tarjetas - Solo para fútbol */}
                {currentTab === 'cards' && torneos.find(t => t.id === partidoToStart.torneo_id)?.deporte === 'futbol' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      {/* Tarjetas Equipo Local */}
                      <div className="bg-white border rounded-lg">
                        <div className="bg-yellow-50 px-4 py-3 border-b">
                          <h4 className="text-lg font-medium">Tarjetas - {partidoToStart.equipo_local?.nombre}</h4>
                        </div>
                        <div className="p-4 space-y-3">
                          {/* Campo de búsqueda para equipo local */}
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
                          {getPlayersOnField(teamLocalPlayers)
                            .filter(player =>
                              player.name.toLowerCase().includes(searchJugador1.toLowerCase()) ||
                              (allLoadedPlayers.find(p => p.id === player.id)?.numero_camiseta?.toString() || '').includes(searchJugador1)
                            )
                            .map((player) => (
                            <div key={player.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <p className="font-medium">{player.name}</p>
                                <div className="flex gap-2 mt-1">
                                  {Array.from({ length: player.yellowCards }).map((_, i) => (
                                    <span key={i} className="bg-yellow-400 text-black px-2 py-1 rounded text-xs">
                                      Amarilla
                                    </span>
                                  ))}
                                  {player.redCard && (
                                    <span className="bg-red-500 text-white px-2 py-1 rounded text-xs">Roja</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => addCard('local', player.id, 'yellow')}
                                  disabled={player.redCard}
                                  className="px-3 py-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded text-sm disabled:opacity-50"
                                >
                                  Amarilla
                                </button>
                                <button
                                  onClick={() => addCard('local', player.id, 'red')}
                                  disabled={player.redCard}
                                  className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded text-sm disabled:opacity-50"
                                >
                                  Roja
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Tarjetas Equipo Visitante */}
                      <div className="bg-white border rounded-lg">
                        <div className="bg-yellow-50 px-4 py-3 border-b">
                          <h4 className="text-lg font-medium">Tarjetas - {partidoToStart.equipo_visitante?.nombre}</h4>
                        </div>
                        <div className="p-4 space-y-3">
                          {/* Campo de búsqueda para equipo visitante */}
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
                          {getPlayersOnField(teamVisitantePlayers)
                            .filter(player =>
                              player.name.toLowerCase().includes(searchJugador2.toLowerCase()) ||
                              (allLoadedPlayers.find(p => p.id === player.id)?.numero_camiseta?.toString() || '').includes(searchJugador2)
                            )
                            .map((player) => (
                            <div key={player.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <p className="font-medium">{player.name}</p>
                                <div className="flex gap-2 mt-1">
                                  {Array.from({ length: player.yellowCards }).map((_, i) => (
                                    <span key={i} className="bg-yellow-400 text-black px-2 py-1 rounded text-xs">
                                      Amarilla
                                    </span>
                                  ))}
                                  {player.redCard && (
                                    <span className="bg-red-500 text-white px-2 py-1 rounded text-xs">Roja</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => addCard('visitante', player.id, 'yellow')}
                                  disabled={player.redCard}
                                  className="px-3 py-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded text-sm disabled:opacity-50"
                                >
                                  Amarilla
                                </button>
                                <button
                                  onClick={() => addCard('visitante', player.id, 'red')}
                                  disabled={player.redCard}
                                  className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded text-sm disabled:opacity-50"
                                >
                                  Roja
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Historial de Tarjetas */}
                    {cardsHistory.length > 0 && (
                      <div className="bg-white border rounded-lg p-4">
                        <h4 className="text-lg font-semibold mb-3">Historial de Tarjetas</h4>
                        <div className="space-y-2">
                          {cardsHistory.map((card) => (
                            <div key={card.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                              <div className="flex items-center gap-3">
                                <span className="font-medium">{card.playerName}</span>
                                <span className="text-sm text-gray-600">
                                  ({card.team === 'local' ? partidoToStart.equipo_local?.nombre : partidoToStart.equipo_visitante?.nombre})
                                </span>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  card.cardType === 'yellow'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {card.cardType === 'yellow' ? 'Amarilla' : 'Roja'}
                                </span>
                                <span className="text-xs text-gray-500">{card.timestamp}</span>
                              </div>
                              <button
                                onClick={() => removeCard(card.id, card.playerId, card.cardType)}
                                className="text-red-600 hover:text-red-900 p-1"
                                title="Eliminar tarjeta"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
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
                          <h4 className="text-lg font-medium">Cambios - {partidoToStart.equipo_local?.nombre}</h4>
                        </div>
                        <div className="p-4 space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Jugador que sale:</label>
                            {/* Campo de búsqueda para jugadores en campo */}
                            <div className="relative mb-2">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                              </div>
                              <input
                                type="text"
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm"
                                placeholder="Buscar jugador que sale..."
                                value={searchJugador1}
                                onChange={(e) => setSearchJugador1(e.target.value)}
                              />
                            </div>
                            <select
                              className="input-field"
                              value={playerOutLocal}
                              onChange={(e) => setPlayerOutLocal(e.target.value)}
                            >
                              <option value="">Seleccionar jugador</option>
                              {getPlayersOnField(teamLocalPlayers)
                                .filter(player =>
                                  player.name.toLowerCase().includes(searchJugador1.toLowerCase()) ||
                                  (allLoadedPlayers.find(p => p.id === player.id)?.numero_camiseta?.toString() || '').includes(searchJugador1)
                                )
                                .map((player) => (
                                <option key={player.id} value={player.id}>
                                  #{allLoadedPlayers.find(p => p.id === player.id)?.numero_camiseta || 'S/N'} - {player.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Jugador que entra:</label>
                            {/* Campo de búsqueda para jugadores suplentes */}
                            <div className="relative mb-2">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                              </div>
                              <input
                                type="text"
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm"
                                placeholder="Buscar jugador que entra..."
                                value={searchJugador2}
                                onChange={(e) => setSearchJugador2(e.target.value)}
                              />
                            </div>
                            <select
                              className="input-field"
                              value={playerInLocal}
                              onChange={(e) => setPlayerInLocal(e.target.value)}
                            >
                              <option value="">Seleccionar jugador</option>
                              {getPlayersOnBench(teamLocalPlayers)
                                .filter(player =>
                                  player.name.toLowerCase().includes(searchJugador2.toLowerCase()) ||
                                  (allLoadedPlayers.find(p => p.id === player.id)?.numero_camiseta?.toString() || '').includes(searchJugador2)
                                )
                                .map((player) => (
                                <option key={player.id} value={player.id}>
                                  #{allLoadedPlayers.find(p => p.id === player.id)?.numero_camiseta || 'S/N'} - {player.name}
                                </option>
                              ))}
                            </select>
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
                          <h4 className="text-lg font-medium">Cambios - {partidoToStart.equipo_visitante?.nombre}</h4>
                        </div>
                        <div className="p-4 space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Jugador que sale:</label>
                            {/* Campo de búsqueda para jugadores en campo */}
                            <div className="relative mb-2">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                              </div>
                              <input
                                type="text"
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm"
                                placeholder="Buscar jugador que sale..."
                                value={searchJugador1}
                                onChange={(e) => setSearchJugador1(e.target.value)}
                              />
                            </div>
                            <select
                              className="input-field"
                              value={playerOutVisitante}
                              onChange={(e) => setPlayerOutVisitante(e.target.value)}
                            >
                              <option value="">Seleccionar jugador</option>
                              {getPlayersOnField(teamVisitantePlayers)
                                .filter(player =>
                                  player.name.toLowerCase().includes(searchJugador1.toLowerCase()) ||
                                  (allLoadedPlayers.find(p => p.id === player.id)?.numero_camiseta?.toString() || '').includes(searchJugador1)
                                )
                                .map((player) => (
                                <option key={player.id} value={player.id}>
                                  #{allLoadedPlayers.find(p => p.id === player.id)?.numero_camiseta || 'S/N'} - {player.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Jugador que entra:</label>
                            {/* Campo de búsqueda para jugadores suplentes */}
                            <div className="relative mb-2">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                              </div>
                              <input
                                type="text"
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm"
                                placeholder="Buscar jugador que entra..."
                                value={searchJugador2}
                                onChange={(e) => setSearchJugador2(e.target.value)}
                              />
                            </div>
                            <select
                              className="input-field"
                              value={playerInVisitante}
                              onChange={(e) => setPlayerInVisitante(e.target.value)}
                            >
                              <option value="">Seleccionar jugador</option>
                              {getPlayersOnBench(teamVisitantePlayers)
                                .filter(player =>
                                  player.name.toLowerCase().includes(searchJugador2.toLowerCase()) ||
                                  (allLoadedPlayers.find(p => p.id === player.id)?.numero_camiseta?.toString() || '').includes(searchJugador2)
                                )
                                .map((player) => (
                                <option key={player.id} value={player.id}>
                                  #{allLoadedPlayers.find(p => p.id === player.id)?.numero_camiseta || 'S/N'} - {player.name}
                                </option>
                              ))}
                            </select>
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

              {/* Goles */}
              {resumenPartido.goles && resumenPartido.goles.length > 0 && (
                <div className="bg-white border rounded-lg p-4">
                  <h4 className="text-lg font-semibold mb-3">Goles del Partido</h4>
                  <div className="space-y-2">
                    {resumenPartido.goles.map((gol, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="font-medium">{gol.jugador}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">{gol.equipo}</span>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-bold">
                            {gol.cantidad} {gol.cantidad === 1 ? 'gol' : 'goles'}
                          </span>
                        </div>
                      </div>
                    ))}
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

              {/* Tarjetas */}
              {(resumenPartido.tarjetas_amarillas?.length > 0 || resumenPartido.tarjetas_rojas?.length > 0) && (
                <div className="grid grid-cols-2 gap-4">
                  {/* Tarjetas Amarillas */}
                  {resumenPartido.tarjetas_amarillas?.length > 0 && (
                    <div className="bg-white border rounded-lg p-4">
                      <h4 className="text-lg font-semibold mb-3 text-yellow-600">Tarjetas Amarillas</h4>
                      <div className="space-y-2">
                        {resumenPartido.tarjetas_amarillas.map((tarjeta, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                            <span className="font-medium">{tarjeta.jugador}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">{tarjeta.equipo}</span>
                              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm font-bold">
                                {tarjeta.cantidad} {tarjeta.cantidad === 1 ? 'amarilla' : 'amarillas'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tarjetas Rojas */}
                  {resumenPartido.tarjetas_rojas?.length > 0 && (
                    <div className="bg-white border rounded-lg p-4">
                      <h4 className="text-lg font-semibold mb-3 text-red-600">Tarjetas Rojas</h4>
                      <div className="space-y-2">
                        {resumenPartido.tarjetas_rojas.map((tarjeta, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-red-50 rounded">
                            <span className="font-medium">{tarjeta.jugador}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">{tarjeta.equipo}</span>
                              <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-bold">
                                {tarjeta.cantidad} {tarjeta.cantidad === 1 ? 'roja' : 'rojas'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Cambios */}
              {resumenPartido.cambios && resumenPartido.cambios.length > 0 && (
                <div className="bg-white border rounded-lg p-4">
                  <h4 className="text-lg font-semibold mb-3">Cambios Realizados</h4>
                  <div className="space-y-2">
                    {resumenPartido.cambios.map((cambio, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                        <div>
                          <span className="text-red-600">Sale: {cambio.jugador_sale}</span>
                          <span className="mx-2">→</span>
                          <span className="text-green-600">Entra: {cambio.jugador_entra}</span>
                        </div>
                      </div>
                    ))}
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
    </div>
  )
}

export default Partidos