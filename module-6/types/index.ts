export type ResponseEntity = {
	data: any
	error: null | ErrorResponse
}

export type ErrorResponse = {
	message: string
}

export type EmptySuccessResponse = {
	data: {
		success: boolean
	}
	error: null | ErrorResponse
}
