import React from 'react'
import { TouchableOpacity, Image, StyleSheet } from 'react-native'
import { style, colors } from '../Styling'

export default ({icon, onPress}: {icon?: 'plus'|'done', onPress: ()=>any}) => {
  return (
    <TouchableOpacity style={css.container} onPress={onPress}>
      <Image style={css.icon} source={icon === 'done'
        ? require('../Media/Icons/done.png')
        : require('../Media/Icons/plus.png')}
      />
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