import express from 'express'
import bodyParser from 'body-parser'
import { Routes, Misc } from './constants'
import {
	authMiddleWare,
	errMiddleware,
	notFoundMiddleware,
	teapotMiddleware,
} from './middleware'
import { cartRouter, productsRouter } from './routes'

const app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(`${Routes.PROFILE_CART}`, authMiddleWare, cartRouter)
app.use(`${Routes.PRODUCTS}`, authMiddleWare, productsRouter)

//No project can be complete until valid teapot response ^.^
app.get('/teapot', teapotMiddleware)

//Must be the last 2 routes in order to handle errors and page not found cases
app.use(errMiddleware)
app.use(notFoundMiddleware)

app.listen(Misc.PORT, () => {
	console.log(`Server is running on port ${Misc.PORT}`)
})
