import React, { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { API } from '../../App'
import { AppButton, AppInputMin, AppModal, AppText } from '../../Components'
import { TodoList, User } from '../../Models'
import { colors, style } from '../../Styling'
import { screen } from '../../Utils'

export default (props: {list: TodoList, editList: (list: TodoList)=>any, close: AppModal.Close}) => {
  const [list, setList] = useState(props.list)

  const save = () => {
    props.editList(list)
    props.close(false)
  }

  const MemberItem = (props: {id: string}) => {
    const [user, setUser] = useState<User>()

    useEffect(() => {
      (async () => setUser(await API.getCachedUser(props.id)))()
    }, [])

    return (
      <AppText>{user?.username ?? 'loading...'}</AppText>
    )
  }

  return (
    <AppModal close={props.close}>
      <View style={css.container}>
        <AppInputMin style={css.title} defaultValue={list.title}
          onChangeText={title=>setList({...list, title})} />
        <Spacing />
        <AppInputMin style={css.description} defaultValue={list.description} multiline
          onChangeText={description=>setList({...list, description})} />
        <Spacing />
        <AppText style={css.members_title}>Members:</AppText>
        {list.member_ids.map(id => <MemberItem {...{id}} />)}
        <AppButton style={{marginLeft: 'auto'}} label='Done' onPress={save} />
      </View>
    </AppModal>
  )
}

const Spacing = () => <View style={css.spacing} />

const css = StyleSheet.create({
  container: {
    marginHorizontal: screen.width / 10,
    backgroundColor: colors.main,
    padding: style.padding,
    borderRadius: style.border_radius_med,
  },
  spacing: {
    height: style.padding,
  },
  title: {
    fontSize: style.font_size_big,
  },
  description: {
    fontSize: style.font_size_small,
  },
  members_title: {

  },
})