import { NextResponse } from "next/server";
import type { ApiResult } from "@/lib/api/types";

export const toQueryParams = (
  searchParams: URLSearchParams,
): Record<string, string | undefined> => {
  const query: Record<string, string | undefined> = {};

  searchParams.forEach((value, key) => {
    query[key] = value;
  });

  return query;
};

export const toNextResponse = <T>(result: ApiResult<T>): NextResponse =>
  NextResponse.json(result.body, { status: result.status });
