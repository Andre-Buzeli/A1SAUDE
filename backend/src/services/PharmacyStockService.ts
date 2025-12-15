import { prisma } from '../server';

export class PharmacyStockService {
  
  // ============================================================================
  // PRODUCT MANAGEMENT
  // ============================================================================
  
  async createProduct(data: {
    establishmentId: string;
    code: string;
    barcode?: string;
    name: string;
    genericName?: string;
    manufacturer?: string;
    category: string;
    subcategory?: string;
    therapeuticClass?: string;
    presentation: string;
    concentration?: string;
    unit: string;
    isControlled?: boolean;
    controlType?: string;
    requiresPrescription?: boolean;
    minStock?: number;
    maxStock?: number;
    storageLocation?: string;
    storageConditions?: string;
  }) {
    return prisma.pharmacyProduct.create({
      data: {
        ...data,
        currentStock: 0,
        reservedStock: 0,
        isActive: true
      }
    });
  }

  async getProductById(id: string) {
    return prisma.pharmacyProduct.findUnique({
      where: { id },
      include: {
        batches: {
          where: { status: 'active' },
          orderBy: { expirationDate: 'asc' }
        },
        _count: {
          select: { stockMovements: true }
        }
      }
    });
  }

  async updateProduct(id: string, data: Partial<{
    code: string;
    barcode: string;
    name: string;
    genericName: string;
    manufacturer: string;
    category: string;
    subcategory: string;
    therapeuticClass: string;
    presentation: string;
    concentration: string;
    unit: string;
    isControlled: boolean;
    controlType: string;
    requiresPrescription: boolean;
    minStock: number;
    maxStock: number;
    storageLocation: string;
    storageConditions: string;
    isActive: boolean;
  }>) {
    return prisma.pharmacyProduct.update({
      where: { id },
      data
    });
  }

  async deleteProduct(id: string) {
    return prisma.pharmacyProduct.update({
      where: { id },
      data: { isActive: false }
    });
  }

  async listProducts(params: {
    establishmentId: string;
    category?: string;
    isControlled?: boolean;
    lowStock?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { establishmentId, category, isControlled, lowStock, search, page = 1, limit = 20 } = params;
    
    const where: any = { establishmentId, isActive: true };
    
    if (category) where.category = category;
    if (isControlled !== undefined) where.isControlled = isControlled;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { genericName: { contains: search } },
        { code: { contains: search } }
      ];
    }

    let items = await prisma.pharmacyProduct.findMany({
      where,
      include: {
        batches: {
          where: { status: 'active' },
          orderBy: { expirationDate: 'asc' },
          take: 1
        }
      },
      orderBy: { name: 'asc' },
      skip: (page - 1) * limit,
      take: limit
    });

    if (lowStock) {
      items = items.filter(p => p.currentStock <= p.minStock);
    }

    const total = await prisma.pharmacyProduct.count({ where });

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  // ============================================================================
  // BATCH MANAGEMENT
  // ============================================================================

  async addBatch(data: {
    productId: string;
    batchNumber: string;
    expirationDate: Date;
    manufacturingDate?: Date;
    quantity: number;
    unitCost?: number;
    supplier?: string;
    invoiceNumber?: string;
    receivedBy: string;
  }) {
    const batch = await prisma.productBatch.create({
      data: {
        ...data,
        currentQuantity: data.quantity,
        status: 'active'
      }
    });

    // Update product stock
    await prisma.pharmacyProduct.update({
      where: { id: data.productId },
      data: {
        currentStock: { increment: data.quantity }
      }
    });

    // Create stock movement
    const product = await prisma.pharmacyProduct.findUnique({
      where: { id: data.productId },
      select: { currentStock: true, establishmentId: true }
    });

    await prisma.stockMovement.create({
      data: {
        productId: data.productId,
        establishmentId: product!.establishmentId,
        movementType: 'entry',
        quantity: data.quantity,
        previousStock: product!.currentStock - data.quantity,
        newStock: product!.currentStock,
        batchNumber: data.batchNumber,
        unitCost: data.unitCost,
        totalCost: data.unitCost ? data.unitCost * data.quantity : null,
        referenceType: 'purchase',
        performedBy: data.receivedBy,
        reason: `Entrada de lote ${data.batchNumber}`
      }
    });

    return batch;
  }

  async getBatches(productId: string) {
    return prisma.productBatch.findMany({
      where: { productId },
      orderBy: { expirationDate: 'asc' }
    });
  }

  async getExpiringBatches(establishmentId: string, daysAhead: number = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    return prisma.productBatch.findMany({
      where: {
        product: { establishmentId },
        status: 'active',
        expirationDate: { lte: futureDate },
        currentQuantity: { gt: 0 }
      },
      include: {
        product: {
          select: { id: true, name: true, code: true }
        }
      },
      orderBy: { expirationDate: 'asc' }
    });
  }

  // ============================================================================
  // STOCK MOVEMENTS
  // ============================================================================

