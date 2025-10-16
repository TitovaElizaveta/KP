import { makeAutoObservable } from 'mobx'

export default class QuestionStore {
  constructor() {
    this._questions = []
    makeAutoObservable(this)
  }
  
  setQuestions(questions) {
    this._questions = questions
  }
  
  addQuestion(question) {
    this._questions.push(question)
  }
  
  updateQuestion(updatedQuestion) {
    const index = this._questions.findIndex(q => q.id === updatedQuestion.id)
    if (index !== -1) {
      this._questions[index] = updatedQuestion
    }
  }
  
  deleteQuestion(questionId) {
    this._questions = this._questions.filter(q => q.id !== questionId)
  }
  
  get questions() {
    return this._questions
  }
  
  getQuestionById(id) {
    return this._questions.find(q => q.id === id)
  }
}