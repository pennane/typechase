import { merge } from 'webpack-merge'
import common from './common'
import webpack from 'webpack'
import processConfig from '../process'

const config: webpack.Configuration = merge(common, {
    mode: 'development',
    devtool: 'inline-source-map',
    output: {
        publicPath: '/'
    },
    devServer: {
        historyApiFallback: true,
        host: '0.0.0.0',
        port: processConfig.ports.app,
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
