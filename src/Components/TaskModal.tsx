import React, { useState } from 'react'
import { View, StyleSheet, Modal, TouchableWithoutFeedback } from 'react-native'
import { AppText } from '../Components'
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
              <AppText style={css.title}>{task.title}</AppText>
              <AppText style={css.status}>{task.status}</AppText>
            </View> 
            <Divider />
            {task.description !== '' && <>
              <AppText style={css.description}>{task.description}</AppText>
              <Divider />
            </>}
            <View style={css.created_container}>
              <AppText style={css.created_text}>Created by {task.creator_id} on {new Date(task.creation_date).toDateString()}</AppText>
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
    fontSize: style.font_size_big,
  },
  status: {
    fontSize: style.font_size_small,
    marginLeft: 'auto',
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  description: {
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
    fontSize: style.font_size_small,
  },
})

export default TaskModal