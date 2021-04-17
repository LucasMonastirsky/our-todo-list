import React, { useEffect, useState } from 'react';
import { Animated, BackHandler, Dimensions, StyleSheet, View } from 'react-native'
import { Navigation } from '.';
import { CustomDrawer } from '../Components';
import { AuthenticationLayout } from '../Layouts';
import { Layout } from '../Layouts/types';
import { colors, style } from '../Styling';
import { createAnimation, screen, useAsyncState } from '../Utils';

import Amplify, { Auth } from 'aws-amplify'
import { amplify_config } from '../Config'

Amplify.configure(amplify_config)

const App = () => {
  const [active_layout_index, setActiveLayoutIndex] = useState(0)
  const [, getBackAnimationActive, setBackAnimationActive] = useAsyncState(false)
  const [layout_stack, getLayoutStack, setLayoutStack] = useAsyncState([Navigation.current_layout])
  const [logged_in, setLoggedIn] = useState(false)

  //#region Navigation
  Navigation.onChangeLayout = (layout: Layout) => {
    setLayoutStack([...layout_stack, layout])
    setActiveLayoutIndex(getLayoutStack().length - 1)
  }

  useEffect(() => {
    return BackHandler.addEventListener('hardwareBackPress', onBack).remove
  }, [])
  const onBack = () => {
    if (getLayoutStack().length < 2) {
      Navigation.reset()
      return false
    }

    setBackAnimationActive(true)
    setActiveLayoutIndex(value => value - 1)
      
    return true
  }
  //#endregion

  const scroll_animation = createAnimation({
    from: 0, to: -screen.width*active_layout_index,
    duration: style.anim_duration,
    condition: active_layout_index,
    onDone: () => {
      if (getBackAnimationActive()) {
        const new_layout_stack = [...getLayoutStack()]
        new_layout_stack.pop()
        setLayoutStack(new_layout_stack)
        setBackAnimationActive(false)
      }
    }
  })

  const content = () => {
    return !logged_in
    ? <AuthenticationLayout onLoggedIn={()=>setLoggedIn(true)} />
    : <CustomDrawer>
        <Animated.View style={[css.content, {left: scroll_animation}]}>
          {layout_stack.map((Layout, index) => (
            <View style={[css.layout_container]}>
              <Layout active={index===active_layout_index} />
            </View>
          ))}
        </Animated.View>
      </CustomDrawer>
  }

  return (
    <View style={css.app}>{content()}</View>
  )
}

const css = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: colors.main_dark,
  },
  content: {
    flexDirection: 'row',
    height: '100%',
  },
  layout_container: {
    width: screen.width,
  },
})

export default App
