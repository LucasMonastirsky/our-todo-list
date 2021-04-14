import React, { useEffect } from 'react'
import { BackHandler, StyleSheet, View } from 'react-native'
import { AppButton, AppInput, AppText } from '../../Components'
import { style } from '../../Styling'
import { LayoutProps } from '../types'

const RegisterLayout = (props: LayoutProps & {onCancel: ()=>any}) => {
  useEffect(()=>{
    return BackHandler.addEventListener('hardwareBackPress', props.onCancel).remove
  }, [])

  return (
    <View style={css.container}>
      <AppText style={css.title}>New Account</AppText>
      <AppInput label="Username" />
      <AppInput label="Password" />
      <AppInput label="Confirm Password" />
      <AppButton label="Create Account" onPress={()=>{}} />
    </View>
  )
}

const css = StyleSheet.create({
  container: {
    padding: style.padding,
    alignItems: 'center',
  },
  title: {
    alignSelf: 'center',
    fontSize: style.font_size_huge,
    fontWeight: 'bold',
  },
})

export default RegisterLayout