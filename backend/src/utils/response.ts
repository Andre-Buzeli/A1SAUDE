import { Response } from 'express';
import { ApiResponse, PaginatedResponse } from '../types/auth.types';

export class ResponseUtils {
  /**
   * Resposta de sucesso
   */
  static success<T>(
    res: Response,
    data?: T,
    message?: string,
    statusCode: number = 200
  ): Response<ApiResponse<T>> {
    return res.status(statusCode).json({
      success: true,
      data,
      message,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Resposta de erro
   */
  static error(
    res: Response,
    message: string,
    errors?: string[],
    statusCode: number = 400
  ): Response<ApiResponse> {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Resposta paginada
   */
  static paginated<T>(
    res: Response,
    data: T[],
    page: number,
    limit: number,
    total: number,
    message?: string
  ): Response<PaginatedResponse<T>> {
    const totalPages = Math.ceil(total / limit);
    
    return res.status(200).json({
      success: true,
      data,
      message,
      pagination: {
        page,
        limit,
        total,
        totalPages
      },
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Resposta de criação
   */
  static created<T>(
    res: Response,
    data: T,
    message: string = 'Recurso criado com sucesso'
  ): Response<ApiResponse<T>> {
    return this.success(res, data, message, 201);
  }

  /**
   * Resposta de não encontrado
   */
  static notFound(
    res: Response,
    message: string = 'Recurso não encontrado'
  ): Response<ApiResponse> {
    return this.error(res, message, undefined, 404);
  }

  /**
   * Resposta de não autorizado
   */
  static unauthorized(
    res: Response,
    message: string = 'Não autorizado'
  ): Response<ApiResponse> {
    return this.error(res, message, undefined, 401);
  }

  /**
   * Resposta de proibido
   */
  static forbidden(
    res: Response,
    message: string = 'Acesso negado'
  ): Response<ApiResponse> {
    return this.error(res, message, undefined, 403);
  }

  /**
   * Resposta de conflito
   */
  static conflict(
    res: Response,
    message: string = 'Conflito de dados'
  ): Response<ApiResponse> {
    return this.error(res, message, undefined, 409);
  }

  /**
   * Resposta de validação
   */
  static validation(
    res: Response,
    errors: string[],
    message: string = 'Dados inválidos'
  ): Response<ApiResponse> {
    return this.error(res, message, errors, 422);
  }

  /**
   * Resposta de erro interno
   */
  static internalError(
    res: Response,
    message: string = 'Erro interno do servidor'
  ): Response<ApiResponse> {
    return this.error(res, message, undefined, 500);
  }

  /**
   * Resposta de rate limit
   */
  static rateLimitExceeded(
    res: Response,
    message: string = 'Muitas tentativas. Tente novamente mais tarde.'
  ): Response<ApiResponse> {
    return this.error(res, message, undefined, 429);
  }

  /**
   * Resposta de manutenção
   */
  static maintenance(
    res: Response,
    message: string = 'Sistema em manutenção'
  ): Response<ApiResponse> {
    return this.error(res, message, undefined, 503);
  }

  /**
   * Resposta sem conteúdo
   */
  static noContent(res: Response): Response {
    return res.status(204).send();
  }

  /**
   * Resposta de redirecionamento
   */
  static redirect(res: Response, url: string): void {
    res.status(302).redirect(url);
  }
}

/**
 * Middleware para capturar erros não tratados
 */
export const errorHandler = (
  error: any,
  req: any,
  res: Response,
  next: any
): Response<ApiResponse> => {
  console.error('Erro não tratado:', error);

  // Erro de validação do Zod
  if (error.name === 'ZodError') {
    const errors = error.errors.map((err: any) => 
      `${err.path.join('.')}: ${err.message}`
    );
    return ResponseUtils.validation(res, errors);
  }

  // Erro de JWT
  if (error.name === 'JsonWebTokenError') {
    return ResponseUtils.unauthorized(res, 'Token inválido');
  }

  if (error.name === 'TokenExpiredError') {
    return ResponseUtils.unauthorized(res, 'Token expirado');
  }

  // Erro do Prisma
  if (error.code === 'P2002') {
    return ResponseUtils.conflict(res, 'Dados já existem no sistema');
  }

  if (error.code === 'P2025') {
    return ResponseUtils.notFound(res, 'Registro não encontrado');
  }

  // Erro de sintaxe JSON
  if (error.type === 'entity.parse.failed') {
    return ResponseUtils.validation(res, ['JSON inválido']);
  }

  // Erro genérico
  return ResponseUtils.internalError(res);
};

/**
 * Middleware para rotas não encontradas
 */
export const notFoundHandler = (req: any, res: Response): Response<ApiResponse> => {
  return ResponseUtils.notFound(res, `Rota ${req.method} ${req.path} não encontrada`);
};