import { AxiosError } from 'axios';
import { useMutation, useQuery } from 'react-query';
import { Store } from './store';

interface iX {
  [index: string]: any;
}

export function useMany<T extends iX>(
  model: string,
  params?: {},
  initialData?: T,
  enabled: boolean = true,
  queryKey: string = ''
) {
  return useQuery<T>(
    queryKey || `${model}/${new URLSearchParams(params)}`,
    Store.finds<T>(model, params),
    { initialData, enabled, onError: error => console.error(error) }
  );
}

export function useSaver<T extends iX>(
  model: string,
  onSuccess: (datum: T) => void = () => {},
  onError: (err: AxiosError) => void = () => {}
) {
  return useMutation((bdy: T) => Store.save(model, bdy), {
    // return useMutation((bdy: T) => Store.post(model, bdy), {
    onSuccess: onSuccess,
    onError: onError,
  });
}
