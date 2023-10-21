import products from '../db/products.json'
import { Product } from '../entities'

const getProducts = (): Product[] => {
	try {
		return products
	} catch (error) {
		console.error(`Error reading products data: ${error}`)

		return []
	}
}

const getProductById = (id: string): Product => {
	const productList: Product[] = getProducts()

	return productList.find((product) => product.id === id)
}

export const productRepository = { getProducts, getProductById }
