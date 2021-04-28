import React, { useEffect, useState } from 'react'
import { Image, StyleSheet, View } from 'react-native'
import { API } from '../App'
import { User } from '../Models'
import { colors, style } from '../Styling'

const ProfilePicture = ({source, user_id}: {source?: string, user_id?: string}) => {
  const [user, setUser] = useState<User>()

  const source_or_default = user
    ? { uri: user.image }
    : source
    ? { uri: source }
    : require('../Media/Icons/profile_default.png')

  useEffect(() => {(async () => {
    if (user_id) {
      setUser(await API.getCachedUser(user_id))
    }
  })()}, [])

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
    height: undefined,
    width: undefined,
  },
})

export default ProfilePicture