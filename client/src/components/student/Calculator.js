import React, { useState } from 'react'
import '../../style/Calculator.css'

const Calculator = () => {
  const [setA, setSetA] = useState('')
  const [setB, setSetB] = useState('')
  const [result, setResult] = useState(null)
  const [animationType, setAnimationType] = useState('')

  const calculateSymmetricDifference = () => {
    const arrA = setA.split(',').map(item => item.trim()).filter(Boolean)
    const arrB = setB.split(',').map(item => item.trim()).filter(Boolean)

    const areSetsEqual = arrA.length === arrB.length &&
      arrA.every(item => arrB.includes(item)) &&
      arrB.every(item => arrA.includes(item))

    const hasCommonElements = arrA.some(item => arrB.includes(item)) ||
      arrB.some(item => arrA.includes(item))

    const differenceA = arrA.filter(x => !arrB.includes(x))
    const differenceB = arrB.filter(x => !arrA.includes(x))
    const difference = [...differenceA, ...differenceB]

    setResult({
      elements: difference,
      differenceA: differenceA,
      differenceB: differenceB,
      areSetsEqual: areSetsEqual,
      hasCommonElements: hasCommonElements
    })

    if (areSetsEqual) {
      setAnimationType('same')
    } else if (hasCommonElements) {
      setAnimationType('overlap')
    } else {
      setAnimationType('')
    }
  }

  const resetAnimation = () => {
    setAnimationType('')
    setResult(null)
  }

  const getSetDisplay = (set) => {
    const elements = set.split(',').map(item => item.trim()).filter(Boolean)
    return elements.length > 0 ? `{${elements.join(', ')}}` : '∅'
  }

  return (
    <div className="calculator-container">
      <h2 className="mb-6">Калькулятор кольцевой суммы множеств</h2>
      <div className="animation-section">
        <div className={`venn-diagram ${animationType ? `animate-${animationType}` : ''}`}>
          <div className="circle circle-a">
            <div className="label">
              <span>A = {getSetDisplay(setA)}</span>
            </div>
          </div>
          <div className="circle circle-b">
            <div className="label">
              <span>B = {getSetDisplay(setB)}</span>
            </div>
          </div>
          <div className="intersection"></div>
        </div>

        <div className="sets-display">
          <div className="set-input">
            <label className="form-label fw-bold">Множество A:</label>
            <input style={{cursor: 'pointer'}} type="text" className="form-control"
              value={setA}
              onChange={(e) => setSetA(e.target.value)}
              placeholder="Введите элементы через запятую"
            />
          </div>
          <div className="set-input">
            <label className="form-label fw-bold">Множество B:</label>
            <input style={{cursor: 'pointer'}} type="text" className="form-control"
              value={setB}
              onChange={(e) => setSetB(e.target.value)}
              placeholder="Введите элементы через запятую"
            />
          </div>
        </div>
      </div>

      <div className="d-flex gap-2 mb-4 justify-content-center">
        <button className="btn btn-primary" onClick={calculateSymmetricDifference} disabled={!setA && !setB}>
          Вычислить кольцевую сумму
        </button>
        <button className="btn btn-primary" onClick={resetAnimation}>
          Сбросить анимацию
        </button>
      </div>

      {result && (
        <div className="card border-success mt-4">
          <div className="card-header bg-success text-white">
            <h5 className="mb-0">Решение:</h5>
          </div>
          <div className="card-body p-3">
            <p className="mb-3">
              Кольцевая сумма двух множеств А и Б (или более) - множество элементов этих множеств, которые принадлежат либо только множеству А,
              либо только множеству В. То есть элементы, которые присутствуют только в одном из множеств.
            </p>
            <p className="mb-3">A ⊕ B = (A\B) ∪ (B\A) - формула для вычисления (∪ - знак объединения).</p>

            <div className="bg-light rounded">
              <p className="mb-2">У нас <strong>A = {getSetDisplay(setA)}</strong>, а <strong>B = {getSetDisplay(setB)}</strong>.</p>
              {result.areSetsEqual ? (
                <>
                  <p className="mb-2 ">Множества A и B полностью одинаковы.</p>
                  <p className="mb-2">(A\B) = ∅</p>
                  <p className="mb-2">(B\A) = ∅</p>
                  <p className="mb-2">(A\B) ∪ (B\A) = ∅</p>
                  <p className="mb-0 fw-bold">A ⊕ B = (A\B) ∪ (B\A) = ∅</p>
                </>
              ) : (
                <>
                  <p className="mb-2">(A\B) = {getSetDisplay(result.differenceA.join(', '))}</p>
                  <p className="mb-2">(B\A) = {getSetDisplay(result.differenceB.join(', '))}</p>
                  <p className="mb-2">(A\B) ∪ (B\A) = {getSetDisplay(result.elements.join(', '))}</p>
                  <p className="mb-0 fw-bold">A ⊕ B = (A\B) ∪ (B\A) = {getSetDisplay(result.elements.join(', '))}</p>
                </>
              )}

              <p className="mb-0 fw-bold mt-2">
                Ответ: A ⊕ B = {result.areSetsEqual ? '∅' : getSetDisplay(result.elements.join(', '))}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Calculator