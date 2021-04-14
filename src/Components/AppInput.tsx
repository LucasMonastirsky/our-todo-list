import React from 'react'
import { View, TextInput, StyleSheet, TextInputProps } from 'react-native'
import { colors, style } from '../Styling'

const AppInput = (props: {label: string, type?: 'username'|'password'|'new_password'} & TextInputProps) => {
  const type_props = {
    username: {autoCompleteType:"username", textContentType: "username"} as const,
    password: {autoCompleteType:"password", textContentType: "password", secureTextEntry: true} as const,
    new_password: {autoCompleteType:"password", textContentType: "newPassword", secureTextEntry: true} as const,
    none: {},
  }[props.type ?? 'none']

  return (
    <View style={css.input_container}>
      <TextInput
        style={css.input_text}
        placeholder={props.label}
        placeholderTextColor={colors.gray}
        {...props}
        {...type_props}
      />
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