import React, { useState } from 'react'
import { StyleSheet, TextInput } from 'react-native'
import { API } from '../../App'
import { AppButton, AppInputMin, AppModal } from '../../Components'
import { Task, TodoList } from '../../Models'
import { colors, style } from '../../Styling'
import { StateSetter } from '../../Types'
import { Dictionary, screen, DEBUG } from '../../Utils'
import { default as uuid } from 'react-native-uuid'

const default_task: Partial<Task> = {
  title: 'Task Title',
  id: '0',
  creator_id: '0',
  position: 0,
}

type PropTypes = {
  list: TodoList, 
  setLists: StateSetter<Dictionary<TodoList>>,
  close: AppModal.Close
}
const AddTaskModal = (props: PropTypes) => {
  const [title, setTitle] = useState('New Task')
  const [description, setDescription] = useState('')

  const addTask = async () => {
    const id = `${uuid.v4()}`

    props.setLists(previous_lists => {
      previous_lists.map[props.list.id].tasks[id] = {
        title,
        description,
        status: 'Pending',
        id: id,
        list_id: props.list.id,
        creator_id: API.user.id,
        creation_date: Date.now(),
        position: 0,
      }
      return previous_lists.clone()
    })
    API.createTask(props.list, { title, description, id })
      .then(new_task => {
        DEBUG.log(`Got new task from API, replacing temporary local task...`)
        props.setLists(previous_lists => {
          previous_lists.map[props.list.id].tasks[new_task.id] = new_task
          return previous_lists.clone()
        })
      })
      .catch(e => {
        DEBUG.error(`Error while creating task ${title}:`, e)
        props.setLists(previous_lists => {
          delete previous_lists.map[props.list.id].tasks[id]
          return previous_lists.clone()
        })
      })
    props.close(false)
  }

  return (
    <AppModal close={props.close}>
      <TextInput style={css.title_input} defaultValue='Task Title' onChangeText={setTitle} />
      <AppInputMin style={css.description} onChangeText={setDescription}
        defaultValue={default_task.description}
        placeholder='Give the task a description'
        placeholderTextColor={colors.light_dark}
        multiline
      />
      <AppButton label='Add Task' onPress={addTask} style={css.button_add_task} />
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
  title_input: {
    color: colors.light,
    fontSize: style.font_size_big,
    backgroundColor: colors.main,
    borderTopLeftRadius: style.border_radius_big,
    borderTopRightRadius: style.border_radius_big,
    textAlign: 'center',
  },
  description: {
    fontSize: style.font_size_small,
  },
  button_add_task: {
    margin: style.padding,
  },
})

export default AddTaskModal