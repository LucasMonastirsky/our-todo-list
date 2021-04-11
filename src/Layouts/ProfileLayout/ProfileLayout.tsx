import React, { useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import { Navigation } from '../../App'

const ProfileLayout = () => {
  useEffect(() => {Navigation.header = ()=><View />}, [])

  return (
    <View style={css.container}>

    </View>
  )
}

const css = StyleSheet.create({
  container: {

  },
})

export default ProfileLayout