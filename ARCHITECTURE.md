# 🏗️ Architecture

---

## 🇬🇧 English

### System Overview

The Oura Health Agent is built on the OpenClaw agent framework and follows a modular, event-driven architecture that enables real-time health monitoring and conversational interaction.

### Core Components

#### 1. **Oura API Integration Layer**
- **Purpose**: Handles all communication with Oura Cloud API
- **Responsibilities**:
  - Authentication and token management
  - Rate limiting and request throttling
  - Data fetching (sleep, readiness, activity, heart rate)
  - Webhook subscription management
  - Error handling and retry logic

#### 2. **Data Processing Engine**
- **Purpose**: Transforms raw Oura data into actionable insights
- **Responsibilities**:
  - Data normalization and validation
  - Trend analysis and pattern detection
  - Anomaly detection (sleep disruptions, unusual HRV)
  - Score aggregation and historical comparison
  - Statistical analysis (averages, percentiles, trends)

#### 3. **Conversation Interface**
- **Purpose**: Natural language interaction with health data
- **Responsibilities**:
  - Intent recognition (query, command, request)
  - Context management (conversation state)
  - Response generation (conversational, formatted)
  - Multi-turn dialogue support
  - Query parsing and entity extraction

#### 4. **Proactive Monitoring Service**
- **Purpose**: Background health monitoring and alerts
- **Responsibilities**:
  - Periodic data synchronization
  - Threshold monitoring (low readiness, poor sleep)
  - Trend detection (improving/declining patterns)
  - Notification generation
  - Recommendation engine

#### 5. **Storage & State Management**
- **Purpose**: Persistent data and configuration
- **Responsibilities**:
  - Local caching of Oura data
  - User preferences and settings
  - Historical data storage
  - Conversation context persistence
  - Goal tracking state

### Data Flow

```
┌─────────────┐
│ Oura Ring   │
└──────┬──────┘
       │ (Bluetooth)
       ▼
┌─────────────┐
│ Oura Cloud  │◄────┐
│     API     │     │
└──────┬──────┘     │
       │ (HTTPS)    │ Webhooks
       ▼            │
┌─────────────────────────┐
│  Oura API Integration   │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│  Data Processing Engine │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│   Storage & Cache       │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│ Conversation Interface  │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│  User (via OpenClaw)    │
└─────────────────────────┘
```

### Technology Stack

- **Language**: Python 3.9
- **Runtime**: Google Cloud Run Jobs
- **API Client**: `requests` library with retry handling
- **Data Storage**: Google BigQuery (partitioned by date)
- **Data Processing**: `pandas` for data transformation
- **Oura Integration**: `oura-ring` Python SDK
- **Notifications**: Telegram Bot API
- **Container**: Docker (python:3.9-slim base image)
- **Orchestration**: Cloud Scheduler (cron-based triggers)

### Security Considerations

1. **API Token Management**
   - Tokens stored in encrypted environment variables
   - Never logged or exposed in responses
   - Automatic token refresh when supported

2. **Data Privacy**
   - All health data stored locally by default
   - No third-party data sharing
   - User-controlled data retention policies
   - Secure deletion capabilities

3. **Rate Limiting**
   - Respect Oura API rate limits (5,000 requests/day)
   - Intelligent caching to minimize API calls
   - Graceful degradation when limits approached

### Performance Optimization

- **Caching Strategy**: 
  - Sleep data: 1 hour cache
  - Readiness/Activity: 15 minutes cache
  - Historical data: 24 hour cache
  
- **Lazy Loading**: Only fetch data when requested
- **Batch Requests**: Combine multiple data requests
- **Background Sync**: Periodic updates during off-peak times

### Extension Points

The architecture supports future extensions:
- Custom health metrics integration
- Third-party service connections (Apple Health, Google Fit)
- Advanced analytics and ML models
- Multi-user support
- Mobile companion app

---

## 🇪🇸 Español

### Descripción General del Sistema

El Oura Health Agent está construido sobre el marco de agentes OpenClaw y sigue una arquitectura modular dirigida por eventos que permite el monitoreo de salud en tiempo real y la interacción conversacional.

### Componentes Principales

#### 1. **Capa de Integración con API de Oura**
- **Propósito**: Maneja toda la comunicación con la API de Oura Cloud
- **Responsabilidades**:
  - Autenticación y gestión de tokens
  - Limitación de tasa y regulación de solicitudes
  - Obtención de datos (sueño, preparación, actividad, frecuencia cardíaca)
  - Gestión de suscripciones a webhooks
  - Manejo de errores y lógica de reintento

