import React from 'react'
import { Image, ImageSourcePropType, StyleSheet, TouchableOpacity } from 'react-native'
import { style } from '../Styling'

const Icon = ({source, onPress}: {source: ImageSourcePropType, onPress: ()=>any}) => (
  <TouchableOpacity style={css.header_icon_container} {...{onPress}}>
      <Image style={css.header_icon_img} {...{source}} />
  </TouchableOpacity>
)

const css = StyleSheet.create({
  header_icon_container: {
    marginLeft: style.margin,
  },
  header_icon_img: {
    flex: 1,
    aspectRatio: 1,
  },
})

export default Icon