import React, { useState } from 'react'
import { TouchableOpacity, StyleSheet, Animated } from 'react-native'
import { Task, TASK_STATUS } from '../../Models'
import { colors, style } from '../../Styling'
import TaskModal from './TaskModal'
import { createAnimation } from '../../Utils'
import { AppText } from '../../Components'
import { API } from '../../App'

const TaskView = (props: { task: Task, index?: number }) => {
  const [modal_active, setModalActive] = useState(false)
  const anim = createAnimation({duration: style.anim_duration / 5 * ((props.index ?? 0) + 1)})

  const claimTask = async () => {
    await API.editTask({
      ...props.task,
      status: TASK_STATUS.IN_PROGRESS,
      claimed_by_id: API.user.id,
    })
    console.log(`Claimed task ${props.task.title}`)
  }

  return (
    <TouchableOpacity onPress={() => setModalActive(true)}>
      <Animated.View style={[css.container, {opacity: anim}]}>
        <TouchableOpacity style={css.status} onPress={claimTask}>

        </TouchableOpacity>
        <AppText style={css.title}>{props.task.title}</AppText>
      </Animated.View>
      {modal_active && <TaskModal task={props.task} close={()=>setModalActive(false)} />}
    </TouchableOpacity>
  )
}

const css = StyleSheet.create({
  container: {
    backgroundColor: colors.main,
    flexDirection: 'row',
    marginTop: style.border_width,
  },
  status: {
    backgroundColor: colors.main,
    aspectRatio: 1,
    borderRightWidth: style.border_width,
    borderRightColor: colors.main_dark,
  },
  status_divider: {
    width: style.border_width,
    backgroundColor: colors.main_dark,
  },
  title: {
    padding: style.padding,
    marginLeft: style.margin,
    marginBottom: style.font_size_med / 6,
  },
})

export default TaskView