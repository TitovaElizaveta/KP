import { $authHost } from '../index'

export const getMyQuestions = async (params = {}) => {
  const { data } = await $authHost.get('teacher/questions', { params })
  return data
}

export const searchQuestions = async (params = {}) => {
  const { data } = await $authHost.get('teacher/questions/search', { params })
  return data
}

export const createQuestion = async (questionData) => {
  const { data } = await $authHost.post('teacher/questions', questionData)
  return data
}

export const updateQuestion = async (questionId, questionData) => {
  const { data } = await $authHost.put(`teacher/questions/${questionId}`, questionData)
  return data
}

export const deleteQuestion = async (questionId) => {
  const { data } = await $authHost.delete(`teacher/questions/${questionId}`)
  return data
}

