import React, { useEffect, useState } from 'react';
import { Animated, BackHandler, StyleSheet, View } from 'react-native'
import { API, Navigation } from '.';
import { AppDrawer } from '../Components';
import { AuthenticationLayout } from '../Layouts';
import { Layout } from '../Layouts/types';
import { colors, style } from '../Styling';
import { createAnimation, screen, useAsyncState } from '../Utils';

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

  const signOut = async () => {
    await API.signOut()
    setLoggedIn(false)
  }

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
    : <AppDrawer {...{signOut}}>
        <Animated.View style={[css.content, {left: scroll_animation}]}>
          {layout_stack.map((Layout, index) =>
            index < layout_stack.length - 2
            ? <View style={css.hidden_layout} key={index} />
            : <View style={[css.layout_container]} key={index}>
                <Layout active={index===active_layout_index} />
              </View>
          )}
        </Animated.View>
      </AppDrawer>
  }

  return (
    <View style={css.app}>{content()}</View>
  )
}

const css = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexDirection: 'row',
    height: '100%',
  },
  layout_container: {
    width: screen.width,
  },
  hidden_layout: {
    width: screen.width,
  }
})

export default App
