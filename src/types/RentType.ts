export type Rent = {
  id: string
  code: string
  productName: string
  quantity: number
  totalValuePerDay: number
  clientRut: string
  deliveryDate: string
  paymentMethod?: string
  clientName: string
  warrantyValue: number
  warrantyType?: string
  createdAt: string
  isFinished: boolean
  // Optional fields for finished rents
  totalDays?: number
  totalPrice?: number
  observations?: string
  isPaid?: boolean
  finishDate?: string
  updatedAt?: string
}
