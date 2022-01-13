import express, { Request, Response } from 'express'
import path from 'path'
import { connect } from 'mongoose'
import { Campground } from './models/campGround'
import { CampgroundType } from './types/campground'
import methodOverride from 'method-override'
import morgan from 'morgan'

connect('mongodb://localhost:27017/yelp-camp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
})
  .then(() => {
    console.log('MongoDBコネクションOK！！')
    // スキーマの定義などthenの中で書かなくても書かなくても良い仕様になっている
  })
  .catch((err: Error) => {
    console.log('MongoDBコネクションエラー')
    console.log(err)
  })

const app = express()
// req.bodyをパース
app.use(express.urlencoded({ extended: true }))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
// formでGETとPOST以外を送れるようにする
app.use(methodOverride('_method'))
// 通信のログを出力
app.use(morgan('tiny'))

// 一覧
app.get('/campgrounds', async (req: Request, res: Response) => {
  const campgrounds = await Campground.find({})
  res.render('campgrounds/index', { campgrounds })
})

// 作成
app.get('/campgrounds/new', (req: Request, res: Response) => {
  res.render('campgrounds/new')
})
app.post('/campgrounds', async (req: Request, res: Response) => {
  const getCampground = (req.body as { campground: Partial<CampgroundType> })
    .campground
  const campground = new Campground(getCampground)
  await campground.save()
  res.redirect(`/campgrounds/${campground._id}`)
})

// 更新
app.get('/campgrounds/:id/edit', async (req: Request, res: Response) => {
  const campground = await Campground.findById(
    (req.params as { id: string }).id
  )
  res.render('campgrounds/edit', { campground })
})
app.put('/campgrounds/:id', async (req: Request, res: Response) => {
  const campground = await Campground.findByIdAndUpdate(
    (req.params as { id: string }).id,
    { ...(req.body as { campground: Partial<CampgroundType> }).campground }
  )
  res.redirect(`/campgrounds/${campground!.id}`)
})

// 削除
app.delete('/campgrounds/:id', async (req: Request, res: Response) => {
  const { id } = req.params as { id: string }
  await Campground.findByIdAndDelete(id)
  res.redirect('/campgrounds')
})

// 詳細
app.get('/campgrounds/:id', async (req: Request, res: Response) => {
  const campground = await Campground.findById(req.params.id)
  res.render('campgrounds/show', { campground })
})

app.get('/makecampground', async (req: Request, res: Response) => {
  const camp = new Campground({
    title: '私の庭',
    description: '気軽に遊べる私の庭である。',
  })
  await camp.save()
  res.send(camp)
})

app.listen(3000, () => {
  console.log('ポート3000で待ち受け中...')
})
