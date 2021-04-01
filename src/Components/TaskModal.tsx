import React, { useState } from 'react'
import { View, StyleSheet, Modal, Text, TouchableWithoutFeedback } from 'react-native'
import { Task } from '../Models'
import { colors, style } from '../Styling'

const TaskModal = (props: { task: Task, onClose: ()=>void }) => {
  const [visible, setVisible] = useState(true)

  const close = () => {
    setVisible(false)
    props.onClose()
  }

  return (
    <Modal transparent {...{visible}} onRequestClose={close}>
      <TouchableWithoutFeedback onPressOut={close}>
        <View style={css.centered}>
          <View style={css.container}>
            <View style={css.title_container}>
              <Text style={css.title}>{props.task.title}</Text>
            </View>
            <Text style={css.description}>{props.task.description}</Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  )
}

const css = StyleSheet.create({
  centered: {
    padding: style.margin,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000aa'
  },
  container: {
    padding: style.padding,
    borderRadius: style.border_radius_big,
    backgroundColor: colors.main_light,
    width: '100%',
  },
  title_container: {
    flexDirection: 'row',
  },
  title: {
    color: colors.dark,
    fontSize: style.font_size_big,
  },
  description: {

  },
})

export default TaskModal