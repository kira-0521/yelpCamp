import express, { Request, Response, NextFunction } from 'express'
import path from 'path'
import { connect } from 'mongoose'
import methodOverride from 'method-override'
import morgan from 'morgan'
import Joi from 'joi'
const ejsMate = require('ejs-mate')

import { Campground } from './models/campGround'
import { CampgroundType, ExpressErrorType } from './types/campground'
import { catchAsync } from './utils/catchAsync'
import { ExpressError } from './utils/ExpressError'
import { campgroundsSchema } from './shema'

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

const app = express()
app.engine('ejs', ejsMate)
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

// req.bodyをパース
app.use(express.urlencoded({ extended: true }))
// formでGETとPOST以外を送れるようにする
app.use(methodOverride('_method'))
// 通信のログを出力
app.use(morgan('tiny'))

// サーバーサイドバリデーション
const validateCampground = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { error } = campgroundsSchema.validate(req.body)
  if (error?.details[0].message) {
    throw new ExpressError(error.details[0].message, 400)
  } else {
    next()
  }
}

// 一覧
app.get(
  '/campgrounds',
  catchAsync(async (req: Request, res: Response) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { campgrounds })
  })
)

// 作成
app.get('/campgrounds/new', (req: Request, res: Response) => {
  res.render('campgrounds/new')
})
app.post(
  '/campgrounds',
  validateCampground,
  catchAsync(async (req: Request, res: Response) => {
    const getCampground = (req.body as { campground: Partial<CampgroundType> })
      .campground
    const campground = new Campground(getCampground)
    await campground.save()
    res.redirect(`/campgrounds/${campground._id}`)
  })
)

// 更新
app.get(
  '/campgrounds/:id/edit',
  catchAsync(async (req: Request, res: Response) => {
    const campground = await Campground.findById(
      (req.params as { id: string }).id
    )
    res.render('campgrounds/edit', { campground })
  })
)
app.put(
  '/campgrounds/:id',
  validateCampground,
  catchAsync(async (req: Request, res: Response) => {
    const campground = await Campground.findByIdAndUpdate(
      (req.params as { id: string }).id,
      { ...(req.body as { campground: Partial<CampgroundType> }).campground }
    )
    res.redirect(`/campgrounds/${campground!.id}`)
  })
)

// 削除
app.delete(
  '/campgrounds/:id',
  catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string }
    await Campground.findByIdAndDelete(id)
    res.redirect('/campgrounds')
  })
)

// 詳細
app.get(
  '/campgrounds/:id',
  catchAsync(async (req: Request, res: Response) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/show', { campground })
  })
)

// エラーハンドラー
app.all('*', (req: Request, res: Response, next: NextFunction) => {
  next(new ExpressError('ページが見つかりませんでした。', 404))
})
app.use(
  (err: ExpressErrorType, req: Request, res: Response, next: NextFunction) => {
    const { statusCode = 500 } = err
    if (!err.message) {
      err.message = '問題が起きました。'
    }
    res.status(statusCode).render('campgrounds/error', { err })
  }
)

app.listen(3000, () => {
  console.log('ポート3000で待ち受け中...')
})
