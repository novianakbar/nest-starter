export interface ResponseType<T> {
  statusCode: number;
  message?: string;
  data?: T[] | null;
}

export interface ResponseGetType<T> {
  statusCode: number;
  message?: string;
  data?: {
    statusCode: number;
    totalPage: number;
    pageSize: number;
    currentPage: number;
    totalItem: number;
    data: T[] | null;
  } | null;
}
