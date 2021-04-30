import React, { useEffect, useState } from 'react'
import { StyleSheet, TextInput, View } from 'react-native'
import { API, Navigation } from '../../App'
import { AppButton, AppText, Loading, ProfilePicture } from '../../Components'
import { TodoList, User } from '../../Models'
import { colors, style } from '../../Styling'
import { LayoutProps } from '../types'

const ProfileLayout = (props: LayoutProps) => {
  const [user, setUser] = useState<User>(API.user)
  const [user_changes, setUserChanges] = useState<Partial<User>>({})
  const [lists, setLists] = useState<TodoList[]|undefined>()
  const [loading, setLoading] = useState(false)

  useEffect(() => {if (props.active) Navigation.header = ()=><View />}, [props.active])
  
  useEffect(() => {
    API.getListsFrom(user).then(setLists)
  }, [])

  const saveChanges = () => {
    setLoading(true)
    API.editUser(user.id, user_changes)
      .then(() => {
        setUser({...user, ...user_changes})
        setUserChanges({})
      }).catch(() => {

      }).finally(() => setLoading(false))
  }
  
  const Item = ({label, value}: {label: string, value: string}) => (
    <View style={css.item_container}>
      <AppText style={css.item_label}>{label}:</AppText>
      <AppText style={css.item_value}>{value}</AppText>
    </View>
  )

  const ListItem = (list: TodoList) => (
    <View style={css.list_container} key={list.id}>
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
      <TextInput style={css.name} onChangeText={text=>setUserChanges({nickname: text})}>{user.nickname}</TextInput>
      <Item label='Username' value={user.username} />

      {loading
      ? <Loading />
      : Object.keys(user_changes).length > 0
      && <AppButton label='Save Changes' onPress={saveChanges} />
      }

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
    backgroundColor: colors.main_dark,
  },
  pfp_container: {
    flexDirection: 'row',
    height: 100,
    aspectRatio: 1,
    alignSelf: 'center',
    alignItems: 'center',
    marginTop: style.margin,
  },
  name: {
    textAlign: 'center',
    fontSize: style.font_size_big,
    color: colors.light,
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