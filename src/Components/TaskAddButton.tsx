import React from 'react'
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native'
import { colors, style } from '../Styling'

const TaskAddButton = (props: { onTouch: () => void }) => {
  return (
    <View style={css.container}>
      <TouchableOpacity style={css.circle} onPress={props.onTouch}>
          <Image style={css.img} source={require('../Media/Icons/plus.png')}/>
      </TouchableOpacity>
    </View>
  )
}

const css = StyleSheet.create({
  container: {
    height: 75,
    width: 75,
    position: 'absolute',
    right: 0,
    bottom: 0,
    zIndex: 1,
    padding: style.margin,
  },
  circle: {
    backgroundColor: colors.main,
    flex: 1,
    borderRadius: 100,
    padding: '20%',
  },
  img: {
    flex: 1,
    height: undefined,
    width: undefined,
  },
})

export default TaskAddButton