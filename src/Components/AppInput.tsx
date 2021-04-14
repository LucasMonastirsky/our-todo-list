import React from 'react'
import { View, TextInput, StyleSheet } from 'react-native'
import { colors, style } from '../Styling'

const AppInput = (props: {label: string}) => {
  return (
    <View style={css.input_container}>
      <TextInput style={css.input_text} placeholder={props.label} placeholderTextColor={colors.gray} />
    </View>
  )
}

const css = StyleSheet.create({
  input_container: {
    borderRadius: style.border_radius_med,
    marginTop: style.margin,
    backgroundColor: colors.light,
    width: 300,
  },
  input_text: {
    fontSize: style.font_size_med,
    color: colors.dark,
  },
})

export default AppInput