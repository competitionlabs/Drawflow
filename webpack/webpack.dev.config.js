const path = require('path');

module.exports = {
	entry: {
		'drawflow.js': [
			'./src/javascript/drawflow.js',
			'./src/scss/style.scss'
		]
	},
	output: {
		filename: '[name]',
		path: path.resolve(__dirname, '../dist/javascript')
	},
	mode: 'development',
	devtool: 'inline-source-map',
	devServer: {
		open: true,
		port: 9001,
		contentBase: path.join(__dirname, '/..'),
		openPage: 'example/index.html',
		writeToDisk: true
	},
	optimization: {
		minimize: false
	},
	watch: true,
	watchOptions: {
		aggregateTimeout: 600
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /(node_modules|tests)/,
				use: ['babel-loader']
			},
			{
				test: /\.scss$/i,
				use: [
						{
							loader: 'file-loader',
							options: {
								name: '../css/[name].css'
							}
						},
						'sass-loader'
					]
			},
			{
				test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
				loader: 'svg-url-loader',
				query: {
					limit: 8192,
					mimetype: 'application/svg+xml'
				}
			},
			{
				test: /\.(png|jpg)$/,
				loader: 'url-loader',
				query: {
					limit: 8192
				}
			},
		]
	},
	plugins: []
};
