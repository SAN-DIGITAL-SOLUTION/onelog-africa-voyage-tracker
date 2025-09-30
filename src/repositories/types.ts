/**
 * Types génériques pour les repositories
 * Pattern Repository pour la couche de persistance
 */

/**
 * Interface générique Repository
 * Définit les opérations CRUD standard
 */
export interface Repository<T, TFilters = unknown> {
  findById(id: string): Promise<T | null>;
  findAll(filters?: TFilters): Promise<T[]>;
  create(data: Omit<T, 'id'>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

/**
 * Options de pagination
 */
export interface PaginationOptions {
  page?: number;
  limit?: number;
  offset?: number;
}

/**
 * Options de tri
 */
export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

/**
 * Résultat paginé
 */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
