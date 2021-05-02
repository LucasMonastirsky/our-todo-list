import React, { SyntheticEvent, useState } from 'react'
import { TouchableOpacity, StyleSheet, Animated, View, NativeSyntheticEvent } from 'react-native'
import { Task } from '../../Models'
import { colors, style } from '../../Styling'
import TaskModal from './TaskModal'
import { createAnimation, screen } from '../../Utils'
import { AppText, ProfilePicture } from '../../Components'
import { API } from '../../App'
import DEBUG from '../../Utils/DEBUG'

type PropTypes = {
  task: Task,
  index?: number,
  updateTask: (task: Task) => any
  onTaskFinished: () => any
}
const TaskView = (props: PropTypes) => {
  const { task } = props
  const [modal_active, setModalActive] = useState(false)
  const anim = createAnimation({duration: style.anim_duration / 5 * ((props.index ?? 0) + 1)})

  const claimTask = async () => {
    const new_task: Task = {
      ...props.task,
      status: 'Claimed',
      claimed_by_id: API.user.id,
    }
    await API.editTask(new_task)
    props.updateTask(new_task)
    DEBUG.log(`Claimed task ${props.task.title}`)
  }

  const finishTask = async () => {
    await API.editTask({...props.task,
      status: 'Done',
      completer_id: API.user.id,
      completion_date: Date.now()
    })
    props.onTaskFinished()
  }

  //#region Gestures
  const gesture_horizontal_start_threshold = 5
  const gesture_horizontal_confirm_threshold = screen.width / 3

  const [gesture_start_time, setGestureStartTime] = useState(0)
  const [gesture_start_x, setGestureStartPos] = useState(0)
  const [gesture_delta_x, setGestureDeltaX] = useState(0)
  const [gesture_anim, setGestureAnim] = useState<'none'|'canceled'|'confirmed'|'done'>('none')

  type GestureEvent = { nativeEvent: { pageX: number } }
  const gesture_handlers = {
    onStartShouldSetResponder: () => true,
    onResponderGrant: ({nativeEvent}: GestureEvent) => {
      setGestureStartTime(Date.now())
      setGestureStartPos(nativeEvent.pageX)
    },
    onResponderMove: ({nativeEvent}: GestureEvent) => {
      const delta = nativeEvent.pageX - gesture_start_x
      if (delta > gesture_horizontal_start_threshold && task.status !== 'Done') {
        setGestureDeltaX(nativeEvent.pageX - gesture_start_x)
      }
    },
    onResponderRelease: ({nativeEvent}: GestureEvent) => {
      if (gesture_delta_x > gesture_horizontal_start_threshold) {
        if (gesture_delta_x > gesture_horizontal_confirm_threshold) {
          setGestureAnim('confirmed')
        } else {
          setGestureAnim('canceled')
        }
      } else {
        setModalActive(true)
      }
    }
  }

  const slide_anim = task.status === 'Done' ? undefined : createAnimation({
    from: gesture_delta_x,
    to: gesture_anim === 'confirmed' || gesture_anim === 'done'
      ? screen.width
      : gesture_anim === 'canceled'
      ? 0
      : gesture_delta_x,
    condition: [gesture_anim],
    duration: gesture_anim === 'none' ? 0 : style.anim_duration,
    onDone: () => {
      if (gesture_anim === 'confirmed') {
        finishTask()
        setGestureAnim('done')
      }
      if (gesture_anim === 'canceled') {
        setGestureAnim('none')
        setGestureDeltaX(0)
      }
    }
  })
  //#endregion

  const done = props.task.status === 'Done'
  return (
    <Animated.View style={{opacity: anim, left: done ? 0 : slide_anim }}>
      <View 
        style={[css.container, done && css.done_container]}
        {...gesture_handlers}
      >
        <TouchableOpacity style={css.status_container} onPress={!done?claimTask:()=>{}}>
          {(props.task.status === 'Claimed' || done)
          ? <ProfilePicture user_id={props.task.claimed_by_id} />
          : <View style={css.status_unclaimed} />
          }
        </TouchableOpacity>
        <AppText style={css.title}>{props.task.title}</AppText>
      </View>

      {modal_active && <TaskModal task={props.task} close={()=>setModalActive(false)} />}
    </Animated.View>
  )
}

const css = StyleSheet.create({
  container: {
    backgroundColor: colors.main,
    flexDirection: 'row',
    marginTop: style.border_width,
    padding: style.padding / 2,
  },
  done_container: {
    backgroundColor: colors.main_dark,
  },
  status_container: {
    aspectRatio: 1,
  },
  status_unclaimed: {
    backgroundColor: colors.main_dark,
    borderRadius: style.border_radius_big,
    margin: style.margin,
    flex: 1,
  },
  done_status: {
    backgroundColor: colors.main_dark,
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