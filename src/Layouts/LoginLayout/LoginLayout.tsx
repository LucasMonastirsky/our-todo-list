import React, { useEffect } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Navigation } from '../../App'
import { AppText } from '../../Components'
import { colors, style } from '../../Styling'

const LoginLayout = (props: {active?: boolean}) => {
  useEffect(() => {
    if (props.active)
      Navigation.header = () => <View style={css.header}><AppText style={css.header_text}>Welcome to Our To-Do List!</AppText></View>
  }, [props.active])

  return (
    <View style={css.container}>
      <View style={{flex: 1, marginVertical: -style.header_height}}>
        <View style={{height: style.header_height}} />
        <Text style={css.title}>OUR TODO LIST</Text>
      </View>
      <View style={{flex: 1, justifyContent: 'center',}}>
        <Input label="Username" />
        <Input label="Password" />
        <Separator />
        <View style={css.button_facebook}>
          <Text style={css.button_facebook_text}>Log in with Facebook</Text>
        </View>
      </View>
      <View style={{flex: 1}} />
    </View>
  )
}

const Input = (props: {label: string}) => {
  return (
    <View style={css.input_container}>
      <Text style={css.input_text}>{props.label}</Text>
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
    padding: style.padding,
    marginTop: style.margin,
    backgroundColor: colors.light,
    width: 300,
    // alignSelf: 'center',
  },
  input_text: {
    fontSize: style.font_size_med,
    color: colors.dark,
  },
  button_facebook: {
    marginTop: style.margin,
    backgroundColor: '#3B5998',
    padding: style.padding,
    borderRadius: style.border_radius_med,
  },
  button_facebook_text: {
    fontSize: style.font_size_big,
    color: colors.light,
    alignSelf: 'center',
  },
})

export default LoginLayout