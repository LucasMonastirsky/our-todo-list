import React, { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { API, Navigation } from '../../App'
import { AddFloatingButton, AppButton, AppIcon, AppInputMin, AppModal, AppText } from '../../Components'
import { User } from '../../Models'
import { style } from '../../Styling'
import { LayoutProps } from '../types'

const ContactsLayout = (props: LayoutProps) => {
  const [contacts, setContacts] = useState<User[]>([])
  const [adding_contact, setAddingContact] = useState(false)

  useEffect(() => {
    if (props.active) Navigation.header = () => (
      <View style={css.header}>
        <AppText style={css.header_title}>Contacts</AppText>
      </View>
    )

    API.user.contact_ids?.forEach(id => { //TODO: replace this with a batch get?
      if (contacts.some(user => user.id === id)) // only necessary for debugging
        return
      API.getCachedUser(id).then(user => setContacts(prev => [...prev, user]))
    })
  }, [])

  const addContact = async (id: string) => {
    await API.addContact(id, API.user.id)
    const contact = await API.getCachedUser(id)
    setContacts(prev => [...prev, contact])
    setAddingContact(false)
  }

  const removeContact = async (id: string) => {
    await API.removeContact(id, API.user.id)
    const new_contacts = [...contacts]
    let index = -1
    new_contacts.some((user, i) => {
      if (user.id === id) {
        index = i
        return true
      }
    })
    new_contacts.splice(index, 1)
    setContacts(new_contacts)
  }

  const ContactItem = ({user}: {user: User}) => {
    return (
      <View style={css.item} key={user.id}>
        <AppText style={css.item_name}>{user.nickname}</AppText>
        <AppIcon style={css.item_icon}
          source={require('../../Media/Icons/remove.png')}
          onPress={()=>removeContact(user.id)}
        />
      </View>
    )
  }

  return (
    <View style={css.container}>
      {adding_contact && <AddingContactModal close={setAddingContact} {...{addContact}} />}
      {contacts.map(user => <ContactItem {...{user}} key={user.id} />)}
      <AddFloatingButton onPress={()=>setAddingContact(true)} />
    </View>
  )
}

const AddingContactModal = ({close, addContact}: {
  close: (value: boolean)=>any
  addContact: (id: string)=>any
}) => {
  const [contact_id, setContactId] = useState('')

  return (
    <AppModal close={close}>
      <AppText style={css.modal_title}>Add a Contact</AppText>
      <AppInputMin placeholder='Contact Id' onChangeText={setContactId} />
      <AppButton label='Add' onPress={() => addContact(contact_id)} />
    </AppModal>
  )
}

const css = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {

  },
  header_title: {
    fontSize: style.font_size_big,
    marginLeft: 'auto',
  },
  item: {
    padding: style.padding,
    flexDirection: 'row',
  },
  item_name:  {
    fontSize: style.font_size_med,
  },
  item_icon: {
    marginLeft: 'auto',
  },
  modal_title: {
    fontSize: style.font_size_big,
    textAlign: 'center',
  }
})

export default ContactsLayout