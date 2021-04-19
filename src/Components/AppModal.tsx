import React from 'react'
import { Modal, StyleSheet, TouchableWithoutFeedback, View } from 'react-native'
import { colors } from '../Styling'

const AppModal = (props: {children: any, close: (value: boolean)=>any}) => {
  const close = () => props.close(false)

  return (
    <Modal transparent onRequestClose={close}>
      <TouchableWithoutFeedback onPress={close}>
        <View style={css.centered}>
          <TouchableWithoutFeedback>
            {props.children}
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  )
}

const css = StyleSheet.create({
  centered: {
    backgroundColor: colors.faded,
    justifyContent: 'center',
    flex: 1,
  },
})

export default AppModal
module AppModal {
  export type Close = (value: boolean) => any
}