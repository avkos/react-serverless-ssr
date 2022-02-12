const webpack = require('webpack');
const path = require('path');
require('dotenv').config()
const clientManifest = require('./build/asset-manifest.json'); // reactapp generated assets mappings after client build


module.exports = {

    entry: "./ssr.js",
    target: "node",

    externals: [],

    output: {
        path: path.resolve("build-ssr"),
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
                            publicPath: url => console.log(url) || url, // override the default publicPath to return the file utl as it's
                            emitFile: false, // don't emit assets, just use them as it is from the client build
                            name(resourcePath) {
                                console.log('!!!!!',resourcePath)
                                const filename = path.basename(resourcePath); // get file name from the path
                                console.log('filename',filename)
                                console.log(clientManifest.files)
                                const absolutePath = clientManifest.files[`static/media/${filename}`]; // load the current file url from client generated paths
                                console.log('absolutePath',absolutePath)
                                return absolutePath;
                            },
                        },
                    },
                ],
            },
            {
                test: /\.(scss|css)$/,
                use: 'ignore-loader', // ignore loader for css and scss because they are handled in the client build
            },
            {
                test: /\.html$/i,
                loader: "html-loader",
                options: {
                    // Disables attributes processing
                    sources: false,
                },
            }
        ],
    },
    plugins: [
        new webpack.DefinePlugin({
            PUBLIC_URL: JSON.stringify(process.env.PUBLIC_URL),
        })
    ]
}