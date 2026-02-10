import { NextResponse } from "next/server";
import { z } from "zod";

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  meta?: Record<string, any>;
};

export function apiResponse<T>(
  data: T | null,
  options: {
    status?: number;
    error?: string;
    meta?: Record<string, any>;
  } = {}
) {
  const { status = 200, error, meta } = options;

  const body: ApiResponse<T> = {
    success: !error,
    ...(data !== null && { data }),
    ...(error && { error }),
    ...(meta && { meta }),
  };

  return NextResponse.json(body, { status });
}

export function apiError(message: string, status: number = 400) {
  return apiResponse(null, { error: message, status });
}

// Zod error formatter
export function apiValidationError(error: z.ZodError) {
  const message = (error as any).errors
    .map((e: any) => `${e.path.join(".")}: ${e.message}`)
    .join(", ");
  return apiError(message, 400);
}
