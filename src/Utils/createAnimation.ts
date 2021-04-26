import { useEffect, useRef } from "react"
import { Animated } from "react-native"
import { style } from "../Styling"

type parameters = {from?: number, to?: number, duration?: number, condition?: any, onDone?: ()=>void, delay?: number}
const useAnim = ({from, to, duration, condition, onDone, delay}: parameters) => {
  const anim = useRef(new Animated.Value(from ?? 0)).current

  useEffect(()=>{
   Animated.timing(anim, {
     toValue: to ?? 1,
     duration: duration ?? style.anim_duration,
     delay,
     useNativeDriver: false,
   }).start(onDone)
  }, [condition ?? anim])

  return anim
}

export default useAnim