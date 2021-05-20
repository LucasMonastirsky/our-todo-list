import { API, Navigation } from '../../App'
import React, { useEffect, useState } from 'react'
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import uuid from 'react-native-uuid'
import { TodoList } from '../../Models'
import { Dictionary } from '../../Utils'
import ListItem from './ListItem'
import { TasksLayout, ContactsLayout, ProfileLayout } from '../'
import { AppButtonItem, AppIcon, AppText, Loading, ProfilePicture } from '../../Components'
import { colors, style } from '../../Styling'
import { ItemCreator } from '../../Components'

type PropTypes = {
  
}

export default (props: PropTypes) => {
  const [lists, setLists] = useState<Dictionary<TodoList>>()
  const [adding_list, setAddingList] = useState(false)
  const [new_list_title, setNewListTitle] = useState('')

  useEffect(() => {
    API.getCachedListsFrom(API.user).then(setLists)
    API.getListsFrom(API.user).then(setLists)
  }, [])

  const submitList = () => {
    if (new_list_title.length < 1)
      return

    const new_list: TodoList = {
      title: new_list_title,
      description: '',
      id: `${uuid.v4()}`,
      tasks: {},
      owner_id: API.user.id,
      member_ids: [API.user.id]
    }
    setNewListTitle('')
    setAddingList(false)
    setLists(prev => {
      prev!.map[new_list.id] = new_list
      return prev?.clone()
    })
    API.createTodoList({...new_list})
  }

  const onListSelected = (id: string) => {
    Navigation.goTo(TasksLayout, {list: lists!.map[id]})
  }

  if (lists === undefined) return ( // TODO: add message when user has no lists
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Loading />
    </View>
  )

  return <>
    <View style={css.header}>
      <TouchableOpacity style={{flexDirection: 'row'}} onPress={()=>Navigation.goTo(ProfileLayout)}>
        <ProfilePicture user_id={API.user.id} size='medium' />
        <AppText style={css.title}>{API.user.nickname}</AppText>
      </TouchableOpacity>
      <View style={{flex: 1}} />
      <AppIcon style={css.header_icon} onPress={()=>Navigation.goTo(ContactsLayout)} source={require('../../Media/Icons/contacts.png')} />
      <AppIcon style={css.header_icon} source={require('../../Media/Icons/options.png')} />
    </View>
    <ScrollView>
      {adding_list && <ItemCreator
        placeholder='New List Title'
        onChange={setNewListTitle}
        onSubmit={submitList}
        onCancel={setAddingList}
      />}
      {lists.values.map(list => <ListItem key={list.id} {...{list}} onPress={()=>onListSelected(list.id)} />)}
    </ScrollView>
    <AppButtonItem icon={adding_list?'done':'plus'} onPress={adding_list?submitList:()=>setAddingList(true)} />
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