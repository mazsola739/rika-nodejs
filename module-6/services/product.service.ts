import { productRepository } from '../repositories'

export const getProducts = () => {
	return productRepository.getProducts()
}

export const getProductById = (id: string) => {
	return productRepository.getProductById(id)
}

export const productService = {
	getProducts,
	getProductById,
}
