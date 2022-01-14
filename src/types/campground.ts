export interface CampgroundType {
  title: string
  image: string
  price: number
  description: string
  location: string
}

export interface ExpressErrorType extends Error {
  statusCode: number
}
