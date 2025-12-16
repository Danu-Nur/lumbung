
import { FastifyInstance } from 'fastify';
import { getCategoriesHandler, getWarehousesHandler, getSuppliersHandler } from '../controllers/master.js';
import { createCategoryHandler, updateCategoryHandler, deleteCategoryHandler } from '../controllers/category.js';
import { createSupplierHandler, updateSupplierHandler, deleteSupplierHandler } from '../controllers/supplier.js';
import { createWarehouseHandler, updateWarehouseHandler, deleteWarehouseHandler } from '../controllers/warehouse.js';

export async function masterRoutes(fastify: FastifyInstance) {
    fastify.addHook('onRequest', fastify.authenticate);

    // Categories
    fastify.get('/categories', getCategoriesHandler);
    fastify.post('/categories', createCategoryHandler);
    fastify.put('/categories/:id', updateCategoryHandler);
    fastify.delete('/categories/:id', deleteCategoryHandler);

    // Warehouses
    fastify.get('/warehouses', getWarehousesHandler);
    fastify.post('/warehouses', createWarehouseHandler);
    fastify.put('/warehouses/:id', updateWarehouseHandler);
    fastify.delete('/warehouses/:id', deleteWarehouseHandler);

    // Suppliers
    fastify.get('/suppliers', getSuppliersHandler);
    fastify.post('/suppliers', createSupplierHandler);
    fastify.put('/suppliers/:id', updateSupplierHandler);
    fastify.delete('/suppliers/:id', deleteSupplierHandler);
}
