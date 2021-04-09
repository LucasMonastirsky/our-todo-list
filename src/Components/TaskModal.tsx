import React, { useState } from 'react'
import { View, StyleSheet, Modal, Text, TouchableWithoutFeedback } from 'react-native'
import { Task } from '../Models'
import { colors, style } from '../Styling'

const TaskModal = (props: { task: Task, onClose: ()=>void }) => {
  const [visible, setVisible] = useState(true)
  const { task } = props

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
              <Text style={css.title}>{task.title}</Text>
              <Text style={css.status}>{task.status}</Text>
            </View> 
            <Divider />
            {task.description !== '' && <>
              <Text style={css.description}>{task.description}</Text>
              <Divider />
            </>}
            <View style={css.created_container}>
              <Text style={css.created_text}>Created by {task.creator_id} on {new Date(task.creation_date).toDateString()}</Text>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  )
}

const Divider = () => <View style={css.divider} />

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
    backgroundColor: colors.main,
    width: '100%',
  },
  title_container: {
    flexDirection: 'row',
  },
  title: {
    color: colors.light,
    fontSize: style.font_size_big,
  },
  status: {
    color: colors.light,
    fontSize: style.font_size_small,
    marginLeft: 'auto',
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  description: {
    color: colors.light,
    fontSize: style.font_size_small,
    marginVertical: style.padding,
  },
  divider: {
    backgroundColor: colors.light,
    height: 1,
    marginHorizontal: style.margin,
    marginVertical: style.padding,
  },
  created_container: {

  },
  created_text: {
    color: colors.light,
    fontSize: style.font_size_small,
  },
})

export default TaskModal