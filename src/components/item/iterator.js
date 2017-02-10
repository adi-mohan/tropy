'use strict'

const React = require('react')
const { PureComponent, PropTypes } = React
const { ClickCatcher } = require('../click-catcher')
const { DND } = require('../../constants')
const { times } = require('../../common/util')
const { arrayOf, shape, bool, func, number, string } = PropTypes


class ItemIterator extends PureComponent {

  get size() {
    return this.constructor.ZOOM[this.props.zoom]
  }

  isSelected(item) {
    return this.props.selection.includes(item.id)
  }

  handleClickOutside = () => {
    this.props.onSelect()
  }

  connect(element) {
    return (this.props.isDisabled) ? element : this.props.dt(element)
  }

  map(fn) {
    return this.props.items.map((item, idx) => fn({
      item,
      cache: this.props.cache,
      selection: this.props.selection,
      list: this.props.list,
      size: this.size,
      isLast: idx === this.props.items.length - 1,
      isSelected: this.isSelected(item),
      isDisabled: this.props.isDisabled,
      onContextMenu: this.props.onContextMenu,
      onDropPhotos: this.props.onPhotoMove,
      onItemOpen: this.props.onItemOpen,
      onSelect: this.props.onSelect
    }))
  }

  renderClickCatcher(props) {
    return (
      <ClickCatcher {...props}
        accept={DND.ITEMS}
        isDisabled
        onClick={this.handleClickOutside}/>
    )
  }

  static ZOOM = [
    24,
    ...times(57, i => i * 4 + 28),
    ...times(32, i => i * 8 + 256),
    512
  ]

  static propTypes = {
    isOver: bool,
    isDisabled: bool,

    cache: string.isRequired,
    items: arrayOf(shape({
      id: number.isRequired
    })).isRequired,
    selection: arrayOf(number).isRequired,
    list: number,
    zoom: number.isRequired,

    dt: func.isRequired,
    onContextMenu: func.isRequired,
    onItemOpen: func.isRequired,
    onPhotoMove: func.isRequired,
    onSelect: func.isRequired
  }
}


module.exports = {
  ItemIterator,
  ZOOM: ItemIterator.ZOOM
}
