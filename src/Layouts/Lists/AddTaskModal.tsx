import React, { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { API } from '../../App'
import { AppButton, AppInputMin, AppModal } from '../../Components'
import { Task, TodoList } from '../../Models'
import { colors, style } from '../../Styling'
import { screen } from '../../Utils'

const default_task: Partial<Task> = {
  title: 'Task Title',
  id: '0',
  creator_id: '0',
  position: 0,
}

const AddTaskModal = (props: {list: TodoList, onAdd: (task: Task)=>any, close: AppModal.Close}) => {
  const [title, setTitle] = useState('New Task')
  const [description, setDescription] = useState('')

  const addTask = async () => {
    const user = API.user
    const final_task: Task = await API.createTask(props.list, { title, description })
    props.onAdd(final_task)
    props.close(false)
  }

  return (
    <AppModal close={props.close}>
      <View style={css.container}>
        <AppInputMin defaultValue='Task Title' onChangeText={setTitle} />
        <AppInputMin style={css.description} onChangeText={setDescription}
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