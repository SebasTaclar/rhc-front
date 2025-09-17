// Tipos para el sistema de pagos y wallpapers
export interface WallpaperType {
  id: number
  title: string
  description: string
  thumbnail: string
  resolution: string
  format: string
  price: number
  category?: string
  tags?: string[]
}

export interface PaymentType {
  id: string
  wallpaperNumber: number
  status: 'PENDING' | 'APPROVED' | 'COMPLETED' | 'REJECTED' | 'CANCELLED'
  amount: number
  currency: string
  createdAt: string
  updatedAt: string
  buyerEmail: string
  buyerName: string
  buyerIdentificationNumber: string
  preferenceId?: string
  paymentUrl?: string
  externalReference?: string
}
