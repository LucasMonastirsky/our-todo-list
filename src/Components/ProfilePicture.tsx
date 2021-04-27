import React from 'react'
import { Image, StyleSheet, View } from 'react-native'
import { colors, style } from '../Styling'

const ProfilePicture = ({source}: {source?: string}) => {
  const source_or_default = source
    ? { uri: source }
    : require('../Media/Icons/profile_default.png')

  return (
    <View style={css.container}>
      <Image source={source_or_default} style={css.image} />
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
    aspectRatio: 1,
    height: 50,
    width: 50,
  },
})

export default ProfilePicture