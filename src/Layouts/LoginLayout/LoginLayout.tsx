import React, { useEffect } from 'react'
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { Navigation } from '../../App'
import { AppText } from '../../Components'
import { colors, style } from '../../Styling'
import { screen } from '../../Utils'

const LoginLayout = (props: {active?: boolean, onLogin: ()=>{}}) => {
  useEffect(() => {
    if (props.active)
      Navigation.header = () => <View style={css.header}><AppText style={css.header_text}>Welcome to Our To-Do List!</AppText></View>
  }, [props.active])

  return (
    <View style={css.container}>
      <View style={{flex: 1}}>
        <Text style={css.title}>OUR TODO LIST</Text>
      </View>
      <View style={{flex: 1}}>
        <Input label="Username" />
        <Input label="Password" />
        <Separator />
        <Button label="Sign In" onPress={props.onLogin} />
        <Button label="New Account" onPress={()=>{}} />
        <TouchableOpacity>
          <AppText style={css.button_facebook_text}>Log in with Facebook</AppText>
        </TouchableOpacity>
      </View> 
      <View style={{flex: 1}} />
    </View>
  )
}

const Input = (props: {label: string}) => {
  return (
    <View style={css.input_container}>
      <TextInput style={css.input_text} placeholder={props.label} />
    </View>
  )
}
const Button = (props: {label: string, onPress: ()=>any}) => (
  <TouchableOpacity onPress={props.onPress}>
    <AppText style={css.button}>{props.label}</AppText>
  </TouchableOpacity>
)

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
    position: 'absolute',
    height: screen.height,
  },
  title: {
    color: colors.light,
    fontSize: style.font_size_big * 1.33,
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
  input_container: {
    borderRadius: style.border_radius_med,
    marginTop: style.margin,
    backgroundColor: colors.light,
    width: 300,
  },
  input_text: {
    fontSize: style.font_size_med,
    color: colors.dark,
  },
  button: {
    backgroundColor: colors.main,
    fontSize: style.font_size_big,
    padding: style.padding,
    paddingHorizontal: style.padding * 2,
    alignSelf: 'center',
    borderRadius: style.border_radius_med,
    marginTop: style.margin,
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