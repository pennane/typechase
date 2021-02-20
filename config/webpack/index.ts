import webpack from 'webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import processConfig from '../process'

const config: webpack.Configuration = {
    mode: 'development',
    output: {
        publicPath: '/'
    },
    entry: './src/app/index.tsx',
    module: {
        rules: [
            {
                test: /\.(ts|js)x?$/i,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript'],
                        plugins: ['@babel/plugin-transform-runtime']
                    }
                }
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader']
            }
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'src/app/index.html'
        }),
        new webpack.HotModuleReplacementPlugin()
    ],
    devtool: 'inline-source-map',
    devServer: {
        historyApiFallback: true,
<<<<<<< HEAD
        port: 3000,
=======
        host: '0.0.0.0',
        port: processConfig.ports.app,
>>>>>>> react
        open: true,
        hot: true
    }
}

export default config
