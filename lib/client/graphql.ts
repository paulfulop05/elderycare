export type GraphQLErrorPayload = {
  message: string;
};

export type GraphQLResponse<T> = {
  data?: T;
  errors?: GraphQLErrorPayload[];
};

export const executeGraphQL = async <
  TData,
  TVariables extends Record<string, unknown> = Record<string, unknown>,
>(
  query: string,
  variables?: TVariables,
): Promise<TData> => {
  const response = await fetch("/api/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "same-origin",
    body: JSON.stringify({ query, variables }),
  });

  const payload = (await response.json()) as GraphQLResponse<TData>;
  if (!response.ok || payload.errors?.length) {
    throw new Error(payload.errors?.[0]?.message ?? `HTTP ${response.status}`);
  }

  return payload.data as TData;
};
