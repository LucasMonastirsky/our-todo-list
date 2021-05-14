import React, { useEffect, useState } from 'react'
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import TaskView from './TaskView'
import { TodoList } from '../../Models'
import { colors, style } from '../../Styling'
import ListTab from './ListTab'
import { API, Navigation } from '../../App'
import { LayoutProps } from '../types'
import AddTaskModal from './AddTaskModal'
import ListEditModal from './ListEditModal'
import ListAddModal from './ListAddModal'
import { AppText, Loading } from '../../Components'
import ContactsModal from './ContactsModal'
import Icon from '../../Components/AppIcon'
import { DEBUG, Dictionary } from '../../Utils'

const ListLayout = (props: LayoutProps) => {
  const [lists, setLists] = useState<Dictionary<TodoList>>(new Dictionary<TodoList>({}))
  const [getting_lists, setGettingLists] = useState(true)
  const [current_list_index, setCurrentListIndex] = useState(0)
  const [adding_task, setAddingTask] = useState(false)
  const [editting, setEditting] = useState(false)
  const [adding_list, setAddingList] = useState(false)
  const [viewing_contacts, setViewingContancts] = useState(false)
  const [scroll_enabled, setScrollEnabled] = useState(true)

  const current_list = lists.values[current_list_index]

  useEffect(()=>{ // get lists
    API.getListsFrom(API.user).then(result => {
      DEBUG.log(result)
      setLists(result)
      setGettingLists(false)
    })
  }, [])

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
      <View style={{flex: 1, justifyContent: 'center'}}>
        <Loading />
      </View>
    )
  }

  return (
    <View style={css.container}>
      {adding_task && <AddTaskModal list={current_list} {...{setLists}} close={()=>setAddingTask(false)} />}
      {editting && <ListEditModal list={current_list} {...{setLists}} close={()=>setEditting(false)} />}
      {adding_list && <ListAddModal {...{setLists}} close={setAddingList} />}
      {viewing_contacts && <ContactsModal list={current_list} {...{setLists}} close={setViewingContancts} />}
      {!current_list ? <AppText>No lists.</AppText>
      : <>
        <ListTab {...{lists}} onSelect={i=>setCurrentListIndex(i)} />
        {/* this needs optimization */}
        <ScrollView scrollEnabled={scroll_enabled}>
          {Object.values(current_list.tasks).filter(x=>x.status !== 'Done').map((item, index)=>(
            <TaskView {...{
              key: item.id,
              task: item,
              index,
              setScrollEnabled,
              setLists,
              // updateTask: task => updateTask(task),
              // onTaskFinished: () => updateTask({ ...item,
              //   status: 'Done',
              //   completer_id: API.user.id,
              //   completion_date: Date.now(),
              //   claimed_by_id: API.user.id,
              // })}
            }} />
          ))}
          {Object.values(current_list.tasks).filter(x=>x.status === 'Done').map((item, index)=>(
            <TaskView {...{
              key: item.id,
              task: item,
              index,
              setScrollEnabled,
              setLists,
              // updateTask: task => updateTask(task),
              // onTaskFinished: () => {throw new Error(`Task ${item.title} is already done!`)}
            }} />
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