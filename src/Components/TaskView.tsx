import React, { useEffect, useRef, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native'
import { Task } from '../Models'
import { colors, style } from '../Styling'
import TaskModal from './TaskModal'

const TaskView = (props: { task: Task, index?: number }) => {
  const [modal_active, setModalActive] = useState(false)
  const anim = useRef(new Animated.Value(0)).current

  useEffect(()=>{
   Animated.timing(anim, {
     toValue: 1,
     duration: 100 * ((props.index ?? 0) + 1),
     useNativeDriver: false,
   }).start()
  }, [anim])

  return (
    <TouchableOpacity onPress={() => setModalActive(true)}>
      <Animated.View style={[css.container, {opacity: anim}]}>
        <TouchableOpacity style={css.status} onPress={()=>{/* set status as pending */ }}>

        </TouchableOpacity>
        <View style={css.status_divider} />
        <Text style={css.title}>{props.task.title}</Text>
      </Animated.View>
      {modal_active && <TaskModal task={props.task} onClose={()=>setModalActive(false)} />}
    </TouchableOpacity>
  )
}

const css = StyleSheet.create({
  container: {
    backgroundColor: colors.main,
    flexDirection: 'row',
  },
  status: {
    backgroundColor: colors.main,
    aspectRatio: 1,
  },
  status_divider: {
    width: style.border_width,
    backgroundColor: colors.main_dark,
  },
  title: {
    color: colors.light,
    fontSize: style.font_size_med,
    padding: style.padding,
    marginLeft: style.margin,
    marginBottom: style.font_size_med / 6,
  },
})

export default TaskView