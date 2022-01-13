import { connect, connection } from 'mongoose'
import cities from './cities'
import { descriptors, places } from './seedHelpers'
import { Campground } from '../models/campGround'

connect('mongodb://localhost:27017/yelp-camp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
})
  .then(() => {
    console.log('MongoDBコネクションOK！！')
  })
  .catch((err: Error) => {
    console.log('MongoDBコネクションエラー')
    console.log(err)
  })

const sample = (array: Array<string>) =>
  array[Math.floor(Math.random() * array.length)]

const seedDB = async () => {
  await Campground.deleteMany({})
  for (let i = 0; i < 50; i++) {
    const randomCityIndex = Math.floor(Math.random() * cities.length)
    const camp = new Campground({
      location: `${cities[randomCityIndex].prefecture}${cities[randomCityIndex].city}`,
      title: `${sample(descriptors)}・${sample(places)}`,
    })
    await camp.save()
  }
}

seedDB().then(() => {
  connection.close()
})
