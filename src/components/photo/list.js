import React from 'react'
import { object, func } from 'prop-types'
import { PhotoListItem } from './list-item'
import { PhotoIterator } from './iterator'
import { SASS } from '../../constants'
import { dc } from '../../ontology'
import cx from 'classnames'
import { match } from '../../keymap'


class PhotoList extends PhotoIterator {
  get classes() {
    return ['photo-list', super.classes]
  }

  getColumns() {
    return 1
  }

  getRowHeight() {
    return SASS.ROW.HEIGHT
  }

  isEditing(photo) {
    return this.props.edit.photo === photo.id
  }

  next(offset = 1) {
    if (!(offset === 1 || offset === -1)) {
      return super.next(offset)
    }

    const photo = super.next(0)
    if (!this.isExpanded(photo)) {
      return this.getPhotoBackwards(super.next(offset), offset)
    }

    let { selection } = this.props
    const idx = photo.selections.indexOf(selection)

    if (offset > 0) {
      if (idx + offset >= photo.selections.length) {
        return super.next(offset)
      }
    } else {
      if (idx === 0) return photo
      if (idx < 0) {
        return this.getPhotoBackwards(super.next(offset), offset)
      }
    }

    selection = photo.selections[idx + offset]

    let notes = (selection != null) ?
      (this.props.selections?.[selection]?.notes || []) :
      photo.notes

    return {
      ...photo,
      selection,
      notes
    }
  }

  current() {
    const photo = super.next(0)
    if (!this.isExpanded(photo)) return photo

    const { selection } = this.props
    if (!photo.selections.includes(selection)) return photo

    return {
      ...photo,
      selection
    }
  }

  getPhotoBackwards(photo, offset) {
    if (offset >= 0 || !this.isExpanded(photo)) return photo

    return {
      ...photo,
      selection: photo.selections[photo.selections.length - 1]
    }
  }

  edit = (photo) => {
    if (photo != null && !this.props.isDisabled) {
      const { id, selection } = photo

      if (selection == null) {
        this.props.onEdit({ photo: id })
      } else {
        this.props.onEdit({ selection })
      }
    }
  }

  handleEditCancel = (...args) => {
    this.props.onEditCancel(...args)
    this.container.focus()
  }

  // eslint-disable-next-line complexity
  handleKeyDown = (event) => {
    switch (match(this.keymap, event)) {
      case 'up':
        this.handlePrevPhoto(event)
        break
      case 'down':
        this.handleNextPhoto(event)
        break
      case 'home':
        this.handleHomeKey(event)
        break
      case 'end':
        this.handleEndKey(event)
        break
      case 'pageUp':
        this.handlePageUp(event)
        break
      case 'pageDown':
        this.handlePageDown(event)
        break
      case 'left':
      case 'contract':
        if (!this.contract(this.current())) return
        break
      case 'right':
      case 'expand':
        if (!this.expand(this.current())) return
        break
      case 'edit':
      case 'enter':
        this.edit(this.current())
        break
      case 'open':
        this.handleItemOpen(this.current())
        break
      case 'preview':
        this.preview(this.current())
        break
      case 'rotateLeft':
        this.handleRotate(-90)
        break
      case 'rotateRight':
        this.handleRotate(90)
        break
      case 'delete':
        this.handleDelete(this.current())
        break
      default:
        return
    }

    event.preventDefault()
    event.stopPropagation()
    event.nativeEvent.stopImmediatePropagation()
  }


  render() {
    const { data, edit, onBlur, onChange } = this.props
    const { height } = this.state
    const { transform } = this

    return this.connect(
      <div className={cx(this.classes)}>
        <div
          className="scroll-container"
          ref={this.setContainer}
          tabIndex={this.tabIndex}
          onBlur={onBlur}
          onKeyDown={this.handleKeyDown}>
          <div className="runway" style={{ height }}>
            <ul className="viewport" style={{ transform }}>
              {this.mapIterableRange(({ photo, ...props }) =>
                <PhotoListItem {...props}
                  key={photo.id}
                  photo={photo}
                  data={data}
                  edit={edit}
                  selections={this.props.selections}
                  title={dc.title}
                  isEditing={this.isEditing(photo)}
                  onChange={onChange}
                  onEdit={this.edit}
                  onEditCancel={this.handleEditCancel}
                  onSelectionSort={this.props.onSelectionSort}/>)}
            </ul>
          </div>
        </div>
      </div>
    )
  }

  static propTypes = {
    ...PhotoIterator.propTypes,
    edit: object.isRequired,
    data: object.isRequired,
    onChange: func.isRequired,
    onEdit: func.isRequired,
    onEditCancel: func.isRequired
  }

  static defaultProps = {
    ...PhotoIterator.defaultProps,
    edit: {}
  }
}


const PhotoListContainer = PhotoList.asDropTarget()

export {
  PhotoListContainer as PhotoList
}
