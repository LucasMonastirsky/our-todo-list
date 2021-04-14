import React, { useEffect, useState } from 'react';
import { Animated, BackHandler, Dimensions, StyleSheet, View } from 'react-native'
import { Navigation } from '.';
import { CustomDrawer } from '../Components';
import { LoginLayout } from '../Layouts';
import { colors, style } from '../Styling';
import { createAnimation, useAsyncState } from '../Utils';

const App = () => {
  const [active_layout_index, setActiveLayoutIndex] = useState(0)
  const [back_animation_active, getBackAnimationActive, setBackAnimationActive] = useAsyncState(false)
  const [layout_stack, getLayoutStack, setLayoutStack] = useAsyncState([Navigation.current_layout])
  const [login_layout_active, setLoginLayoutActive] = useState(true)

  //#region Navigation
  Navigation.onChangeLayout = (layout: ()=>JSX.Element) => {
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
    from: 0, to: -screen_width*active_layout_index,
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
    if (login_layout_active)
      return <LoginLayout onLogin={()=>setLoginLayoutActive(false)} />
    return (
      <CustomDrawer>
        <Animated.View style={[css.content, {left: scroll_animation}]}>
          {layout_stack.map((Layout, index) => (
            <View style={[css.layout_container]}>
              <Layout active={index===active_layout_index} />
            </View>
          ))}
        </Animated.View>
      </CustomDrawer>
    )
  }

  return (
    <View style={css.app}>{content()}</View>
  )
}

const screen_width = Dimensions.get('window').width

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
    width: screen_width,
  },
})

export default App
