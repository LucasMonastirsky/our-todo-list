import React, { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import Drawer from 'react-native-drawer'
import { DrawerIcon, FadeContent } from './'
import { colors, style } from '../Styling'

const CustomDrawer = (props: {header_content?: any, children?: any}) => {
  const [drawer_active, setDrawerActive] = useState(false)

  const DrawerContent = () => <View style={css.drawer}></View>

  return (
    <Drawer
      type="overlay"
      openDrawerOffset={0.33}
      open={drawer_active}
      onCloseStart={()=>setDrawerActive(false)}
      content={<DrawerContent />}
    >
      <View style={css.header}>
        <DrawerIcon onPress={()=>setDrawerActive(true)} />
        {props.header_content}
      </View>
      <View style={css.content}>{props.children}</View>
      <FadeContent active={drawer_active} />
    </Drawer>
  )
}

const css = StyleSheet.create({
  drawer: {
    flex: 1,
    backgroundColor: colors.main_dark,
  },
  header: {
    height: 45,
    backgroundColor: colors.main,
    padding: style.padding,
    flexDirection: 'row',
  },
  content: {
    backgroundColor: colors.main_dark,
    flex: 1,
  },
})

export default CustomDrawer