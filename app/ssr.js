import React from "react";
import ReactDOMServer from "react-dom/server";
import {SSRApp} from "./src/SSRApp";
import zlib from 'zlib'
import indexFile from "./build-prod/index.html";

let rawHtml = indexFile
export const setHtml = (html) => {
    rawHtml = html
}
// MOCK DATA START
import mocker from 'mocker-data-generator'

const user = {
    id: {
        chance: 'integer({"min": 1})'
    },
    firstName: {
        faker: 'name.firstName'
    },
    lastName: {
        faker: 'name.lastName'
    },
    country: {
        faker: 'address.country'
    },
    createdAt: {
        faker: 'date.past'
    },
    description: {
        faker: 'lorem.paragraph'
    }
}

const res = mocker().schema('user', user, 10).buildSync()
const users = res.user
const getList = async () => {
    return users.map((u, index) => ({
        ...u,
        id: index,
        url: `https://picsum.photos/500/500?seed=${u.id}`,
        createdAt: new Date(u.createdAt).toISOString()
    }))
}
// MOCK DATA END


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
    const users = await getList()
    const initData = {users}
    const app = ReactDOMServer.renderToString(<SSRApp url={url} initData={initData}/>);
    const html = rawHtml.replace(
        '<div id="root"></div>',
        `<div id="root">${app}</div>`
    )
        .replace('<scirpt></scirpt>', '<script type="text/javascript">window.__data = JSON.parse(`' + JSON.stringify(initData) + '`);</script>')

    if (!compress) {
        return html
    }
    return await gzip(html)
}
export const edgeHandler = async (event) => {
    console.log('edgeHandler',event)
    try {
        const request = event.Records[0].cf.request;
        const body = await getHtml(request.uri, {compress: true})
        const res = {
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
        console.log('res', res)
        return res
    } catch (error) {
        console.log(`Error ${error.message}`);
        return `Error ${error}`;
    }
};
export const apiHandler = async (event) => {
    console.log('apiHandler')
    try {
        const body = await getHtml(event.path, {compress: false})
        console.log({
            apiHandler: 'apiHandler',
            statusCode: 200,
            headers: {
                "Content-Type": "text/html",
            },
            body,
        })
        return {
            statusCode: 200,
            headers: {
                "Content-Type": "text/html",
            },
            body,
        };
    } catch (error) {
        console.log(`Error ${error.message}`);
        return `Error ${error}`;
    }
};
