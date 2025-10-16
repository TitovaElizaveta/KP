import { $authHost } from "../index"

export const fetchStudents = async () => {
  const { data } = await $authHost.get('admin/students')
  return data
}

export const createStudent = async (studentData) => {
  const { data } = await $authHost.post('admin/students', studentData)
  return data
}

export const updateStudent = async (id, studentData) => {
  const { data } = await $authHost.put(`admin/students/${id}`, studentData)
  return data
}

export const deleteStudent = async (id) => {
  const { data } = await $authHost.delete(`admin/students/${id}`)
  return data
}