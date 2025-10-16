import { $authHost } from "../index"

export const fetchGroups = async () => {
  const { data } = await $authHost.get('admin/groups')
  return data
}

export const createGroup = async (group) => {
  const { data } = await $authHost.post('admin/groups', group)
  return data
}

export const updateGroup = async (id, group) => {
  const { data } = await $authHost.put(`admin/groups/${id}`, group)
  return data
}

export const deleteGroup = async (id) => {
  const { data } = await $authHost.delete(`admin/groups/${id}`)
  return data
}