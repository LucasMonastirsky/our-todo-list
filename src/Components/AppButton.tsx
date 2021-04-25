import React from 'react'
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native'
import { AppText } from '.'
import { colors, style } from '../Styling'

const AppButton = (props: {label: string, color?: string, onPress: ()=>any, style?: ViewStyle}) => (
  <TouchableOpacity onPress={props.onPress} style={props.style}>
    <AppText style={[css.button, {backgroundColor: props.color ?? colors.main_light}]}>
      {props.label}
    </AppText>
  </TouchableOpacity>
)

const css = StyleSheet.create({
  button: {
    backgroundColor: colors.main_light,
    fontSize: style.font_size_med,
    padding: style.padding,
    paddingHorizontal: style.padding * 2,
    alignSelf: 'center',
    borderRadius: style.border_radius_med,
    marginTop: style.margin,
  },
})

export default AppButton