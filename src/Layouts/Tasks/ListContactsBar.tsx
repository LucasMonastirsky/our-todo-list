import React, { useEffect, useState } from 'react'
import { LayoutAnimation, Platform, StyleSheet, TouchableOpacity, UIManager, View } from 'react-native'
import { ProfilePicture, AppText, Loading } from '../../Components'
import { TodoList, User } from '../../Models'
import { style, colors } from '../../Styling'
import { StateSetter } from '../../Types'
import AddContactModal from './AddContactModal'

type PropTypes = { members?: User[], list: TodoList, setList: StateSetter<TodoList>, extended: boolean }
export default (props: PropTypes) => {
  const [modal_active, setModalActive] = useState(false)
  const [extended, setExtended] = useState(props.extended)

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setExtended(props.extended)
  }, [props.extended])

  if (props.members === undefined)
    return <Loading />

  return (
    <View>
      {modal_active && <AddContactModal {...{list: props.list, setList: props.setList}} close={setModalActive} />}
      <View style={extended ? css.members_container_extended : css.members_container}>
        {props.members?.map(user => 
          <TouchableOpacity style={css.member_item} disabled={!extended} key={user.id}>
            <ProfilePicture user_id={user.id} size='small' />
            {extended &&
              <AppText style={css.member_name}>{user.nickname}</AppText>
            }
          </TouchableOpacity>
        )}
        {extended && <>
          <TouchableOpacity style={css.member_add_button} onPress={()=>setModalActive(true)}>
            <AppText style={css.member_add_text}>Add a contact...</AppText>
          </TouchableOpacity>
        </>
        }
      </View>
    </View>
  )
}

export const css = StyleSheet.create({
  members_container: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  members_container_extended: {
  },
  member_item: {
    marginRight: style.padding,
    marginBottom: style.padding,
    flexDirection: 'row',
  },
  member_icon: {
    marginRight: style.margin,
  },
  member_name: {
    marginLeft: style.padding,
  },
  member_add_button: {
    padding: style.padding,
  },
  member_add_text: {

  },
})