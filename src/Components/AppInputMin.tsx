import React, { RefObject } from 'react'
import { View, TextInput, StyleSheet, TextInputProps, ViewProps } from 'react-native'
import { AppText } from '.'
import { colors, style } from '../Styling'

const AppInputMin = (props: TextInputProps & { title?: string, ref?: RefObject<TextInput> }) => {
  return (
    <View style={css.input_container}>
      {props.title && <AppText style={css.title}>{props.title}</AppText>}
      <TextInput
        placeholderTextColor={colors.light_dark}
        textAlign='center'
        {...props}
        style={[css.input_text, props.style]}
      />
    </View>
  )
}

const css = StyleSheet.create({
  input_container: {
    borderColor: colors.light_dark,
    borderRadius: style.border_radius_med,
    borderBottomWidth: style.border_width,
    borderBottomEndRadius: style.border_radius_big,
  },
  input_text: {
    fontSize: style.font_size_med,
    color: colors.light,
    padding: style.padding,
  },
  title: {
    fontSize: style.font_size_small,
  },
})

export default AppInputMin