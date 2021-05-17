import { useRef, useState } from "react"
import { StateSetter } from "../Types"

type ReturnType<T> = [T, ()=>T, (value: T | ((prev: T)=>T))=>void]

function useAsyncState<Type>(initial_value: Type): ReturnType<Type> {
  const [state, _setState] = useState(initial_value)
  const ref = useRef(state)
  const getState = () => ref.current
  const setState = (value: Type | ((prev: Type)=>Type)) => {
    if (typeof value === 'function') {
      const setter = value as (prev: Type)=>Type
      _setState(state => ref.current = setter(state))
    } else {
      _setState(value)
      ref.current = value
    }
  }
  return [state, getState, setState]
}

export default useAsyncState