import React, { useState } from 'react'
import { Modal, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native'
import { AppButton, AppInputMin, AppModal, AppText } from '../../Components'
import { Task } from '../../Models'
import { colors, style } from '../../Styling'
import { screen } from '../../Utils'

const default_task = new Task({
  title: 'Task Title',
  id: '0',
  creator_id: '0',
  position: 0,
})

const AddTaskModal = (props: {onAdd: (task: Task)=>any, close: ()=>any}) => {
  const [task, setTask] = useState(default_task)

  const addTask = () => {
    props.onAdd(task)
    props.close()
  }

  return (
    <AppModal close={props.close}>
      <View style={css.container}>
        <AppInputMin defaultValue='Task Title' onChangeText={text=>setTask({...task, title: text})} />
        <AppInputMin style={css.description} onChangeText={text=>setTask({...task, description: text})}
          defaultValue={default_task.description}
          placeholder='Give the task a description'
          placeholderTextColor={colors.light_dark}
          multiline
        />
        <AppButton label='Add Task' onPress={addTask} style={css.button_add_task} />
      </View>
    </AppModal>
  )
}

const css = StyleSheet.create({
  container: {
    // flex: 1,
    // width: 'auto',
    marginHorizontal: screen.width / 10,
    backgroundColor: colors.main,
    padding: style.padding,
    borderRadius: style.border_radius_med,
  },
  description: {
    fontSize: style.font_size_small,
  },
  button_add_task: {
    marginTop: 'auto',
    marginLeft: 'auto',
    marginRight: style.margin,
  },
})

export default AddTaskModal