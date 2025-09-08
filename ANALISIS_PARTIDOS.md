# Análisis del Proceso de Creación de Partidos

Este documento detalla la estructura y el flujo necesarios para registrar un partido finalizado con sus goles y titulares en el sistema.

## Proceso General

El sistema está diseñado para registrar partidos como si se estuvieran gestionando en tiempo real. No existe un único endpoint para registrar un partido ya finalizado con todos sus datos. En cambio, el proceso se divide en cuatro pasos secuenciales:

1.  **Crear el Partido**: Se registra la información básica del partido.
2.  **Iniciar el Partido**: Se envían los titulares de cada equipo.
3.  **Registrar Goles**: Cada gol se registra como un evento individual.
4.  **Finalizar el Partido**: Se cierra el partido y se calculan los puntos.

## Estructura de Datos (JSON)

A continuación se detalla el formato JSON que la API espera en cada paso del proceso.

### 1. Crear Partido

*   **Endpoint**: `POST /api/partidos`
*   **Descripción**: Crea un nuevo partido en estado `programado`.

```json
{
  "torneo_id": 1,
  "equipo_local_id": 1,
  "equipo_visitante_id": 2,
  "cancha_id": 1,
  "fecha_hora": "2023-10-27 20:00:00",
  "fase": "grupos",
  "grupo": "A"
}
```

### 2. Iniciar Partido

*   **Endpoint**: `POST /api/partidos/{id}/iniciar`
*   **Descripción**: Cambia el estado del partido a `en_curso` y registra los jugadores titulares.

```json
{
  "veedor_id": 1,
  "arbitro_id": 1,
  "titulares": {
    "local": [
      {"jugador_id": 101, "numero_camiseta": 10},
      {"jugador_id": 102, "numero_camiseta": 7}
    ],
    "visitante": [
      {"jugador_id": 201, "numero_camiseta": 9},
      {"jugador_id": 202, "numero_camiseta": 1}
    ]
  }
}
```

### 3. Registrar Gol

*   **Endpoint**: `POST /api/partidos/{id}/eventos`
*   **Descripción**: Registra un gol como un evento. Esta acción debe repetirse para cada gol del partido.

```json
{
  "tipo_evento": "gol",
  "jugador_id": 101,
  "equipo_id": 1,
  "minuto": 25,
  "tiempo": 1
}
```

### 4. Finalizar Partido

*   **Endpoint**: `POST /api/partidos/{id}/finalizar`
*   **Descripción**: Cambia el estado del partido a `finalizado` y calcula los puntos. No requiere un cuerpo de solicitud.

## Diagrama de Flujo

```mermaid
graph TD
    A[Inicio] --> B{1. Crear Partido};
    B --> C{2. Iniciar Partido};
    C --> D{3. Registrar Goles};
    D --> E{¿Hay más goles?};
    E -- Sí --> D;
    E -- No --> F{4. Finalizar Partido};
    F --> G[Fin];

    subgraph "Paso 1: Crear Partido"
        B --> B1["POST /api/partidos"];
        B1 --> B2["Body: {torneo_id, equipos, fecha, etc.}"];
    end

    subgraph "Paso 2: Iniciar Partido"
        C --> C1["POST /api/partidos/{id}/iniciar"];
        C1 --> C2["Body: {titulares}"];
    end

    subgraph "Paso 3: Registrar Goles"
        D --> D1["POST /api/partidos/{id}/eventos"];
        D1 --> D2["Body: {tipo_evento: 'gol', jugador_id, etc.}"];
    end

    subgraph "Paso 4: Finalizar Partido"
        F --> F1["POST /api/partidos/{id}/finalizar"];
    end