import { $authHost } from '../index'

export const getMyCourses = async () => {
  const { data } = await $authHost.get('teacher/courses')
  return data
}

export const createCourse = async (courseData) => {
  const { data } = await $authHost.post('teacher/courses', courseData)
  return data
}

export const updateCourse = async (courseId, courseData) => {
  const { data } = await $authHost.put(`teacher/courses/${courseId}`, courseData)
  return data
}

export const deleteCourse = async (courseId) => {
  const { data } = await $authHost.delete(`teacher/courses/${courseId}`)
  return data
}

export const getAllGroups = async () => {
  const { data } = await $authHost.get('teacher/groups')
  return data
}

export const getCourseById = async (courseId) => {
  const { data } = await $authHost.get(`teacher/courses/${courseId}`)
  return data
}

export const addGroupsToCourse = async (courseId, groupIds) => {
  const { data } = await $authHost.post(`teacher/courses/${courseId}/groups`, { groupIds })
  return data
}

export const removeGroupsFromCourse = async (courseId, groupIds) => {
  const { data } = await $authHost.delete(`teacher/courses/${courseId}/groups`, {
    data: { groupIds }
  })
  return data
}

export const getCourseTests = async (courseId) => {
  const { data } = await $authHost.get(`teacher/courses/${courseId}/tests`)
  return data
}

export const attachTestToCourse = async (courseId, testId, courseTestData) => {
  const { data } = await $authHost.post(`teacher/courses/${courseId}/tests/${testId}/attach`, courseTestData)
  return data
}

export const updateCourseTest = async (courseId, testId, courseTestData) => {
  const { data } = await $authHost.put(`teacher/courses/${courseId}/tests/${testId}`, courseTestData)
  return data
}

export const detachTestFromCourse = async (courseId, testId) => {
  const { data } = await $authHost.delete(`teacher/courses/${courseId}/tests/${testId}`)
  return data
}

export const getCourseTheory = async (courseId) => {
  const { data } = await $authHost.get(`teacher/courses/${courseId}/theory`)
  return data
}

export const uploadTheory = async (courseId, formData) => {
  const { data } = await $authHost.post(`teacher/courses/${courseId}/theory`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  return data
}

export const deleteTheory = async (theoryId) => {
  const { data } = await $authHost.delete(`teacher/theory/${theoryId}`)
  return data
}