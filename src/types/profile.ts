export interface ProfileResponse {
  message: string
  data: Data
}

export interface Data {
  id: string
  name: string
  email: string
  role: string
  gender: any
  phone: any
  address: any
  iat: number
  exp: number
}
