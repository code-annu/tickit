export function buildSuccessResponse<T>(data: T, message: string) {
  return { success: true, message, data };
}
