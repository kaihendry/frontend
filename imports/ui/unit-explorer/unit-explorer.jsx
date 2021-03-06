import React, { Component } from 'react'
import { Meteor } from 'meteor/meteor'
import PropTypes from 'prop-types'
import UnverifiedWarning from '../components/unverified-warning'
import { connect } from 'react-redux'
import { createContainer } from 'meteor/react-meteor-data'
import { push } from 'react-router-redux'
import FontIcon from 'material-ui/FontIcon'
import RootAppBar from '../components/root-app-bar'
import Preloader from '../preloader/preloader'
import { setDrawerState } from '../general-actions'
import Units, { collectionName } from '../../api/units'
import FloatingActionButton from 'material-ui/FloatingActionButton'
import FilteredUnits from './filtered-units'
import { SORT_BY, sorters } from '../explorer-components/sort-items'
import { NoItemMsg } from '../explorer-components/no-item-msg'
import { Sorter } from '../explorer-components/sorter'
import { StatusFilter } from '../explorer-components/status-filter'
import { RoleFilter } from '../explorer-components/role-filter'
import memoizeOne from 'memoize-one'

class UnitExplorer extends Component {
  constructor (props) {
    super(props)
    this.state = {
      slideIndex: 0,
      searchActive: false,
      searchText: '',
      selectedStatusFilter: null,
      selectedRoleFilter: null,
      sortBy: null
    }
  }

  handleStatusFilterClicked = (event, index, selectedStatusFilter) => {
    this.setState({
      selectedStatusFilter: selectedStatusFilter
    })
  }

  handleRoleFilterClicked = (event, index, selectedRoleFilter) => {
    this.setState({
      selectedRoleFilter: selectedRoleFilter
    })
  }

  handleSortClicked = (event, index, value) => {
    this.setState({
      sortBy: value
    })
  }

  handleAddCaseClicked = (id) => {
    const { dispatch } = this.props
    dispatch(push(`/case/new?unit=${id}`))
  }

  handleUnitClicked = (id) => {
    const { dispatch } = this.props
    dispatch(push(`/unit/${id}`))
  }

  onSearchChanged = (searchText) => {
    this.setState({ searchText })
  }

  filterUnits = memoizeOne(
    (unitList, selectedStatusFilter, sortBy, selectedRoleFilter, searchText, searchActive) => {
      const { currentUserId } = this.props
      let statusFilter
      switch (selectedStatusFilter) {
        case 'All':
          statusFilter = () => true
          break
        case 'Active':
          statusFilter = unitItem => unitItem.is_active
          break
        case 'Disabled':
          statusFilter = unitItem => !unitItem.is_active
          break
        default:
          statusFilter = unitItem => unitItem.is_active
      }
      let roleFilter
      switch (selectedRoleFilter) {
        case 'All':
          roleFilter = () => true
          break
        case 'Created':
          roleFilter = unitItem => unitItem.metaData && unitItem.metaData.ownerIds && unitItem.metaData.ownerIds[0] === currentUserId
          break
        case 'Involved':
          roleFilter = unitItem => ((unitItem.metaData && !unitItem.metaData.ownerIds) || (unitItem.metaData && !unitItem.metaData.ownerIds && !unitItem.metaData.ownerIds[0] === currentUserId))
          break
        default:
          roleFilter = () => true
      }
      const filteredUnits = unitList.filter(unitItem => roleFilter(unitItem) && statusFilter(unitItem)).sort(sorters[sortBy])

      if (!searchText || !searchActive) return filteredUnits

      let regex
      if (searchText.charAt(0).match(/\d/)) {
        regex = new RegExp(`(^|[^\\d])${searchText}`, 'i')
      } else {
        regex = new RegExp(`(^|[^a-zA-Z])${searchText}`, 'i')
      }
      return filteredUnits.filter(item => item.name.match(regex))
    },
    (a, b) => {
      if (Array.isArray(a) && Array.isArray(b)) {
        return a.length === b.length
      } else {
        return a === b
      }
    }
  )

  render () {
    const { isLoading, unitList, dispatch } = this.props
    const { searchText, selectedStatusFilter, selectedRoleFilter, sortBy, searchActive } = this.state

    if (isLoading) return <Preloader />

    const units = this.filterUnits(unitList, selectedStatusFilter, sortBy, selectedRoleFilter, searchText, searchActive)
    return (
      <div className='flex flex-column flex-grow full-height'>
        <RootAppBar
          title='My Units'
          placeholder='Search units...'
          onIconClick={() => dispatch(setDrawerState(true))}
          shadowless
          searchText={searchText}
          onSearchChanged={this.onSearchChanged}
          searchActive={searchActive}
          onBackClicked={() => this.setState({
            searchActive: false
          })}
          onSearchRequested={() => this.setState({
            searchActive: true
          })}
          showSearch
        />
        <UnverifiedWarning />
        <div className='flex-grow flex flex-column overflow-hidden'>
          <div className='flex bg-very-light-gray'>
            <StatusFilter
              selectedStatusFilter={selectedStatusFilter}
              onFilterClicked={this.handleStatusFilterClicked}
              status={['All', 'Active', 'Disabled']}
            />
            <RoleFilter
              selectedRoleFilter={selectedRoleFilter}
              onRoleFilterClicked={this.handleRoleFilterClicked}
              roles={['All', 'Created', 'Involved']}
            />
            <Sorter
              onSortClicked={this.handleSortClicked}
              sortBy={sortBy}
              labels={[
                [SORT_BY.NAME_ASCENDING, { category: 'Name (A to Z)', selected: 'Name ↑' }],
                [SORT_BY.NAME_DESCENDING, { category: 'Name (Z to A)', selected: 'Name ↓' }]
              ]}
            />
          </div>
          <div className='flex-grow flex flex-column overflow-auto'>
            <div className='flex-grow bb b--very-light-gray bg-white pb6'>
              { units.length === 0 ? (
                <NoItemMsg item={'unit'} iconType={'location_on'} />
              ) : (
                <FilteredUnits
                  filteredUnits={units}
                  handleUnitClicked={this.handleUnitClicked}
                  handleAddCaseClicked={this.handleAddCaseClicked}
                  showAddBtn
                />
              )
              }
            </div>
          </div>
        </div>
        <div className='absolute bottom-2 right-2'>
          <FloatingActionButton
            onClick={() => dispatch(push(`/unit/new`))}
          >
            <FontIcon className='material-icons'>add</FontIcon>
          </FloatingActionButton>
        </div>
      </div>
    )
  }
}

UnitExplorer.propTypes = {
  unitList: PropTypes.array,
  isLoading: PropTypes.bool,
  unitsError: PropTypes.object,
  currentUserId: PropTypes.string
}

let unitsError
export default connect(
  () => ({ }) // Redux store to props
)(createContainer(
  () => {
    const unitsHandle = Meteor.subscribe(`${collectionName}.forBrowsing`, {
      onStop: (error) => {
        unitsError = error
      }
    })
    return {
      unitList: Units.find().fetch().map(unit => Object.assign({}, unit, {
        metaData: unit.metaData()
      })),
      isLoading: !unitsHandle.ready(),
      currentUserId: Meteor.userId(),
      unitsError
    }
  }, // Meteor data to props
  UnitExplorer
))
