import { useEffect, useRef } from "react"
import { Animated } from "react-native"

type parameters = {from?: number, to?: number, duration?: number, condition?: any, onDone?: ()=>void}
const useAnim = ({from, to, duration, condition, onDone}: parameters) => {
  const anim = useRef(new Animated.Value(from ?? 0)).current

  useEffect(()=>{
   Animated.timing(anim, {
     toValue: to ?? 1,
     duration: duration ?? 300,
     useNativeDriver: false,
   }).start(onDone)
  }, [condition ?? anim])

  return anim
}

export default useAnim