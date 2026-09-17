/**
 * TMSshj - API Client
 *
 * Ye file application ki common API configuration handle karegi.
 *
 * Is file ka purpose:
 * 1. API ka base URL define karna
 * 2. Common headers manage karna
 * 3. Authentication token bhejna
 * 4. GET aur POST requests ke liye reusable functions dena
 *
 * IMPORTANT:
 * Actual endpoint yahan define nahi honge.
 *
 * Example:
 * authService.js
 * taskService.js
 * dashboardService.js
 *
 * apne respective endpoints handle karenge.
 */

/**
 * TMS backend ka base URL.
 *
 * Postman collection ke mutabiq:
 * https://www.itschatters.com
 */
const BASE_URL = 'https://www.itschatters.com';

/**
 * Common API error class.
 *
 * Agar request fail ho to hum custom error
 * create karenge taake screen par meaningful
 * error handle kiya ja sake.
 */
class ApiError extends Error {
  constructor(message, status = null, data = null) {
    super(message);

    /**
     * Error ka naam.
     */
    this.name = 'ApiError';

    /**
     * HTTP status code.
     *
     * Example:
     * 401 = Unauthorized
     * 404 = Not Found
     * 500 = Server Error
     */
    this.status = status;

    /**
     * Server se aane wala response data.
     */
    this.data = data;
  }
}

/**
 * Common request headers create karta hai.
 *
 * Agar token diya gaya ho to Authorization header
 * automatically add ho jayega.
 */
const createHeaders = token => {
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  /**
   * Authenticated API request ke liye:
   *
   * Authorization: Bearer <token>
   */
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

/**
 * API response ko JSON mein convert karta hai
 * aur HTTP errors ko handle karta hai.
 */
const handleResponse = async response => {
  let responseData = null;

  try {
    /**
     * Backend se JSON response read karne ki koshish.
     */
    responseData = await response.json();
  } catch (error) {
    /**
     * Agar response valid JSON nahi hai,
     * responseData null rahega.
     */
    responseData = null;
  }

  /**
   * HTTP request unsuccessful ho to custom
   * ApiError throw karenge.
   */
  if (!response.ok) {
    throw new ApiError(
      `Request failed with status ${response.status}`,
      response.status,
      responseData,
    );
  }

  /**
   * Successful response return.
   */
  return responseData;
};

/**
 * GET request helper.
 *
 * Example:
 *
 * apiGet(
 *   '/api/v1/index.php?module=auth&action=me',
 *   token,
 * );
 */
const apiGet = async (endpoint, token = null) => {
  try {
    /**
     * API request.
     */
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: createHeaders(token),
    });

    /**
     * Common response handler.
     */
    return await handleResponse(response);
  } catch (error) {
    /**
     * Agar already ApiError hai,
     * usay as-is throw karenge.
     */
    if (error instanceof ApiError) {
      throw error;
    }

    /**
     * Network/connection error.
     */
    throw new ApiError(
      error instanceof Error
        ? error.message
        : 'Unable to connect to the server.',
    );
  }
};

/**
 * POST request helper.
 *
 * Example:
 *
 * apiPost(
 *   '/api/v1/index.php?module=auth&action=login',
 *   {
 *     email,
 *     password,
 *     login_type: 0,
 *   },
 * );
 */
const apiPost = async (
  endpoint,
  body = undefined,
  token = null,
) => {
  try {
    /**
     * API request.
     */
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: createHeaders(token),

      /**
       * Body available ho to usko JSON string mein
       * convert karenge.
       */
      body:
        body !== undefined
          ? JSON.stringify(body)
          : undefined,
    });

    /**
     * Common response handler.
     */
    return await handleResponse(response);
  } catch (error) {
    /**
     * Existing ApiError ko dobara wrap nahi karenge.
     */
    if (error instanceof ApiError) {
      throw error;
    }

    /**
     * Network/connection error.
     */
    throw new ApiError(
      error instanceof Error
        ? error.message
        : 'Unable to connect to the server.',
    );
  }
};

/**
 * Base URL aur API helpers export kar rahe hain.
 *
 * Ab service files in functions ko import kar sakti hain.
 */
export {
  BASE_URL,
  ApiError,
  apiGet,
  apiPost,
};