import React, { useEffect, useState } from 'react'
import { TouchableOpacity, StyleSheet, Animated, View, TextInput } from 'react-native'
import { Task } from '../../Models'
import { colors, style } from '../../Styling'
import { createAnimation, screen, timeAgo } from '../../Utils'
import { AppText, ProfilePicture } from '../../Components'
import { API } from '../../App'

type PropTypes = {
  task: Task
  index?: number
  updateTask: (task: Task) => any
  onTaskFinished: () => any
  setScrollEnabled: (value: boolean) => any
}
const TaskView = (props: PropTypes) => {
  const { task } = props
  const [details_active, setDetailsActive] = useState(false)
  const [creator_name, setCreatorName] = useState<string>()
  const [completer_name, setCompleterName] = useState<string>()
  const anim = createAnimation({duration: style.anim_duration / 5 * ((props.index ?? 0) + 1)})

  useEffect(() => {
    API.getCachedUser(task.creator_id)
    .then(user => setCreatorName(user.nickname))

    if (task.status === 'Done')
      API.getCachedUser(task.completer_id!)
        .then(user => setCompleterName(user.nickname))
  }, [])

  const claimTask = async () => {
    const updated_task = await API.updateTaskStatus(task, 'Claimed')
    props.updateTask(updated_task)
  }

  const finishTask = async () => {
    await API.updateTaskStatus(task, 'Done')
    props.onTaskFinished()
  }

  //#region Gestures
  const gesture_horizontal_start_threshold = 5
  const gesture_horizontal_confirm_threshold = screen.width / 3

  const [gesture_start_x, setGestureStartX] = useState(0)
  const [gesture_delta_x, setGestureDeltaX] = useState(0)
  const [gesture_anim, setGestureAnim] = useState<'none'|'canceled'|'confirmed'|'done'>('none')

  type GestureEvent = { nativeEvent: { pageX: number } }
  const gesture_handlers = {
    onStartShouldSetResponder: () => true,
    onResponderGrant: ({nativeEvent}: GestureEvent) => {
      setGestureStartX(nativeEvent.pageX)
    },
    onResponderMove: ({nativeEvent}: GestureEvent) => {
      const delta = nativeEvent.pageX - gesture_start_x
      if (delta > gesture_horizontal_start_threshold && task.status !== 'Done') {
        setGestureDeltaX(nativeEvent.pageX - gesture_start_x)
        props.setScrollEnabled(false)
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
        setDetailsActive(x => !x)
      }

      props.setScrollEnabled(true)
    },
    onResponderEnd: ({nativeEvent}: GestureEvent) => {
      if (gesture_anim === 'none')
        setGestureAnim('canceled')
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
      <View style={[css.container, done && css.done_container]}
        {...gesture_handlers}
      >
        <View style={{flexDirection: 'row'}}>
          <TouchableOpacity style={css.status_container} onPress={!done?claimTask:()=>{}}>
            {(props.task.status === 'Claimed' || done)
            ? <ProfilePicture user_id={props.task.claimed_by_id} />
            : <View style={css.status_unclaimed} />
            }
          </TouchableOpacity>
          <View style={css.title_container}>
            <AppText style={css.title}>{props.task.title}</AppText>
            {details_active &&
              <AppText style={css.created_by}>
                Created by {creator_name ?? '???'} {timeAgo(props.task.creation_date)}
              </AppText>
            }
          </View>
        </View>

        {details_active && <>
        <View style={css.details_container}>
            <View style={css.details_separator} />
            <TextInput style={css.description}
              placeholder='No available description'
              placeholderTextColor={colors.light_dark}
              defaultValue={task.description}
              autoCorrect={false}
            />
            {task.status === 'Done' && <>
              <View style={css.details_separator} />
              <AppText style={css.completed_by}>
                Completed by {completer_name} {timeAgo(task.completion_date!)}
              </AppText>
            </>}
          </View>
        </>}
      </View>
    </Animated.View>
  )
}

const css = StyleSheet.create({
  container: {
    backgroundColor: colors.main,
    marginTop: style.border_width,
    padding: style.padding / 2,
  },
  done_container: {
    backgroundColor: colors.main_dark,
  },
  status_container: {
    aspectRatio: 1,
    height: 40,
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
  title_container: {
    marginLeft: style.margin,
    justifyContent: 'center',
  }, 
  title: {
  },
  created_by: {
    fontSize: style.font_size_small,
  },
  details_container: {
    padding: style.padding / 2,
  },
  details_separator: {
    height: style.border_width,
    backgroundColor: colors.light,
    marginHorizontal: style.margin,
    marginVertical: style.padding,
  },
  description: {
    fontSize: style.font_size_small,
    textAlign: 'center',
    color: colors.light,
    padding: 0,
  },
  completed_by: {
    fontSize: style.font_size_small,
    color: colors.light_dark,
  },
})

export default TaskView