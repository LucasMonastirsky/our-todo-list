import React, { useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import { Navigation } from '../../App'

const ProfileLayout = (props: {active?: boolean}) => {
  useEffect(() => {if (props.active) Navigation.header = ()=><View />}, [props.active])

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