import React, { useEffect } from 'react'
import { BackHandler, StyleSheet, View } from 'react-native'
import { AppButton, AppInput, AppText } from '../../Components'
import { style } from '../../Styling'
import { screen } from '../../Utils'
import { LayoutProps } from '../types'

const RegisterLayout = (props: LayoutProps & {onCancel: ()=>any}) => {
  useEffect(()=>{
    return BackHandler.addEventListener('hardwareBackPress', props.onCancel).remove
  }, [])

  return (
    <View style={css.container}>
      <View style={{flex: 1, justifyContent: 'flex-end'}}>
        <AppText style={css.title}>New Account</AppText>
      </View>
      <View style={{}}>
        <AppInput label="Username" />
        <AppInput label="Password" />
        <AppInput label="Confirm Password" />
      </View>
      <View style={{flex: 1, marginTop: style.margin,}}>
       <AppButton label="Create Account" onPress={()=>{}} />
       <AppButton label="Cancel" onPress={()=>{}} />
      </View>
    </View>
  )
}

const css = StyleSheet.create({
  container: {
    padding: style.padding,
    alignItems: 'center',
    height: screen.height,
    justifyContent: 'center',
  },
  title: {
    alignSelf: 'center',
    fontSize: style.font_size_huge,
    fontWeight: 'bold',
  },
})

export default RegisterLayout