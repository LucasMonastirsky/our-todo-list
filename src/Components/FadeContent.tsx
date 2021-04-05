import React, { useRef } from 'react'
import { Animated, StyleSheet } from 'react-native'

const FadeContent = (props: {active: boolean}) => {
  const anim = useRef(new Animated.Value(props.active ? 1 : 0)).current

  React.useEffect(() => {
    Animated.timing(anim, {
        toValue: props.active ? 1 : 0,
        duration: 500,
        useNativeDriver: false,
      }
    ).start();
  }, [props.active])

  return <Animated.View pointerEvents='none' style={[css.container, {opacity: anim}]}  />
}

const css = StyleSheet.create({
  container: {
    backgroundColor: '#000000aa',
    width: '100%',
    height: '100%',
    position: 'absolute',
  }
})

export default FadeContent