import { Response } from 'express'
import { Status, Messages } from '../constants'
import { ResponseEntity } from '../types'

export const setResponse = (
	res: Response,
	{
		responseEntity = { data: null, error: null },
		status = Status.OK,
		contentType = 'application/json',
	}: { responseEntity: ResponseEntity; status: number; contentType?: string },
	cache = false
) => {
	cache
		? res.writeHead(status, {
				'Content-Type': contentType,
				'Cache-Control': 'max-age=31536000',
		  })
		: res.writeHead(status, { 'Content-Type': contentType })
	res.write(JSON.stringify(responseEntity))
	res.end()
}

export const setServerError = (res: Response) => {
	return setResponse(res, {
		responseEntity: {
			data: null,
			error: {
				message: Messages.INTERNAL_SERVER_ERROR_MESSAGE,
			},
		},
		status: Status.INTERVAL_SERVER_ERROR,
	})
}

export const setErrorResponse = (
	res: Response,
	status: number,
	message: string
) => {
	return setResponse(res, {
		responseEntity: {
			data: null,
			error: {
				message,
			},
		},
		status,
	})
}
