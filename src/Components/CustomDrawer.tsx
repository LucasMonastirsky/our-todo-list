import React, { useState } from 'react'
import { View, StyleSheet, Text, Image } from 'react-native'
import Drawer from 'react-native-drawer'
import { DrawerIcon, FadeContent } from './'
import { colors, style } from '../Styling'

const CustomDrawer = (props: {header_content?: any, children?: any}) => {
  const [drawer_active, setDrawerActive] = useState(false)

  const DrawerContent = () => (
    <View style={css.drawer}>
      <Item>
        <View style={css.picture_container}>
          <Image style={css.picture} source={require('../Images/Icons/profile_default.png')} />
        </View>
        <Spacer />
        <ItemText>Profile</ItemText>
      </Item>
      <Item>
        <ItemText>Lists</ItemText>
      </Item>
      <Item>
        <ItemText>Options</ItemText>
      </Item>
      <Text style={css.credit_text}>Developed by Lucas Monastirsky</Text>
    </View>
  )

  const Item = ({children}: {children: any}) => <View style={css.item}>{children}</View>
  const ItemText = ({children}: {children: any}) => <Text style={css.text}>{children}</Text>
  const Spacer = () => <View style={css.spacer} />

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
  item: {
    padding: style.padding,
    flexDirection: 'row',
  },
  spacer: {
    width: style.margin,
  },
  text: {
    fontSize: style.font_size_med,
    color: colors.light,
  },
  picture_container: {

  },
  picture: {
    borderRadius: 100,
    flex: 1,
    aspectRatio: 1,
  },
  credit_text: {
    fontSize: style.font_size_small * 0.75,
    padding: style.padding,
    color: colors.light,
    marginTop: 'auto',
  },
})

export default CustomDrawer