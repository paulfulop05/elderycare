export type ApiSuccess<T> = {
  data: T;
};

export type ApiError = {
  error: string;
  details?: Record<string, string>;
};

export type ApiResult<T> = {
  status: number;
  body: ApiSuccess<T> | ApiError;
};

export const ok = <T>(data: T): ApiResult<T> => ({
  status: 200,
  body: { data },
});

export const created = <T>(data: T): ApiResult<T> => ({
  status: 201,
  body: { data },
});

export const badRequest = (
  error: string,
  details?: Record<string, string>,
): ApiResult<never> => ({
  status: 400,
  body: {
    error,
    details,
  },
});

export const notFound = (error: string): ApiResult<never> => ({
  status: 404,
  body: { error },
});
