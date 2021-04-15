import React, { useEffect, useState } from 'react'
import { BackHandler, StyleSheet, View } from 'react-native'
import { AppButton, AppInput, AppText } from '../../Components'
import { colors, style } from '../../Styling'
import { screen } from '../../Utils'
import { LayoutProps } from '../types'
import { Auth } from 'aws-amplify'

const RegisterLayout = (props: LayoutProps & {onCancel: ()=>any}) => {
  const [username, _setUsername] = useState('')
  const [password, _setPassword] = useState('')
  const [confirmPassword, _setConfirmPassword] = useState('')
  const [alert, setAlert] = useState<string>('')

  const setUsername = (value: string) => {
    _setUsername(value)
    setAlert('')
  }

  const setPassword = (value: string) => {
    _setPassword(value)
    setAlert('')
  }

  const setConfirmPassword = (value: string) => {
    _setConfirmPassword(value)
    setAlert('')
  }

  useEffect(()=>{
    return BackHandler.addEventListener('hardwareBackPress', props.onCancel).remove
  }, [])

  const validateEmail = (email: string) => {
    return email.split('@').length === 2
  }

  const register = async () => {
    if (!validateEmail(username))
      return setAlert('Invalid email')
    if (confirmPassword !== password)
      return setAlert(`Passwords don't match!`)

    const result = await Auth.signUp({
      username, password,
      attributes: {
        email: username,
      }
    })
  }

  return (
    <View style={css.container}>
      <View style={{flex: 1, justifyContent: 'flex-end'}}>
        <AppText style={css.title}>New Account</AppText>
      </View>
      <View style={{marginBottom: style.margin,}}>
        <AppInput label="Username" type="username" onChangeText={setUsername} />
        <AppInput label="Password" type="new_password" onChangeText={setPassword} />
        <AppInput label="Confirm Password" type="password" onChangeText={setConfirmPassword}  />
      </View>
     {alert.length > 1 && <AppText style={css.alert_text}>{alert}</AppText>}
      <View style={{flex: 1}}>
       <AppButton label="Create Account" onPress={register} />
       <AppButton label="Cancel" onPress={props.onCancel} />
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
  alert_text: {
    color: colors.alert,
  },
})

export default RegisterLayout