import { $authHost } from '../index'

export const startTest = async (testId) => {
  const { data } = await $authHost.post(`student/tests/${testId}/start`)
  return data
}

export const saveAnswer = async (attemptId, questionId, answer) => {
  const { data } = await $authHost.post('student/tests/save-answer', {
    attemptId, questionId, answer
  })
  return data
}

export const submitTest = async (attemptId) => {
  const { data } = await $authHost.post('student/tests/complete', {
    attemptId
  })
  return data
}

export const getTestResults = async (testId) => {
  const { data } = await $authHost.get(`student/tests/${testId}/results`)
  return data
}

export const checkTestAvailability = async (testId) => {
  const { data } = await $authHost.get(`student/tests/${testId}/check`)
  return data
}

export const getAttemptHistory = async () => {
  const { data } = await $authHost.get('student/attempts/history')
  return data
}

export const getAttemptDetails = async (attemptId) => {
  const { data } = await $authHost.get(`student/attempts/${attemptId}/details`)
  return data
}