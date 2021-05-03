import React, { useEffect, useState } from 'react'
import { FlatList, Image, ImageSourcePropType, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import TaskView from './TaskView'
import { Task, TodoList } from '../../Models'
import { colors, style } from '../../Styling'
import ListTab from './ListTab'
import { API, Navigation, Options } from '../../App'
import { LayoutProps } from '../types'
import AddTaskModal from './AddTaskModal'
import ListEditModal from './ListEditModal'
import ListAddModal from './ListAddModal'
import { AddFloatingButton, AppText, Loading } from '../../Components'
import DEBUG from '../../Utils/DEBUG'
import ContactsModal from './ContactsModal'
import Icon from '../../Components/AppIcon'
import { indexFromId } from '../../Utils'

const ListLayout = (props: LayoutProps) => {
  const [lists, setLists] = useState<TodoList[]>([])
  const [getting_lists, setGettingLists] = useState(true)
  const [current_list_index, setCurrentListIndex] = useState(0)
  const [adding_task, setAddingTask] = useState(false)
  const [editting, setEditting] = useState(false)
  const [adding_list, setAddingList] = useState(false)
  const [viewing_contacts, setViewingContancts] = useState(false)
  const [scroll_enabled, setScrollEnabled] = useState(true)

  const current_list = lists[current_list_index]

  useEffect(()=>{ // get lists
    API.getListsFrom(API.user).then(result => {
      setLists(result)
      setGettingLists(false)
    })
  }, [])

  //#region Methods
  const addTask = (task: Task) => {
    const updated_list = {...current_list, tasks: [
      ...current_list.tasks,
      task
    ]}
    const updated_lists = [...lists]
    updated_lists.splice(current_list_index, 1, updated_list)
    setLists(updated_lists)
  }

  const addList = (list: TodoList) => {
    setLists([...lists, list])
  }

  const updateList = (changes: Partial<TodoList>) => {
    const new_lists = [...lists]
    new_lists.splice(current_list_index, 1, {...current_list, ...changes})
    setLists([...new_lists])
  }

  const updateTask = (task: Task) => {
    const task_index = indexFromId(current_list.tasks, task.id)
    if (task_index < 0)
     throw new Error(`Could not find task ${task.title} in ${current_list.title}`)

    const new_list = {...current_list}
    new_list.tasks[task_index] = task
    updateList(new_list)
  }

  const onRemoveList = () => {
    const new_lists = [...lists]
    new_lists.splice(current_list_index, 1)
    setCurrentListIndex(i => i > 0 ? i-1 : 0)
    setLists(new_lists)
  }

  const addUserToList = (id: string) => {
    const new_list = {...current_list}
    new_list.member_ids.push(id)
    updateList(new_list)
  }

  const removeUserFromList = (id: string) => {
    const new_list = {...current_list}
    const user_index = new_list.member_ids.indexOf(id)
    new_list.member_ids.splice(user_index, 1)
    updateList(new_list)
  }
  //#endregion

  //#region Render
  useEffect(() => {
    if (props.active) Navigation.header = () => {
      return (
        <View style={css.header}>
          <Icon source={require('../../Media/Icons/edit.png')} onPress={()=>setEditting(true)} />
          <Icon source={require('../../Media/Icons/contacts.png')} onPress={()=>setViewingContancts(true)} />
          <Icon source={require('../../Media/Icons/plus.png')} onPress={()=>setAddingList(true)} />
        </View>
      )
    }
  }, [props.active])

  if (getting_lists) {
    return (
      <View style={css.container}>
        <Loading />
      </View>
    )
  }

  return (
    <View style={css.container}>
      {adding_task && <AddTaskModal list={current_list} onAdd={addTask} close={()=>setAddingTask(false)} />}
      {editting && <ListEditModal list={current_list} editList={updateList} {...{onRemoveList}} close={()=>setEditting(false)} />}
      {adding_list && <ListAddModal add={addList} close={setAddingList} />}
      {viewing_contacts && <ContactsModal list={current_list} onUserAdded={addUserToList} onUserRemoved={removeUserFromList} close={setViewingContancts} />}
      {!current_list ? <AppText>No lists.</AppText>
      : <>
        <ListTab {...{lists}} onSelect={i=>setCurrentListIndex(i)} />
        {/* this needs optimization */}
        <ScrollView scrollEnabled={scroll_enabled}>
          {current_list.tasks.filter(x=>x.status !== 'Done').map((item, index)=>(
            <TaskView {...{
              task: item,
              index,
              setScrollEnabled,
              updateTask: task => updateTask(task),
              onTaskFinished: () => updateTask({ ...item,
                status: 'Done',
                completer_id: API.user.id,
                completion_date: Date.now(),
                claimed_by_id: API.user.id,
              })}
            } />
          ))}
          {current_list.tasks.filter(x=>x.status === 'Done').map((item, index)=>(
            <TaskView {...{
              task: item,
              index,
              setScrollEnabled,
              updateTask: task => updateTask(task),
              onTaskFinished: () => {throw new Error(`Task ${item.title} is already done!`)}
              }}
            />
        ))}
        </ScrollView>
      </>
      }
      <TouchableOpacity onPress={()=>setAddingTask(true)}>
        <View style={css.add_button_container}>
          <Image style={css.add_button_icon} source={require('../../Media/Icons/plus.png')} />
        </View>
      </TouchableOpacity>
    </View>
  )
  //#endregion
}

const css = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    height: '100%',
    width: '100%',
  },
  header: {
    flex: 1,
    flexDirection: 'row',
    padding: style.padding,
    justifyContent: 'flex-end',
  },
  list_title_container: {
    marginLeft: 'auto',
  },
  list_title: {
    fontSize: style.font_size_big,
  },
  list_select_container: {
    backgroundColor: colors.main_dark + 'bb',
    padding: style.padding,
    position: 'absolute',
    right: 0,
    top: 50,
    zIndex: 1,
  },
  list_select_item: {

  },
  list_select_item_text: {
  },
  item_divider: {
    height: 2,
  },
  options_button: {
    color: colors.light,
    fontSize: style.font_size_med,
  },
  drawer_container: {
    backgroundColor: colors.main,
    height: '100%',
  },
  content_fade: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    backgroundColor: '#000000aa'
  },
  add_button_container: {
    backgroundColor: colors.main,
    borderTopWidth: style.border_width,
    borderColor: colors.background,
    height: 50,
    alignItems: 'center',
  },
  add_button_icon: {
    flex: 1,
    aspectRatio: 1,
    margin: style.margin,
  },
})

export default ListLayout