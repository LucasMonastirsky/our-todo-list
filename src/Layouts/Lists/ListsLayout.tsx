import { API, Navigation } from '../../App'
import React, { useEffect, useState } from 'react'
import { Animated, LayoutChangeEvent, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import uuid from 'react-native-uuid'
import { TodoList } from '../../Models'
import { createAnimation, Dictionary } from '../../Utils'
import ListItem from './ListItem'
import { TasksLayout, ContactsLayout, ProfileLayout } from '../'
import { AppButtonItem, AppIcon, AppText, Loading, ProfilePicture } from '../../Components'
import { colors, style } from '../../Styling'
import { ItemCreator } from '../../Components'

export default () => {
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

  //#region Animation
  const [animating, setAnimating] = useState(false)
  const [selected_list_index, setSelectedListIndex] = useState(0)
  const [header_height, setHeaderHeight] = useState(0)  
  const [item_height, setItemHeight] = useState(0)

  const onListSelected = (id: string, index: number) => {
    setAnimating(true)
    setSelectedListIndex(index)
  }

  const onAnimationDone = () => {
    if (animating) {
      Navigation.goTo(TasksLayout, {list: lists!.values[selected_list_index!]})
    }
  }

  const onHeaderLayout = ({nativeEvent: {layout}}: LayoutChangeEvent) =>
    setHeaderHeight(layout.height)

  const onItemLayout = ({nativeEvent: {layout}}: LayoutChangeEvent) =>
    setItemHeight(layout.height)

  const header_animation = {
    marginTop: createAnimation({
      from: 0,
      to: -header_height - item_height * selected_list_index,
      condition: animating,
      onDone: onAnimationDone,
    })
  }

  //#endregion

  if (lists === undefined) return ( // TODO: add message when user has no lists
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Loading />
    </View>
  )

  return <>
    <Animated.View style={[css.header, animating?header_animation:{}]} onLayout={onHeaderLayout}>
      <TouchableOpacity style={{flexDirection: 'row'}} onPress={()=>Navigation.goTo(ProfileLayout)}>
        <ProfilePicture user_id={API.user.id} size='medium' />
        <AppText style={css.title}>{API.user.nickname}</AppText>
      </TouchableOpacity>
      <View style={{flex: 1}} />
      <AppIcon style={css.header_icon} onPress={()=>Navigation.goTo(ContactsLayout)} source={require('../../Media/Icons/contacts.png')} />
      <AppIcon style={css.header_icon} source={require('../../Media/Icons/options.png')} />
    </Animated.View>
    <ScrollView>
      {adding_list && <ItemCreator
        placeholder='New List Title'
        onChange={setNewListTitle}
        onSubmit={submitList}
        onCancel={setAddingList}
      />}
      {lists.values.map((list, index) =>
        <ListItem {...{
          key: list.id,
          list,
          slide_out: animating && index > selected_list_index,
          slide_duration: (lists.values.length - selected_list_index - index) * style.anim_duration,
          onPress: ()=>onListSelected(list.id, index),
          onLayout: index === 0 ? onItemLayout : undefined,
        }}/>
      )}
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