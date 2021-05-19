import React, { useEffect, useState } from 'react'
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import uuid from 'react-native-uuid'
import { API, Notifications } from '../../App'
import { AppButtonItem, AppIcon, AppText, Horizontal, ProfilePicture } from '../../Components'
import { ItemCreator } from '../../Components'
import { Task, TodoList, User } from '../../Models'
import { colors, style } from '../../Styling'
import { DEBUG } from '../../Utils'
import AddContactModal from './AddContactModal'
import TaskView from './TaskView'

export default (props: { list: TodoList }) => {
  const [list, setList] = useState(props.list)
  useEffect(()=>setList(props.list), [props.list])
  const setTaskInState = (task: Task) =>
    setList(prev => {
      prev.tasks[task.id] = task
      return {...prev}
  })

  const [members, setMembers] = useState<User[]>()
  const [changes, setChanges] = useState<Partial<TodoList>>({})

  const [scroll_enabled, setScrollEnabled] = useState(true)
  const [adding_task, setAddingTask] = useState(false)
  const [members_extended, setMembersExtended] = useState(false)
  const [add_contact_modal_active, setAddContactModalActive] = useState(false)

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

  //#region Remote Listeners
  // TODO: add sounds to remote events
  const onRemoteTaskCreated = (task: Task) => {
    setTaskInState(task)
  }

  const onRemoteTaskUpdated = (task: Task) => {
    setTaskInState(task)
  }
  //#endregion

  const uploadChanges = async () => {
    setList(prev => ({...prev, ...changes}))
    await API.editTodoList(list.id, changes)
  }

  const onSubmitTask = (title: string) => {
    const new_task: Task = {
      title: title,
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
    API.createTask(list, new_task).then(data => DEBUG.log(`Uploaded task ${data.title}`))
  }

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

  return (
    <View style={css.container}>
      <View style={css.header}>
        <Horizontal>
          <TextInput  {...inputProps('title')} />
        </Horizontal>
        <TouchableOpacity onPress={()=>setMembersExtended(true)}>
          {add_contact_modal_active && <AddContactModal {...{list, setList}} close={setAddContactModalActive} />}
          <View style={members_extended ? css.members_container_extended : css.members_container}>
            {members?.map(user => 
              <TouchableOpacity style={css.member_item} disabled={!members_extended}>
                <ProfilePicture user_id={user.id} size='small' />
                {members_extended &&
                  <AppText style={css.member_name}>{user.nickname}</AppText>
                }
              </TouchableOpacity>
            )}
            {members_extended && <>
              <TouchableOpacity style={css.member_add_button} onPress={()=>setAddContactModalActive(true)}>
                <AppText style={css.member_add_text}>Add a contact...</AppText>
              </TouchableOpacity>
              <TouchableOpacity style={css.members_close} onPress={()=>setMembersExtended(false)}>
                <View style={css.members_close_icon} />
              </TouchableOpacity>
            </>
            }
          </View>
        </TouchableOpacity>
      </View>
      {/* this needs optimization */}
      {Object.values(list.tasks).length < 1 && !adding_task 
      ? <View style={css.no_tasks_text_container}>
          <AppText style={css.no_tasks_text}>This list has no tasks</AppText>
          <AppText style={css.no_tasks_text}>Add a task by pressing the button at the bottom of the screen</AppText>
        </View>
      : <ScrollView scrollEnabled={scroll_enabled}>
          {adding_task && <ItemCreator onSubmit={onSubmitTask} onCancel={setAddingTask} />}
          {Object.values(list.tasks).filter(x=>x.status !== 'Done').map((item, index)=>(
            <TaskView {...{
              key: item.id,
              task: item,
              index,
              setScrollEnabled,
              setList,
            }} />
          ))}
          {Object.values(list.tasks).filter(x=>x.status === 'Done').map((item, index)=>(
            <TaskView {...{
              key: item.id,
              task: item,
              index,
              setScrollEnabled,
              setList,
            }} />
          ))}
        </ScrollView>
      }
      <AppButtonItem onPress={() => setAddingTask(true)} />
    </View>
  )
}

const css = StyleSheet.create({
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
  members_container: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  members_container_extended: {
  },
  member_item: {
    marginRight: style.padding,
    marginBottom: style.padding,
    flexDirection: 'row',
  },
  member_icon: {
    marginRight: style.margin,
  },
  member_name: {
    marginLeft: style.padding,
  },
  member_add_button: {
    padding: style.padding,
  },
  member_add_text: {

  },
  members_close: {
    marginTop: style.margin,
    marginBottom: -style.padding,
    padding: style.margin,
  },
  members_close_icon: {
    height: style.padding,
    width: style.margin * 3,
    alignSelf: 'center',
    borderRadius: style.border_radius_med,
    backgroundColor: colors.light,
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