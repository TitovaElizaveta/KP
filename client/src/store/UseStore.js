import {makeAutoObservable} from 'mobx'

export default class UseStore{
  constructor(){
    this._isAuth=false
    this._user={}
    makeAutoObservable(this)//следит за изм переменных, при изм - передринг
  }
  
  //экшены - фуекции . изм состояние
  setIsAuth(bool){
    this._isAuth=bool
  }
  setUser(user){
    this._user=user
  }

  //одноимённые гетеры для получения какихто переменных из состояния. компьютер функции  - тип как оптимизация
  get isAuth(){
    return this._isAuth
  }
  get user(){
    return this._user
  }
}
