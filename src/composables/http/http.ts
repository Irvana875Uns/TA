import type { AxiosError, AxiosRequestConfig } from 'axios'
import {
  type UseQueryOptions,
  type UseMutationOptions,
  useQuery,
  useMutation
} from '@tanstack/vue-query'
import type { ComputedRef, Ref } from 'vue'
import axios from 'axios'
import { Env } from '@/config'
import Cookie from 'js-cookie'

export const http = axios.create({
  baseURL: Env().API_BASE_URL
})

http.interceptors.response.use(
  (response) => {
    return response
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

http.interceptors.request.use((config) => {
  const token = Cookie.get('token')

  if (token) {
    Object.assign(config.headers, { Authorization: `Bearer ${token}` })
  }

  return config
})

type Config<TData = any, TError = any> = {
  keys?: any[]
  params?: Ref
  httpOptions?: AxiosRequestConfig
  queryOptions?: UseQueryOptions<TData, TError>
}

/**
 * API GET Method request only.
 * @example
    const { data: items, isLoading, isError } = useHttp<number, string>('/', {
      keys: ['id']
      queryOptions: {
        onSuccess: function (data) {
          return
        },
        onError: function (data) {
          data
        },
      },
    })
 * @param url URL API
 * @param options HTTP Mutation Options
 */
export function useHttp<TData = any, TError = any>(
  url: ComputedRef<string> | string,
  options?: Config<TData, TError>
) {
  if (options) {
    const { httpOptions, queryOptions, keys = [], params } = options
    return useQuery<TData>({
      queryKey: [url, params, ...keys],
      ...(queryOptions as any),
      queryFn: async (): Promise<TData> => {
        try {
          const { data } = await http.get<TData>(unref(url), {
            ...httpOptions,
            params: unref(params)
          })
          return data
        } catch (e: any) {
          throw e
        }
      }
    })
  }
  return useQuery<TData>({
    queryKey: [url],
    queryFn: async (): Promise<TData> => {
      try {
        const { data } = await http.get<TData>(unref(url), {})
        return data
      } catch (e: any) {
        throw e
        Promise.reject(e?.response ?? e)
      }
    }
  })
}

type HttpMutationOptions<TData = any, TError = any, TVariables = any, TContext = any> = {
  method: 'GET' | 'HEAD' | 'POST' | 'OPTIONS' | 'PUT' | 'DELETE' | 'PATCH'
  httpOptions?: AxiosRequestConfig
  queryOptions?: UseMutationOptions<TData, TError, TVariables, TContext>
}

/**
 * Update data to the server.
 * @example
  const {mutate, isLoading, isError, error} =  useHttpMutation<TData, TError>('todos/:id', {
    method: 'POST',
    httpOptions: { // axios options
      timeout: 30000,
    },
    queryOptions: { // vue-query options
      onSuccess: function (data) {
        console.log(data);
      },
      onError: function (data) {
        console.log(data);
      },
    },
    })
    const onSubmitForm = (data) => {
      mutate(data)
    }
 * @param url URL API
 * @param options HTTP Mutation Options
 */
export function useHttpMutation<
  TVariables = any,
  TData = any,
  TError = { data: { message: string } }
>(url: Ref<string> | string, options: HttpMutationOptions<TData, TError>) {
  return useMutation<TData, TError, TVariables>({
    ...(options.queryOptions as any),
    mutationFn: (value: TVariables): Promise<TData> => {
      return new Promise((resolve, reject) => {
        return http
          .request<TData>({
            url: unref(url),
            method: options.method,
            ...options.httpOptions,
            data: value
          })
          .then((response) => {
            resolve(response.data)
          })
          .catch((error: AxiosError<TError>) => {
            reject(error.response ?? error.message)
          })
      })
    }
  })
}
