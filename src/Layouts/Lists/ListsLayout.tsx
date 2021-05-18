import { API, Navigation, Notifications } from '../../App'
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
import { Layout } from '../types'

type PropTypes = {
  
}

export default (props: PropTypes) => {
  const [lists, setLists] = useState<Dictionary<TodoList>>()

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

  const onListSelected = (id: string) => {
    Navigation.goTo(TasksLayout as Layout, {list: lists!.map[id]})
  }

  if (lists === undefined) return ( // TODO: add message when user has no lists
    <View>

    </View>
  )

  return <>
    <View style={css.header}>
      <ProfilePicture user_id={API.user.id} size='medium' />
      <AppText style={css.title}>{API.user.nickname}</AppText>
      <View style={{flex: 1}} />
      <AppIcon style={css.header_icon} onPress={()=>Navigation.goTo(ContactsLayout)} source={require('../../Media/Icons/contacts.png')} />
      <AppIcon style={css.header_icon} source={require('../../Media/Icons/options.png')} />
    </View>
    <ScrollView>
      {adding_list && <ItemCreator placeholder='New List Title' onSubmit={onSubmitList} onCancel={setAddingList} />}
      {lists.values.map(list => <ListItem {...{list}} onPress={()=>onListSelected(list.id)} />)}
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
    alignSelf: 'center',
    height: 35,
    padding: style.padding / 2,
  },
})