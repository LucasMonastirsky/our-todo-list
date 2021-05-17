import { API, Navigation } from '../../App'
import React, { useEffect, useState } from 'react'
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import uuid from 'react-native-uuid'
import { TodoList } from '../../Models'
import { Dictionary } from '../../Utils'
import ListItem from './ListItem'
import { TasksLayout, ContactsLayout } from '../'
import { AppButtonItem, AppIcon, AppText, ProfilePicture } from '../../Components'
import { colors, style } from '../../Styling'
import { ItemCreator } from '../../Components'

type PropTypes = {
  
}

export default (props: PropTypes) => {
  const [lists, setLists] = useState<Dictionary<TodoList>>()
  const [selected_list_id, setSelectedListId] = useState<string>()

  const [adding_list, setAddingList] = useState(false)

  useEffect(() => {
    API.getListsFrom(API.user).then(setLists)
  }, [])

  const onSubmitList = (title: string) => {
    const new_list: TodoList = {
      title,
      description: '',
      id: `${uuid.v4()}`,
      tasks: {},
      owner_id: API.user.id,
      member_ids: [API.user.id]
    }
    setAddingList(false)
    setLists(prev => {
      prev!.map[new_list.id] = new_list
      return prev?.clone()
    })
    API.createTodoList({...new_list})
  }

  if (selected_list_id !== undefined)
    return <TasksLayout list={lists!.map[selected_list_id]} goBack={()=>{setSelectedListId(undefined);return true}} />

  if (lists === undefined) return (
    <View>

    </View>
  )

  return <>
    <View style={css.header}>
      <View style={{aspectRatio: 1}}>
        <ProfilePicture user_id={API.user.id} />
      </View>
      <AppText style={css.title}>{API.user.nickname}</AppText>
      <View style={{flex: 1}} />
      <AppIcon style={css.header_icon} onPress={()=>Navigation.goTo(ContactsLayout)} source={require('../../Media/Icons/contacts.png')} />
      <AppIcon style={css.header_icon} source={require('../../Media/Icons/options.png')} />
    </View>
    <ScrollView>
      {adding_list && <ItemCreator placeholder='New List Title' onSubmit={onSubmitList} onCancel={setAddingList} />}
      {lists.values.map(list => <ListItem {...{list}} onPress={()=>setSelectedListId(list.id)} />)}
    </ScrollView>
    <AppButtonItem onPress={()=>setAddingList(true)} />
</>
}

const css = StyleSheet.create({
  header: {
    flexDirection: 'row',
    padding: style.margin,
    backgroundColor: colors.main,
  },
  title: {
    fontSize: style.font_size_big,
    marginLeft: style.padding,
  },
  header_icon: {
    padding: style.padding / 2,
  },
})