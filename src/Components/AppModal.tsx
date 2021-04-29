import React, { useState } from 'react'
import { Modal, StyleSheet, TouchableWithoutFeedback, Animated, View } from 'react-native'
import { colors, style } from '../Styling'
import { createAnimation } from '../Utils'

const AppModal = (props: {children: any, close: (value: boolean)=>any, clear?: boolean}) => {
  const [active, setActive] = useState(true)

  const close = () => {
    setActive(false)
  }

  const fade_animation = createAnimation({
    from: 1 - +active,
    to: +active,
    condition: active,
    onDone: () => {
      if (!active)
        props.close(false)
    }
  })

  const fade_style = {
    backgroundColor: props.clear ?  '#00000000' : '#000000aa',
    opacity: fade_animation,
  }

  return (
    <Modal transparent onRequestClose={close}>
      <TouchableWithoutFeedback onPress={close}>
        <Animated.View style={[css.centered, fade_style]}>
          <TouchableWithoutFeedback>
            <View style={css.container}>
              {props.children}
            </View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  )
}

const css = StyleSheet.create({
  container: {
    marginHorizontal: style.margin,
    padding: style.padding,
    borderRadius: style.border_radius_big,
    backgroundColor: colors.main,
  },
  centered: {
    justifyContent: 'center',
    flex: 1,
  },
})

export default AppModal
module AppModal {
  export type Close = (value: boolean) => any
}