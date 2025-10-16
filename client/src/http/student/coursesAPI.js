import { $authHost } from '../index'

export const getMyCourses = async () => {
  const { data } = await $authHost.get('student/courses')
  return data
}

export const getCourseDetails = async (courseId) => {
  const { data } = await $authHost.get(`student/courses/${courseId}`)
  return data
}

export const getCourseTests = async (courseId) => {
  const { data } = await $authHost.get(`student/courses/${courseId}/tests`)
  return data
}

export const viewTheory = async (courseId, theoryId) => {
  const { data } = await $authHost.get(`student/courses/${courseId}/theory/${theoryId}/view`, {
    responseType: 'blob'
  })
  return data
}

export const downloadTheory = async (theoryId) => {
  const { data } = await $authHost.get(`student/theory/${theoryId}/download`, {
    responseType: 'blob'
  })
  return data
}

export const getCourseTheory = async (courseId) => {
  const { data } = await $authHost.get(`student/courses/${courseId}/theory`)
  return data
}