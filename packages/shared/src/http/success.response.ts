export function buildSuccessResponse<T>({
  data,
  message,
}: {
  data: T;
  message: string;
}) {
  return { success: true, message, data };
}
