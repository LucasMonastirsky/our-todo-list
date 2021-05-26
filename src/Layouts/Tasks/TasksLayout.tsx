import React, { useEffect, useState } from 'react'
import { LayoutAnimation, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, UIManager, View } from 'react-native'
import uuid from 'react-native-uuid'
import { ListsLayout } from '..'
import { API, Notifications } from '../../App'
import Navigation, { Layout } from '../../App/Navigation'
import { AppButtonItem, AppIcon, AppText, Horizontal } from '../../Components'
import { ItemCreator } from '../../Components'
import { Task, TodoList, User } from '../../Models'
import { colors, style } from '../../Styling'
import { DEBUG } from '../../Utils'
import DeleteModal from './DeleteModal'
import DeletingMessage from './DeletingMessage'
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
  const [extended, setExtended] = useState(false)
  const [delete_modal_active, setDeleteModalActive] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const removers: Function[] = []
    removers.push(Notifications.addTaskCreatedListener(onRemoteTaskCreated).remove)
    removers.push(Notifications.addTaskUpdatedListener(onRemoteTaskUpdated).remove)
  }, []) 

  useEffect(() => {
    if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental)
      UIManager.setLayoutAnimationEnabledExperimental(true)
  }, [])

  useEffect(() => {
    setMembers([])
    list.member_ids.forEach(id =>
      API.getCachedUser(id).then(user =>
        setMembers(prev => [...prev??[], user])))
  }, [list])

  const toggleExtended = () => {
    setExtended(x => !x)
  }
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

  const deleteList = async () => {
    setDeleting(true)
    await API.deleteTodoList(list.id)
    Navigation.goTo(ListsLayout)
  }
  //#endregion

  //#region Render
  const inputProps = (property: keyof TodoList & keyof typeof css) => ({
    style: css[property],
    value: changes[property] || list[property],
    spellCheck: false,
    editable: extended,
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
      total: Object.values(list.tasks).length,
      setScrollEnabled,
      setList,
    }} />
  )

  if (deleting)
    return <DeletingMessage list_title={list.title} />

  return (
    <View style={css.container}>
      <TouchableOpacity style={css.header} onPress={toggleExtended}>
        <Horizontal>
          <TextInput  {...inputProps('title')} />
          {extended && <AppIcon
            style={css.header_delete_icon}
            source={require('../../Media/Icons/remove.png')}
            onPress={()=>setDeleteModalActive(true)}
          />}
          {delete_modal_active && <DeleteModal list_title={list.title} onConfirm={deleteList} close={setDeleteModalActive} />}
        </Horizontal>
        <ListContactsBar {...{members, list, setList, extended}} />
        {extended &&
          <TouchableOpacity style={css.header_close} onPress={toggleExtended}>
            <View style={css.header_close_icon} />
          </TouchableOpacity>
        }
      </TouchableOpacity>
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
  header_delete_icon: {
    position: 'absolute',
    height: style.font_size_big,
    alignSelf: 'center',
    marginRight: style.padding,
    right: 0
  },
  header_close: {
    marginTop: style.margin,
    marginBottom: -style.padding,
    padding: style.margin,
  },
  header_close_icon: {
    height: style.padding,
    width: style.margin * 3,
    alignSelf: 'center',
    borderRadius: style.border_radius_med,
    backgroundColor: colors.light,
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