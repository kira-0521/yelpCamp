import { Schema, model } from 'mongoose'
import { CampgroundType } from '../types/campground'

const campgroundSchema = new Schema<CampgroundType>({
  title: String,
  image: String,
  price: String,
  description: String,
  location: String,
})

export const Campground = model<Partial<CampgroundType>>(
  'Campground',
  campgroundSchema
)