  async createMovement(data: {
    productId: string;
    establishmentId: string;
    movementType: string;
    quantity: number;
    batchNumber?: string;
    unitCost?: number;
    referenceType?: string;
    referenceId?: string;
    destinationUnit?: string;
    sourceUnit?: string;
    patientId?: string;
    reason?: string;
    performedBy: string;
    notes?: string;
  }) {
    const product = await prisma.pharmacyProduct.findUnique({
      where: { id: data.productId },
      select: { currentStock: true }
    });

    if (!product) throw new Error('Produto não encontrado');

    const previousStock = product.currentStock;
    let newStock = previousStock;

    if (['entry', 'return'].includes(data.movementType)) {
      newStock = previousStock + data.quantity;
    } else if (['exit', 'loss', 'transfer'].includes(data.movementType)) {
      if (previousStock < data.quantity) {
        throw new Error('Estoque insuficiente');
      }
      newStock = previousStock - data.quantity;
    } else if (data.movementType === 'adjustment') {
      newStock = data.quantity; // Direct adjustment
    }

    // Update product stock
    await prisma.pharmacyProduct.update({
      where: { id: data.productId },
      data: { currentStock: newStock }
    });

    // Update batch if specified
    if (data.batchNumber && ['exit', 'loss', 'transfer'].includes(data.movementType)) {
      await prisma.productBatch.updateMany({
        where: { productId: data.productId, batchNumber: data.batchNumber },
        data: { currentQuantity: { decrement: data.quantity } }
      });
    }

    // Create movement record
    return prisma.stockMovement.create({
      data: {
        ...data,
        previousStock,
        newStock,
        totalCost: data.unitCost ? data.unitCost * data.quantity : null
      }
    });
  }

  async getMovements(params: {
    establishmentId: string;
    productId?: string;
    movementType?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }) {
    const { establishmentId, productId, movementType, startDate, endDate, page = 1, limit = 20 } = params;
    
    const where: any = { establishmentId };
    
    if (productId) where.productId = productId;
    if (movementType) where.movementType = movementType;
    if (startDate || endDate) {
      where.performedAt = {};
      if (startDate) where.performedAt.gte = startDate;
      if (endDate) where.performedAt.lte = endDate;
    }

    const [items, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        include: {
          product: {
            select: { id: true, name: true, code: true }
          }
        },
        orderBy: { performedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.stockMovement.count({ where })
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  // ============================================================================
  // DISPENSATION
  // ============================================================================

  async dispense(data: {
    productId: string;
    establishmentId: string;
    quantity: number;
    patientId: string;
    prescriptionId?: string;
    performedBy: string;
    notes?: string;
  }) {
    // Get FIFO batch
    const batch = await prisma.productBatch.findFirst({
      where: {
        productId: data.productId,
        status: 'active',
        currentQuantity: { gte: data.quantity }
      },
      orderBy: { expirationDate: 'asc' }
    });

    if (!batch) throw new Error('Lote disponível não encontrado');

    return this.createMovement({
      ...data,
      movementType: 'exit',
      batchNumber: batch.batchNumber,
      referenceType: 'dispensation',
      referenceId: data.prescriptionId,
      reason: 'Dispensação para paciente'
    });
  }

  // ============================================================================
  // ALERTS
  // ============================================================================

  async getLowStockAlerts(establishmentId: string) {
    return prisma.pharmacyProduct.findMany({
      where: {
        establishmentId,
        isActive: true,
        currentStock: { lte: prisma.pharmacyProduct.fields.minStock }
      },
      orderBy: { currentStock: 'asc' }
    });
  }

  async getStockAlerts(establishmentId: string) {
    const [lowStock, expiring, expired] = await Promise.all([
      prisma.pharmacyProduct.count({
        where: {
          establishmentId,
          isActive: true,
          currentStock: { lte: 10 } // Simplified check
        }
      }),
      this.getExpiringBatches(establishmentId, 30).then(b => b.length),
      prisma.productBatch.count({
        where: {
          product: { establishmentId },
          status: 'active',
          expirationDate: { lt: new Date() }
        }
      })
    ]);

    return { lowStock, expiring, expired };
  }

  // ============================================================================
  // DASHBOARD STATS
  // ============================================================================

  async getDashboardStats(establishmentId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      totalProducts,
      totalValue,
      todayMovements,
      monthDispensations,
      alerts,
      byCategory
    ] = await Promise.all([
      prisma.pharmacyProduct.count({
        where: { establishmentId, isActive: true }
      }),
      prisma.pharmacyProduct.aggregate({
        where: { establishmentId, isActive: true },
        _sum: { currentStock: true }
      }),
      prisma.stockMovement.count({
        where: { establishmentId, performedAt: { gte: today, lt: tomorrow } }
      }),
      prisma.stockMovement.count({
        where: {
          establishmentId,
          movementType: 'exit',
          referenceType: 'dispensation',
          performedAt: { gte: startOfMonth }
        }
      }),
      this.getStockAlerts(establishmentId),
      prisma.pharmacyProduct.groupBy({
        by: ['category'],
        where: { establishmentId, isActive: true },
        _count: true,
        _sum: { currentStock: true }
      })
    ]);

    return {
      totalProducts,
      totalItems: totalValue._sum.currentStock || 0,
      todayMovements,
      monthDispensations,
      alerts,
      byCategory: byCategory.map(c => ({
        category: c.category,
        count: c._count,
        stock: c._sum.currentStock || 0
      }))
    };
  }
}

export const pharmacyStockService = new PharmacyStockService();

