const webpack = require('webpack');
const path = require('path');
require('dotenv').config()
const clientManifest = require('./build-prod/asset-manifest.json'); // reactapp generated assets mappings after client build

const isLocal = !process.env.PUBLIC_URL
console.log('process.env.PUBLIC_URL',process.env.PUBLIC_URL)
module.exports = {

    entry: isLocal ? "./ssr-local.js" : "./ssr.js",
    target: "node",
    externals: [],

    output: {
        path: path.resolve(isLocal ? "build-ssr-local" : "build-ssr"),
        filename: 'ssr.js',
        library: "index",
        libraryTarget: 'umd',
    },

    module: {
        rules: [
            {
                test: /\.(js|jsx|mjs)$/,
                use: 'babel-loader',
            },
            {
                test: /\.(svg|jpeg|jpg|gif|png)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            publicPath: url => url, // override the default publicPath to return the file utl as it's
                            emitFile: false, // don't emit assets, just use them as it is from the client build
                            name(resourcePath) {
                                const filename = path.basename(resourcePath); // get file name from the path
                                return clientManifest.files[`static/media/${filename}`]; // load the current file url from client generated paths
                            },
                        },
                    },
                ],
            },
            {
                test: /\.html$/i,
                loader: "html-loader",
                options: {
                    // Disables attributes processing
                    sources: false,
                },
            },
            {
                test: /\.(scss|css|md)$/,
                use: 'ignore-loader', // ignore loader for css and scss because they are handled in the client build
            },
        ],
    },
    plugins: [
        new webpack.DefinePlugin({
            PUBLIC_URL: JSON.stringify(process.env.PUBLIC_URL),
        })
    ]
}