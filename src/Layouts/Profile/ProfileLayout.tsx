import React, { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { API, Navigation } from '../../App'
import { AppText, Loading, ProfilePicture } from '../../Components'
import { TodoList, User } from '../../Models'
import { colors, style } from '../../Styling'
import { LayoutProps } from '../types'

const ProfileLayout = (props: LayoutProps) => {
  const [user, setUser] = useState<User>(API.user)
  const [lists, setLists] = useState<TodoList[]|undefined>()

  useEffect(() => {if (props.active) Navigation.header = ()=><View />}, [props.active])
  
  useEffect(() => {
    API.getListsFrom(user).then(setLists)
  }, [])
  
  const Item = ({label, value}: {label: string, value: string}) => (
    <View style={css.item_container}>
      <AppText style={css.item_label}>{label}:</AppText>
      <AppText style={css.item_value}>{value}</AppText>
    </View>
  )

  const ListItem = (list: TodoList) => (
    <View style={css.list_container}>
      <AppText style={css.list_title}>{list.title}</AppText>
      { user.id === list.owner_id
      && <AppText style={css.owner_label}>Owner</AppText>
      }
    </View>
  )

  return (
    <View style={css.container}>
      <View style={css.pfp_container}>
        <ProfilePicture source={user.image} />
      </View>
      <AppText style={css.name}>{user.nickname}</AppText>
      <Item label='Username' value={user.username} />

      <View style={css.list_section}>
        <AppText style={css.list_section_header}>Lists: </AppText>
        {lists === undefined
        ? <Loading />
        : lists.map(ListItem)
        }
      </View>
    </View>
  )
}

const css = StyleSheet.create({
  container: {
  },
  pfp_container: {
    height: 100,
    alignItems: 'center',
    marginTop: style.margin,
  },
  name: {
    textAlign: 'center',
    fontSize: style.font_size_big,
  },
  item_container: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    padding: style.padding,
  },
  item_label: {
    textAlign: 'right',
    flex: 1,
    marginRight: style.margin,
  },
  item_value: {
    textAlign: 'left',
    flex: 1,
    marginLeft: style.margin,
  },
  list_section: {
    marginTop: style.margin,
  },
  list_section_header: {
    backgroundColor: colors.main,
    padding: style.padding,
  },
  list_container: {
    backgroundColor: colors.main_dark,
    padding: style.padding,
    flexDirection: 'row',
  },
  list_title: {

  },
  owner_label: {
    marginLeft: 'auto',
  },
})

export default ProfileLayout