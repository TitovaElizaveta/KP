import {$authHost, $host} from "./index"

export const login = async (email, password) => {
  const { data } = await $host.post('auth/login', { email, password });
  localStorage.setItem('token', data.token)
  return data; 
}

export const check = async () => {
  const { data } = await $authHost.get('auth/check')
  localStorage.setItem('token', data.token)
  return data; 
}