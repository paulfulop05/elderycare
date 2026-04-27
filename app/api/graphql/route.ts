import { NextRequest, NextResponse } from "next/server";
import { graphql } from "graphql";
import { appGraphqlRoot, appGraphqlSchema } from "@/lib/graphql/schema";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    query?: string;
    variables?: Record<string, unknown>;
    operationName?: string;
  };

  if (!body.query) {
    return NextResponse.json(
      { errors: [{ message: "GraphQL query is required." }] },
      { status: 400 },
    );
  }

  const result = await graphql({
    schema: appGraphqlSchema,
    source: body.query,
    rootValue: appGraphqlRoot,
    variableValues: body.variables,
    operationName: body.operationName,
  });

  return NextResponse.json(result, {
    status: result.errors?.length ? 400 : 200,
  });
}
