import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database.js';
import { AppError } from '../middlewares/errorHandler.js';

// ===== CATEGORÍAS =====

// Obtener categorías de un restaurante
export const getCategories = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;

    const result = await query(
      `SELECT * FROM categories
       WHERE restaurant_id = $1 AND is_active = true
       ORDER BY display_order, name`,
      [restaurantId]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

// Crear categoría
export const createCategory = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;
    const { name, display_order } = req.body;

    const categoryId = uuidv4();

    // Obtener el último orden si no se especifica
    let order = display_order;
    if (order === undefined) {
      const maxOrder = await query(
        'SELECT COALESCE(MAX(display_order), 0) + 1 as next_order FROM categories WHERE restaurant_id = $1',
        [restaurantId]
      );
      order = maxOrder.rows[0].next_order;
    }

    const result = await query(
      `INSERT INTO categories (id, restaurant_id, name, display_order, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, true, NOW(), NOW())
       RETURNING *`,
      [categoryId, restaurantId, name, order]
    );

    res.status(201).json({
      success: true,
      message: 'Categoría creada',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar categoría
export const updateCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const { name, display_order, is_active } = req.body;

    const result = await query(
      `UPDATE categories
       SET name = COALESCE($1, name),
           display_order = COALESCE($2, display_order),
           is_active = COALESCE($3, is_active),
           updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [name, display_order, is_active, categoryId]
    );

    if (result.rows.length === 0) {
      throw new AppError('Categoría no encontrada', 404);
    }

    res.json({
      success: true,
      message: 'Categoría actualizada',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar categoría
export const deleteCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params;

    // Verificar si tiene productos
    const products = await query(
      'SELECT COUNT(*) FROM products WHERE category_id = $1 AND is_available = true',
      [categoryId]
    );

    if (parseInt(products.rows[0].count) > 0) {
      throw new AppError('No se puede eliminar una categoría con productos activos', 400);
    }

    await query(
      'UPDATE categories SET is_active = false, updated_at = NOW() WHERE id = $1',
      [categoryId]
    );

    res.json({
      success: true,
      message: 'Categoría eliminada'
    });
  } catch (error) {
    next(error);
  }
};

// Reordenar categorías
export const reorderCategories = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;
    const { categories } = req.body; // Array de { id, display_order }

    for (const cat of categories) {
      await query(
        'UPDATE categories SET display_order = $1, updated_at = NOW() WHERE id = $2 AND restaurant_id = $3',
        [cat.display_order, cat.id, restaurantId]
      );
    }

    res.json({
      success: true,
      message: 'Categorías reordenadas'
    });
  } catch (error) {
    next(error);
  }
};

// ===== PRODUCTOS =====

// Obtener menú completo (categorías con sus productos)
export const getFullMenu = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;

    // Obtener categorías
    const categories = await query(
      `SELECT * FROM categories
       WHERE restaurant_id = $1 AND is_active = true
       ORDER BY display_order, name`,
      [restaurantId]
    );

    // Obtener productos
    const products = await query(
      `SELECT * FROM products
       WHERE restaurant_id = $1 AND is_available = true
       ORDER BY name`,
      [restaurantId]
    );

    // Agrupar productos por categoría
    const menu = categories.rows.map(category => ({
      ...category,
      products: products.rows.filter(p => p.category_id === category.id)
    }));

    res.json({
      success: true,
      data: menu
    });
  } catch (error) {
    next(error);
  }
};

// Obtener productos de una categoría
export const getProductsByCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params;

    const result = await query(
      `SELECT * FROM products
       WHERE category_id = $1 AND is_available = true
       ORDER BY name`,
      [categoryId]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

// Obtener producto por ID
export const getProductById = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const result = await query(
      `SELECT p.*, c.name as category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = $1`,
      [productId]
    );

    if (result.rows.length === 0) {
      throw new AppError('Producto no encontrado', 404);
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Obtener productos destacados
export const getFeaturedProducts = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;

    const result = await query(
      `SELECT * FROM products
       WHERE restaurant_id = $1 AND is_featured = true AND is_available = true
       ORDER BY name
       LIMIT 10`,
      [restaurantId]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

// Buscar productos
export const searchProducts = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.json({
        success: true,
        data: []
      });
    }

    const result = await query(
      `SELECT p.*, c.name as category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.restaurant_id = $1
       AND p.is_available = true
       AND (p.name ILIKE $2 OR p.description ILIKE $2)
       ORDER BY p.name
       LIMIT 20`,
      [restaurantId, `%${q}%`]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

// Crear producto
export const createProduct = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;
    const {
      category_id, name, description, price,
      image_url, is_featured, tags
    } = req.body;

    const productId = uuidv4();

    const result = await query(
      `INSERT INTO products (
        id, restaurant_id, category_id, name, description, price,
        image_url, is_available, is_featured, tags, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, true, $8, $9, NOW(), NOW())
      RETURNING *`,
      [
        productId, restaurantId, category_id, name, description, price,
        image_url, is_featured || false, JSON.stringify(tags || [])
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Producto creado',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar producto
export const updateProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const updates = req.body;

    const fields = [];
    const values = [];
    let paramCount = 1;

    const allowedFields = [
      'category_id', 'name', 'description', 'price',
      'image_url', 'is_available', 'is_featured', 'tags'
    ];

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        fields.push(`${field} = $${paramCount}`);
        values.push(field === 'tags' ? JSON.stringify(updates[field]) : updates[field]);
        paramCount++;
      }
    }

    if (fields.length === 0) {
      throw new AppError('No hay campos para actualizar', 400);
    }

    fields.push('updated_at = NOW()');
    values.push(productId);

    const result = await query(
      `UPDATE products SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      throw new AppError('Producto no encontrado', 404);
    }

    res.json({
      success: true,
      message: 'Producto actualizado',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar producto
export const deleteProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;

    await query(
      'UPDATE products SET is_available = false, updated_at = NOW() WHERE id = $1',
      [productId]
    );

    res.json({
      success: true,
      message: 'Producto eliminado'
    });
  } catch (error) {
    next(error);
  }
};

// Toggle disponibilidad
export const toggleProductAvailability = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const result = await query(
      `UPDATE products
       SET is_available = NOT is_available, updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [productId]
    );

    res.json({
      success: true,
      message: result.rows[0].is_available ? 'Producto disponible' : 'Producto no disponible',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Toggle destacado
export const toggleProductFeatured = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const result = await query(
      `UPDATE products
       SET is_featured = NOT is_featured, updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [productId]
    );

    res.json({
      success: true,
      message: result.rows[0].is_featured ? 'Producto destacado' : 'Producto no destacado',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};
