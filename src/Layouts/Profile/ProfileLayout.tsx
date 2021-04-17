import Auth from '@aws-amplify/auth'
import React, { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Navigation } from '../../App'
import { AppText } from '../../Components'
import { LayoutProps } from '../types'

const ProfileLayout = (props: LayoutProps) => {
  const [username, setUsername] = useState('loading...')

  useEffect(() => {if (props.active) Navigation.header = ()=><View />}, [props.active])
  useEffect(()=>{
    (async () => {
      setUsername((await Auth.currentUserInfo()).username)
    })()
  }, [])

  return (
    <View style={css.container}>
      <AppText>{username}</AppText>
    </View>
  )
}

const css = StyleSheet.create({
  container: {

  },
})

export default ProfileLayout