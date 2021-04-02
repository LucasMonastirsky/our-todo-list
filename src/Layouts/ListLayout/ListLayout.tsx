import React, { useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { TaskList } from '../../Components'
import TaskAddButton from '../../Components/TaskAddButton'
import { Task, TodoList } from '../../Models'
import { colors, style } from '../../Styling'

const debug_lists: TodoList[] = [
  new TodoList({
    title: 'Household',
    description: 'Tasks for our home!',
    id: '0',
    tasks: [
      new Task({title: 'Wash Dishes', creator_id: 'Laura', id: '0'}),
      new Task({title: 'Buy Tofu', creator_id: 'Josh', id: '1'}),
      new Task({title: 'Fill Hole in the Wall', creator_id: 'Laura', id: '2'}),
      new Task({title: 'Take Dog for a Walk', creator_id: 'Laura', id: '3'}),
      new Task({title: 'Develop App', creator_id: 'Josh', id: '4'}),
      new Task({title: 'I Ran out of Ideas', creator_id: 'Laura', id: '5'}),
    ]
  }),
  new TodoList({
    title: 'Vacation Trip',
    description: 'Things to do before going on vacation',
    id: '1',
    tasks: [
      new Task({title: 'Choose Destination', creator_id: 'Laura', id: '6'}),
      new Task({title: 'Book Tickets', creator_id: 'Josh', id: '7'}),
      new Task({title: 'Plan Activities', creator_id: 'Laura', id: '8'}),
      new Task({title: 'Find Someone to Take Care of the Dog', creator_id: 'Laura', id: '9'}),
      new Task({title: 'Ask for vacation at work', creator_id: 'Josh', id: '10'}),
      new Task({title: 'I Ran out of Ideas, yet again...', creator_id: 'Laura', id: '11'}),
    ]
  }),
]

const ListLayout = () => {
  const [lists, setLists] = useState(debug_lists)
  const [current_list_index, setCurrentListIndex] = useState(0)
  const [selecting_list, setSelectingList] = useState(false)

  const current_list = lists[current_list_index]

  const addTask = () => {
    const updated_list = {...current_list, tasks: [
      ...current_list.tasks,
      new Task({ id: `${current_list.tasks.length}`, creator_id: 'Josh' })
    ]}
    const updated_lists = [...lists]
    updated_lists.splice(current_list_index, 1, updated_list)
    setLists(updated_lists)
  }

  const onSelectList = (index: number) => {
    setCurrentListIndex(index)
    setSelectingList(false)
  }

  return (
    <View style={css.container}>
      <View style={css.header}>
        <TouchableOpacity style={css.list_title_container} onPress={()=>setSelectingList(!selecting_list)}>
          <Text style={css.list_title}>{current_list.title}</Text>
        </TouchableOpacity>
      </View>
      {selecting_list &&
        <View style={css.list_select_container}>
          {lists.map((list, index) =>
            <TouchableOpacity style={css.list_select_item} onPress={()=>onSelectList(index)}>
              <Text style={css.list_select_item_text}>{list.title}</Text>
            </TouchableOpacity>
          )}
        </View>
      }
      <TaskList tasks={current_list.tasks} />
      <TaskAddButton onTouch={addTask} />
    </View>
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
})

export default ListLayout