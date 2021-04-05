import React from 'react'
import { View, StyleSheet, TouchableNativeFeedback } from 'react-native'
import { colors, style } from '../Styling'

const DrawerIcon = (props: {onPress: ()=>void}) => {
  return (
    <TouchableNativeFeedback {...props}>
      <View style={css.container}>
        <View style={css.bar} />
        <View style={css.spacing} />
        <View style={css.bar} />
        <View style={css.spacing} />
        <View style={css.bar} />
      </View>
    </TouchableNativeFeedback>
  )
}

const css = StyleSheet.create({
  container: {
    height: '100%',
    aspectRatio: 1.3,
    padding: style.padding,
  },
  bar: {
    width: '100%',
    flex: 1,
    backgroundColor: colors.light,
    borderRadius: 1,
  },
  spacing: {
    flex: 1.3,
  },
})

export default DrawerIcon