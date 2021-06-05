import React, { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { API } from '../../App'
import { Layout } from '../../App/Navigation'
import { AppButtonItem, AppIcon, AppText, ItemCreator, Loading, ProfilePicture } from '../../Components'
import { User } from '../../Models'
import { colors, style } from '../../Styling'

const view = () => {
  const [contacts, setContacts] = useState<User[]>([])
  const [adding_contact, setAddingContact] = useState(false)
  const [new_contact_id, setNewContactId] = useState('')
  const [loading_new_contact, setLoadingNewContact] = useState(false)

  useEffect(() => {
    API.getContacts().then(setContacts)
  }, [])

  const submitContact = async () => {
    if (new_contact_id.length < 1
    || API.user.contact_ids?.includes(new_contact_id))
      return

    setLoadingNewContact(true)
    setAddingContact(false)

    try {
      await API.addContact(new_contact_id, API.user.id)
      const new_contact = await API.getCachedUser(new_contact_id)
      setContacts(x => [...x, new_contact])
    } catch (e) {
      throw e
    } finally {
      setLoadingNewContact(false)
      setAddingContact(false) 
      setNewContactId('')
    }
  }

  const removeContact = async (contact_id: string) => {
    await API.removeContact(contact_id)
  }

  const MemberItem = (user: User) => {
    return (
      <View style={css.member_item} key={user.id}>
        <ProfilePicture user_id={user.id} size='medium' />
        <AppText style={css.member_item_name}>{user.nickname}</AppText>
        <AppIcon style={css.member_remove_icon} onPress={()=>removeContact(user.id)} source={require('../../Media/Icons/remove.png')} />
      </View>
    )
  }

  return (
    <View style={css.container}>
      <View style={css.header}>
        <AppText style={css.header_title}>Contacts</AppText>
      </View>
      {adding_contact && <ItemCreator placeholder="Contact's ID" onChange={setNewContactId} onCancel={setAddingContact} onSubmit={submitContact} />}
      {loading_new_contact && <Loading />}
      {contacts.map(MemberItem)}
      <View style={{flex: 1}} />
      <AppButtonItem icon={adding_contact?'done':'plus'} onPress={adding_contact?submitContact:()=>setAddingContact(true)} />
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
    marginLeft: style.margin,
  },
  member_item_image: {
    height: 40,
    marginRight: style.margin,
    aspectRatio: 1,
  },
  member_remove_icon: {
    marginLeft: 'auto',
    padding: style.margin,
  },
})

export default {
  name: 'Contacts',
  view,
} as Layout