import { merge } from 'webpack-merge'
import common from './common'
import webpack from 'webpack'

const config: webpack.Configuration = merge(common, {
    mode: 'development',
    devtool: 'inline-source-map',
    output: {
        publicPath: '/'
    },
    devServer: {
        historyApiFallback: true,
        host: '127.0.0.1',
        port: 8080,
        open: true,
        hot: true
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader']
            }
        ]
    }
})

export default config
