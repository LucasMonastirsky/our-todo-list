import React from 'react'
import { StyleSheet, Text } from 'react-native'
import { colors, style } from '../Styling'

const AppText = ({style, children}: {style?: any, children: any}) => (
  <Text style={[css.style, style]}>{children}</Text>
)

const css = StyleSheet.create({
  style: {
    color: colors.light,
    fontSize: style.font_size_med,
  },
})

export default AppText