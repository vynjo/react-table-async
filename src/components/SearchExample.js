import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { setSearch } from "../reducers/search";

class Search extends Component {
    handleSearch() {
        this.props.setSearch(Date.now());
    }

    render() {
        return (
            <div className="search-container">
                <button onClick={this.handleSearch.bind(this)}>
                    Trigger Search
                </button>{" "}
                {`| ${
                    this.props.search
                        ? `Cache ID: ${this.props.search}`
                        : "No Search Cache"
                }`}
            </div>
        );
    }
}

const mapStateToProps = state => ({
    search: state.search.search
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
)(Search);
