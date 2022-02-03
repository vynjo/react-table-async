import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactTable from "react-table";
import cx from "classnames";
import { Checkbox } from "@nike/ruxac";

import "./NikeReactTable.css";
import "react-table/react-table.css";

class NikeReactTable extends Component {
  constructor(props) {
    super(props);

    this.checkboxColumn = id => {
      return [
        { show: false, Header: "index", accessor: id },
        {
          id: "checkbox",
          accessor: "",
          Cell: ({ original }) => {
            return (
              <Checkbox
                onChange={() => this.toggleRow(original[id])}
                value={this.state.selected[original[id]] === true}
              />
            );
          },
          Header: () => {
            return (
              <Checkbox
                onChange={() => this.toggleSelectAll()}
                value={this.state.selectAll === 1}
                className={cx({
                  "checkbox-dashed": this.state.selectAll === 2
                })}
                ref={input => {
                  if (input) {
                    input.indeterminate = this.state.selectAll === 2;
                  }
                }}
              />
            );
          },
          sortable: false,
          width: 45
        }
      ];
    };

    this.state = {
      selected: {},
      selectAll: 0
    };

    this.toggleRow = this.toggleRow.bind(this);
    this.currentPageIds = this.currentPageIds.bind(this);
    this.onTableViewChange = this.onTableViewChange.bind(this);

    this.reactTable = React.createRef();
  }

  getSelectedIds(obj) {
    return Object.keys(obj)
      .map(k => (obj[k] === true ? parseInt(k, 10) : null))
      .filter(v => v !== null);
  }

  componentDidUpdate(prevProps, prevState) {
    if (typeof this.props.onCheckChange === "function") {
      const selectedIds = this.getSelectedIds(this.state.selected);
      const prevSelectedIds = this.getSelectedIds(prevState.selected);
      const arrayDiff = this.arrDiff(selectedIds, prevSelectedIds);

      if (arrayDiff.length) {
        this.props.onCheckChange(selectedIds, {
          checked: prevSelectedIds.length < selectedIds.length,
          changed: arrayDiff
        });
      }
    }
  }

  arrDiff(a1, a2) {
    let a = [],
      diff = [];
    for (let i = 0; i < a1.length; i++) {
      a[a1[i]] = true;
    }

    for (let i = 0; i < a2.length; i++) {
      if (a[a2[i]]) {
        delete a[a2[i]];
      } else {
        a[a2[i]] = true;
      }
    }

    for (let k in a) {
      diff.push(parseInt(k, 10));
    }

    return diff;
  }

  toggleRow(id) {
    const newSelected = { ...this.state.selected };
    newSelected[id] = !this.state.selected[id];
    const selectedIds = this.getSelectedIds(newSelected);
    this.setState({
      selected: newSelected,
      selectAll: selectedIds.length > 0 ? 2 : 0
    });
  }

  toggleSelectAll() {
    let newSelected = {};

    if (this.props.selectAllType === "page") {
      newSelected = { ...this.state.selected };
      const cd = this.currentPageIds();
      if (this.state.selectAll === 0) {
        cd.forEach(x => {
          newSelected[x] = true;
        });
      } else {
        cd.forEach(x => {
          if (newSelected[x]) {
            delete newSelected[x];
          }
        });
      }
    } else {
      if (this.state.selectAll === 0) {
        this.props.data.forEach(x => {
          newSelected[x[this.props.id]] = true;
        });
      }
    }

    this.setState({
      selected: newSelected,
      selectAll: this.state.selectAll === 0 ? 1 : 0
    });
  }

  currentPageIds() {
    const current = this.reactTable.current;
    if (current) {
      const page = current.state.page;
      const pageSize = current.state.pageSize;
      const allData = current.getResolvedState().sortedData;
      const startIdx = page * pageSize;
      const currentData = allData
        .slice(startIdx, startIdx + pageSize)
        .map(item => item._original);
      const ids = [];
      currentData.forEach(x => {
        ids.push(x[this.props.id]);
      });
      return ids;
    }
    return [];
  }

