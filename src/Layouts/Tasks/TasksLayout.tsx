import React, { useEffect, useState } from 'react'
import { ScrollView, StyleSheet, TextInput, View } from 'react-native'
import uuid from 'react-native-uuid'
import { API, Notifications } from '../../App'
import { Layout } from '../../App/Navigation'
import { AppButtonItem, AppText } from '../../Components'
import { ItemCreator } from '../../Components'
import { Task, TodoList, User } from '../../Models'
import { colors, style } from '../../Styling'
import { DEBUG } from '../../Utils'
import ListContactsBar from './ListContactsBar'
import TaskView from './TaskView'

const view = (props: { list: TodoList }) => {
  //#region Lifecycle
  const [list, setList] = useState(props.list)
  useEffect(()=>setList(props.list), [props.list])
  const setTaskInState = (task: Task) =>
    setList(prev => {
      prev.tasks[task.id] = task
      return {...prev}
  })

  const [members, setMembers] = useState<User[]>()
  const [changes, setChanges] = useState<Partial<TodoList>>({})
  const [new_task_title, setNewTaskTitle] = useState('')

  const [scroll_enabled, setScrollEnabled] = useState(true)
  const [adding_task, setAddingTask] = useState(false)

  useEffect(() => {
    const removers: Function[] = []
    removers.push(Notifications.addTaskCreatedListener(onRemoteTaskCreated).remove)
    removers.push(Notifications.addTaskUpdatedListener(onRemoteTaskUpdated).remove)
  }, []) 

  useEffect(() => {
    setMembers([])
    list.member_ids.forEach(id =>
      API.getCachedUser(id).then(user =>
        setMembers(prev => [...prev??[], user])))
  }, [list])
  //#endregion

  //#region Remote Listeners
  // TODO: add sounds to remote events
  const onRemoteTaskCreated = (task: Task) => {
    if (task.list_id === list.id) {
      setTaskInState(task)
      return true
    }
  }

  const onRemoteTaskUpdated = (task: Task) => {
    if (task.list_id === list.id) {
      setTaskInState(task)
      return true
    }
  }
  //#endregion

  //#region Actions
  const uploadChanges = async () => {
    setList(prev => ({...prev, ...changes}))
    await API.editTodoList(list.id, changes)
  }

  const submitNewTask = () => {
    if (new_task_title.length < 1)
      return

    const new_task: Task = {
      title: new_task_title!,
      description: '',
      id: `${uuid.v4()}`,
      status: 'Pending',
      list_id: list.id,
      creator_id: API.user.id,
      creation_date: Date.now(),
      position: 0,
    }
    list.tasks[new_task.id] = new_task
    setList({...list})
    setAddingTask(false)
    setNewTaskTitle('')
    API.createTask(list, new_task).then(data => DEBUG.log(`Uploaded task ${data.title}`))
  }
  //#endregion

  //#region Render
  const inputProps = (property: keyof TodoList & keyof typeof css) => ({
    style: css[property],
    value: changes[property] || list[property],
    spellCheck: false,
    onChangeText: (text: string) => setChanges(prev => ({...prev, [property]: text})),
    onSubmitEditing: uploadChanges,
    onEndEditing: () => setChanges(prev => {
      delete prev[property]
      return {...prev}
    })
  })

  const mapTask = (task: Task, index: number) => (
    <TaskView {...{
      key: task.id,
      task: task,
      index,
      setScrollEnabled,
      setList,
    }} />
  )

  return (
    <View style={css.container}>
      <View style={css.header}>
        <TextInput  {...inputProps('title')} />
        <ListContactsBar {...{members, list, setList}} />
      </View>
      {/* TODO: this needs optimization */}
      {Object.values(list.tasks).length < 1 && !adding_task 
      ? <View style={css.no_tasks_text_container}>
          <AppText style={css.no_tasks_text}>This list has no tasks</AppText>
          <AppText style={css.no_tasks_text}>Add a task by pressing the button at the bottom of the screen</AppText>
        </View>
      : <ScrollView scrollEnabled={scroll_enabled}>
          {adding_task && <ItemCreator onChange={setNewTaskTitle} onSubmit={submitNewTask} onCancel={setAddingTask} />}
          {Object.values(list.tasks).filter(x=>x.status !== 'Done').map(mapTask)}
          {Object.values(list.tasks).filter(x=>x.status === 'Done').map(mapTask)}
        </ScrollView>
      }
      <AppButtonItem icon={adding_task?'done':'plus'} onPress={adding_task?submitNewTask:()=>setAddingTask(true)} />
    </View>
  )
  //#endregion
}

export const css = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: style.padding,
    backgroundColor: colors.main,
  },
  title: {
    width: '100%',
    textAlign: 'center',
    fontSize: style.font_size_big,
    color: colors.light,
    padding: style.padding,
  },
  list_edit_icon: {
    marginLeft: 'auto',
    padding: style.padding / 1.5,
  },
  no_tasks_text_container: {
    flex: 1,
    justifyContent: 'center',
  },
  no_tasks_text: {
    textAlign: 'center',
    marginBottom: style.padding,
  },
  add_task_container: {
    height: style.font_size_med * 2,
    padding: style.padding,
    backgroundColor: colors.main,
    alignItems: 'center',
  },
  add_task_icon: {
    flex: 1,
    aspectRatio: 1,
  },
})

export default {
  name: 'Tasks',
  view,
} as Layout