import React from 'react'
import { StyleSheet, View } from 'react-native'
import { colors, style } from '../Styling'

const Header = () => {
  return (
    <View style={css.container}>
      <View style={css.pfp_container}>

      </View>
    </View>
  )
}

const css = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: style.header_height,
    backgroundColor: colors.main,
    padding: style.padding,
  },
  pfp_container: {
    aspectRatio: 1,
    borderRadius: 100,
  },
  pfp: {

  },
})

export default Header