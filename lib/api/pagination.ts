import { z } from "zod";

export type QueryParams = Record<string, string | undefined>;

const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
});

export type PaginationInput = {
  page: number;
  pageSize: number;
};

export type PaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export const parsePaginationQuery = (
  query: QueryParams,
):
  | { success: true; data: PaginationInput }
  | { success: false; details: Record<string, string> } => {
  const parsed = paginationQuerySchema.safeParse(query);
  if (parsed.success) {
    return {
      success: true,
      data: parsed.data,
    };
  }

  const details: Record<string, string> = {};
  parsed.error.issues.forEach((issue) => {
    const key = issue.path[0]?.toString() ?? "query";
    if (!details[key]) {
      details[key] = issue.message;
    }
  });

  return {
    success: false,
    details,
  };
};

export const paginate = <T>(
  items: T[],
  pagination: PaginationInput,
): { data: T[]; pagination: PaginationMeta } => {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pagination.pageSize));
  const safePage = Math.min(pagination.page, totalPages);
  const start = (safePage - 1) * pagination.pageSize;

  return {
    data: items.slice(start, start + pagination.pageSize),
    pagination: {
      page: safePage,
      pageSize: pagination.pageSize,
      total,
      totalPages,
    },
  };
};
