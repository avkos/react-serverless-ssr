import {apiHandler as apiHandlerSsr} from './ssr'
import express from 'express'
import serverlessExpress from '@vendia/serverless-express'

export const apiHandler = apiHandlerSsr

const app = express();
app.use(express.static(__dirname + '/../../build/static'));
app.use(express.static(__dirname + '/../../build'));

export const staticHandler = serverlessExpress({app})





