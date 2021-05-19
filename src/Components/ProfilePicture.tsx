import { container } from '@aws-amplify/ui'
import React, { useEffect, useState } from 'react'
import { Image, StyleSheet, View } from 'react-native'
import { API } from '../App'
import { User } from '../Models'
import { colors, style } from '../Styling'

const ProfilePicture = (props: {uri?: string, user_id: string, size?: 'small'|'medium'|'big'}) => {
  const [user, setUser] = useState<User>()

  useEffect(() => {(async () => {
    setUser(await API.getCachedUser(props.user_id))
  })()}, [])

  const size_map = {
    'small': 30,
    'medium': 45,
    'big': 60,
  }

  const container_style = props.size
  ? {...css.container_set_size, height: size_map[props.size]}
  : css.container_flex

  return (
    <View style={container_style}>
      <Image source={{uri: props.uri ?? user?.image}} style={css.image} />
    </View>
  )
}

const css = StyleSheet.create({
  container_flex: {
    flex: 1,
    padding: style.padding / 2,
  },
  container_set_size: {
    aspectRatio: 1,
    // height: 40,
    // width: undefined,
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