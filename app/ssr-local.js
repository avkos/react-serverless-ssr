import {apiHandler as apiHandlerSsr, setHtml} from './ssr'
import express from 'express'
import serverlessExpress from '@vendia/serverless-express'
import indexFile from "./build-local/index.html";

console.log('indexFile',indexFile)
setHtml(indexFile)
export const apiHandler = apiHandlerSsr

const app = express();
app.use(express.static(__dirname + '/../../build-local/static'));
app.use(express.static(__dirname + '/../../build-local'));

export const staticHandler = serverlessExpress({app})





