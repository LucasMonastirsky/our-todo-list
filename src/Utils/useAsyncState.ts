import { useRef, useState } from "react"

function useAsyncState<Type>(initial_value: Type): [Type, ()=>Type, (value: Type)=>void] {
  const [state, _setState] = useState(initial_value)
  const ref = useRef(state)
  const getState = () => ref.current
  const setState = (value: Type) => {
    _setState(value)
    ref.current = value
  }
  return [state, getState, setState]
}

export default useAsyncState