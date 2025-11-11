export interface Client {
  id: number
  businessName: string
  phone: string
  nit?: string | null
  city?: string | null
  sector?: string | null
  email?: string | null
  address?: string | null
  contractedServices?: string[] | null
  createdAt?: string
  updatedAt?: string
}

export interface CreateClientRequest {
  businessName: string
  phone: string
  nit?: string | null
  city?: string | null
  sector?: string | null
  email?: string | null
  address?: string | null
  contractedServices?: string[] | null
}

export interface UpdateClientRequest {
  businessName?: string
  phone?: string
  nit?: string | null
  city?: string | null
  sector?: string | null
  email?: string | null
  address?: string | null
  contractedServices?: string[] | null
}
