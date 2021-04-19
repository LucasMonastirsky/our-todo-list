import React, { useState } from 'react'
import { Modal, StyleSheet, TouchableWithoutFeedback, View } from 'react-native'
import { colors } from '../Styling'

export default ({children, close}: {children: any, close: ()=>any}) => {
  return (
    <Modal transparent onRequestClose={close}>
      <TouchableWithoutFeedback onPress={close}>
        <View style={css.centered}>
          <TouchableWithoutFeedback>
            {children}
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
    // alignItems: 'center',
    flex: 1,
  },
})