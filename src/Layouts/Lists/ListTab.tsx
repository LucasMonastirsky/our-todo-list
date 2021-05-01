import React, { useRef, useState } from 'react'
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { AppText } from '../../Components'
import { TodoList } from '../../Models'
import { colors, style } from '../../Styling'
import { screen } from '../../Utils'

const ListTab = (props: { lists: TodoList[], onSelect: (index: number)=>void, onPress?: ()=>void }) => {
  const [selected_index, _setSelectedIndex] = useState(0)
  const [positions, setPositions] = useState<number[]>([])
  const [widths, setWidths] = useState<number[]>([])
  const [offset_start, setOffsetStart] = useState(0)
  const [offset_end, setOffsetEnd] = useState(0)

  const setSelectedIndex = (new_index: number) => {
    _setSelectedIndex(new_index)
    props.onSelect(new_index)
  }

  const scroll_view_ref = useRef<ScrollView>(null)

  const onScroll = (event: { nativeEvent: { contentOffset: { x: number } } }) => {
    const pos = event.nativeEvent.contentOffset.x + 1
    let selection = 0
    offsets.forEach((item_pos, index) => {
      if (pos > item_pos)
        selection = index
    })
    setSelectedIndex(selection)
  }

  const scrollToIndex = (index: number) => {
    scroll_view_ref.current?.scrollTo({ x: offsets[index]}) 
  }

  const tabs = props.lists.map((list, index) => {
    const onLayout = (event: any) => {
      const width = event.nativeEvent.layout.width
      setWidths(arr => {
        const new_arr = [...arr]
        new_arr.splice(index, 1, width)
        return new_arr
      })
      setPositions(arr => {
        const new_arr = [...arr]
        const offset = (new_arr[index-1] ?? offset_start) + width
        new_arr.splice(index, 1, offset)
        return new_arr
      })

      if (index === 0)
        setOffsetStart((screen.width - width) / 2)
      if (index === props.lists.length - 1)
        setOffsetEnd((screen.width - width) / 2)
    }

    return (
      <TouchableOpacity key={list.id} onPress={()=>scrollToIndex(index)}>
        <View {...{onLayout}} style={[css.item, (selected_index === index ? css.item_selected : {})]}>
          <AppText style={[css.item_text, (selected_index === index ? css.item_text_selected : {})]}>
            {list.title}
          </AppText>
        </View>
      </TouchableOpacity>
    )
  })

  const offsets = positions.map((value, index) => {
    if (index === 0) return 0
    return positions[index-1] - ((screen.width - widths[index]) / 2)
  })

  return (
    <View style={css.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        {...{onScroll}}
        snapToOffsets={offsets}
        ref={scroll_view_ref}
      >
        <View style={{width: offset_start}} />
        {tabs}
        <View style={{width: offset_end}} />
      </ScrollView>
    </View>
  )
}

const css = StyleSheet.create({
  container: {
    backgroundColor: colors.main,
  },
  item: {
    justifyContent: 'center',
    paddingBottom: style.padding,
  },
  item_selected: {
    borderBottomWidth: style.border_width,
    borderBottomColor: colors.light,
  },
  item_text: {
    color: colors.light_dark,
    fontSize: style.font_size_big,
    marginHorizontal: style.margin * 2,
  },
  item_text_selected: {
    color: colors.light,
  },
})

export default ListTab