import React, { useEffect, useState } from 'react'
import { BackHandler, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import uuid from 'react-native-uuid'
import { API } from '../../App'
import { AppIcon, AppText, Horizontal, ProfilePicture } from '../../Components'
import { ItemCreator } from '../../Components'
import { Task, TodoList, User } from '../../Models'
import { colors, style } from '../../Styling'
import { DEBUG } from '../../Utils'
import TaskView from './TaskView'

type PropTypes = {
  list: TodoList,
  goBack: any,
}

export default (props: PropTypes) => {
  const [list, setList] = useState(props.list)
  useEffect(()=>setList(props.list), [props.list])

  const [scroll_enabled, setScrollEnabled] = useState(true)
  const [members, setMembers] = useState<User[]>()
  const [adding_task, setAddingTask] = useState(false)

  useEffect(() => {
    if (!members) list.member_ids.forEach(id =>
      API.getCachedUser(id).then(user =>
        setMembers(prev => [...prev??[], user])))

    return BackHandler.addEventListener('hardwareBackPress', props.goBack).remove
  }, []) 

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

  const MemberIcon = ({user}: {user: User}) => {
    return (
      <View style={css.member_icon}>
        <ProfilePicture user_id={user.id}/>
      </View>
    )
  }

  return (
    <View style={css.container}>
      <View style={css.header}>
        <Horizontal>
          <AppText style={css.title}>{list.title}</AppText>
          <AppIcon style={css.list_edit_icon} source={require('../../Media/Icons/edit.png')} />
        </Horizontal>
        <View style={css.members_container}>
          {members?.map(user => <MemberIcon {...{user}} />)}
        </View>
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
      <TouchableOpacity style={css.add_task_container} onPress={() => setAddingTask(true)}>
        <Image style={css.add_task_icon}
          source={adding_task ? require('../../Media/Icons/edit.png') : require('../../Media/Icons/plus.png')}
        />
      </TouchableOpacity>
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
    fontSize: style.font_size_big,
  },
  list_edit_icon: {
    marginLeft: 'auto',
    padding: style.padding / 1.5,
  },
  members_container: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  member_icon: {
    height: style.font_size_big * 2,
    aspectRatio: 1,
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