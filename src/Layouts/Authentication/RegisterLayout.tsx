import React, { useEffect, useState } from 'react'
import { BackHandler, StyleSheet, View } from 'react-native'
import { AppButton, AppInput, AppText, Loading } from '../../Components'
import { colors, style } from '../../Styling'
import { screen } from '../../Utils'
import { Auth } from 'aws-amplify'
import { API } from '../../App'

const USERNAME_MIN_LENGTH = 3
const PASSWORD_MIN_LENGTH = 8

const RegisterLayout = (props: {onCancel: ()=>any, onRegister: (username: string)=>void}) => {
  const [loading, setLoading] = useState(false)
  const [username, _setUsername] = useState('')
  const [email, _setEmail] = useState('')
  const [password, _setPassword] = useState('')
  const [confirmPassword, _setConfirmPassword] = useState('')
  const [alert, setAlert] = useState<string>('')
  const [phase, setPhase] = useState<'registering'|'confirming'|'loading'>('registering')
  const [confirmation_code, setConfirmationCode] = useState('')

  const setUsername = (value: string) => {
    _setUsername(value)
    setAlert('')
  }

  const setEmail = (value: string) => {
    _setEmail(value)
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
    if (username.length < USERNAME_MIN_LENGTH)
      return setAlert(`Username must be longer than ${USERNAME_MIN_LENGTH} characters`)
    if (!validateEmail(email))
      return setAlert('Invalid email')
    if (confirmPassword !== password)
      return setAlert(`Passwords don't match!`)
    if (password.length < PASSWORD_MIN_LENGTH)
      return setAlert(`Password must be longer than ${PASSWORD_MIN_LENGTH} characters`)

    setLoading(true)
    API.registerUser(username, password, email)
      .then(() => setPhase('confirming'))
      .catch(error => setAlert(error.message))
      .finally(() => setLoading(false))
  }

  const confirmUser = async () => {
    if (confirmation_code.length !== 6)
      return setAlert('Confirmation code must be 6 characters long')
    
    setLoading(true)

    API.confirmUser(username, confirmation_code)
      .then(() => {
        API.signIn(username, password)
          .then(() => props.onRegister(username))
      })
      .catch(message => {
        setAlert(message)
        setLoading(false)
      })
  }

  const resendConfirmationCode = async () => {
    await Auth.resendSignUp(username)
  }

  return loading
  ? <View style={css.container}><Loading /></View>
  : (
    <View style={css.container}>
      {phase === 'registering' && (<>
        <View style={{flex: 1, justifyContent: 'flex-end'}}>
          <AppText style={css.title}>New Account</AppText>
        </View>
        <View style={{marginBottom: style.margin,}}>
          <AppInput label="Username" type="username" onChangeText={setUsername} />
          <AppInput label="Email" type="username" onChangeText={setEmail} />
          <AppInput label="Password" type="new_password" onChangeText={setPassword} />
          <AppInput label="Confirm Password" type="password" onChangeText={setConfirmPassword}  />
        </View>
        {alert.length > 1 && <AppText style={css.alert_text}>{alert}</AppText>}
        <View style={{flex: 1}}>
        <AppButton label="Create Account" onPress={register} />
        <AppButton label="Cancel" onPress={props.onCancel} />
        </View>
      </>)}
      {phase === 'confirming' && (<>
        <View>
          <AppText style={css.title}>Enter Confirmation Code</AppText>
          <AppInput label="Confirmation Code" type="numeric" onChangeText={setConfirmationCode} />
          {alert.length > 1 && <AppText style={css.alert_text}>{alert}</AppText>}
          <AppButton label="Confirm" onPress={confirmUser} />
          <AppButton label="Resend Code" onPress={resendConfirmationCode} />
        </View>
      </>)}
      
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