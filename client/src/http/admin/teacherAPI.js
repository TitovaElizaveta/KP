import { $authHost } from "../index"

export const fetchTeachers = async () => {
  const { data } = await $authHost.get('admin/teachers')
  return data
}

export const createTeacher = async (teacherData) => {
  const { data } = await $authHost.post('admin/teachers', teacherData)
  return data
}

export const updateTeacher = async (id, teacherData) => {
  const { data } = await $authHost.put(`admin/teachers/${id}`, teacherData)
  return data
}

export const deleteTeacher = async (id) => {
  const { data } = await $authHost.delete(`admin/teachers/${id}`)
  return data
}