  onTableViewChange() {
    const cd = this.currentPageIds();
    let selectAllState = 0;
    let selectCount = 0;
    cd.forEach(x => {
      if (this.state.selected[x]) {
        selectCount++;
      }
    });
    if (selectCount > 0) {
      selectAllState = 2;
      if (selectCount === cd.length) {
        selectAllState = 1;
      }
    }

    this.setState({
      selectAll: selectAllState
    });
  }

  render() {
    const columns = [...this.props.columns];
    if (this.props.checkboxAt !== undefined && this.props.checkboxAt >= 0) {
      columns.splice(
        this.props.checkboxAt,
        0,
        ...this.checkboxColumn(this.props.id)
      );
    }

    const newProps = { ...this.props };

    // Remove overwritten props from newProps clone
    if (
      this.props.onPageChange &&
      typeof this.props.onPageChange === "function"
    ) {
      delete newProps["onPageChange"];
    }
    if (
      this.props.onPageSizeChange &&
      typeof this.props.onPageSizeChange === "function"
    ) {
      delete newProps["onPageSizeChange"];
    }
    if (
      this.props.onSortedChange &&
      typeof this.props.onSortedChange === "function"
    ) {
      delete newProps["onSortedChange"];
    }
    if (
      this.props.onExpandedChange &&
      typeof this.props.onExpandedChange === "function"
    ) {
      delete newProps["onExpandedChange"];
    }
    if (
      this.props.onFilteredChange &&
      typeof this.props.onFilteredChange === "function"
    ) {
      delete newProps["onFilteredChange"];
    }
    if (
      this.props.onResizedChange &&
      typeof this.props.onResizedChange === "function"
    ) {
      delete newProps["onResizedChange"];
    }

    return (
      <ReactTable
        {...newProps}
        data={this.props.data}
        ref={this.reactTable}
        columns={columns}
        onPageChange={pageIndex => {
          if (
            this.props.onPageChange &&
            typeof this.props.onPageChange === "function"
          ) {
            this.props.onPageChange(pageIndex);
          }
          this.onTableViewChange();
        }}
        onPageSizeChange={(pageSize, pageIndex) => {
          if (
            this.props.onPageSizeChange &&
            typeof this.props.onPageSizeChange === "function"
          ) {
            this.props.onPageSizeChange(pageSize, pageIndex);
          }
          this.onTableViewChange();
        }}
        onSortedChange={(newSorted, column, shiftKey) => {
          if (
            this.props.onSortedChange &&
            typeof this.props.onSortedChange === "function"
          ) {
            this.props.onSortedChange(newSorted, column, shiftKey);
          }
          this.onTableViewChange();
        }}
        onExpandedChange={(newExpanded, index, event) => {
          if (
            this.props.onExpandedChange &&
            typeof this.props.onExpandedChange === "function"
          ) {
            this.props.onExpandedChange(newExpanded, index, event);
          }
          this.onTableViewChange();
        }}
        onFilteredChange={(filtered, column) => {
          if (
            this.props.onFilteredChange &&
            typeof this.props.onFilteredChange === "function"
          ) {
            this.props.onFilteredChange(filtered, column);
          }
          this.onTableViewChange();
        }}
        onResizedChange={(newResized, event) => {
          if (
            this.props.onResizedChange &&
            typeof this.props.onResizedChange === "function"
          ) {
            this.props.onResizedChange(newResized, event);
          }
          this.onTableViewChange();
        }}
      />
    );
  }
}

NikeReactTable.propTypes = {
  onCheckChange: PropTypes.func,
  selectAllType: PropTypes.string.isRequired,
  data: PropTypes.array.isRequired,
  id: PropTypes.string.isRequired,
  columns: PropTypes.array,
  checkboxAt: PropTypes.number.isRequired,
  onPageChange: PropTypes.func,
  onPageSizeChange: PropTypes.func,
  onSortedChange: PropTypes.func,
  onExpandedChange: PropTypes.func,
  onFilteredChange: PropTypes.func,
  onResizedChange: PropTypes.func
};

export default NikeReactTable;
