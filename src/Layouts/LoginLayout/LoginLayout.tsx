import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { AppButton, AppInput, AppText } from '../../Components'
import { colors, style } from '../../Styling'
import { screen } from '../../Utils'

const LoginLayout = (props: {onLogin: ()=>any, onRegister: ()=>any}) => {

  return (
    <View style={css.container}>
      <View style={{flex: 1}}>
        <Text style={css.title}>OUR TODO LIST</Text>
      </View>
      <View style={{flex: 1}}>
        <AppInput label="Username" type="username" />
        <AppInput label="Password" type="password" />
        <Separator />
        <AppButton label="Sign In" onPress={props.onLogin} />
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