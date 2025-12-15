import { Router } from 'express';
import { pharmacyStockService } from '../services/PharmacyStockService';

const router = Router();

// Dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const { establishmentId } = req.query;
    if (!establishmentId) {
      return res.status(400).json({ success: false, error: { message: 'establishmentId é obrigatório' } });
    }
    const stats = await pharmacyStockService.getDashboardStats(establishmentId as string);
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error getting pharmacy stock dashboard:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Get alerts
router.get('/alerts', async (req, res) => {
  try {
    const { establishmentId } = req.query;
    if (!establishmentId) {
      return res.status(400).json({ success: false, error: { message: 'establishmentId é obrigatório' } });
    }
    const alerts = await pharmacyStockService.getStockAlerts(establishmentId as string);
    res.json({ success: true, data: alerts });
  } catch (error) {
    console.error('Error getting stock alerts:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Get low stock items
router.get('/low-stock', async (req, res) => {
  try {
    const { establishmentId } = req.query;
    if (!establishmentId) {
      return res.status(400).json({ success: false, error: { message: 'establishmentId é obrigatório' } });
    }
    const items = await pharmacyStockService.getLowStockAlerts(establishmentId as string);
    res.json({ success: true, data: items });
  } catch (error) {
    console.error('Error getting low stock items:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Get expiring batches
router.get('/expiring', async (req, res) => {
  try {
    const { establishmentId, daysAhead } = req.query;
    if (!establishmentId) {
      return res.status(400).json({ success: false, error: { message: 'establishmentId é obrigatório' } });
    }
    const batches = await pharmacyStockService.getExpiringBatches(
      establishmentId as string,
      daysAhead ? parseInt(daysAhead as string) : 30
    );
    res.json({ success: true, data: batches });
  } catch (error) {
    console.error('Error getting expiring batches:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// ============================================================================
// PRODUCTS
// ============================================================================

// List products
router.get('/products', async (req, res) => {
  try {
    const { establishmentId, category, isControlled, lowStock, search, page, limit } = req.query;
    if (!establishmentId) {
      return res.status(400).json({ success: false, error: { message: 'establishmentId é obrigatório' } });
    }
    const result = await pharmacyStockService.listProducts({
      establishmentId: establishmentId as string,
      category: category as string,
      isControlled: isControlled === 'true' ? true : isControlled === 'false' ? false : undefined,
      lowStock: lowStock === 'true',
      search: search as string,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 20
    });
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Error listing products:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Get product by ID
router.get('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const product = await pharmacyStockService.getProductById(id);
    if (!product) {
      return res.status(404).json({ success: false, error: { message: 'Produto não encontrado' } });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    console.error('Error getting product:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Create product
router.post('/products', async (req, res) => {
  try {
    const product = await pharmacyStockService.createProduct(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Update product
router.put('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const product = await pharmacyStockService.updateProduct(id, req.body);
    res.json({ success: true, data: product });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Delete product
router.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pharmacyStockService.deleteProduct(id);
    res.json({ success: true, message: 'Produto desativado com sucesso' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// ============================================================================
// BATCHES
// ============================================================================

// Get product batches
router.get('/products/:id/batches', async (req, res) => {
  try {
    const { id } = req.params;
    const batches = await pharmacyStockService.getBatches(id);
    res.json({ success: true, data: batches });
  } catch (error) {
    console.error('Error getting batches:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Add batch
router.post('/products/:id/batches', async (req, res) => {
  try {
    const { id } = req.params;
    const batch = await pharmacyStockService.addBatch({ ...req.body, productId: id });
    res.status(201).json({ success: true, data: batch });
  } catch (error) {
    console.error('Error adding batch:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// ============================================================================
// MOVEMENTS
// ============================================================================

// List movements
router.get('/movements', async (req, res) => {
  try {
    const { establishmentId, productId, movementType, startDate, endDate, page, limit } = req.query;
    if (!establishmentId) {
      return res.status(400).json({ success: false, error: { message: 'establishmentId é obrigatório' } });
    }
    const result = await pharmacyStockService.getMovements({
      establishmentId: establishmentId as string,
      productId: productId as string,
      movementType: movementType as string,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 20
    });
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Error listing movements:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Create movement
router.post('/movements', async (req, res) => {
  try {
    const movement = await pharmacyStockService.createMovement(req.body);
    res.status(201).json({ success: true, data: movement });
  } catch (error: any) {
    console.error('Error creating movement:', error);
    if (error.message === 'Estoque insuficiente') {
      return res.status(400).json({ success: false, error: { message: error.message } });
    }
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Dispense medication
router.post('/dispense', async (req, res) => {
  try {
    const movement = await pharmacyStockService.dispense(req.body);
    res.status(201).json({ success: true, data: movement });
  } catch (error: any) {
    console.error('Error dispensing medication:', error);
    if (error.message === 'Estoque insuficiente' || error.message === 'Lote disponível não encontrado') {
      return res.status(400).json({ success: false, error: { message: error.message } });
    }
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

export default router;

