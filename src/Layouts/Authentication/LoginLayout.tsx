import React, { useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { API } from '../../App'
import { AppButton, AppInput, AppText, Loading } from '../../Components'
import { colors, style } from '../../Styling'
import { screen } from '../../Utils'

const LoginLayout = (props: {onLogin: ()=>any, onRegister: ()=>any}) => {
  const [loading, setLoading] = useState(false)
  const [username, _setUsername] = useState('')
  const [password, _setPassword] = useState('')
  const [error_message, setErrorMessage] = useState<string>()

  const setUsername = (value: string) => {
    _setUsername(value)
    setErrorMessage(undefined)
  }

  const setPassword = (value: string) => {
    _setPassword(value)
    setErrorMessage(undefined)
  }

  const login = async () => {
    if (password.length < 8)
      return setErrorMessage(`Incorrect password`)

    setLoading(true)
    API.signIn(username, password)
      .then(props.onLogin)
      .catch(err => setErrorMessage(err.message))
      .finally(() => setLoading(false))
  }

  if (loading)
    return <View style={css.container}><Loading /></View>

  return (
    <View style={css.container}>
      <View style={{flex: 1}}>
        <Text style={css.title}>OUR TODO LIST</Text>
      </View>
      <View style={{flex: 1}}>
        <AppInput label="Username" type="username" onChangeText={setUsername} />
        <AppInput label="Password" type="password" onChangeText={setPassword} />
        {error_message && <AppText style={css.error_message}>{error_message}</AppText>}
        <Separator />
        <AppButton label="Sign In" onPress={login} />
        <AppButton label="New Account" onPress={props.onRegister} />
        <TouchableOpacity>
          <AppText style={css.button_facebook_text}>Log in with Facebook</AppText>
        </TouchableOpacity>
      </View> 
      <View style={{flex: 1}} />
    </View>
  )
}

const Separator = () => <View style={css.separator}/>

const css = StyleSheet.create({
  header: {
    flex: 1,
    justifyContent: 'center',
  },
  header_text: {
    alignSelf: 'flex-end',
  },
  container: {
    alignSelf: 'center',
    height: screen.height,
  },
  title: {
    color: colors.light,
    fontSize: style.font_size_huge,
    marginTop: 'auto',
    marginBottom: style.margin,
    fontWeight: 'bold',
    alignSelf: 'center',
  },
  error_message: {
    color: colors.alert,
    marginTop: style.margin,
  },
  separator: {
    margin: style.margin,
    marginBottom: 0,
    borderRadius: style.border_radius_big,
    backgroundColor: colors.light_dark,
    height: style.border_width,
  },
  button_facebook_text: {
    fontSize: style.font_size_big,
    color: colors.light,
    alignSelf: 'center',
    backgroundColor: '#3B5998',
    padding: style.padding,
    paddingHorizontal: style.padding * 2,
    borderRadius: style.border_radius_med,
    marginTop: style.margin,
  },
})

export default LoginLayout