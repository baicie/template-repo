/**
 * API 客户端配置
 * 基于 fetch API 封装的 HTTP 请求工具
 */

interface RequestConfig extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
  code?: number;
}

/**
 * 创建 API 基础配置
 */
function createApiClient(baseUrl: string = "") {
  const apiClient = async <T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> => {
    const { params, ...fetchConfig } = config;

    let url = `${baseUrl}${endpoint}`;

    // 处理查询参数
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        searchParams.append(key, String(value));
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    // 设置默认 headers
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...fetchConfig.headers,
    };

    try {
      const response = await fetch(url, {
        ...fetchConfig,
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  };

  return {
    get: <T>(endpoint: string, config?: RequestConfig) =>
      apiClient<T>(endpoint, { ...config, method: "GET" }),

    post: <T>(endpoint: string, config?: RequestConfig) =>
      apiClient<T>(endpoint, { ...config, method: "POST" }),

    put: <T>(endpoint: string, config?: RequestConfig) =>
      apiClient<T>(endpoint, { ...config, method: "PUT" }),

    patch: <T>(endpoint: string, config?: RequestConfig) =>
      apiClient<T>(endpoint, { ...config, method: "PATCH" }),

    delete: <T>(endpoint: string, config?: RequestConfig) =>
      apiClient<T>(endpoint, { ...config, method: "DELETE" }),
  };
}

export const api = createApiClient(process.env.NEXT_PUBLIC_API_URL ?? "");
