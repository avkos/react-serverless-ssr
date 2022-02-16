import React from "react";
import ReactDOMServer from "react-dom/server";
import {SSRApp} from "./src/SSRApp";
import indexFile from "./build/index.html";
import zlib from 'zlib'


// MOCK DATA START
import mocker from 'mocker-data-generator'
const user = {
    id:{
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
    // username: {
    //     function: function() {
    //         return (
    //             this.object.lastName.substring(0, 5) +
    //             this.object.firstName.substring(0, 3) +
    //             Math.floor(Math.random() * 10)
    //         )
    //     }
    // }
}

const res = mocker().schema('user', user, 10).buildSync()
const users=res.user
const getList = async ()=>{
    return users.map(u=>({
        ...u,
        createdAt:new Date(u.createdAt).toISOString()
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
    const html = indexFile.replace(
        '<div id="root"></div>',
        `<div id="root">${app}</div>`
    ).replace('<scirpt></scirpt>','<script type="text/javascript">window.__data = JSON.parse(`'+JSON.stringify(initData)+'`);</script>')

    if (!compress) {
        return html
    }
    return await gzip(html)
}
export const edgeHandler = async (event) => {
    try {
        const request = event.Records[0].cf.request;
        const body = await getHtml(request.uri, {compress: true})
        return {
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
    } catch (error) {
        console.log(`Error ${error.message}`);
        return `Error ${error}`;
    }
};
export const apiHandler = async (event) => {
    try {
        const body = await getHtml(event.path, {compress: false})
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
