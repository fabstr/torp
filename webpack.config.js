const path = require('path');
const { optimize } = require('webpack');
module.exports = {
    entry: './src/main.ts',
    output: {
        filename: 'torp.js',
        path: path.resolve(__dirname, 'dist'),
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    devServer: {
        contentBase: './dist',
        port: 8000
    },
};