import React, { useEffect, useRef, useState } from 'react'
import { View, StyleSheet, Animated } from 'react-native'
import { colors, style } from '../Styling'

const Loading = () => {
  return (
    <View style={css.container}>
      <Ball index={0} of={3} />
      <View style={css.separator} />
      <Ball index={1} of={3} />
      <View style={css.separator} />
      <Ball index={2} of={3} />
    </View>
  )
}

const Ball = ({index, of}: {index: number, of: number}) => {
  const animation = useRef(new Animated.Value(0)).current

  useEffect(() => {
    setTimeout(() => {
      Animated.loop(Animated.sequence([
        Animated.timing(animation, {
          toValue: size,
          duration: style.anim_duration,
          useNativeDriver: false,
        }),
        Animated.timing(animation, {
          toValue: 0,
          duration: style.anim_duration,
          useNativeDriver: false,
        }),
        Animated.delay(style.anim_duration / of),
      ])).start()
    }, style.anim_duration / of * index)
  }, [])

  return <Animated.View style={[css.ball, {
    width: animation,
    height: animation }]}
  />
}

const size = style.font_size_small

const css = StyleSheet.create({
  container: {
    height: size,
    alignItems: 'center',
    flexDirection: 'row',
    alignSelf: 'center',
    marginTop: 'auto',
    marginBottom: 'auto',
    // borderWidth: 1,
  },
  ball: {
    backgroundColor: colors.light,
    borderRadius: 100,
  },
  separator: {
    width: 5,
  },
})

export default Loading