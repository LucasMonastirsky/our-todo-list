import React, { useEffect } from 'react'
import { BackHandler, Keyboard, View, StyleSheet } from 'react-native'
import { AppInputMin } from '.'
import { colors, style } from '../Styling'

type PropTypes = {
  placeholder?: string,
  onCancel: (x?:any)=>any,
  onSubmit: (value?:string)=>any,
  onChange?: (text:string)=>any,
}
export default (props: PropTypes) => {
  useEffect(() => {
    const listeners = [
      BackHandler.addEventListener('hardwareBackPress', ()=>props.onCancel(false)),
      Keyboard.addListener('keyboardDidHide', ()=>props.onCancel(false))
    ]
    return () => {
      listeners.forEach(x => x.remove())
    }
  }, [])

  return (
    <View style={css.container}>
      <AppInputMin style={css.title_input}
        placeholder={props.placeholder}
        autoFocus
        autoCapitalize='words'
        onChangeText={props.onChange}
        onSubmitEditing={({nativeEvent})=>props.onSubmit(nativeEvent.text)}
        onEndEditing={()=>props.onCancel(false)}
      />
    </View>
  )
}

const css = StyleSheet.create({
  container: {
    backgroundColor: colors.main,
    marginTop: style.border_width,
  },
  title_input: {

  },
})