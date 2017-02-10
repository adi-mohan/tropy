'use strict'

const React = require('react')
const { PropTypes, PureComponent } = React
const { DragSource, DropTarget } = require('react-dnd')
const { getEmptyImage } = require('react-dnd-electron-backend')
const { compose, map, filter, into } = require('transducers.js')
const { DND } = require('../../constants')
const { meta } = require('../../common/os')
const { bool, func, number, object, shape, oneOf, arrayOf } = PropTypes


class ItemIterable extends PureComponent {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    this.props.dp(getEmptyImage())
  }


  get classes() {
    return {
      'item': true,
      'drop-target': !this.props.isDisabled,
      'active': this.props.isSelected,
      'over': this.props.isOver && this.props.canDrop,
      'dragging': this.props.isDragging,
      'last': this.props.isLast,
      [this.props.orientation]: true
    }
  }

  get isVertical() {
    return this.props.orientation === 'vertical'
  }


  handleOpen = () => {
    const { item, onItemOpen } = this.props

    onItemOpen({
      id: item.id, photos: item.photos
    })
  }

  handleSelect = (event) => {
    const { item, selection, isSelected, onSelect } = this.props

    if (meta(event)) {
      onSelect(item.id, isSelected ? 'remove' : 'merge')

    } else {
      if (!isSelected || selection.length > 1) {
        onSelect(item.id, 'replace')
      }
    }
  }


  handleContextMenu = (event) => {
    const {
      item,
      list,
      isDisabled,
      isSelected,
      selection,
      onContextMenu
    } = this.props

    // FIX handle selection in time
    if (!isSelected) this.handleSelect(event)

    const context = ['item']
    const target = { id: item.id, tags: item.tags, list }

    // FIX
    if (selection.length > 1) {
      context.push('bulk')
      target.id = selection
    }

    if (list) context.push('list')
    if (isDisabled) context.push('deleted')

    onContextMenu(event, context.join('-'), target)
  }

  setContainer = (container) => {
    this.container = container
  }


  connect(element) {
    return (this.props.isDisabled) ?
      element : this.props.ds(this.props.dt(element))
  }


  static DragSourceSpec = {
    beginDrag({ item, selection }) {
      return {
        items: into(
          [{ ...item }],
          compose(filter(id => id !== item.id), map(id => ({ id }))),
          selection
        )
      }
    },

    canDrag({ item }) {
      return !item.deleted
    }
  }

  static DragSourceCollect = (connect, monitor) => ({
    ds: connect.dragSource(),
    dp: connect.dragPreview(),
    isDragging: monitor.isDragging()
  })


  static DropTargetSpec = {
    drop({ item, onDropPhotos }, monitor) {
      const photo = monitor.getItem()

      onDropPhotos({
        item: item.id, photos: [photo]
      })
    },

    canDrop({ item }, monitor) {
      const photo = monitor.getItem()

      if (item.deleted) return false
      if (item.id === photo.item) return false

      return true
    }
  }

  static DropTargetCollect = (connect, monitor) => ({
    dt: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop()
  })

  static wrap() {
    return DragSource(
      DND.ITEMS, this.DragSourceSpec, this.DragSourceCollect
    )(DropTarget(
      DND.PHOTO, this.DropTargetSpec, this.DropTargetCollect
    )(this))
  }


  static propTypes = {
    isDragging: bool,
    isLast: bool,
    isOver: bool,
    isSelected: bool,
    isDisabled: bool,
    canDrop: bool,

    item: shape({
      id: number.isRequired,
      data: object,
      deleted: bool,
      photos: arrayOf(number)
    }).isRequired,

    selection: arrayOf(number).isRequired,
    list: number,
    size: number.isRequired,
    orientation: oneOf(['horizontal', 'vertical']),

    ds: func.isRequired,
    dt: func.isRequired,
    dp: func.isRequired,

    onContextMenu: func.isRequired,
    onDropPhotos: func.isRequired,
    onItemOpen: func.isRequired,
    onSelect: func.isRequired
  }

  static defaultProps = {
    orientation: 'vertical'
  }
}

module.exports = {
  ItemIterable
}
