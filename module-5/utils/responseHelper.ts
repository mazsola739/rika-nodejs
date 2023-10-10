export const setResponse = (
	res,
	{ data = {}, status = 200, contentType = 'application/json' },
	cache = false
) => {
	cache
		? res.writeHead(status, {
				'Content-Type': contentType,
				'Cache-Control': 'max-age=31536000',
		  })
		: res.writeHead(status, { 'Content-Type': contentType })
	res.write(JSON.stringify(data))
	res.end()
}

export const setOptionsResponse = (
	res,
	{ status = 204, options = 'OPTIONS, GET' }
) => {
	res.writeHead(status, {
		Allow: options,
		'Cache-Control': 'max-age=31536000',
	})
	res.end()
}
