import React from 'react'
import { StyleSheet, View } from 'react-native'
import { colors, style } from '../Styling'

const ProfilePicture = () => {
  return (
    <View style={css.container}>
      <View style={css.image} />
    </View>
  )
}

const css = StyleSheet.create({
  container: {
    flex: 1,
    padding: style.padding / 2,
  },
  image: {
    flex: 1,
    backgroundColor: colors.light,
    borderRadius: 100,
  },
})

export default ProfilePicture