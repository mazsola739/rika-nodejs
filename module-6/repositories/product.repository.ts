import { ProductEntity } from '../entities/product.entity'
import products from '../db/products.json'

const getProducts = (): ProductEntity[] => {
	try {
		return products
	} catch (error) {
		console.error(`Error reading products data: ${error}`)

		return []
	}
}

const getProductById = (id: string): ProductEntity => {
	const productList: ProductEntity[] = getProducts()

	return productList.find((product) => product.id === id)
}

export const productRepository = { getProducts, getProductById }
