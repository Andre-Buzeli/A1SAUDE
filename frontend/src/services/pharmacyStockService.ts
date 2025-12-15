import api from './api';

export interface PharmacyProduct {
  id: string;
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
  isControlled: boolean;
  controlType?: string;
  requiresPrescription: boolean;
  minStock: number;
  maxStock?: number;
  currentStock: number;
  reservedStock: number;
  storageLocation?: string;
  storageConditions?: string;
  isActive: boolean;
  batches?: ProductBatch[];
}

export interface ProductBatch {
  id: string;
  productId: string;
  batchNumber: string;
  expirationDate: string;
  manufacturingDate?: string;
  quantity: number;
  currentQuantity: number;
  unitCost?: number;
  supplier?: string;
  invoiceNumber?: string;
  receivedAt: string;
  receivedBy?: string;
  status: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  establishmentId: string;
  movementType: string;
  quantity: number;
  previousStock: number;
  newStock: number;
  batchNumber?: string;
  unitCost?: number;
  totalCost?: number;
  referenceType?: string;
  referenceId?: string;
  destinationUnit?: string;
  sourceUnit?: string;
  patientId?: string;
  reason?: string;
  performedBy: string;
  performedAt: string;
  notes?: string;
  product?: PharmacyProduct;
}

export const pharmacyStockService = {
  async getDashboard(establishmentId: string) {
    const response = await api.get(`/pharmacy-stock/dashboard?establishmentId=${establishmentId}`);
    return response.data;
  },

  async getAlerts(establishmentId: string) {
    const response = await api.get(`/pharmacy-stock/alerts?establishmentId=${establishmentId}`);
    return response.data;
  },

  async getLowStock(establishmentId: string) {
    const response = await api.get(`/pharmacy-stock/low-stock?establishmentId=${establishmentId}`);
    return response.data;
  },

  async getExpiringBatches(establishmentId: string, daysAhead?: number) {
    const params = new URLSearchParams({ establishmentId });
    if (daysAhead) params.append('daysAhead', String(daysAhead));
    const response = await api.get(`/pharmacy-stock/expiring?${params.toString()}`);
    return response.data;
  },

  // Products
  async listProducts(params: {
    establishmentId: string;
    category?: string;
    isControlled?: boolean;
    lowStock?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) searchParams.append(key, String(value));
    });
    const response = await api.get(`/pharmacy-stock/products?${searchParams.toString()}`);
    return response.data;
  },

  async getProductById(id: string) {
    const response = await api.get(`/pharmacy-stock/products/${id}`);
    return response.data;
  },

  async createProduct(data: Partial<PharmacyProduct>) {
    const response = await api.post('/pharmacy-stock/products', data);
    return response.data;
  },

  async updateProduct(id: string, data: Partial<PharmacyProduct>) {
    const response = await api.put(`/pharmacy-stock/products/${id}`, data);
    return response.data;
  },

  async deleteProduct(id: string) {
    const response = await api.delete(`/pharmacy-stock/products/${id}`);
    return response.data;
  },

  // Batches
  async getBatches(productId: string) {
    const response = await api.get(`/pharmacy-stock/products/${productId}/batches`);
    return response.data;
  },

  async addBatch(productId: string, data: Partial<ProductBatch> & { receivedBy: string }) {
    const response = await api.post(`/pharmacy-stock/products/${productId}/batches`, data);
    return response.data;
  },

  // Movements
  async listMovements(params: {
    establishmentId: string;
    productId?: string;
    movementType?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) searchParams.append(key, String(value));
    });
    const response = await api.get(`/pharmacy-stock/movements?${searchParams.toString()}`);
    return response.data;
  },

  async createMovement(data: Partial<StockMovement>) {
    const response = await api.post('/pharmacy-stock/movements', data);
    return response.data;
  },

  async dispense(data: {
    productId: string;
    establishmentId: string;
    quantity: number;
    patientId: string;
    prescriptionId?: string;
    performedBy: string;
    notes?: string;
  }) {
    const response = await api.post('/pharmacy-stock/dispense', data);
    return response.data;
  }
};

