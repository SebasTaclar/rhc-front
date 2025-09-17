// Tipos para la integración con Wompi Widget

export interface WompiWidgetConfig {
  currency: string
  amountInCents: number
  reference: string
  publicKey: string
  signature: {
    integrity: string
  }
  redirectUrl?: string
  expirationTime?: string
  taxInCents?: {
    vat?: number
    consumption?: number
  }
  customerData?: {
    email?: string
    fullName?: string
    phoneNumber?: string
    phoneNumberPrefix?: string
    legalId?: string
    legalIdType?: string
  }
  shippingAddress?: {
    addressLine1?: string
    addressLine2?: string
    city?: string
    phoneNumber?: string
    region?: string
    country?: string
    name?: string
    postalCode?: string
  }
}

export interface WompiWidgetResult {
  transaction: {
    id: string
    status: 'APPROVED' | 'DECLINED' | 'PENDING' | 'ERROR'
    reference: string
    amount_in_cents: number
    currency: string
    payment_method_type: string
    payment_method: any
    created_at: string
    finalized_at?: string
  }
}

export interface WompiWidgetCheckout {
  open(callback: (result: WompiWidgetResult) => void): void
}

// Extensión del objeto Window para incluir WidgetCheckout
declare global {
  interface Window {
    WidgetCheckout: new (config: WompiWidgetConfig) => WompiWidgetCheckout
  }
}

export {}
