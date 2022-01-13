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
    const price = Math.floor(Math.random() * 3000) * 100
    const camp = new Campground({
      location: `${cities[randomCityIndex].prefecture}${cities[randomCityIndex].city}`,
      title: `${sample(descriptors)}・${sample(places)}`,
      image: 'https://source.unsplash.com/collection/483251',
      description:
        '木曾路はすべて山の中である。あるところは岨づたいに行く崖の道であり、あるところは数十間の深さに臨む木曾川の岸であり、あるところは山の尾をめぐる谷の入り口である。一筋の街道はこの深い森林地帯を貫いていた。東ざかいの桜沢から、西の十曲峠まで、木曾十一宿はこの街道に添うて、二十二里余にわたる長い谿谷の間に散在していた。道路の位置も幾たびか改まったもので、古道はいつのまにか深い山間に埋もれた。名高い桟も、',
      price,
    })
    await camp.save()
  }
}

seedDB().then(() => {
  connection.close()
})
