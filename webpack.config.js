const path = require("path");
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
module.exports = {
    entry: {
        index:'./src/index.js',
        /*bundle: [
            "webpack/hot/dev-server",
            (`${__dirname}/src/index.js`)
        ]*/
    },
    output: {
        filename:'[name].js',
        path: path.resolve(__dirname,'./dist'),
        publicPath: '/dist'
    },
    devServer:{
        port: 8080,
        overlay: true,
    },
    watch: true,
    module: {
        rules: [

            {
                test:/\.scss$/,
                use:[
                    MiniCssExtractPlugin.loader,
                    "css-loader",
                    {
                        loader: 'postcss-loader',
                        options: {
                            plugins: [

                            ],
                            sourceMap: true
                        }
                    },
                    "sass-loader",

                ]
            },
            {
                test:/\.css$/,
                use:[
                    MiniCssExtractPlugin.loader,
                    "css-loader"
                ]
            },
            {
                test:  /\.(jpe?g|png|gif|svg)$/i,
                loader: 'file-loader',
                options: {
                    name: 'img/[name].[ext]',
                    publicPath: './'
                },
            },

        ],

    },
    plugins: [
        new BrowserSyncPlugin({
            host: 'localhost',
            port: 3000,
            files:['*.html','src/style.scss'],
            // server: { baseDir: ['dist'] },
            proxy: 'http://localhost:8080/'
        }),
        new MiniCssExtractPlugin({
            filename: "[name].css",
        }),
    ],

};