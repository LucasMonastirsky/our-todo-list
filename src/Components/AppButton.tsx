import React from 'react'
import { StyleSheet, TouchableOpacity } from 'react-native'
import { AppText } from '.'
import { colors, style } from '../Styling'

const AppButton = (props: {label: string, onPress: ()=>any}) => (
  <TouchableOpacity onPress={props.onPress}>
    <AppText style={css.button}>{props.label}</AppText>
  </TouchableOpacity>
)

const css = StyleSheet.create({
  button: {
    backgroundColor: colors.main,
    fontSize: style.font_size_big,
    padding: style.padding,
    paddingHorizontal: style.padding * 2,
    alignSelf: 'center',
    borderRadius: style.border_radius_med,
    marginTop: style.margin,
  },
})

export default AppButton