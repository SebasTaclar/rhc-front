export type EventType = 'MEETING' | 'DEADLINE' | 'REMINDER' | 'OTHER'

export interface Event {
  id: number
  title: string
  description?: string
  startDate: string
  endDate: string
  eventType: EventType
  isPrivate: boolean
  clientIds?: number[]
  employeeIds?: number[]
  createdBy?: number
  createdAt: string
  updatedAt?: string
  // Relaciones opcionales
  clients?: Array<{ id: number; businessName: string }>
  employees?: Array<{ id: number; name: string }>
  creator?: { id: number; name: string }
}

export interface PublicEvent {
  id: number
  title: string
  description?: string
  startDate: string
  endDate: string
  eventType: EventType
  isPrivate: boolean
  createdAt: string
}

export interface CreateEventRequest {
  title: string
  description?: string
  startDate: string
  endDate: string
  eventType: EventType
  isPrivate?: boolean
  clientIds?: number[]
  employeeIds?: number[]
}

export interface UpdateEventRequest {
  title?: string
  description?: string
  startDate?: string
  endDate?: string
  eventType?: EventType
  isPrivate?: boolean
  clientIds?: number[]
  employeeIds?: number[]
}

export interface ValidateTokenWithEventsResponse {
  tokenValidation: {
    isValid: boolean
    clientId: number
    expiresAt: string
    message: string
  }
  clientData: {
    clientId: number
    totalEvents: number
    publicEvents: number
    privateEvents: number
  }
  events: {
    public: PublicEvent[]
    private: PublicEvent[]
  }
}
