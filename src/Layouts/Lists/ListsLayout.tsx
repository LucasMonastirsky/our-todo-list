import { API, Navigation } from '../../App'
import React, { useEffect, useState } from 'react'
import { ScrollView, View } from 'react-native'
import { TodoList } from '../../Models'
import { Dictionary } from '../../Utils'
import { LayoutProps } from '../types'
import { AppText } from '../../Components'
import ListItem from './ListItem'
import TasksLayout from '../Tasks/TasksLayout'

type PropTypes = {
  
}

export default (props: PropTypes) => {
  const [lists, setLists] = useState<Dictionary<TodoList>>()
  const [selected_list_id, setSelectedListId] = useState<string>()

  useEffect(() => {
    API.getListsFrom(API.user).then(setLists)
  }, [])

  if (selected_list_id !== undefined)
    return <TasksLayout list={lists!.map[selected_list_id]} goBack={()=>{setSelectedListId(undefined);return true}} />

  if (lists === undefined) return (
    <View>

    </View>
  )

  return (
    <ScrollView>
      {lists.values.map(list => <ListItem {...{list}} onPress={()=>setSelectedListId(list.id)} />)}
    </ScrollView>
  )
}