#### 2. **Motor de Procesamiento de Datos**
- **Propósito**: Transforma datos crudos de Oura en perspectivas accionables
- **Responsabilidades**:
  - Normalización y validación de datos
  - Análisis de tendencias y detección de patrones
  - Detección de anomalías (interrupciones del sueño, VFC inusual)
  - Agregación de puntajes y comparación histórica
  - Análisis estadístico (promedios, percentiles, tendencias)

#### 3. **Interfaz de Conversación**
- **Propósito**: Interacción en lenguaje natural con datos de salud
- **Responsabilidades**:
  - Reconocimiento de intención (consulta, comando, solicitud)
  - Gestión de contexto (estado de conversación)
  - Generación de respuestas (conversacional, formateada)
  - Soporte de diálogo de múltiples turnos
  - Análisis de consultas y extracción de entidades

#### 4. **Servicio de Monitoreo Proactivo**
- **Propósito**: Monitoreo de salud en segundo plano y alertas
- **Responsabilidades**:
  - Sincronización periódica de datos
  - Monitoreo de umbrales (baja preparación, sueño deficiente)
  - Detección de tendencias (patrones de mejora/declive)
  - Generación de notificaciones
  - Motor de recomendaciones

#### 5. **Almacenamiento y Gestión de Estado**
- **Propósito**: Datos persistentes y configuración
- **Responsabilidades**:
  - Almacenamiento en caché local de datos de Oura
  - Preferencias y configuraciones del usuario
  - Almacenamiento de datos históricos
  - Persistencia del contexto de conversación
  - Estado de seguimiento de objetivos

### Flujo de Datos

```
┌─────────────┐
│ Oura Ring   │
└──────┬──────┘
       │ (Bluetooth)
       ▼
┌─────────────┐
│ Oura Cloud  │◄────┐
│     API     │     │
└──────┬──────┘     │
       │ (HTTPS)    │ Webhooks
       ▼            │
┌─────────────────────────┐
│  Integración API Oura   │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│  Motor Procesamiento    │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│   Almacenamiento/Caché  │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│ Interfaz Conversacional │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│  Usuario (vía OpenClaw) │
└─────────────────────────┘
```

### Stack Tecnológico

- **Lenguaje**: Python 3.9
- **Entorno de Ejecución**: Google Cloud Run Jobs
- **Cliente API**: Librería `requests` con manejo de reintentos
- **Almacenamiento de Datos**: Google BigQuery (particionado por fecha)
- **Procesamiento de Datos**: `pandas` para transformación de datos
- **Integración Oura**: SDK Python `oura-ring`
- **Notificaciones**: API de Telegram Bot
- **Contenedor**: Docker (imagen base python:3.9-slim)
- **Orquestación**: Cloud Scheduler (triggers basados en cron)

### Consideraciones de Seguridad

1. **Gestión de Tokens de API**
   - Tokens almacenados en variables de entorno cifradas
   - Nunca registrados o expuestos en respuestas
   - Actualización automática de tokens cuando sea compatible

2. **Privacidad de Datos**
   - Todos los datos de salud almacenados localmente por defecto
   - Sin compartir datos con terceros
   - Políticas de retención de datos controladas por el usuario
   - Capacidades de eliminación segura

3. **Limitación de Tasa**
   - Respetar límites de tasa de API de Oura (5,000 solicitudes/día)
   - Almacenamiento en caché inteligente para minimizar llamadas API
   - Degradación elegante cuando se acercan los límites

### Optimización de Rendimiento

- **Estrategia de Caché**: 
  - Datos de sueño: caché de 1 hora
  - Preparación/Actividad: caché de 15 minutos
  - Datos históricos: caché de 24 horas
  
- **Carga Diferida**: Solo obtener datos cuando se solicitan
- **Solicitudes por Lotes**: Combinar múltiples solicitudes de datos
- **Sincronización en Segundo Plano**: Actualizaciones periódicas durante horas valle

### Puntos de Extensión

La arquitectura soporta extensiones futuras:
- Integración de métricas de salud personalizadas
- Conexiones con servicios de terceros (Apple Health, Google Fit)
- Análisis avanzado y modelos de ML
- Soporte multi-usuario
- Aplicación móvil complementaria

---

**Author / Autor**: Diego Armas  
**License / Licencia**: MIT
