import { $authHost } from '../index'

export const getStudentStatistics = async (testId) => {
  const { data } = await $authHost.get(`teacher/tests/${testId}/statistics/students`)
  return data
}

export const getGroupStatistics = async (courseId) => {
  const { data } = await $authHost.get(`teacher/courses/${courseId}/statistics/groups`)
  return data
}

export const filterStudentStatistics = async (testId, filters) => {
  const { data } = await $authHost.get(`teacher/tests/${testId}/statistics/filter`, {
    params: filters
  })
  return data
}

export const filterGroupStatistics = async (courseId, filters) => {
  const { data } = await $authHost.get(`teacher/courses/${courseId}/statistics/groups/filter`, {
    params: filters
  })
  return data
}