import React from "react";
import ReactDOMServer from "react-dom/server";
import {SSRApp} from "./src/SSRApp";
import indexFile from "./build/index.html";

// import config from "../config.json";
// import axios from "axios";
// import Buffer from 'buffer'
import zlib from 'zlib'

// const indexFile = `
// <!DOCTYPE html>
// <html lang="en">
//   <head>
//     <meta charset="utf-8" />
//     <meta name="viewport" content="width=device-width, initial-scale=1" />
//     <meta name="theme-color" content="#000000" />
//     <meta
//       name="description"
//       content="Web site created using create-react-app"
//     />
//     <title>React App</title>
//   </head>
//   <body>
//     <noscript>You need to enable JavaScript to run this app.</noscript>
//     <div id="root"></div>
//     <div>Rendered on Edge</div>
//   </body>
// </html>
// `;

const gzip = (html) => new Promise((resolve, reject) => {
    const input = Buffer.from(html);
    zlib.deflate(input, (err, res) => {
        if (err) {
            return reject(err)
        }
        resolve(res.toString('base64'))
    });
})
const getHtml = async (url, {compress}) => {
    const app = ReactDOMServer.renderToString(<SSRApp url={url}/>);

    const html = indexFile.replace(
        '<div id="root"></div>',
        `<div id="root">${app}</div>`
    );
    if (!compress) {
        return html
    }
    return await gzip(html)
}

export const edgeHandler = async (event) => {
    try {
        const request = event.Records[0].cf.request;
        const body = await getHtml(request.uri, {compress: true})
        const response = {
            status: "200",
            statusDescription: "OK",
            bodyEncoding: 'base64',
            headers: {
                "cache-control": [
                    {
                        key: "Cache-Control",
                        value: "max-age=100",
                    },
                ],
                "content-type": [
                    {
                        key: "Content-Type",
                        value: "text/html",
                    },
                ],
                "content-encoding": [
                    {
                        key: 'Content-Encoding',
                        value: 'deflate'
                    }
                ]
            },
            body,
        };
        return response
    } catch (error) {
        console.log(`Error ${error.message}`);
        return `Error ${error}`;
    }
};

export const apiHandler = async (event) => {
    try {
        console.log('event.path',event.path)
        // event.path
        // event.queryStringParameters
        // event.queryStringParameters
        // event.multiValueQueryStringParameters
        // event.pathParameters
        const request = {uri: '/'}
        const body = await getHtml(event.path, {compress: false})
        console.log('body',body)
        const response = {
            statusCode: 200,
            headers: {
                "Content-Type": "text/html",
                // "Content-Encoding": "deflate"
            },
            body,
        };
        return response
    } catch (error) {
        console.log(`Error ${error.message}`);
        return `Error ${error}`;
    }
};
