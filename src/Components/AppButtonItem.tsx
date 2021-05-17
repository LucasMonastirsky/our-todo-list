import React from 'react'
import { TouchableOpacity, Image, StyleSheet } from 'react-native'
import { style, colors } from '../Styling'

export default ({onPress}: {onPress: ()=>any}) => {
  return (
    <TouchableOpacity style={css.container} onPress={onPress}>
      <Image style={css.icon} source={require('../Media/Icons/plus.png')} />
    </TouchableOpacity>
  )
}

const css = StyleSheet.create({
  container: {
    height: style.font_size_med * 2,
    backgroundColor: colors.main,
    padding: style.padding,
    alignItems: 'center',
    marginTop: style.border_width,
  },
  icon: {
    flex: 1,
    aspectRatio: 1,
  },
})