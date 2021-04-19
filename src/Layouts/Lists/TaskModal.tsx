import React from 'react'
import { View, StyleSheet } from 'react-native'
import { AppModal, AppText } from '../../Components'
import { Task } from '../../Models'
import { colors, style } from '../../Styling'
import { formatDate } from '../../Utils'

const TaskModal = (props: { task: Task, close: ()=>void }) => {
  const { task } = props

  return (
    <AppModal close={props.close}>
      <View style={css.container}>
        <View style={css.title_container}>
          <AppText style={css.title}>{task.title}</AppText>
          <AppText style={css.status}>{task.status}</AppText>
        </View> 
        <Divider />
        {task.description !== '' && <>
          <AppText style={css.description}>{task.description}</AppText>
          <Divider />
        </>}
        <View style={css.created_container}>
          <AppText style={css.created_text}>Created by {task.creator_id} on {formatDate(task.creation_date)}</AppText>
        </View>
      </View>
    </AppModal>
  )
}

const Divider = () => <View style={css.divider} />

const css = StyleSheet.create({
  container: {
    marginHorizontal: style.margin,
    padding: style.padding,
    borderRadius: style.border_radius_big,
    backgroundColor: colors.main,
  },
  title_container: {
    flexDirection: 'row',
  },
  title: {
    fontSize: style.font_size_big,
  },
  status: {
    fontSize: style.font_size_small,
    marginLeft: 'auto',
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  description: {
    fontSize: style.font_size_small,
    marginVertical: style.padding,
  },
  divider: {
    backgroundColor: colors.light,
    height: 1,
    marginHorizontal: style.margin,
    marginVertical: style.padding,
  },
  created_container: {

  },
  created_text: {
    fontSize: style.font_size_small,
  },
})

export default TaskModal