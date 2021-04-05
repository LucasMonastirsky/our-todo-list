import React, { useState } from 'react'
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import TaskAddButton from '../../Components/TaskAddButton'
import TaskView from '../../Components/TaskView'
import { Task, TodoList } from '../../Models'
import { colors, style } from '../../Styling'
import ListTab from './ListTab'
import Drawer from 'react-native-drawer'
import { FadeContent } from '../../Components'

const debug_lists: TodoList[] = [
  new TodoList({
    title: 'Household',
    description: 'Tasks for our home!',
    id: '0',
    tasks: [
      new Task({title: 'Wash Dishes', creator_id: 'Laura', id: '0', position: 0}),
      new Task({title: 'Buy Tofu', creator_id: 'Josh', id: '1', position: 1}),
      new Task({title: 'Fill Hole in the Wall', creator_id: 'Laura', id: '2', position: 2}),
      new Task({title: 'Take Dog for a Walk', creator_id: 'Laura', id: '3', position: 3}),
      new Task({title: 'Develop App', creator_id: 'Josh', id: '4', position: 4}),
      new Task({title: 'I Ran out of Ideas', creator_id: 'Laura', id: '5', position: 5}),
    ]
  }),
  new TodoList({
    title: 'Vacation Trip',
    description: 'Things to do before going on vacation',
    id: '1',
    tasks: [
      new Task({title: 'Choose Destination', creator_id: 'Laura', id: '6', position: 0}),
      new Task({title: 'Book Tickets', creator_id: 'Josh', id: '7', position: 1}),
      new Task({title: 'Plan Activities', creator_id: 'Laura', id: '8', position: 2}),
      new Task({title: 'Find Someone to Take Care of the Dog', creator_id: 'Laura', id: '9', position: 3}),
      new Task({title: 'Ask for vacation at work', creator_id: 'Josh', id: '10', position: 4}),
      new Task({title: 'I Ran out of Ideas, yet again...', creator_id: 'Laura', id: '11', position: 5}),
    ]
  }),
]

const ListLayout = () => {
  const [lists, setLists] = useState(debug_lists)
  const [current_list_index, setCurrentListIndex] = useState(0)
  const [selecting_list, setSelectingList] = useState(false)
  const [drawer_active, setDrawerActive] = useState(false)

  const current_list = lists[current_list_index]

  const addTask = () => {
    const updated_list = {...current_list, tasks: [
      ...current_list.tasks,
      new Task({ id: `${current_list.tasks.length}`, creator_id: 'Josh', position: current_list.tasks.length })
    ]}
    const updated_lists = [...lists]
    updated_lists.splice(current_list_index, 1, updated_list)
    setLists(updated_lists)
  }

  const onSelectList = (index: number) => {
    setCurrentListIndex(index)
    setSelectingList(false)
  }

  const DrawerContent = () => {
    return (
      <View style={css.drawer_container}>
        <Text>Drawer!</Text>
      </View>
    )
  }

  return (
    <Drawer
      type="overlay"
      openDrawerOffset={0.5}
      open={drawer_active}
      onCloseStart={()=>setDrawerActive(false)}
      content={<DrawerContent />}
    >
      <View style={css.container}>
        <View style={css.header}>
          <TouchableOpacity style={css.options_button_container} onPress={()=>setDrawerActive(true)}>
            <Text style={css.options_button}>Options</Text>
          </TouchableOpacity>
          <TouchableOpacity style={css.list_title_container} onPress={()=>console.log('pressed members button')}>
          </TouchableOpacity>
        </View>
        <ListTab {...{lists}} onSelect={onSelectList} />
        {selecting_list &&
          <View style={css.list_select_container}>
            {lists.map((list, index) =>
              <TouchableOpacity style={css.list_select_item} onPress={()=>onSelectList(index)} key={index}>
                <Text style={css.list_select_item_text}>{list.title}</Text>
              </TouchableOpacity>
            )}
          </View>
        }
        <FlatList
          data={current_list.tasks}
          renderItem={({item})=>(
            <TaskView task={item} />
          )}
          ItemSeparatorComponent={()=><View style={css.item_divider} />}
        />
        <TaskAddButton onTouch={addTask} />
      </View>
      <FadeContent active={drawer_active} />
    </Drawer>
  )
}

const css = StyleSheet.create({
  container: {
    backgroundColor: colors.main_dark,
    flex: 1,
  },
  header: {
    height: 50,
    backgroundColor: colors.main,
    padding: style.padding,
    flexDirection: 'row',
  },
  list_title_container: {
    marginLeft: 'auto',
  },
  list_title: {
    fontSize: style.font_size_big,
    color: colors.light,
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
    fontSize: style.font_size_med,
    color: colors.light,
  },
  item_divider: {
    height: 2,
  },
  options_button_container: {

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
})

export default ListLayout