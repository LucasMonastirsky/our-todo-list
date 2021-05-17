import React, { useEffect, useState } from 'react'
import { Image, StyleSheet, View } from 'react-native'
import { API } from '../../App'
import { AppButtonItem, AppText, ItemCreator, Loading, ProfilePicture } from '../../Components'
import { User } from '../../Models'
import { colors, style } from '../../Styling'
import { DEBUG } from '../../Utils'
import { LayoutProps } from '../types'

export default (props: LayoutProps) => {
  const [contacts, setContacts] = useState<User[]>([])
  const [adding_contact, setAddingContact] = useState(false)
  const [loading_new_contact, setLoadingNewContact] = useState(false)

  useEffect(() => {
    if (contacts.length < API.user.contact_ids.length) // this check is only necessary for live debugging
      API.user.contact_ids.forEach(id => {
        API.getCachedUser(id).then(user => {
          setContacts(prev => [...prev, user])
        })
      })
  }, [])

  const onSubmitContact = async (id: string) => {
    setLoadingNewContact(true)

    try {
      await API.addContact(id, API.user.id)
      const new_contact = await API.getCachedUser(id)

      setContacts(x => [...x, new_contact])
    }
    finally { // TODO: display error message or something...
      setLoadingNewContact(false)
      setAddingContact(false) 
    }
  }

  const MemberItem = (user: User) => {
    return (
      <View style={css.member_item}>
        <View style={css.member_item_image}>
          <ProfilePicture user_id={user.id} />
        </View>
        <AppText>{user.nickname}</AppText>
      </View>
    )
  }

  return (
    <View style={css.container}>
      <View style={css.header}>
        <AppText style={css.header_title}>Contacts</AppText>
      </View>
      {adding_contact &&
      (!loading_new_contact
      ? <ItemCreator placeholder="Contact's ID" onCancel={setAddingContact} onSubmit={onSubmitContact} />
      : <Loading />)}
      {contacts.map(MemberItem)}
      <View style={{flex: 1}} />
      <AppButtonItem onPress={()=>setAddingContact(true)} />
    </View>
  )
}

const css = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: colors.main,
    padding: style.padding,
  },
  header_title: {
    fontSize: style.font_size_big,
  },
  member_item: {
    marginTop: style.border_width,
    padding: style.padding,
    backgroundColor: colors.main,
    flexDirection: 'row',
    alignItems: 'center',
  },
  member_item_name: {
    fontSize: style.font_size_med,
  },
  member_item_image: {
    height: 40,
    marginRight: style.margin,
    aspectRatio: 1,
  },
})