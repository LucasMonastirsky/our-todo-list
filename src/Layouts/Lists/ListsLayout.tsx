import React, { useEffect, useState } from 'react'
import { FlatList, Image, ImageSourcePropType, Modal, StyleSheet, TouchableOpacity, View } from 'react-native'
import TaskView from './TaskView'
import { Task, TASK_STATUS, TodoList } from '../../Models'
import { colors, style } from '../../Styling'
import ListTab from './ListTab'
import { API, Navigation } from '../../App'
import { LayoutProps } from '../types'
import AddTaskModal from './AddTaskModal'
import ListEditModal from './ListEditModal'
import ListAddModal from './ListAddModal'
import { AppText, Loading } from '../../Components'
import DEBUG from '../../Utils/DEBUG'

const ListLayout = (props: LayoutProps) => {
  const [lists, setLists] = useState<TodoList[]>([])
  const [getting_lists, setGettingLists] = useState(true)
  const [current_list_index, setCurrentListIndex] = useState(0)
  const [adding_task, setAddingTask] = useState(false)
  const [editting, setEditting] = useState(false)
  const [adding_list, setAddingList] = useState(false)

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

  const updateList = (list: TodoList) => {
    const new_lists = [...lists]
    new_lists.splice(current_list_index, 1, list)
    setLists(new_lists)
  }

  const updateTask = (index: number, task: Task) => {
    const new_list = {...current_list}
    new_list.tasks[index] = task
    updateList(new_list)
  }

  const onRemoveList = () => {
    const new_lists = [...lists]
    new_lists.splice(current_list_index, 1)
    setLists(new_lists)
  }

  const onTaskFinished = (task: Task, task_index: number) => {
    DEBUG.log(`Finished task ${current_list.tasks[task_index].title}`)
    current_list.tasks.splice(task_index, 1, {...task, status: TASK_STATUS.DONE})
    const new_lists = [...lists]
    new_lists.splice(current_list_index, 1, current_list)
    setLists(new_lists)
  }
  //#endregion

  //#region Render
  useEffect(() => {
    if (props.active) Navigation.header = () => {
      const Icon = ({source, onPress}: {source: ImageSourcePropType, onPress: ()=>any}) => (
        <TouchableOpacity style={css.header_icon_container} {...{onPress}}>
            <Image style={css.header_icon_img} {...{source}} />
        </TouchableOpacity>
      )
  
      return (
        <View style={css.header}>
          <Icon source={require('../../Media/Icons/edit.png')} onPress={()=>setEditting(true)} />
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

  else return (
    <View style={css.container}>
      {adding_task && <AddTaskModal list={current_list} onAdd={addTask} close={()=>setAddingTask(false)} />}
      {editting && <ListEditModal list={current_list} editList={updateList} {...{onRemoveList}} close={()=>setEditting(false)} />}
      {adding_list && <ListAddModal add={addList} close={setAddingList} />}
      {!current_list ? <AppText>No lists.</AppText>
      : <>
        <ListTab {...{lists}} onSelect={i=>setCurrentListIndex(i)} />
        <FlatList
          data={current_list.tasks}
          renderItem={({item, index})=>item.status === TASK_STATUS.DONE ? null : (
            <TaskView {...{
              task: item,
              index,
              updateTask: task => updateTask(index, task),
              onTaskFinished: () => onTaskFinished(item, index)
            }} />
          )}
        />
      </>
      }
      <View style={css.add_task_button_container}>
        <TouchableOpacity style={css.add_task_button_background} onPress={()=>setAddingTask(true)}>
            <Image style={css.add_task_button_img} source={require('../../Media/Icons/plus.png')}/>
        </TouchableOpacity>
      </View>
    </View>
  )
  //#endregion
}

const css = StyleSheet.create({
  container: {
    backgroundColor: colors.main_dark,
    height: '100%',
    width: '100%',
  },
  header: {
    flex: 1,
    flexDirection: 'row',
    padding: style.padding,
    justifyContent: 'flex-end',
  },
  header_icon_container: {
    marginLeft: style.margin,
  },
  header_icon_img: {
    flex: 1,
    aspectRatio: 1,
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
  add_task_button_container: {
    height: 75,
    width: 75,
    position: 'absolute',
    right: 0,
    bottom: 0,
    zIndex: 1,
    padding: style.margin,
  },
  add_task_button_background: {
    backgroundColor: colors.main,
    flex: 1,
    borderRadius: 100,
    padding: '20%',
  },
  add_task_button_img: {
    flex: 1,
    height: undefined,
    width: undefined,
  },
})

export default ListLayout