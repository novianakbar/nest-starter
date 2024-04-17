export function generateResponse(
  statusCode: number,
  message?: string,
  data?: any,
): any {
  const response: any = {
    statusCode,
    message: 'Success',
    data,
  };
  if (message) {
    response.message = message;
  }
  return response;
}
