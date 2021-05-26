import React, { useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { AppModal, AppText, Horizontal } from '../../Components'
import { colors, style } from '../../Styling'

type PropTypes = {
  list_title: string,
  onConfirm: ()=>any,
  close: (x: boolean)=>any,
}
export default ({list_title, onConfirm, close}: PropTypes) => {
  const [active, setActive] = useState(true)

  const onPressConfirm = () => {
    setActive(false)
    onConfirm()
  }

  return (
    <AppModal {...{close, active}}>
      <AppText style={css.title}>Delete List</AppText>
      <AppText style={css.description}>Are you sure you want to delete {list_title}?</AppText>
      <Horizontal>
        <TouchableOpacity style={css.button_confirm} onPress={onPressConfirm}>
          <AppText style={css.button_text}>Yes</AppText>
        </TouchableOpacity>
        <TouchableOpacity style={css.button_cancel} onPress={()=>setActive(false)}>
          <AppText style={css.button_text}>No</AppText>
        </TouchableOpacity>
      </Horizontal>
    </AppModal>
  )
}

const css = StyleSheet.create({
  title: {
    backgroundColor: colors.main,
    textAlign: 'center',
    fontSize: style.font_size_big,
    padding: style.padding,
  },
  description: {
    fontSize: style.font_size_med,
    textAlign: 'center',
    padding: style.margin,
  },
  button_confirm: {
    flex: 1,
    backgroundColor: colors.alert,
  },
  button_cancel: {
    flex: 1,
    backgroundColor: colors.main,
  },
  button_text: {
    textAlign: 'center',
    padding: style.padding,
  }
})