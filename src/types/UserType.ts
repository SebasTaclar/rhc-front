export interface User {
  id: string
  username: string
  name: string
  role: string
  membershipPaid: boolean
}

export interface UserResponse {
  success: boolean
  data: User
  message: string
}
