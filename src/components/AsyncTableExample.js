import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import ReactTable from "react-table";
import { setSearch } from "../reducers/search";
import { MakeData } from "../lib/helpers";

import "react-table/react-table.css";

class ATE extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: [],
      loading: false,
      pages: 0,
      page: 0,
      columns: [
        { Header: "Name", accessor: "name" },
        { Header: "Age", accessor: "age" }
      ]
    };

    this.instance = null;
  }

  componentDidUpdate(prevProps) {
    // Trigger when a new search happens
    if (prevProps.search !== this.props.search && this.instance !== null) {
      this.setState({ page: 0 });
      this.handleOnFetchData(this.instance.state);
    }
  }

  // Generic API call wrapper, abstracted away from the component manipulation.
  getData(page, pageSize, sorted) {
    return new Promise(resolve => {
      // Simulating a 1/3 second API Call.
      setTimeout(() => {
        // Make sure to get your filters from Redux to send to your API call
        resolve(MakeData(pageSize, this.props.filters));
      }, 333);
    });
  }

  // This function is called whenever the component is mounted and whenever the search prop is updated.
  async handleOnFetchData({ page, pageSize, sorted }, instance) {
    if (!this.instance && instance) {
      this.instance = instance;
      // Don't trigger a search when setting up the instance
      return;
    } else if ((!this.instance && !instance) || !this.props.search) {
      // Don't trigger a seach if no instance OR search cache ID hasn't been set in Redux.
      return;
    }

    // If you've gotten this far, then you probably are doing a filter search.
    this.setState({ loading: true });

    try {
      const { data, totalResults } = await this.getData(page, pageSize, sorted);

      this.setState({
        data,
        pages: Math.ceil(totalResults / pageSize),
        loading: false
      });
    } catch (e) {
      // There was an error in the API call being made.
      console.error(e);
      this.setState({ loading: false });
    }
  }

  render() {
    const { columns, data, pages, loading, page } = this.state;

    return (
      <div className="tableGrid-container-sc">
        <ReactTable
          columns={columns}
          manual={true}
          data={data}
          pages={pages}
          loading={loading}
          onFetchData={this.handleOnFetchData.bind(this)}
          className="-striped -highlight"
          page={page}
          onPageChange={page => this.setState({ page })}
        />
      </div>
    );
  }
}

/** Boiler plate Redux shenanigans */

const mapStateToProps = state => ({
  search: state.search.search,
  filters: state.search.filters
});

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      setSearch
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ATE);
