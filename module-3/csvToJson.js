const fs = require('fs')
const path = require('path')
const csvtojson = require('csvtojson')

const csvFilePath = path.join('./module-3/csvDirectory.csv')
const txtFilePath = path.join('./module-3/csvDirectory.txt')

const readStream = fs.createReadStream(csvFilePath)
const writeStream = fs.createWriteStream(txtFilePath)

readStream.on('error', (err) => {
	console.error(`Error reading file: ${err}`)
})

writeStream.on('error', (err) => {
	console.error(`Error writing file: ${err}`)
})

csvtojson()
	.fromStream(readStream)
	.subscribe(
		(jsonObj) => {
			const txtLine = `{"Book": "${jsonObj.Book}", "Author": "${jsonObj.Author}", "Price": ${jsonObj.Price}}\n`
			writeStream.write(txtLine)
		},
		(err) => {
			console.error(`Error converting CSV to JSON: ${err}`)
		},
		() => {
			console.log('CSV converted to JSON and written to file successfully')
		}
	)
