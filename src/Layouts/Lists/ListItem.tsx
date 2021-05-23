import React, { useEffect, useState } from 'react'
import { Animated, LayoutAnimation, LayoutChangeEvent, Platform, StyleSheet, TouchableOpacity, UIManager, View, ViewProps, ViewStyle } from 'react-native'
import { AppText, ProfilePicture } from '../../Components'
import { TodoList, User } from '../../Models'
import { colors, style } from '../../Styling'
import { API } from '../../App'
import { createAnimation, screen } from '../../Utils'

type PropTypes = {
  list: TodoList,
  slide_out?: boolean,
  slide_duration?: number,
  onPress: ()=>any,
  onLayout?: (e: LayoutChangeEvent)=>any
}
export default (props: PropTypes) => {
  const [members, setMembers] = useState<User[]>([])
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    if (!members.length) props.list.member_ids.forEach(id =>
      API.getCachedUser(id).then(user =>
        setMembers(prev => [...prev, user])
      )
    )

    if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental)
      UIManager.setLayoutAnimationEnabledExperimental(true)
  }, [])

  const onPress = () => {
    LayoutAnimation.configureNext(LayoutAnimation.create(
      style.anim_duration,
      LayoutAnimation.Types.easeInEaseOut,
      LayoutAnimation.Properties.scaleXY))
    setAnimating(true)
    props.onPress()
  }

  const slide_out_animation = {
    marginLeft: createAnimation({
      from: 0,
      to: props.slide_out ? -screen.width : 0,
      duration: props.slide_duration,
      condition: props.slide_out,
    })
  }

  const container_style = {
    ...(animating ? css.container_transition : css.container),
    ...slide_out_animation,
  }

  return (
    <TouchableOpacity onPress={onPress}>
      <Animated.View onLayout={props.onLayout} style={container_style}>
        <AppText style={css.title}>{props.list.title}</AppText>
          <View style={[css.members_container, animating ? css.members_container_transition : {}]}>
            {members?.map(user =>
              <View style={animating ? css.member_icon_transition : css.member_icon} key={user.id}>
                <ProfilePicture user_id={user.id} size='small' />
              </View>
            )}
          </View>
      </Animated.View>
    </TouchableOpacity>
  )
}

const css = StyleSheet.create({
  container: {
    padding: style.padding,
    backgroundColor: colors.main,
    marginTop: style.border_width,
    width: screen.width,
    flexDirection: 'row',
  },
  container_transition: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: style.padding,
    paddingTop: style.padding * 2,
    backgroundColor: colors.main,
    width: screen.width,
  },
  title: {
    fontSize: style.font_size_big,
  },
  title_transition: {
    width: '100%',
    textAlign: 'center',
    fontSize: style.font_size_big,
    color: colors.light,
    padding: style.padding,
  },
  members_container: {
    marginLeft: 'auto',
    flexDirection: 'row',
  },
  members_container_transition: {
    width: '100%',
    justifyContent: 'center',
    marginTop: style.padding,
  },
  member_icon: {
    marginLeft: style.padding,
  },
  member_icon_transition: {
    marginRight: style.padding,
    marginBottom: style.padding,
    flexDirection: 'row',
  },
})

const transition = StyleSheet.create({
  header: {
    padding: style.padding,
    backgroundColor: colors.main,
  },
  title: {
    width: '100%',
    textAlign: 'center',
    fontSize: style.font_size_big,
    color: colors.light,
    padding: style.padding,
  },
})