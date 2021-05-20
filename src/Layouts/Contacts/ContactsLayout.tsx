import React, { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { API } from '../../App'
import { AppButtonItem, AppText, ItemCreator, Loading, ProfilePicture } from '../../Components'
import { User } from '../../Models'
import { colors, style } from '../../Styling'

export default () => {
  const [contacts, setContacts] = useState<User[]>([])
  const [adding_contact, setAddingContact] = useState(false)
  const [new_contact_id, setNewContactId] = useState('')
  const [loading_new_contact, setLoadingNewContact] = useState(false)

  useEffect(() => {
    if (contacts.length < API.user.contact_ids.length) // this check is only necessary for live debugging
      API.user.contact_ids.forEach(id => {
        API.getCachedUser(id).then(user => {
          setContacts(prev => [...prev, user])
        })
      })
  }, [])

  const submitContact = async () => {
    if (new_contact_id.length < 1
    || API.user.contact_ids.includes(new_contact_id))
      return

    setLoadingNewContact(true)

    try {
      await API.addContact(new_contact_id, API.user.id)
      const new_contact = await API.getCachedUser(new_contact_id)
      setContacts(x => [...x, new_contact])
    } catch {
      // TODO: handle errors
    } finally {
      setLoadingNewContact(false)
      setAddingContact(false) 
      setNewContactId('')
    }
  }

  const MemberItem = (user: User) => {
    return (
      <View style={css.member_item}>
        <ProfilePicture user_id={user.id} size='medium' />
        <AppText style={css.member_item_name}>{user.nickname}</AppText>
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
      ? <ItemCreator placeholder="Contact's ID" onCancel={setAddingContact} onSubmit={submitContact} />
      : <Loading />)}
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
})