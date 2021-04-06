import React, { useRef } from 'react'
import { Animated, StyleSheet } from 'react-native'
import { createAnimation } from '../Utils'

const FadeContent = (props: {active: boolean}) => {
  const anim = createAnimation({
    from: props.active ? 1 : 0,
    to: props.active ? 1 : 0,
    duration: 300,
    condition: props.active
  })

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