import { Response } from 'express';

interface ApiResponseData {
  success: boolean;
  message: string;
  data?: any;
  errors?: any;
}

class ApiResponse {
  static success(res: Response, data?: any, message: string = 'Success', statusCode: number = 200): Response {
    const response: ApiResponseData = {
      success: true,
      message,
      data
    };
    return res.status(statusCode).json(response);
  }

  static error(res: Response, message: string, statusCode: number = 500, errors?: any): Response {
    const response: ApiResponseData = {
      success: false,
      message,
      errors
    };
    return res.status(statusCode).json(response);
  }
}

export default ApiResponse;