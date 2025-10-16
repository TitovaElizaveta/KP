import { $authHost } from '../index'

export const createTest = async (testData) => {
  const { data } = await $authHost.post('teacher/tests', testData)
  return data
}


export const updateTest = async (testId, testData) => {
  const { data } = await $authHost.put(`teacher/tests/${testId}`, testData)
  return data
}

export const deleteTest = async (testId) => {
  const { data } = await $authHost.delete(`teacher/tests/${testId}`)
  return data
}

export const getTestById = async (testId) => {
  const { data } = await $authHost.get(`teacher/tests/${testId}`)
  return data
}

export const getMyTests = async (params = {}) => {
  const { data } = await $authHost.get('teacher/tests', { params })
  return data
}

export const addQuestionsToTest = async (testId, questionIds) => {
  const { data } = await $authHost.post(`teacher/tests/${testId}/questions`, { questionIds })
  return data
}

export const removeQuestionsFromTest = async (testId, questionIds) => {
  const { data } = await $authHost.delete(`teacher/tests/${testId}/questions`, { 
    data: { questionIds } 
  })
  return data
}

export const getTestQuestions = async (testId) => {
  const { data } = await $authHost.get(`teacher/tests/${testId}/questions`)
  return data
}