export type Client = {
  id: string
  name: string
  companyName: string
  companyDocument: string
  rut: string
  phoneNumber: string
  address: string
  creationDate: string
  frequentClient: string // Changed from boolean to string to match API
  photoFileName?: string // Made optional since it's not always returned by API
}
