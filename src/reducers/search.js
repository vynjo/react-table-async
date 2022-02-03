export const SET_SEARCH = "search/SET_SEARCH";

export const setSearch = search => {
    return dispatch => {
        dispatch({
            type: SET_SEARCH,
            payload: search
        });
    };
};

const initialState = {
    search: null,
    filters: {
        foo: "bar",
        bar: "baz"
    }
};

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_SEARCH:
            return {
                ...state,
                search: action.payload
            };
        default:
            return state;
    }
};
