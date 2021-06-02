import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { launchImageLibrary } from 'react-native-image-picker'
import ImageResizer from 'react-native-image-resizer';
import { API } from '../../App'
import { AppButton, AppText, Horizontal, Loading, ProfilePicture } from '../../Components'
import { TodoList, User } from '../../Models'
import { colors, style } from '../../Styling'
import { Dictionary } from '../../Utils'

const view = () => {
  const [user, setUser] = useState<User>(API.user)
  const [user_changes, setUserChanges] = useState<Partial<User>>({})
  const [lists, setLists] = useState<Dictionary<TodoList>|undefined>()
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    API.getLists().then(setLists)
  }, [])

  const onPressImage = async () => {
    launchImageLibrary({ mediaType: 'photo' }, async response => {
      const resized = await ImageResizer.createResizedImage(response.uri!, 64, 64, 'JPEG', 100)
      setUserChanges(prev => ({...prev, image: resized.uri}))
    })
  }

  const saveChanges = async () => {
    setLoading(true)

    const new_user = {...user_changes}
    if (user_changes.image)
      new_user.image = await API.uploadProfilePicture(user_changes.image)

    await API.editUser(user.id, new_user)

    setUser({...user, ...user_changes})
    setUserChanges({})
    setLoading(false)
  }

  const signOut = () => {
    setLoading(true)
    API.signOut()
    setLoading(false)
  }

  const ListItem = (list: TodoList) => (
    <View style={css.list_container} key={list.id}>
      <AppText style={css.list_title}>{list.title}</AppText>
      { user.id === list.owner_id
      && <AppText style={css.owner_label}>Owner</AppText>
      }
    </View>
  )

  const createInputProps = (property: keyof Omit<Omit<User, 'list_ids'>, 'contact_ids'>) => ({
    style: css.item_value,
    defaultValue: user[property],
    onChangeText: (text: string)=>setUserChanges(prev => ({...prev, [property]: text}))
  })

  return (
    <View style={css.container}>
      <TouchableOpacity style={css.pfp_container} onPress={onPressImage}>
        <ProfilePicture uri={user_changes.image ?? user.image} />
      </TouchableOpacity>
      
      <View style={css.item_container}>
        <Text style={css.item_label}>Nickname</Text>
        <TextInput {...createInputProps('nickname')} />
      </View>

      {loading
      ? <Loading />
      : Object.keys(user_changes).length > 0
      && <AppButton label='Save Changes' onPress={saveChanges} />
      }

      {!loading &&
      <Horizontal style={css.bottom_buttons}>
        <View style={{flex: 1}} />
        <AppButton label='Sign Out' onPress={signOut} color={colors.alert} />
      </Horizontal>
      }

      <View style={css.list_section}>
        <AppText style={css.list_section_header}>Lists: </AppText>
        {lists === undefined
        ? <Loading />
        : lists.values.map(ListItem)
        }
      </View>
    </View>
  )
}

const css = StyleSheet.create({
  header: {
    flex: 1,
    justifyContent: 'flex-end',
    flexDirection: 'row',
    padding: style.padding,
  },
  container: {
    backgroundColor: colors.background,
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
    padding: style.padding,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  item_label: {
    color: colors.light,
    marginRight: style.margin,
    fontSize: style.font_size_med,
    paddingRight: style.margin,
    borderRightWidth: style.border_width,
    borderRightColor: colors.light_dark,
  },
  item_value: {
    color: colors.light,
    flex: 1,
    fontSize: style.font_size_med,
    padding: 0,
    paddingBottom: style.padding,
    borderColor: colors.light,
    borderBottomWidth: style.border_width,
  },
  item_icon: {
    height: 20,
    alignSelf: 'center',
  },
  bottom_buttons: {
    padding: style.padding,
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

export default {
  name: 'Profile',
  view,
}