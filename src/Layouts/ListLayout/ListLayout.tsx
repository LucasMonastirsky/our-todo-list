import React, { useEffect, useState } from 'react'
import { FlatList, Image, ImageSourcePropType, StyleSheet, TouchableOpacity, View } from 'react-native'
import TaskAddButton from '../../Components/TaskAddButton'
import TaskView from './TaskView'
import { Task, TodoList } from '../../Models'
import { colors, style } from '../../Styling'
import ListTab from './ListTab'
import { AppText } from '../../Components'
import { Navigation } from '../../App'

const debug_lists: TodoList[] = [
  new TodoList({
    title: 'Household',
    description: 'Tasks for our home!',
    id: '0',
    tasks: [
      new Task({title: 'Wash Dishes', creator_id: 'Laura', id: '0', position: 0}),
      new Task({title: 'Buy Tofu', creator_id: 'Josh', id: '1', position: 1, description: `The normal kind, not the flavoured kind, it's more expensive!`}),
      new Task({title: 'Fill Hole in the Wall', creator_id: 'Laura', id: '2', position: 2}),
      new Task({title: 'Take Dog for a Walk', creator_id: 'Laura', id: '3', position: 3}),
      new Task({title: 'Develop App', creator_id: 'Josh', id: '4', position: 4, description: `Yes, this one.`}),
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
  new TodoList({
    title: 'Project Car',
    description: 'An absolute money pit',
    id: '2',
    tasks: [
      new Task({title: 'Buy new jack', creator_id: 'Laura', id: '12', position: 0}),
      new Task({title: 'Fabricate brake adaptor plate', creator_id: 'Josh', id: '13', position: 1}),
      new Task({title: 'Buy disc brakes', creator_id: 'Laura', id: '14', position: 2}),
      new Task({title: 'Buy fuel tank', creator_id: 'Laura', id: '15', position: 3}),
      new Task({title: 'Build control box', creator_id: 'Josh', id: '16', position: 4}),
      new Task({title: 'Replace alternator', creator_id: 'Laura', id: '17', position: 5}),
    ]
  }),
  new TodoList({
    title: 'Cows Rule',
    description: 'Things to do before going on vacation',
    id: '3',
    tasks: [
      new Task({title: 'They are so pretty', creator_id: 'Laura', id: '18', position: 0}),
      new Task({title: 'In any colour', creator_id: 'Josh', id: '19', position: 1}),
      new Task({title: 'I love them', creator_id: 'Laura', id: '20', position: 2}),
    ]
  }),
  new TodoList({
    title: 'Project Car',
    description: 'Things to do before going on vacation',
    id: '4',
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

const ListLayout = (props: {active?: boolean}) => {
  const [lists, setLists] = useState(debug_lists)
  const [current_list_index, setCurrentListIndex] = useState(0)
  const [selecting_list, setSelectingList] = useState(false)

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

  useEffect(() => {
    if (props.active) Navigation.header = () => {
      const Icon = (props: {source: ImageSourcePropType}) => (
        <TouchableOpacity style={css.header_icon_container} onPress={()=>{}}>
            <Image style={css.header_icon_img} source={props.source} />
        </TouchableOpacity>
      )
  
      return (
        <View style={css.header}>
          <Icon source={require('../../Images/Icons/edit.png')} />
          <Icon source={require('../../Images/Icons/plus.png')} />
        </View>
      )
    }
  }, [props.active])

  return (
    <View style={css.container}>
      <ListTab {...{lists}} onSelect={onSelectList} />
      {selecting_list &&
        <View style={css.list_select_container}>
          {lists.map((list, index) =>
            <TouchableOpacity style={css.list_select_item} onPress={()=>onSelectList(index)} key={index}>
              <AppText style={css.list_select_item_text}>{list.title}</AppText>
            </TouchableOpacity>
          )}
        </View>
      }
      <FlatList
        data={current_list.tasks}
        renderItem={({item, index})=>(
          <TaskView {...{task: item, index}} />
        )}
      />
      <TaskAddButton onTouch={addTask} />
    </View>
  )
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
})

export default ListLayout