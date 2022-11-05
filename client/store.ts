import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';

Vue.use(Vuex);

/**
 * Storage for data that needs to be accessed from various compoentns.
 */
const store = new Vuex.Store({
  state: {
    filter: {type: "username", value: null}, // {type: , value:} (null = show all)
    freets: [], // All freets created in the app
    customFilters: [],
    username: null, // Username of the logged in user
    alerts: {} // global success/error messages encountered during submissions to non-visible forms
  },
  mutations: {
    alert(state, payload) {
      /**
       * Add a new message to the global alerts.
       */
      Vue.set(state.alerts, payload.message, payload.status);
      setTimeout(() => {
        Vue.delete(state.alerts, payload.message);
      }, 3000);
    },
    setUsername(state, username) {
      /**
       * Update the stored username to the specified one.
       * @param username - new username to set
       */
      state.username = username;
    },
    updateFilter(state, filter) {
      /**
       * Update the stored freets filter to the specified one.
       * @param filter - Username of the user to fitler freets by
       */
      state.filter = filter;
    },
    updateFreets(state, freets) {
      /**
       * Update the stored freets to the provided freets.
       * @param freets - Freets to store
       */
      state.freets = freets;
    },
    async refreshFreets(state) {
      /**
       * Request the server for the currently available freets.
       */
      var url = '/api/freets';
      if (state.filter.type == "username") {
        url = `/api/users/${state.filter.value}/freets`;
      } else if (state.filter.type == "filter"){
        url = `/api/filters/view?filterId=${state.filter.value}}`;
      } else if (state.filter.type == "tag"){
        url = `/api/tags/view?tag=${state.filter.value}`;
      } 
      const res = await fetch(url).then(async r => r.json());
      for (let i in res){
        const r_intent = await fetch(`/api/intent/${res[i]._id}`);
        const res_intent = await r_intent.json();
        if (!r_intent.ok) {
          throw new Error(res_intent.error);
        }
        res[i].intent = res_intent;
        const r_suggestions = await fetch(`api/suggestions/${res[i]._id}`);
        const res_suggestions = await r_suggestions.json();
        if (!r_suggestions.ok){
          throw new Error(res_intent.error);
        }
        res[i].suggestions = res_suggestions.suggestions;
      }
      state.freets = res;
    },
    async refreshCustomFilters(state){
      if (state.username !== null) {
        const url = '/api/filters/mine';
        try {
          const r = await fetch(url);
          const res = await r.json();
          if (!r.ok) {
            throw new Error(res.error);
          }
          state.customFilters = res.filters;
        } catch (e) {
          throw new Error(e);
        }
      }
    }
  },
  // Store data across page refreshes, only discard on browser close
  plugins: [createPersistedState()]
});

export default store;
